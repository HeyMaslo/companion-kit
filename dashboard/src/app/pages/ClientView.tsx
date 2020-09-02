import React from 'react';
import { observer } from 'mobx-react';
import { Container, View, Text, Page, Image } from 'app/common/components';
import { RouteComponentProps } from 'react-router';
import History from '../services/history';
import * as Routes from 'app/constants/routes';
import ClientEditorViewModel from 'app/viewModels/ClientEditorViewModel';
import ProjectImages from 'app/helpers/images';
import ButtonColor from 'app/components/ButtonColor';
import { formatToLocalDate } from 'common/utils/dateHelpers';
import AppController from 'app/controllers';

type Props = RouteComponentProps<{ clientId: string}>;

const GoBack = () => History.goBack();
const DiagnosisName = [
    'Primary',
    'Secondary',
    'Tertiary',
];

const ClientView = observer((props: Props) => {

    const model = React.useMemo(() => new ClientEditorViewModel(), []);
    const [avatarUrl, setAvatarUrl] = React.useState<string>();

    React.useEffect(() => {
        return () => {
            model.dispose();
        };
    }, []);

    React.useEffect(() => {
        const clientId = props.match.params.clientId;
        model.setClientId(clientId);
    }, [props.match.params.clientId]);

    React.useEffect(() => {
        if (model.client?.clientId) {
            AppController.Instance.User.getUserPublicInfo(model.client.clientId)
                .then(info => setAvatarUrl(info?.photoURL));
        }
    }, [model.client]);

    const { client, caretaker, extraCaretaker, inProgress } = model;
    const birthday =  client.birthday && formatToLocalDate(client.birthday);
    const avatar = avatarUrl || ProjectImages.AvatarPlaceholderClient;

    return (
        <Page inProgress={inProgress} className="view-client-page">
            <Container>
                <View onClick={GoBack} className="arrow-link">
                    <Image className="arrow-icon" src={ProjectImages.backArrow} />
                </View>
                <View className="info-wrap">
                    <View className="main-info">
                        <View className="heading-wrap">
                            <View className="wrapper">
                                <View className="avatar-wrap">
                                    <Image
                                        src={avatar}
                                    />
                                </View>
                                <Text className="title title-h1 name-client">{client.firstName} {client.lastName}</Text>
                            </View>
                            <ButtonColor onClick={() => History.push(Routes.ClientDetails(client.id, Routes.ClientDetails.Tabs.edit))} titleClassName="type2" title="edit client info"/>
                        </View>
                        <View className="personal-info">
                            <View className="row">
                                {
                                    client.nickname &&
                                    <View className="field">
                                        <Text className="field-label desc-5">Nickname:</Text>
                                        <Text className="field-value label-dropdown2">{client.nickname}</Text>
                                    </View>
                                }
                                {
                                    birthday &&
                                    <View className="field">
                                        <Text className="field-label desc-5">Date of birth:</Text>
                                        <Text className="field-value label-dropdown2">{birthday}</Text>
                                    </View>
                                }
                                {
                                    client.phone &&
                                    <View className="field field--phone">
                                        <Text className="field-label desc-5">Phone:</Text>
                                        <span className="field-value label-dropdown2" title={client.phone}>{client.phone}</span>
                                    </View>
                                }
                                {
                                    client.externalPatientId &&
                                    <View className="field field--clientID">
                                        <Text className="field-label desc-5">Client ID:</Text>
                                        <span className="field-value label-dropdown2" title={client.externalPatientId}>{client.externalPatientId}</span>
                                    </View>
                                }
                                <View className="field field--email">
                                    <Text className="field-label desc-5">Email:</Text>
                                    <span className="field-value label-dropdown2" title={client.email}>{client.email}</span>
                                </View>
                            </View>
                            {
                                client.description &&
                                <View className="row">
                                    <View className="field field--notes">
                                        <Text className="field-label desc-5">Notes:</Text>
                                        <span className="field-value label-dropdown2" title={client.description}>{client.description}</span>
                                    </View>
                                </View>
                            }
                            {
                                client.diagnosis?.length &&
                                <View className="row">
                                    {client.diagnosis.map((diagnosis, i) => diagnosis && (
                                        <View className="field" key={i}>
                                            <Text className="field-label desc-5">{DiagnosisName[i]} Diagnosis:</Text>
                                             <span className="field-value label-dropdown2" title={diagnosis}>{diagnosis}</span>
                                        </View>
                                        ),
                                    )}
                                </View>
                            }
                        </View>
                    </View>
                    <View className="separator" />
                    <View className="sub-info">
                        {
                            !caretaker.isAllEmpty &&

                            <View className="sub-info-block">
                                <Text className="subtitle label-draganddrop">Caretaker</Text>
                                <View className="row">
                                {
                                    caretaker.firstName.value &&
                                    <View className="field field--name">
                                        <Text className="field-label desc-5">First name:</Text>
                                        <span className="field-value label-client-item" title={caretaker.firstName.value}>{caretaker.firstName.value}</span>
                                    </View>
                                }
                                {
                                    caretaker.lastName.value &&
                                    <View className="field field--name">
                                        <Text className="field-label desc-5">Last name:</Text>
                                        <span className="field-value label-client-item" title={caretaker.lastName.value}>{caretaker.lastName.value}</span>
                                    </View>
                                }
                                {
                                    caretaker.relationship.value &&
                                    <View className="field field--relationship">
                                        <Text className="field-label desc-5">Relationship to client:</Text>
                                        <span className="field-value label-client-item" title={caretaker.relationship.value}>{caretaker.relationship.value}</span>
                                    </View>
                                }
                                {
                                    caretaker.phone.value &&
                                    <View className="field field--phone">
                                        <Text className="field-label desc-5">Phone:</Text>
                                        <span className="field-value label-client-item" title={caretaker.phone.value}>{caretaker.phone.value}</span>
                                    </View>
                                }
                                {
                                    caretaker.email.value &&
                                    <View className="field">
                                        <Text className="field-label desc-5">Email:</Text>
                                        <span className="field-value label-client-item" title={caretaker.email.value }>{caretaker.email.value }</span>
                                    </View>
                                }
                                </View>
                            </View>
                        }
                        {
                            !extraCaretaker.isAllEmpty &&

                            <View className="sub-info-block">
                                <Text className="subtitle label-draganddrop">Additional Caretaker</Text>
                                <View className="row">
                                    {
                                        extraCaretaker.firstName.value &&
                                        <View className="field field--name">
                                            <Text className="field-label desc-5">First name:</Text>
                                            <span className="field-value label-client-item" title={extraCaretaker.firstName.value }>{extraCaretaker.firstName.value }</span>
                                        </View>
                                    }
                                    {
                                        extraCaretaker.lastName.value &&
                                        <View className="field field--name">
                                            <Text className="field-label desc-5">Last name:</Text>
                                            <span className="field-value label-client-item" title={extraCaretaker.lastName.value }>{extraCaretaker.lastName.value }</span>
                                        </View>
                                    }
                                    {
                                        extraCaretaker.relationship.value &&
                                        <View className="field field--relationship">
                                            <Text className="field-label desc-5">Relationship to client:</Text>
                                            <span className="field-value label-client-item" title={extraCaretaker.relationship.value }>{extraCaretaker.relationship.value }</span>
                                        </View>
                                    }
                                    {
                                        extraCaretaker.phone.value &&
                                        <View className="field field--phone">
                                            <Text className="field-label desc-5">Phone:</Text>
                                            <span className="field-value label-client-item" title={extraCaretaker.phone.value }>{extraCaretaker.phone.value }</span>
                                        </View>
                                    }
                                    {
                                        extraCaretaker.email.value &&
                                        <View className="field">
                                            <Text className="field-label desc-5">Email:</Text>
                                            <span className="field-value label-client-item" title={extraCaretaker.email.value }>{extraCaretaker.email.value }</span>
                                        </View>
                                    }
                                </View>
                            </View>
                        }
                    </View>
                </View>
            </Container>
        </Page>
    );
});

export default ClientView;
