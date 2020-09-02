import React from 'react';
import { View, Text, Page, Container } from '../common/components';
import ButtonArrow from 'app/components/ButtonArrow';
import History from '../services/history';
import * as Routes from 'app/constants/routes';
import { ClientStatus } from 'common/models';

export default class AddNewClientSuccess extends React.Component {

    render() {

        return (
            <Page className="add-client-success">
                <Container>
                    <View className="text-block">
                        <Text className="title title-h1">Great! You did it well.</Text>
                        <Text className="desc title-h2">Manage the invited client or go back to the dashboard.</Text>
                        <View className="btn-wrap">
                            <ButtonArrow
                                // greenArrow
                                typeButton="primary"
                                title="manage invite"
                                titleClassName="type1"
                                onClick={() => History.replace(Routes.Clients, { defaultStatus: ClientStatus.Invited })}
                            />
                        </View>
                    </View>
                </Container>
            </Page>
        );
    }
}
