import React from 'react';
import { Persona } from 'dependencies/persona/web';
import { View } from 'app/common/components';
import { HtmlElementPersister } from 'app/utils/htmlElementPersister';
import { setTimeoutFramesAsync } from 'common/utils/async';

export type Props = {
};

const PersonaColors = [
    '#BABFBF',
    '#D3DADA',
    '#E6ECEC',
    '#FCFCFC',
    '#EAE8EB',
    '#D6D1D8',
    '#AFA7B1',
    '#3F3C44',
];

let SharedPersona: Persona = null;
const Persister = new HtmlElementPersister();

export default class PersonaComponent extends React.Component<Props> {
    private _containerRef = React.createRef<HTMLDivElement>();

    componentDidMount() {
        this.loadPersona();
    }

    private async loadPersona() {
        const radius = Math.round(this._containerRef.current.clientWidth / 3);

        if (!SharedPersona) {
            const el = this._containerRef.current.appendChild(
                window.document.createElement('div'),
            );

            el.style.width = '100%';
            el.style.height = '100%';

            SharedPersona = new Persona({
                element: el,
                size: radius * 3,
                persona: {
                    radius: radius,
                    ringRes: 50,
                    colors: PersonaColors,
                },
                analytics: {
                    appName: 'companion kit',
                    dataSource: 'Overview',
                    ignoreMood: true,
                },
            });

            Persister.init(el);

            await setTimeoutFramesAsync(10);
        } else {
            Persister.restore(this._containerRef.current);
        }

        SharedPersona.run();
    }

    componentWillUnmount() {
        SharedPersona?.stop();
        Persister.hide();
    }

    render(): React.ReactNode {
        return (
            <View style={{ width: '100%', height: '100%' }} divRef={this._containerRef} />
        );
    }
}
