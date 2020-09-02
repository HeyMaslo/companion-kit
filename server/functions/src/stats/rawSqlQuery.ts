import { FireSQL } from 'firesql';
import db from 'server/services/db';
import { createLazy } from 'common/utils/lazy.light';

const fireSql = createLazy(() => new FireSQL(db.value, { includeId: true }));

export async function doRawSqlQuery(query: string) {
    // console.log('===========> RAW SQL QUERY:', query);
    const res = await fireSql.value.query(query);
    // console.log('===========> RAW SQL RESULT:', res);
    return res;
}
