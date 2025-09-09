"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReactSsrDec = void 0;
const os_core_ts_1 = require("os-core-ts");
function ReactSsrDec(path) {
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
exports.ReactSsrDec = ReactSsrDec;
//# sourceMappingURL=apiMethods.js.map