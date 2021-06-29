import * as admin from 'firebase-admin';
import fbFuncTest from 'firebase-functions-test';
import { clearFirestoreData } from '@firebase/rules-unit-testing';

const projectId = 'bipolarbridges';

export function init(name: string) {
    const config = {
        projectId: projectId,
    };
    const test = fbFuncTest(config);
    const app = admin.initializeApp(config, name);
    return {test: test, app : app};
}

export async function clear() {
    await clearFirestoreData({ projectId });
}
