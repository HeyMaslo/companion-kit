import { createNewEmailUser, clearAllUsers } from '../../util/auth';

/*
*   Fixture database for user data
*/

export type User = {
    email:      string,
    password:   string,
};

const database: User[] = [

    { email: 'user0@test.com', password: 'secret0' },
    { email: 'user1@test.com', password: 'secret1' },

];

export async function create() {
    console.log('Creating users...');
    await Promise.all(database.map((u): Promise<void> => new Promise(async (resolve, reject) => {
        const result = await createNewEmailUser(u);
        if (!result) {
            reject('error creating user database');
        } else {
            resolve();
        }
    })));
}

export async function clear() {
    console.log('Deleting users...');
    const result = await clearAllUsers();
    if (!result) {
        throw new Error('error clearing user database');
    }
}

export function getUser(idx: number = 0): User {
    if (idx >= database.length) {
        throw new Error('user database index is invalid');
    } else {
        return database[idx];
    }
}
