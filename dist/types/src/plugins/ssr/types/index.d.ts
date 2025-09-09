export type CompileConfig = {
    assetsBuildDirectory: string;
    serverBuildDirectory: string;
    publicPath: string;
};
export type Build = {
    entry: {
        module: {
            default: (appContext: AppContext) => string;
        };
    };
    routes: Record<string, {
        module: AppRouteModule;
    }>;
    assets: {
        version: string;
        entry: {
            module: string;
            imports: string[];
        };
        routes: {
            root: AppRoute;
            [key: string]: AppRoute;
        };
        url: string;
    };
    mode: 'production' | 'dev';
    hmrServerPort: number;
};
export type AppLocation = {
    originalUrl: string;
    url: string;
};
export type AppContext = {
    routes: {
        routesManifest: AppRouteManifest;
        routeModules: AppRouteModules;
    };
    pageData: PageData;
    globalData: GlobalData | null;
    router: AppRouter;
    locales: string[];
    locale: string | null;
    userAgent: string;
    location: AppLocation;
};
type AppRouter = {
    path: string;
};
export type AppData = {
    pageData: PageData;
    globalData: GlobalData | null;
};
export type PageData = {
    data: any;
    error: false;
    errors: [];
    errorCode: null;
    status: number;
} | {
    data: null;
    error: true;
    status: number;
    errors: Array<string | {
        key: string;
        message: string;
    }>;
    errorCode: string;
};
export type GlobalData = {
    data: any;
    error: false;
    errors: [];
    errorCode: null;
    status: number;
} | {
    data: null;
    error: true;
    status: number;
    errors: Array<string | {
        key: string;
        message: string;
    }>;
    errorCode: string;
};
type AppRouteManifest = {
    version: string;
    entry: {
        module: string;
        imports: string[];
    };
    routes: {
        root: AppRoute;
        [key: string]: AppRoute;
    };
    url: string;
    mode: 'production' | 'dev';
    hmrServerPort: number;
};
export type AppRouteModules = {
    [key: string]: AppRouteModule;
};
type AppRouteModule = {
    default: () => any;
    links?: (data?: unknown | null) => {
        href: string;
        rel: string;
    }[];
    meta?: (data?: unknown | null) => MetaDescriptor[];
};
type AppRoute = {
    id: string;
    parentId: undefined;
    path: string;
    index?: boolean;
    caseSensitive?: boolean;
    module: string;
    imports?: string[];
};
type MetaDescriptor = {
    charSet: 'utf-8';
} | {
    title: string;
} | {
    name: string;
    content: string;
} | {
    property: string;
    content: string;
} | {
    httpEquiv: string;
    content: string;
} | {
    'script:ld+json': LdJsonObject;
} | {
    tagName: 'meta' | 'link';
    [name: string]: string;
} | {
    [name: string]: unknown;
};
type LdJsonObject = {
    [Key in string]: LdJsonValue;
} & {
    [Key in string]?: LdJsonValue | undefined;
};
type LdJsonArray = LdJsonValue[] | readonly LdJsonValue[];
type LdJsonPrimitive = string | number | boolean | null;
type LdJsonValue = LdJsonPrimitive | LdJsonObject | LdJsonArray;
export {};
