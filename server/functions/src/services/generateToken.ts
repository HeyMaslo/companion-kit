import admin, { AdminLib } from 'server/services/admin';
import { createLogger } from 'common/logger';

const logger = createLogger('[generateToken]');

export async function generateAuthToken(email: string, createUser = true) {
    const user = await ensureAuthUser(email, createUser);

    // issue a token
    logger.log('Issuing token for email:', email);
    const token = await admin.auth().createCustomToken(user.uid);

    return token;
}

export async function ensureAuthUser(email: string, create = true) {
    let user: AdminLib.auth.UserRecord;
    try {
        user = await admin.auth().getUserByEmail(email);
    } catch (err) {
        logger.log('User not found for email =', email);
    }

    if (!user && create) {
        logger.log('Creating user for email:', email);
        user = await admin.auth().createUser({
            email: email,
        });
    }

    return user;
}
