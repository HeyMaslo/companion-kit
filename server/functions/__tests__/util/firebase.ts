import * as admin from 'firebase-admin';
import fbFuncTest from 'firebase-functions-test';
import { clearFirestoreData } from '@firebase/testing';

const projectId = 'bipolarbridges';

export function init(name: string) {
    const config = {
        projectId: projectId,
    };
    const test = fbFuncTest(config);
    admin.initializeApp(config, name);
    return test;
}

export async function clear() {
    await clearFirestoreData({ projectId });
}