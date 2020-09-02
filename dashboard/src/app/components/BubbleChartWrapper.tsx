import React from 'react';
import { Text, Container, View, Tooltip } from 'app/common/components';
import RadioButtonsGroup from 'app/common/components/RadioButtonsGroup';
import * as ViewModels from 'common/viewModels';

interface Props {
    clientName: string;
    tooltipMessage?: string;
    tooltipTitle?: string;
    children?: React.ReactNode;
    filterModel: ViewModels.SelectString;
    onChange?: () => void;
}

export default function BubbleChartWrapper(props: Props) {
    const { clientName, tooltipMessage, tooltipTitle, children, filterModel, onChange } = props;

    return(
        <Container className="bubble-chart-wrap">
            <View className="bubble-chart-heading">
                <View className="bubble-chart-title-wrap">
                    { tooltipMessage &&
                        <Tooltip title={tooltipTitle} message={tooltipMessage} />
                    }
                    <Text className="title-h2 type5">What is {clientName} talking about:</Text>
                </View>
                <RadioButtonsGroup
                    model={filterModel}
                    onChange={onChange}
                />
            </View>
            {children}
        </Container>
    );
}
