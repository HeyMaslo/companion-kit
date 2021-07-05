import { computed, observable, transaction, toJS } from 'mobx';
import {
    DocumentsController as DocumentsControllerBase,
    logger,
} from 'common/controllers/DocumentsController';
import {
    DocumentEntry,
    DocumentLinkShareStatuses,
    DocumentLinkEntry,
    Identify,
    DocumentLinkShareState,
} from 'common/models';
import { Coaches as CoachesFunctions } from 'common/abstractions/functions';
import Firebase from 'common/services/firebase';
import StorageAsync from 'src/services/StorageAsync';

export interface IDocumentsController {
    readonly activeLinks: ReadonlyArray<Identify<DocumentLinkEntry>>;

    readonly popupDocument: Readonly<Identify<DocumentLinkEntry>>;

    markAsSeen(documentId: string): Promise<void>;
    markAsOpened(documentId: string): Promise<void>;
}

const ShownDocuemntIdsKey = 'user:linkdocs:shown';

export class DocumentsController
    extends DocumentsControllerBase
    implements IDocumentsController {
    @observable
    private _seendDocsIds: Record<string, number>;

    @observable.ref
    private _activeLinks: Identify<DocumentLinkEntry>[] = [];

    get activeLinks() {
        return this._activeLinks;
    }

    @computed
    get popupDocument() {
        return this._seendDocsIds
            ? // find a doc which we haven't seen or have seen but share
              this.activeLinks.find(
                  (d) =>
                      d.share.status === DocumentLinkShareStatuses.Sent &&
                      (!this._seendDocsIds[d.id] ||
                          this._seendDocsIds[d.id] < d.share.date),
              )
            : null;
    }

    async markAsSeen(documentId: string) {
        const doc = this.activeLinks.find((d) => d.id === documentId);
        if (!doc) {
            throw new Error('Link doc was not found for id = ' + documentId);
        }

        if (doc.share?.status !== DocumentLinkShareStatuses.Sent) {
            // no sense to track opened docs as seen
            return;
        }

        this._seendDocsIds[doc.id] = doc.share.date;
        await this.saveSeenIds();
    }

    markAsOpened = async (docId: string) => {
        const doc = this.activeLinks.find((d) => d.id === docId);
        if (!doc) {
            throw new Error('Link Doc was not found for id = ' + docId);
        }

        const prevStatus = doc.share.status;
        transaction(() => {
            doc.share.status = DocumentLinkShareStatuses.Opened;
            if (this._seendDocsIds[doc.id]) {
                delete this._seendDocsIds[doc.id];
                this.saveSeenIds();
            }
        });

        try {
            await Firebase.Instance.getFunction(
                CoachesFunctions.MarkDocumentLinkAsSeen,
            ).execute({
                coachId: this.coachId,
                clientCardId: this.clientCardId,
                documentId: docId,
                status: DocumentLinkShareStatuses.Opened,
            });
        } catch (err) {
            doc.share.status = prevStatus;
            throw err;
        }
    };

    protected async onItemsProcessed() {
        await this.loadSeenIds();

        let needSave = false;
        this._entries.forEach((d) => {
            if (!DocumentEntry.isLink(d)) {
                return;
            }

            const seenDate = this._seendDocsIds[d.id];
            if (
                seenDate &&
                seenDate !==
                    DocumentLinkShareState.getLastStatusDate(
                        d.share,
                        DocumentLinkShareStatuses.Sent,
                    )
            ) {
                delete this._seendDocsIds[d.id];
                needSave = true;
            }
        });

        if (needSave) {
            await this.saveSeenIds();
        }

        this._activeLinks = this._entries.filter(
            (e) =>
                DocumentEntry.isLink(e) &&
                DocumentLinkShareState.isValid(e.share),
        ) as Identify<DocumentLinkEntry>[];
    }

    private async loadSeenIds() {
        const str = await StorageAsync.getValue(ShownDocuemntIdsKey);
        try {
            this._seendDocsIds = (str && JSON.parse(str)) || {};
        } catch (err) {
            this._seendDocsIds = {};
        }
        logger.log('Loaded seen ids: ', toJS(this._seendDocsIds));
    }

    private async saveSeenIds() {
        logger.log('Saving seend ids:', this._seendDocsIds);
        await StorageAsync.setValue(
            ShownDocuemntIdsKey,
            JSON.stringify(this._seendDocsIds),
        );
    }
}
