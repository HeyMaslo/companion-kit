import { decode, encode } from 'base-64';

declare var global: any;

// polyfilling 'btoa' and 'atob' is required by Firestore web js sdk

if (!global.btoa) {
    global.btoa = encode;
}

if (!global.atob) {
    global.atob = decode;
}
