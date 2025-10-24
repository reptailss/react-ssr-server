import {RegisterApiMethodsDecorators} from 'os-core-ts'

export function ReactSsr(path: string) {
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        RegisterApiMethodsDecorators.registerMethodDecorator({
            path,
            method: 'ReactSsr',
            target,
            propertyKey,
            type: 'default',
        })
     
    }
}