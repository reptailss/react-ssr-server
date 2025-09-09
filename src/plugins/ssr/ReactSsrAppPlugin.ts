import {
    AppErrorHelper,
    appLogger,
    AppRequest,
    AppResponse,
    ArgEndpointsHandler,
    Controller,
    ControllerEndpoint,
    IApp,
    SendFileControllerEndpoint,
    SystemControllerEndpoint,
} from 'os-core-ts'
import path from 'path'
import {AppContext, AppData, AppRouteModules, Build, CompileConfig, GlobalData, PageData} from './types'
import {IReactSsrAppPlugin} from './interfaces'
import {ISsrNotFoundController} from './interfaces/ssrNotFoundController'
import {ISsrGlobalDataController} from './interfaces/ssrGlobalDataController'


const compileConfig: CompileConfig = require(
    path.resolve(process.cwd(), 'reactSsrCompilerConfig.js'),
)

const build: Build = require(
    path.join(process.cwd(), ...compileConfig.serverBuildDirectory.split('/'), 'index.js'),
)

type HandlerFn = (req: AppRequest, res: AppResponse) => void

const argEndpointsHandler = new ArgEndpointsHandler()

export class ReactSsrAppPlugin implements IReactSsrAppPlugin {
    
    private ssrGlobalDataController: Controller | null = null
    private notFoundHandler: HandlerFn | null = null
    
    public register(app: IApp): void | Promise<void> {
        app.routerBuilder.registerRouteHandler(
            'ReactSsr',
            (router, endpoint, controller) => {
                router.get(
                    endpoint.path,
                    this.getSSRControllerHandler(endpoint, controller),
                )
            },
        )
        if (this.notFoundHandler) {
            app.useNotFoundRoute(this.notFoundHandler)
        }
        
    }
    
    public useNotFoundController(controller: {new(): ISsrNotFoundController}): this {
        const controllerInstance = new controller() as unknown as Controller
        this.notFoundHandler = this.getSSRControllerHandler(
            {
                method: 'ReactSsr' as any,
                path: '',
                _propertyKey: 'notFoundPage',
                type: 'default',
            },
            controllerInstance,
        )
        return this
    }
    
    public useGlobalDataController(controller: {new(): ISsrGlobalDataController}): this {
        this.ssrGlobalDataController = new controller() as unknown as Controller
        return this
    }
    
    private getSSRControllerHandler(
        endpoint:
            | ControllerEndpoint
            | SystemControllerEndpoint
            | SendFileControllerEndpoint,
        controller: Controller,
    ): HandlerFn {
        return async (req: AppRequest, res: AppResponse) => {
            const appData = await this.handleAppData(
                endpoint,
                controller,
                req,
                res,
                req.headers.xinitialpreload !== 'false',
            )
            
            if (req.headers.xonlyjson === 'true') {
                if (appData.pageData.status !== 200) {
                    res.status(appData.pageData.status)
                }
                res.send(appData)
                return
            }
            res.contentType('text/html')
            try {
                const result = build.entry.module.default(
                    this.createAppContext(
                        build,
                        req,
                        res,
                        appData,
                    ),
                )
                if (appData.pageData.status !== 200) {
                    res.status(appData.pageData.status)
                }
                res.send(result)
            } catch (error) {
                appLogger.error('error build ssr page', error)
                res.status(500).send(this.buildHtmlErrorPage(error))
            }
        }
    }
    
    private async handleAppData(
        endpoint:
            | ControllerEndpoint
            | SystemControllerEndpoint
            | SendFileControllerEndpoint,
        controller: Controller,
        req: AppRequest,
        res: AppResponse,
        initialPreload?: boolean,
    ): Promise<AppData> {
        
        const pageData = await this.handlePageData(
            endpoint,
            controller,
            req,
            res,
        )
        
        if (!initialPreload) {
            res._body = {
                pageData,
                error: pageData.error,
                error_code: pageData.errorCode,
            }
            return {
                pageData,
                globalData: null,
            }
        }
        
        if (!this.ssrGlobalDataController) {
            res._body = {
                pageData,
                error: pageData.error,
                error_code: pageData.errorCode,
            }
            return {
                pageData,
                globalData: null,
            }
        }
        
        const globalData = await this.handleGlobalData(req, res)
        
        res._body = {
            pageData,
            globalData,
            error: globalData.error || pageData.error,
            error_code: globalData.errorCode || pageData.errorCode,
        }
        return {
            pageData,
            globalData,
        }
    }
    
    private async handlePageData(
        endpoint:
            | ControllerEndpoint
            | SystemControllerEndpoint
            | SendFileControllerEndpoint,
        controller: Controller,
        req: AppRequest,
        res: AppResponse,
    ): Promise<PageData> {
        try {
            const data = await argEndpointsHandler.getDataByControllerMethod(
                controller,
                endpoint._propertyKey,
                req,
                res,
            )
            return {
                data,
                errors: [],
                error: false,
                errorCode: null,
                status: 200,
            }
        } catch (error) {
            const errorResult = AppErrorHelper.buildErrorResultFromError(error)
            return {
                data: null,
                error: true,
                errors: errorResult.errors,
                errorCode: errorResult.error_code || 'server_side_error',
                status: errorResult.status,
            }
        }
    }
    
    private async handleGlobalData(
        req: AppRequest,
        res: AppResponse,
    ): Promise<GlobalData> {
        
        try {
            const data = await argEndpointsHandler.getDataByControllerMethod(
                this.ssrGlobalDataController as Controller,
                'loadGlobalData',
                req,
                res,
            )
            return {
                data,
                errors: [],
                error: false,
                errorCode: null,
                status: 200,
            }
        } catch (error) {
            const errorResult = AppErrorHelper.buildErrorResultFromError(error)
            return {
                data: null,
                error: true,
                errors: errorResult.errors,
                errorCode: errorResult.error_code || 'server_side_error',
                status: errorResult.status,
            }
        }
    }
    
    private createAppContext(
        build: Build,
        req: AppRequest,
        res: AppResponse,
        appData: AppData,
    ): AppContext {
        const routeModules: AppRouteModules = {}
        for (const routeId in build.routes) {
            routeModules[routeId] = build.routes[routeId].module
        }
        return {
            routes: {
                routesManifest: {
                    version: build.assets.version,
                    entry: build.assets.entry,
                    routes: build.assets.routes,
                    url: build.assets.url,
                    mode: build.mode || 'production',
                    hmrServerPort: build.hmrServerPort || 3001,
                },
                routeModules,
            },
            router: {
                path: res.locals.originalUrlWithLocale || req.url,
            },
            pageData: appData.pageData,
            globalData: appData.globalData,
            userAgent: req.headers['user-agent'],
            locales: res.locals.locales || [],
            locale: res.locals.locale || null,
            location:{
                originalUrl:req.originalUrl,
                url:res.locals.originalUrlWithLocale || req.url,
            }
        }
    }
    
    private buildHtmlErrorPage(error: unknown): string {
        return `<!DOCTYPE html><html lang="uk"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Помилка сервера</title><style>body{margin:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#1c1c1e;color:#fff;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:3rem 2rem}h1{font-size:5rem;color:#ff4c4c;margin:0}h2{font-size:2rem;margin-top:.5rem}p{font-size:1.2rem;max-width:600px;margin-top:1rem;color:#ccc}a{margin-top:2rem;padding:.75rem 1.5rem;background-color:#ff4c4c;color:#fff;text-decoration:none;border-radius:8px;transition:background-color .3s ease}a:hover{background-color:#e13e3e}</style></head><body><h1>500</h1><h2>Ой! Щось пішло не так…</h2><p>На сервері сталася помилка. Ми вже знаємо про проблему або скоро про неї дізнаємось. Спробуйте перезавантажити сторінку трохи пізніше.</p><a href="/">Повернутись на головну</a></body></html>`
    }
}
