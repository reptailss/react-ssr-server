import { IAppPlugin } from 'os-core-ts';
import { ISsrNotFoundController } from './ssrNotFoundController';
import { ISsrGlobalDataController } from './ssrGlobalDataController';
export interface IReactSsrAppPlugin extends IAppPlugin {
    useNotFoundController(controller: {
        new (...args: any): ISsrNotFoundController;
    }): this;
    useGlobalDataController(controller: {
        new (...args: any): ISsrGlobalDataController;
    }): this;
}
