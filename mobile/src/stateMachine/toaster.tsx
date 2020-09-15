import React from 'react';
import { StyleSheet, Animated, Text } from 'react-native';
import Colors from 'src/constants/colors';
import TextStyles from 'src/styles/TextStyles';

import CheckIcon from 'src/assets/images/checkmark-white.svg';
import { Event } from 'common/utils/event';

export type ToastMessage = {
    text: string,
};

const Queue = [] as ToastMessage[];
const Enqueued = new Event();

export function PushToast(message: ToastMessage) {
    if (!message || Queue.find(qi => qi.text === message.text)) {
        return;
    }

    Queue.push(message);
    Enqueued.trigger();
}

export function ToasterView() {
    const [currentMessage, setCurrentMessage] = React.useState('');
    const [position] = React.useState(() => new Animated.Value(40));

    const currentMessageRef = React.useRef<string>();
    React.useEffect(() => {
        currentMessageRef.current = currentMessage;
    });

    const processNext = React.useCallback(() => {
        const m = Queue[0];
        const toastText = m?.text || null;
        if (toastText) {
            Animated.sequence([
                Animated.timing(position, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true
                }),
                Animated.timing(position, {
                    toValue: 40,
                    duration: 300,
                    delay: 2000,
                    useNativeDriver: true
                }),
            ]).start((res) =>  {
                Queue.shift();
                if (res.finished) {
                    requestAnimationFrame(() => {
                        processNext();
                    });
                }
            });
        } else {
            Queue.shift();
        }

        setCurrentMessage(toastText);
    }, [currentMessageRef]);

    React.useEffect(() => Enqueued.on(() => {
        if (!currentMessageRef.current) {
            processNext();
        }
    }), [processNext, currentMessageRef]);

    return currentMessage ? (
        <Animated.View style={[styles.popupMessage, { transform: [{ translateY: position}] }]}>
            <CheckIcon width={8} height={6} />
            <Text style={[TextStyles.labelSmall, styles.popupMessageText]}>
                {currentMessage}
            </Text>
        </Animated.View>
    ) : null;
}

const styles = StyleSheet.create({
    popupMessage: {
        zIndex: 123,
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        height: 40,
        backgroundColor: Colors.toaster.bg,
    },
    popupMessageText: {
        marginLeft: 8,
        textTransform: 'uppercase',
        color: Colors.toaster.text,
    },
});
