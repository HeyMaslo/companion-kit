import * as admin from 'firebase-admin';
import fbFuncTest from 'firebase-functions-test';

export function init(name: string) {
    const config = {
        projectId: 'bipolarbridges',
    };
    const test = fbFuncTest(config);
    admin.initializeApp(config, name);
    return test;
}
