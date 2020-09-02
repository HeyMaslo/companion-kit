import { Icon } from 'app/common/components/Button';
import ButtonColor from './ButtonColor';
import ProjectImages from 'app/helpers/images';

import whiteArrow from 'assets/img/white-arrow.svg';
import redArrow from 'assets/img/red-arrow.svg';

type ButtonArrowProps = {
    typeButton: 'primary' | 'secondary';
};

export default class ButtonArrow extends ButtonColor<ButtonArrowProps> {

    getClassName(): string {
        return `btn ${this.props.className || ''} arrow-btn`;
    }

    getTitleClassName(): string {
        return `${this.props.titleClassName} label-btn4`;
    }

    getIcon(): Icon {
        switch (this.props.typeButton) {
            case 'primary': {
                return {
                    src: ProjectImages.buttonArrowPrimary,
                    alt: 'green arrow',
                };
            }
            case 'secondary': {
                return {
                    src: redArrow,
                    alt: 'red arrow',
                };
            }
            default: {
                return {
                    src: whiteArrow,
                    alt: 'white arrow',
                };
            }
        }
    }
}