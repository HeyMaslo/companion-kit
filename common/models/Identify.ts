
type Identify<T> = T & {
    id: string;
};

export type CollectionShallowReference = {
    collectionPath: string,
    parentDocumentId?: DocumentShallowReference,
};

export type DocumentShallowReference = {
    id: string,
    documentPath: string,
    parentCollection?: CollectionShallowReference,
};

export default Identify;
