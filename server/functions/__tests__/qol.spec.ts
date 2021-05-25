import mockProcess from './mocks/client/process';
process = mockProcess;

import { fail } from 'assert';
import { expect, assert } from 'chai';

import { initializeAsync } from '../../../common/services/firebase';
import * as firebase from './util/firebase';
import clientConfig from './mocks/client/config';

import { createDomain, createQuestion, getDomains, getQuestions } from 'server/qol';
import { QoLActionTypes } from 'common/models/dtos/qol';
import { DomainScope } from 'common/models/QoL';

const test = firebase.init('qol-test');

async function fbCleanup() {
    await firebase.clear();
    await test.cleanup();
}

describe('QoL', () => {
    beforeAll(async () => {
        // Initialize testing client
        await initializeAsync(clientConfig);
    });
    describe('Domains', () => {
        describe('Domain Creation', () => {
            afterEach(fbCleanup);
            it('Should allow a domain to be created', async () => {
                const result = await createDomain({
                    type: QoLActionTypes.CreateDomain,
                    scope: DomainScope.GENERAL,
                    position: 1,
                    name: 'Physical',
                    slug: 'physical',
                    importance: 'SLEEP = Sleeeeepz Sleeeeepz Sleeeeepz Sleeeeepz incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud',
                });
                assert.isNull(result.error);
            });
            it('Should not allow a domain to be created if the scope is not valid', async () => {
                const result = await createDomain({
                    type: QoLActionTypes.CreateDomain,
                    scope: 'NOT_A_VALID_SCOPE',
                    position: 1,
                    name: 'Physical',
                    slug: 'physical',
                    importance: 'PHYSICAL = Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor',
                });
                assert.isNotNull(result.error);
            });
        });
        describe('Domain List', () => {
            afterEach(fbCleanup);
            it('Should list no domains before any are added', async () => {
                const result = await getDomains();
                assert.isNull(result.error);
                assert.lengthOf(result.results, 0);
            });
            it('Should list domains that are added', async () => {
                await createDomain({
                    type: QoLActionTypes.CreateDomain,
                    scope: 'GENERAL',
                    position: 1,
                    name: 'Physical',
                    slug: 'physical',
                    importance: '',
                });
                const result = await getDomains();
                assert.isNull(result.error);
                assert.lengthOf(result.results, 1);
            });
        });
    });
    describe('Question Creation', () => {
        afterEach(fbCleanup);
        it('Should not allow a question to be created if the domain slug is invalid', async () => {
            const result = await createQuestion({
                type: QoLActionTypes.CreateQuestion,
                text: 'had plenty of energy',
                domainSlug: 'not_a_valid_slug',
                position: 1,
            });
            assert.isNotNull(result.error);
        });
        it('Should allow a question to be created referring to a domain', async () => {
            await createDomain({
                type: QoLActionTypes.CreateDomain,
                scope: 'GENERAL',
                position: 1,
                name: 'Physical',
                slug: 'physical',
                importance: '',
            });
            const createResult = await createQuestion({
                type: QoLActionTypes.CreateQuestion,
                text: 'had plenty of energy',
                domainSlug: 'physical',
                position: 1,
            });
            assert.isNull(createResult.error);
            const getResult = await getQuestions({
                type: QoLActionTypes.GetQuestions,
            });
            assert.lengthOf(getResult.results, 1);
        });
    });
});
