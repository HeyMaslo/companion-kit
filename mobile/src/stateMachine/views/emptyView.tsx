import { ViewState } from './base';

export class EmptyView extends ViewState {
    start() {
        /* */
    }

    renderContent() {
        return null;
    }
}
