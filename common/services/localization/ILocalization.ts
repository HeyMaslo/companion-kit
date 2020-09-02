import { StringsShape } from './defaultShape';

export interface ILocalization<TShape extends StringsShape = StringsShape> {
    readonly Current: Readonly<TShape>;
}

let _default: ILocalization = null;

export namespace ILocalization {
    export function setDefault(instance: ILocalization) {
        _default = instance;
    }

    export function getDefault() {
        return _default && _default.Current;
    }
}
