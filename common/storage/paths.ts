
namespace Paths {

    function base(coachId: string, accountId: string) {
        return `entries/${coachId}/${accountId}`;
    }

    export function getJournalEntryPath(coachUid: string, accountId: string, filename: string) {
        return `${base(coachUid, accountId)}/journal/${filename}`;
    }

    export function getSessionEntryPath(coachUid: string, accountId: string, filename: string) {
        return `${base(coachUid, accountId)}/sessions/${filename}`;
    }

    export function getDocumentEntryPath(coachUid: string, accountId: string, filename: string) {
        return `${base(coachUid, accountId)}/documents/${filename}`;
    }

    export function getAvatarPath(uid: string) {
        return `users/${uid}/avatar`;
    }
}

export default Paths;
