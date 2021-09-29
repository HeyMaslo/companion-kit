import mockProcess from './mocks/client/process';
process = mockProcess;

import { init } from './util/firebase';
import { fail } from 'assert';
import { expect, assert } from 'chai';
import clientConfig from './mocks/client/config';
import { GetTokenResult, IAuthController } from '../../../common/abstractions/controlllers/IAuthController';
import { ClientAuthController } from './mocks/client/controllers';
import { Users as UsersFunctions } from '../../../common/abstractions/functions';
import Firebase, { initializeAsync } from '../../../common/services/firebase';
import { validateToken } from '../src/auth';
import * as userData from './mocks/data/users';
import testConfig from './config';

// Initialize testing server
const { test, app } = init('auth-test');

// Tests
let auth: IAuthController = null;
describe('Authentication', () => {
    beforeAll(async () => {
        // Initialize testing client
        await initializeAsync(clientConfig);
    });
    beforeEach(async () => {
        await userData.create();
        auth = new ClientAuthController();
    });
    afterEach(async () => {
        auth = null;
        await test.cleanup();
        await userData.clear();
    });
    it('Should not generate an id token if client is not signed in', async () => {
        const getTokenResult = await auth.getAuthToken();
        assert.isFalse(getTokenResult.result);
        assert.isUndefined(getTokenResult.token);
    });
    it('Should generate an id token for a logged in user', async () => {
        const u = userData.getUser();
        await auth.signInWithEmailPassword(u.email, u.password);
        const getTokenResult: GetTokenResult = await auth.getAuthToken();
        assert.isTrue(getTokenResult.result);
        if (getTokenResult.token) {
            console.log(`Token: ${getTokenResult.token}`);
        } else {
            fail();
        }
    });
    it('Should not validate an invalid token', async () => {
        const u = userData.getUser();
        await auth.signInWithEmailPassword(u.email, u.password);
        // Note: would like to invoke the function using the wrapper below but experiencing
        // issues in the emulation environment despite curl requests to the emulator going through.
        // Perhaps a problem with Firebase versions?
        // In order to test the function more abstractly (using the function factory
        // mechanism) uncomment the following lines the change the call to the validate
        // function to the commented one below. Please be advised that this can result in
        // a strange error 'internal' to appear and the test to fail. The method unit test
        // is used for the time being.
        // const validate = await Firebase.Instance.getFunction(UsersFunctions.ValidateToken);
        const args: any = {
            type: 'validateToken',
            token: 'notavalidtoken',
            email: u.email,
        };
        const res = await validateToken(args); // await validate.execute(args);
        assert.isFalse(res.result);
    });
    if (testConfig.environment === 'DOCKER') {
        it('Should validate a valid token if the provided email is correct', async () => {
            const u = userData.getUser();
            await auth.signInWithEmailPassword(u.email, u.password);
            const getTokenResult: GetTokenResult = await auth.getAuthToken();
            const token = getTokenResult.token;
            // const validate = await Firebase.Instance.getFunction(UsersFunctions.ValidateToken);
            const args: any = {
                type: 'validateToken',
                token: token,
                email: u.email,
            };
            const res = await validateToken(args); // await validate.execute(args);
            // This test has a tendency to fail when running locally (I think) due to an inconsistency
            // with tokens in the emulator environment. Strangely it passes in the CI container.
            assert.isTrue(res.result);
            // That being said, if it works for you, please open a pull-request in the repository
            // explaining how to get it to pass!
        });
    }
    it('Should not validate a valid token if the provided email is incorrect', async () => {
        const u = userData.getUser(0);
        await auth.signInWithEmailPassword(u.email, u.password);
        const getTokenResult: GetTokenResult = await auth.getAuthToken();
        const token = getTokenResult.token;
        // const validate = await Firebase.Instance.getFunction(UsersFunctions.ValidateToken);
        const args: any = {
            type: 'validateToken',
            token: token,
            email: userData.getUser(1).email,
        };
        const res = await validateToken(args); // await validate.execute(args);
        assert.isFalse(res.result);
    });
});
