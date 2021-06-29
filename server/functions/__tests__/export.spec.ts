import * as admin from 'firebase-admin';
import { ExportFunctions } from '../src/export';
import { init } from './util/firebase';
import { assert } from 'chai';

const {test, app} = init('example-test');

describe('Export Functions', () => {
    afterEach(test.cleanup);

    it('Should export new accounts', async () => {
        const clientId = 'client0';
        const handle = test.wrap(ExportFunctions.newAccount);
        await admin.firestore(app)
            .doc(`/clients/${clientId}`).create({
                onboarded: true,
            });
        const acctId = 'account0';
        const coachId = 'coach0';
        const snap = await test.firestore.makeDocumentSnapshot(
            { coachId },
            `/clients/${clientId}/accounts/${acctId}`);
        const result = await(handle(snap, {
            params: { clientId, acctId },
        }));
        assert.isNull(result.error);
    });

    it('Should export new record data', async () => {
        const clientId = 'client0@email.com';
        const handle = test.wrap(ExportFunctions.measurement);
        await admin.firestore(app)
            .doc(`/clients/${clientId}`).create({
                onboarded: true,
            });
        const acctId = 'account1';
        const coachId = 'GUcXaXk6jOuw5fUw';
        await admin.firestore(app)
            .doc(`/clients/${clientId}/accounts/${acctId}`)
            .create({ coachId });
        const recordId = 'record1';
        const snap = await test.firestore.makeDocumentSnapshot(
            {
                clientUid: clientId,
                coachUid: coachId,
                date: 1614054400177,
                mentalHealth: 0.7,
                mindfulness: 0.6,
                energyLevel: {
                    original: 0.4,
                    normalized: null,
                },
                sentiment: {
                    documentSentiment: {
                        score: 5,
                        magnitude: 0.9,
                    },
                    language: 'english',
                    sentences: [
                        {
                            text: {
                                content: 'Aenean lacinia bibendum nulla sed consectetur.',
                                beginOffset: 0,
                            },
                            sentiment: {
                                score: 5,
                                magnitude: 0.9,
                            },
                        },
                        {
                            text: {
                                content: 'Maecenas sed diam eget risus varius blandit sit amet non magna.',
                                beginOffset: 0,
                            },
                            sentiment: {
                                score: 4,
                                magnitude: 0.8,
                            },
                        },
                    ],
                },
            },
            `/records/${recordId}`);
        const result = await(handle(snap));
        assert.isNull(result.error);
      });
});
