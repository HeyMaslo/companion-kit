import React from 'react';
import { observer } from 'mobx-react';
import { View, Text, Page, Container } from 'app/common/components';
import ClientItem from 'app/components/ClientItem';
import * as Routes from 'app/constants/routes';
import History from 'app/services/history';
import Placeholder from 'app/components/PlaceHolder';

import ClientsPageViewModel from 'app/viewModels/ClientsPageViewModel';
import ProfileViewModel from 'app/viewModels/ProfileViewModel';
import Localization from 'app/services/localization';

import ProjectImages from 'app/helpers/images';
import WaitingApproval from 'app/pages/WaitingApproval';
import Select from 'app/common/components/Select';

const ClientName = Localization.Current.DashboardProject.clientName;

const Clients = observer(() => {

    const model = ClientsPageViewModel.Instance;
    const profile = ProfileViewModel.Instance;

    const name = profile.user && profile.user.firstName;
    const loading = model.loading;
    const inProgress = model.inProgress;

    const ccount = model.clients?.length || 0;
    const descInner = `${ccount} ${ccount === 1 ? ClientName.singular : ClientName.plural}`;

    return (
        <Page inProgress={inProgress} className="clients-page">
            <Container className="top">
                <Text className="title title-h1">Hello {name}</Text>
                <Text className="desc-1">
                    { !loading ? (
                        <>
                            You have&nbsp;
                            <Text className="desc-1 type1">
                                {descInner}
                            </Text>
                        </>
                    ) : ' '}
                </Text>
                <View className="filter-wrap">
                    <Text className="label-btn4 type6">your {ClientName.plural}</Text>
                    <Select
                        model={model.sortingType}
                        className="sort-clients"
                        buttonClassname="label-dropdown3"
                        itemClassname="label-dropdown3"
                    />
                </View>
            </Container>
            <View className="scrollable">
                {model.clients?.length
                    ? (
                        <ul className="clients-list">
                            {model.clientsSorted.map(client => (
                                <ClientItem
                                    key={client.id}
                                    client={client}
                                />
                            ))}
                        </ul>
                    )
                    : (
                        <Placeholder
                            title="No clients yet"
                            description="Let’s add your first client!"
                            action={() => History.push(Routes.AddNewClient)}
                            buttonTitle="invite new client"
                            visual={ProjectImages.noClientsVisual}
                            className={'clients'}
                        />
                    )
                }
            </View>
        </Page>
    );
});

export default Clients;
