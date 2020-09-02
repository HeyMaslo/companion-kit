import React from 'react';
import gsap from 'gsap';
import { View, Text, Image, Container } from 'app/common/components';
import { Render as ToasterRender } from 'app/viewModels/ToasterViewModel';

import CheckIcon from 'assets/img/checked-icon2.svg';

export default function Toaster() {
    const [currentMessage, setCurrentMessage] = React.useState('');

    const toastRef = React.useRef<HTMLDivElement>();

    const currentMessageRef = React.useRef<string>();
    React.useEffect(() => {
        currentMessageRef.current = currentMessage;
    });

    const processNext = React.useCallback(() => {
        const m = ToasterRender.first;
        const toastText = m?.text || null;
        if (toastText && !!toastRef.current) {
            const h = toastRef.current.offsetHeight;

            gsap.killTweensOf(toastRef.current);

            gsap.timeline()
                .set(toastRef.current, { autoAlpha: 1 })
                .fromTo(toastRef.current, 0.3, { y: 0 }, { y: -h })
                .fromTo(toastRef.current, 0.3, { y: -h }, { y: 0 }, 2.3)
                .set(toastRef.current, { autoAlpha: 0 })
                .add(() => {
                    ToasterRender.didRender();
                    requestAnimationFrame(() => {
                        processNext();
                    });
                });
        } else {
            ToasterRender.didRender();
        }

        setCurrentMessage(toastText);
    }, [currentMessageRef]);

    React.useEffect(() => ToasterRender.Enqueued.on(() => {
        if (!currentMessageRef.current) {
            processNext();
        }
    }), [processNext, currentMessageRef]);

    return (
        <View divRef={toastRef} className="toaster">
            <Container className="toaster-container">
                <Image className="toaster-checked" src={CheckIcon} />
                <Text className="desc-3 type1 toaster-text">{currentMessage}</Text>
            </Container>
        </View>
    );
}
