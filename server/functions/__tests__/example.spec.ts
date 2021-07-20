import { fail } from 'assert';
import { expect } from 'chai';

import { init } from './util/firebase';

// should be able to import things like the following:
import { initializeAsync } from '../../../common/services/firebase';
import { env } from '../../../env';

const {test, app} = init('example-test');

describe('Example Tests', () => {
    afterEach(async () => {
        await test.cleanup();
    });
    it('Should check that tests work', () => {
        const result = 1 + 1;
        expect(result).to.equal(2);
    });
});
