import db from 'server/services/db';
import { serverOnly, getIdentify } from 'common/database/repositories/dbProvider';
import { ClientSessionEntryIded } from 'common/models';
import { bucket } from 'server/services/storage';
import logger from 'common/logger';

export async function updateFilesMetadata(back?: number) {
    const backDays = back || 0;

    const end = new Date();
    end.setUTCDate(end.getUTCDate() - backDays);

    const sessionsDocs = await serverOnly(db.value).collectionGroup('sessions').where('date', '<', end.getTime()).get();

    const sessions = await Promise.all(sessionsDocs.docs.map(async sdoc => {
        const s = getIdentify<ClientSessionEntryIded>(sdoc);
        const metadata = {
            contentDisposition: `attachment; filename="${s.name}"`,
        };
        const file = await bucket.file(s.auidioRef);
        const exist = await file.exists().then(data => data[0]);

        if (exist) {
            const newMeta = await file.setMetadata(metadata);
            logger.log('updateFilesMetadata newMeta', newMeta);
        }

        return {
            updated: exist,
            entryId: s.id,
        };
    }));

    return {
        sessions,
    };
}
