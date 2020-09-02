import React, { PropsWithChildren } from 'react';
import { View, Text, Image } from 'app/common/components';
import likeIcon from 'assets/img/like-icon.svg';

type Props = PropsWithChildren<{
    onFeedback: (result: boolean) => void;
}>;

export default function InsightsCard(props: Props) {
    const { onFeedback, children } = props;
    const [answered, changeAnswerd] = React.useState(false);

    const onAnswer = (val: boolean) => {
        changeAnswerd(true);
        onFeedback(val);
    };

    return (
        <View className="insights-card">
            {children}

            <View className="feedback-block">
                {!answered && (
                    <>
                        <Text>Was this helpful?</Text>
                        <View>
                            <Text className="like" onClick={() => onAnswer(true)}>
                                <Image src={likeIcon}/>
                                Yes
                            </Text>
                            {/* <Text className="like revert" onClick={() => onAnswer(false)}>
                                <Image src={likeIcon}/>
                                No
                            </Text> */}
                        </View>
                    </>
                )}

                {answered && (
                    <Text>Got it. Thanks!</Text>
                )}
            </View>
        </View>
    );
}