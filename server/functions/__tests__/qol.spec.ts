import { fail } from 'assert';
import { expect, assert } from 'chai';
import { createDomain, createQuestion } from 'server/qol';

import { init } from './util/firebase';

const test = init('qol-test');

describe('Domain Creation', () => {
    afterEach(async () => {
        await test.cleanup();
    });
    it('Should allow a domain to be created', async () => {
        const result = await createDomain({
            scope: 'GENERAL',
            position: 1,
            name: 'Physical',
            slug: 'physical',
        });
        assert.isNull(result.error);
    });
    it('Should not allow a domain to be created if the scope is not valid', async () => {
        const result = await createDomain({
            scope: 'NOT_A_VALID_SCOPE',
            position: 1,
            name: 'Physical',
            slug: 'physical',
        });
        assert.isNotNull(result.error);
    });
});

describe('Question Creation', () => {
    afterEach(async () => {
        await test.cleanup();
    });
    it('Should not allow a question to be created if the domain slug is invalid', async () => {
        const result = await createQuestion({
            text: "had plenty of energy",
            domainSlug: "not_a_valid_slug",
            position: 1,
        });
        assert.isNotNull(result.error);
    });
});
