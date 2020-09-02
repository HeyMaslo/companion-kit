import Button, { Icon } from 'app/common/components/Button';

export default class ButtonColor<T> extends Button<T> {

    getTitleClassName(): string {
        return `${this.props.titleClassName ? this.props.titleClassName : ''} label-btn4`;
    }
}