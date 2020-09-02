import React from 'react';
import { View, Text, Image, Container } from 'app/common/components';
import ButtonArrow from 'app/components/ButtonArrow';

import defaultVisual from 'assets/img/error.svg';

type Props = {
    title: string;
    description?: string;
    visual?: any;
    action?: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
    buttonTitle?: string;
    className?: string;
};

export default function Placeholder(props: Props) {
    const { title, description, action, visual, buttonTitle, className } = props;

    return (
        <Container className={`no-client ${className || '' }`}>
            <View className="img-wrapper">
                <Image src={visual || defaultVisual} />
            </View>
            <View className="wrapper">
                <Text className="desc-2 type2">{title}</Text>
                <Text className="desc-3 type4">{description}</Text>
                {action && (
                    <ButtonArrow
                        // greenArrow
                        typeButton="primary"
                        title={buttonTitle}
                        titleClassName="type4"
                        onClick={action}
                    />
                )}
            </View>
        </Container>
    );
}