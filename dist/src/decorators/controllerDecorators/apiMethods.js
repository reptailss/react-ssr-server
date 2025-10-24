"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReactSsr = void 0;
const os_core_ts_1 = require("os-core-ts");
function ReactSsr(path) {
    return function (target, propertyKey, descriptor) {
        os_core_ts_1.RegisterApiMethodsDecorators.registerMethodDecorator({
            path,
            method: 'ReactSsr',
            target,
            propertyKey,
            type: 'default',
        });
    };
}
exports.ReactSsr = ReactSsr;
//# sourceMappingURL=apiMethods.js.map