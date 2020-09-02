import { QueryTracker } from './tracker.base';
import { TrackerEvent } from './abstractions';

const TRACKING_URL = 'https://www.google-analytics.com/g/collect';
const API_VERSION = '2';

export type TrackingRawBaseData = {
    v: string,
    tid: string,
    uid: string,
    cid: string,
};

export type TrackingRawData = {
};

export class Tracker extends QueryTracker {

    protected base: TrackingRawBaseData & TrackingRawData;

    constructor(trackingID: string, clientId: string, userId: string = null) {
        super();

        this.base = {
            v: API_VERSION,
            tid: trackingID,
            uid: userId,
            cid: clientId,
        };
    }

    protected get trackingUrl() { return TRACKING_URL; }
}
