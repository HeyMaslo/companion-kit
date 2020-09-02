import { autorun } from 'mobx';
import AudioPlayerVM from 'app/viewModels/AudioPlayer';
import { ClientEntry } from 'common/models/ClientEntries';
import { formatDate } from 'common/utils/dateHelpers';

export default abstract class AudioItem {
    private readonly _audioPlayer: AudioPlayerVM;

    private _onActiveUnsubsriber: () => void = null;

    constructor(entry: ClientEntry) {

        const getTitle = () => this.title;
        this._audioPlayer = new AudioPlayerVM({
            audioRef: entry.auidioRef,
            description: formatDate(entry.date),
            audioMeta: entry.audioMeta,
            get title() { return getTitle(); },
        });
    }

    get audioPlayer() { return this._audioPlayer; }
    get active() { return this._audioPlayer.playing; }

    public abstract get title(): string;

    onActive(cb: () => void) {
        if (this._onActiveUnsubsriber) {
            this._onActiveUnsubsriber();
            this._onActiveUnsubsriber = null;
        }

        if (cb) {
            this._onActiveUnsubsriber = autorun(() => {
                if (this.active) {
                    cb();
                }
            });
        }

        return this;
    }
}