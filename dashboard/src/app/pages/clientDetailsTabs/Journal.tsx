import React from 'react';
import { observer } from 'mobx-react';
import * as Routes from 'app/constants/routes';
import { ClientDetails } from 'app/constants/clientRoutes';
import history from 'app/services/history';
import { View, Page, Image, Text } from 'app/common/components';
import JournalListViewModel from 'app/viewModels/JournalPage';
import Placeholder from 'app/components/PlaceHolder';
import WebClientTracker, { Events } from 'app/services/webTracker';
import JournalList from './JournalList';
import ProjectImages from 'app/helpers/images';

type JournalProps = {
    model: JournalListViewModel;
};

function openTab(cid: string, tab: ClientDetails.Tabs) {
    history.push(Routes.ClientDetails(cid, tab));
}

const Journal = observer((props: JournalProps) => {
    const model = props.model;

    React.useEffect(() => {
        WebClientTracker.Instance?.trackEvent(Events.Journal(model.clientName));
    }, []);

    const { activeId, clientId } = model;

    const openPrompts = React.useCallback(() => openTab(clientId, ClientDetails.Tabs.prompts), [clientId]);
    const openInterventions = React.useCallback(() => openTab(clientId, ClientDetails.Tabs.interventions), [clientId]);

    const list = model.list?.length
        ? (
            <JournalList
                list={model.list}
                clientId={model.clientId}
                activeId={activeId}
            />
        ) : (
            <Placeholder
                className="journal-empty"
                title="Your client doesn’t have check-ins"
                visual={ProjectImages.JournaPlaceholder}
            />
        );

    return (
        <Page>
            <View className="journal-tab">
                <View className="actions-block">
                    <View onClick={openPrompts} className="prompts-btn action-btn">
                        <Image src={ProjectImages.iconPrompt}/>
                        <Text className="label-draganddrop">Manage Prompts</Text>
                    </View>
                    {
                        process.appFeatures.INTERVENTIONS_ENABLED &&
                        <View onClick={openInterventions} className="interventions-btn action-btn">
                            <Image src={ProjectImages.iconInterventions}/>
                            <Text className="label-draganddrop">Manage Interventions</Text>
                        </View>
                    }
                </View>
                {list}
            </View>
        </Page>
    );
});

export default Journal;
