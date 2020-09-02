import React from 'react';
import { observer } from 'mobx-react';
import { View, Text, Page, Image } from '../common/components';
import ProjectImages from 'app/helpers/images';
import ButtonArrow from 'app/components/ButtonArrow';
import Localization from 'app/services/localization';

@observer
export default class WaitingApproval extends React.Component {

    render() {
        return (
            <Page className="waiting-approval-page">
                <View className="img-wrapper">
                    <Image src={ProjectImages.waitingVisual} />
                </View>
                <View className="wrapper">
                    <Text className="desc-2 type2">Waiting for approval</Text>
                    <Text className="desc-3 type4">Your account needs to be approved before you can start using it. This can take up to 2 days. Please contact your program manager or get support if you have any questions.
                    </Text>
                    <ButtonArrow
                        titleClassName="type4"
                        typeButton="primary"
                        title="Get Support"
                        onClick={() => location.href = Localization.Current.DashboardProject.contactUsLink}
                    />
                </View>
            </Page>
        );
    }
}