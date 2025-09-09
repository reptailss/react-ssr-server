import { IApp } from 'os-core-ts';
import { IReactSsrAppPlugin } from './interfaces';
import { ISsrNotFoundController } from './interfaces/ssrNotFoundController';
import { ISsrGlobalDataController } from './interfaces/ssrGlobalDataController';
export declare class ReactSsrAppPlugin implements IReactSsrAppPlugin {
    private ssrGlobalDataController;
    private notFoundHandler;
    register(app: IApp): void | Promise<void>;
    useNotFoundController(controller: {
        new (): ISsrNotFoundController;
    }): this;
    useGlobalDataController(controller: {
        new (): ISsrGlobalDataController;
    }): this;
    private getSSRControllerHandler;
    private handleAppData;
    private handlePageData;
    private handleGlobalData;
    private createAppContext;
    private buildHtmlErrorPage;
}
