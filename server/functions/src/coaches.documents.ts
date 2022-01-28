import { FunctionFactory } from 'server/utils/createFunction';
import { Repo } from 'server/services/db';
import { Coaches as CoachesFunctions } from 'common/abstractions/functions';
import * as DocumentsDtos from 'common/models/dtos/documents';
import { transferDefinedFields } from 'common/utils/fields';
import { FeatureSettings } from './services/config';
import { DocumentFileEntry, DocumentLinkShareStatuses, DocumentLinkShareState, UserRoles } from 'common/models';
import AppHttpError from './utils/AppHttpError';
// import { pushNotifications } from './services/notifications';
import { NotificationTypes } from 'common/models/Notifications';

export const DocumentsEndpoint = FeatureSettings.DocumentsEnabled && new FunctionFactory(CoachesFunctions.DocumentsEndpoint)
.create(async (data, ctx) => {
    const user = await Repo.Users.getUserById(ctx.auth.uid);

    const validateRole = (allowed: UserRoles) => {
        if (!UserRoles.Helper.contains(user.roles, allowed)) {
            throw AppHttpError.NoPermission('Role mismatch');
        }
    };

    const coachId = ctx.auth.uid;
    const clientCardId = data.clientCardId;

    if (DocumentsDtos.DocumentRequest.isEdit(data)) {
        validateRole(UserRoles.Coach);

        const diff: Partial<DocumentFileEntry> = { };
        transferDefinedFields(data.diff, diff, 'name');

        const resultUpdate = await Repo.ClientCards.updateDocument(coachId, clientCardId, data.documentId, diff);

        return resultUpdate;
    }

    if (DocumentsDtos.DocumentRequest.isCreate(data)) {
        validateRole(UserRoles.Coach);

        const document = data.document;
        document.date = Date.now();

        const clientCard = await Repo.ClientCards.getClient(coachId, clientCardId);
        const clientUid = clientCard.clientId;

        document.clientUid = clientUid;
        document.coachUid = ctx.auth.uid;
        document.clientCardId = clientCard.id;

        console.log('[CreateDocument] Creating document:', document);

        const res = await Repo.ClientCards.createDocument(coachId, clientCardId, document);

        return res;
    }

    if (DocumentsDtos.DocumentRequest.isMarkAsSeen(data)) {
        validateRole(UserRoles.Client);

        const res = await changeDocShareStatus(data, data.status, data.coachId);
        return res;
    }

    if (DocumentsDtos.DocumentRequest.isChangeStatus(data)) {
        validateRole(UserRoles.Coach);

        const res = await changeDocShareStatus(data, data.status, coachId);
        return res;
    }
});

async function changeDocShareStatus(data: DocumentsDtos.DocumentLinks.ChangeStatusRequest | DocumentsDtos.DocumentLinks.MarkAsSeen, status: DocumentLinkShareStatuses, coachId: string) {
    const doc = await Repo.ClientCards.getDocument(coachId, data.clientCardId, data.documentId);

    if (doc?.type !== 'link') {
        throw AppHttpError.InvalidArguments({ name: 'data.documentId', error: 'Expected link document' });
    }

    let share = doc.share;
    if (!share) {
        if (status !== DocumentLinkShareStatuses.Sent) {
            throw AppHttpError.PreconditionFailed('Newly shared doc link status should be only set to "sent".');
        }

        share = {
            date: Date.now(),
            status: status,
        };
    } else {
        DocumentLinkShareState.changeStatus(share, status);
    }

    if (share.status === DocumentLinkShareStatuses.Sent) {
        const coachUser = await Repo.Users.getUserById(doc.coachUid);

        // await pushNotifications([{
        //     uid: doc.clientUid,
        //     data: {
        //         body: `${coachUser.firstName} ${coachUser.lastName} sent you ${doc.name}.`,
        //         subtitle: 'New Link',
        //         data: {
        //             type: NotificationTypes.NewDocumentLinkShared,
        //             docId: doc.id,
        //         },
        //         displayInForeground: true,
        //     },
        // }]);
    }

    const res = await Repo.ClientCards.updateDocument(doc.coachUid, doc.clientCardId, doc.id, { share });
    return res;
}
