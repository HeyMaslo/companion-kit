import { DocumentEntry, DocumentEntryIded, DocumentLinkShareStatuses } from 'common/models/Documents';

export type DocumentsBaseDto = {
    clientCardId: string,
};

export type DocumentCreateDto = DocumentsBaseDto & { document: DocumentEntry };
export type DocumentEditDto = DocumentsBaseDto & { documentId: string, diff: Pick<DocumentEntry, 'name'> };

export namespace DocumentLinks {
    export type ChangeStatusRequest = DocumentsBaseDto & {
        documentId: string,
        status: DocumentLinkShareStatuses,
    };

    export type MarkAsSeen = ChangeStatusRequest & {
        coachId: string,
        status: DocumentLinkShareStatuses.Opened;
    };
}

export type DocumentRequest = DocumentCreateDto | DocumentEditDto | DocumentLinks.ChangeStatusRequest | DocumentLinks.MarkAsSeen;
export type DocumentResponse = DocumentEntryIded;

export namespace DocumentRequest {
    export function isEdit(r: DocumentRequest): r is DocumentEditDto {
        const jed = r as DocumentEditDto;
        return !!jed?.documentId && !!jed?.diff;
    }

    export function isCreate(r: DocumentRequest): r is DocumentCreateDto {
        const jud = r as DocumentCreateDto;
        return !!jud?.document;
    }

    export function isChangeStatus(r: DocumentRequest): r is DocumentLinks.ChangeStatusRequest {
        const did = r as DocumentLinks.ChangeStatusRequest;
        return !!did.clientCardId && !!did.documentId && !!did.status;
    }

    export function isMarkAsSeen(r: DocumentRequest): r is DocumentLinks.MarkAsSeen {
        const did = r as DocumentLinks.MarkAsSeen;
        return !!did.clientCardId && !!did.coachId && did.status === DocumentLinkShareStatuses.Opened;
    }
}
