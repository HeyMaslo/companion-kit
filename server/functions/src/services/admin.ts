import * as admin from 'firebase-admin';

const app = admin.initializeApp();

export const ProjectId = app.options.projectId;
export const DefaultCredential = app.options.credential;

export default app;

export {
    admin as AdminLib,
};
