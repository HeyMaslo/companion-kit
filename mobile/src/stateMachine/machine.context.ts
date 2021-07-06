import { observable } from 'mobx';
import { Keyboard, PixelRatio } from 'react-native';
import Layout from 'src/constants/Layout';
import { IPersonaViewContext, IStateViewContext, KeyboardState } from './abstractions';
import { PersonaViewPresets, PersonaStates, PersonaViewState, CurrentPersonaSettings } from './persona';
import logger from 'common/logger';
import { PersonaArmState } from 'dependencies/persona/lib';

class PersonaViewContext implements IPersonaViewContext {
    @observable
    public state: PersonaStates = PersonaStates.Init;

    @observable.ref
    public view: PersonaViewState = PersonaViewPresets.Default;

    @observable
    public qolArmMagnitudes: PersonaArmState = PersonaArmState.createEmptyArmState();

    // will be set outside
    public currentSettings: CurrentPersonaSettings = null;

    private get personaRadius() { return (this.currentSettings?.radius || 123) * (this.currentSettings?.resultScale || 1); }

    getContainerHeight(minHeight: number, baseView?: Partial<PersonaViewState>, boxHeight: number = null): { height: number, view: PersonaViewState } {
        const pixelRatio = PixelRatio.get();
        const personaRadius = this.personaRadius;
        let personaBoxHeight = 0;

        if (boxHeight !== null) { 
            personaBoxHeight = boxHeight + (personaRadius/pixelRatio);
        } else if (Layout.window.width < 710) {
            personaBoxHeight = Layout.window.width * 0.7;
        } else if (Layout.window.width < 800) {
            personaBoxHeight = Layout.window.width * 0.8;
        } else {
            personaBoxHeight = Layout.window.width;
        }

        const windowHeight = Layout.window.height;
        const notEnoughSpace = (minHeight + personaBoxHeight) > windowHeight;
        const offset = windowHeight - personaBoxHeight - minHeight;

        const limit = personaBoxHeight * 0.38;

        // default view state
        const view: PersonaViewState = {
            scale: 1,
            rotation: 45,
            ...baseView,
            position: { x: 0, y: 0 },
            anchorPoint: { x: 0, y: 0 },
        };
        let availableHeight: number;

        if (notEnoughSpace) {
            // logger.log('not enough space. move persona up.');
            if (Math.abs(offset) > limit) {
                view.position.y = windowHeight * pixelRatio / 2;
                view.debugName = 'SETUP_HALF_OUT';

                availableHeight = windowHeight - personaRadius / pixelRatio;
            } else {
                view.position.y = (minHeight - windowHeight / 2) * pixelRatio;
                view.anchorPoint.y = 1;
                view.debugName = 'SETUP_PARTIAL';

                availableHeight = minHeight;
            }
        } else {
            view.position.y = (windowHeight / 2 - personaBoxHeight) * pixelRatio;
            view.anchorPoint.y = 1;
            view.debugName = 'SETUP_FULL_SIZE';

            // logger.log('persona position is ok. scale up content.');
            availableHeight = minHeight + offset;
        }

        logger.log('[PersonaViewContext] getContainerHeight', { personaRadius, notEnoughSpace, minHeight, offset, limit, availableHeight, pixelRatio });

        return {
            height: availableHeight,
            view: view,
        };
    }

    getScrollContainerHeight(baseView?: Partial<PersonaViewState>): { height: number, view: PersonaViewState } {
        const dh = Layout.window.height;
        const personaRadius = this.personaRadius;
        const pixelRatio = PixelRatio.get();

        const view: PersonaViewState = {
            scale: 1,
            rotation: 45,
            ...baseView,
            position: {
                x: 0,
                y: dh * pixelRatio / 2,
            },
            anchorPoint: { x: 0, y: 0 },
            debugName: 'SETUP_SCROLL',
        };

        const availableHeight = dh - personaRadius / pixelRatio;

        logger.log('[PersonaViewContext] getScrollContainerHeight', { personaRadius, availableHeight, pixelRatio });

        return {
            height: availableHeight,
            view: view,
        };
    }
    getScrollContainerHeightDown(baseView?: Partial<PersonaViewState>): { height: number, view: PersonaViewState } {
        const dh = Layout.window.height;
        const personaRadius = this.personaRadius;
        const pixelRatio = PixelRatio.get();

        const view: PersonaViewState = {
            scale: 1,
            rotation: 45,
            ...baseView,
            position: {
                x: 0,
                y: -(dh * pixelRatio / 2),
            },
            anchorPoint: { x: 0, y: 0 },
            debugName: 'SETUP_SCROLL',
        };

        const availableHeight = dh - personaRadius / pixelRatio;

        logger.log('[PersonaViewContext] getScrollContainerHeight', { personaRadius, availableHeight, pixelRatio });

        return {
            height: availableHeight,
            view: view,
        };
    }

    setupContainerHeight(minHeight: number, baseView?: Partial<PersonaViewState>, boxHeight: number = null) {
        const res = this.getContainerHeight(minHeight, baseView, boxHeight);
        this.view = res.view;
        return res.height;
    }

    setupContainerHeightForceScroll(baseView?: Partial<PersonaViewState>) {
        const res = this.getScrollContainerHeight(baseView);
        this.view = res.view;
        return res.height;
    }
    setupContainerHeightForceScrollDown(baseView?: Partial<PersonaViewState>) {
        const res = this.getScrollContainerHeightDown(baseView);
        this.view = res.view;
        return res.height;
    }
}

export class ViewContext implements IStateViewContext {
    public readonly persona: IPersonaViewContext = new PersonaViewContext();

    @observable.ref
    private _keyboardProps: KeyboardState;

    get keyboard(): Readonly<KeyboardState> { return this._keyboardProps; }

    constructor() {
        this.initKeyboardEvents();
    }

    initKeyboardEvents() {
        Keyboard.addListener(
            'keyboardDidHide',
            event => this._keyboardProps = { ...event.endCoordinates, isOpened: false },
        );
        Keyboard.addListener(
            'keyboardDidShow',
            event => this._keyboardProps = { ...event.endCoordinates, isOpened: true },
        );
    }
}