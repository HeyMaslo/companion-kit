// import * as FunctionDefinitions from 'common/abstractions/functions';
// import { FunctionFactory } from './utils/createFunction';
import db from './services/db';

async function convertClient(c: FirebaseFirestore.DocumentReference) {
    const sessions = await db.value.collection(`clients/${c.id}/sessions`).get();
    const accounts = db.value.collection(`clients/${c.id}/accounts`);

    await Promise.all(sessions.docs.map(async s => {

        const accDoc = accounts.doc(s.id);

        await accDoc.set(s.data());

        const journals = await s.ref.collection(`journal`).get();
        const journalsDest = accDoc.collection(`journal`);

        await Promise.all(journals.docs.map(async j => {
            const targetDoc = journalsDest.doc(j.id);
            await targetDoc.set(j.data());
            return targetDoc;
        }));
    }));
}

// export const ConvertSessions = new FunctionFactory(FunctionDefinitions.ConvertClientSessions)
//     .create(async (data, ctx) => {

//         const clients = await db.collection('clients').get();

//         await Promise.all(clients.docs.map(async c => {
//                 console.log('Converting client', c.id);
//                 await convertClient(c.ref);
//             }));

//         // const client = await db.collection('clients').doc('2cJwLa519VSf5CaT4fLSxOdVEU92');
//         // await convertClient(client);

//     }).AuthFunction;
