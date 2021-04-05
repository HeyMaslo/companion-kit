import * as admin from 'firebase-admin';
import { fail } from 'assert';
import { expect } from 'chai';
import fbFuncTest from 'firebase-functions-test';

// should be able to import things like the following:
import { initializeAsync } from '../../../common/services/firebase';
import { env } from '../../../env';

// Initialize testing server
const test = fbFuncTest({
    projectId: 'bipolarbridges',
  });
admin.initializeApp();

describe('Example Tests', () => {
    afterEach(async () => {
        await test.cleanup();
    });
    it('Should check that tests work', () => {
        const result = 1 + 1;
        expect(result).to.equal(2);
    });
});
