import { createFunction, FirebaseFunctionCall } from '../utils/createFunction';
import * as functions from 'firebase-functions';

type FunctionType = ReturnType<typeof functions.https.onCall>;

export type ProxyRepo<T> = {
    [P in keyof T]: FunctionType;
};

type InputFunction = (...args: any[]) => Promise<any>;

type ArgsArr<TFunc extends InputFunction> = {
    args: Parameters<TFunc>;
};

export function createProxyFunction<TFunc extends InputFunction>(original: TFunc): FunctionType {
    const wrapper: FirebaseFunctionCall<ArgsArr<TFunc>, ReturnType<TFunc>> = (data, ctx) => {
        const { args } = data;
        return original(...args);
    };
    return createFunction(wrapper);
}

export function createProxyObject<T>(obj: T) {
    const res = { } as ProxyRepo<T>;
    const proto = Object.getPrototypeOf(obj);
    Object.getOwnPropertyNames(proto).forEach(k => {
    // Object.keys(obj).forEach(k => {
        const func = obj[k as keyof T];
        if (typeof func !== 'function' || k === 'constructor') {
            // console.log('Ignoring key', k, 'in type', typeof proto);
            return;
        }
        res[k] = createProxyFunction(func.bind(obj));
    });
    return res;
}