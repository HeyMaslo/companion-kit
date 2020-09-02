import React from 'react';
import { View, Text } from 'app/common/components';
import { InputObservable } from 'app/common/components/Input';
import { TextAreaObservable } from 'app/common/components/TextArea';
import Localization from 'app/services/localization';
import ClientEditorViewModel from 'app/viewModels/ClientEditorViewModel';
import { ClientCardFeatures } from 'common/constants/features';
import { DatePickerObservable } from 'app/components/DatePicker.Loader';

const ProjectTexts = Localization.Current.DashboardProject;

export default class ClientEditorForm extends React.Component<{model: ClientEditorViewModel}> {
    render() {
        const { model } = this.props;
        const { isEditMode, isInvitation, caretaker, extraCaretaker } = model;

        return (
            <View>
                <View className="client-info-wrap info-wrap">
                    <View className="text-block">
                        <Text className="desc-2 type2">Client info</Text>
                    </View>
                    <View className="inputs-wrap">
                        <View className="row">
                            <InputObservable
                                model={model.firstName}
                                label="first name"
                                placeholder="Enter name"
                                maxLength={15}
                                required
                            />
                            <InputObservable
                                model={model.lastName}
                                label="last name"
                                placeholder="Enter last name"
                                maxLength={15}
                                required
                            />
                            { ClientCardFeatures.UseTherapistClientInfo ? (
                                    <InputObservable
                                        model={model.nickname}
                                        label={
                                            <>
                                                <Text>Nickname &nbsp;</Text>
                                                <Text className="sub-label">optional and visible for you</Text>
                                            </>
                                        }
                                        placeholder="Enter nickname"
                                        maxLength={15}
                                        required
                                    />
                            ) : (
                                    <InputObservable
                                        model={model.email}
                                        disabled={isEditMode && !isInvitation}
                                        label="email"
                                        placeholder="example@example.com"
                                        required
                                    />
                            )}
                        </View>
                        <View className="row">
                            { ClientCardFeatures.UseTherapistClientInfo && (
                                <>
                                    <DatePickerObservable
                                        model={model.birthday}
                                        label="Date of birth"
                                        className="datepicker"
                                        required
                                    />
                                    <InputObservable
                                        model={model.email}
                                        disabled={isEditMode && !isInvitation}
                                        name="email"
                                        label="email"
                                        placeholder="example@example.com"
                                        required
                                    />
                                </>
                            )}
                            { ClientCardFeatures.UseOccupation && (
                                <>
                                    <InputObservable
                                        model={model.occupation}
                                        label="Client Occupation"
                                        placeholder="Position"
                                        className="occupation"
                                        required
                                    />
                                </>
                            )}
                            <InputObservable
                                model={model.phone}
                                label="phone"
                                placeholder="ex.9497973232"
                                required
                            />
                        </View>
                        <View className="row">
                            { ClientCardFeatures.UseTherapistClientInfo && (
                                <InputObservable
                                    model={model.externalPatientId}
                                    label={
                                            <>
                                                <Text>Patient ID &nbsp;</Text>
                                                <Text className="sub-label">optional and visible for you</Text>
                                            </>
                                        }
                                    placeholder="Patient ID"
                                />
                            )}
                            <TextAreaObservable
                                model={model.description}
                                label={
                                    <>
                                        <Text>Notes &nbsp;</Text>
                                        <Text className="sub-label">optional and visible for you</Text>
                                    </>
                            }
                                errorMsg={model.description.error}
                                placeholder={`Any notes you want to store about your ${ProjectTexts.clientName.singular.toLowerCase()}`}
                                className="notes"
                            />
                        </View>
                    </View>
                </View>
                {
                    process.appFeatures.COACH_TIME_TRACKING_ENABLED &&
                    <View className="info-wrap diagnosis">
                        <View className="text-block">
                            <Text className="desc-2 type2">Diagnosis&nbsp;</Text>
                            <Text className="desc-2 type3">(optional)</Text>
                        </View>
                        <View className="inputs-wrap">
                            <View className="row">
                                <InputObservable
                                    model={model.diagnosisFirst}
                                    name="email"
                                    label="Primary Diagnosis"
                                    placeholder="Primary Diagnosis"
                                />
                                <InputObservable
                                    model={model.diagnosisSecond}
                                    name="email"
                                    label="Secondary Diagnosis"
                                    placeholder="Secondary Diagnosis"
                                />
                                <InputObservable
                                    model={model.diagnosisThird}
                                    name="email"
                                    label="Tertiary Diagnosis"
                                    placeholder="Tertiary Diagnosis"
                                />
                            </View>
                        </View>
                    </View>
                }
                {
                    process.appFeatures.CLIENT_CARETAKERS_ENABLED &&
                    <>
                        <View className="info-wrap caretaker-wrap">
                            <View className="text-block">
                                <Text className="desc-2 type2">Caretaker&nbsp;</Text>
                                <Text className="desc-2 type3">(optional)</Text>
                            </View>
                            <View className="inputs-wrap">
                                <View className="row">
                                    <InputObservable
                                        model={caretaker.firstName}
                                        label="first name"
                                        placeholder="Enter name"
                                        maxLength={15}
                                    />
                                    <InputObservable
                                        model={caretaker.lastName}
                                        label="last name"
                                        placeholder="Enter last name"
                                        maxLength={15}
                                    />
                                    <InputObservable
                                        model={caretaker.email}
                                        label="email"
                                        placeholder="example@example.com"
                                    />
                                </View>
                                <View className="row">
                                    <InputObservable
                                        model={caretaker.relationship}
                                        label="Relationship to client"
                                        placeholder="Father, Mother, Sister, Brother etc."
                                        className="relationship"
                                    />
                                    <InputObservable
                                        model={caretaker.phone}
                                        label="phone"
                                        placeholder="ex.9497973232"
                                    />
                                </View>
                            </View>
                        </View>
                        <View className="info-wrap add-caretaker-wrap">
                            <View className="text-block">
                                <Text className="desc-2 type2">Additional Caretaker&nbsp;</Text>
                                <Text className="desc-2 type3">(optional)</Text>
                            </View>
                            <View className="inputs-wrap">
                                <View className="row">
                                    <InputObservable
                                        model={extraCaretaker.firstName}
                                        label="first name"
                                        placeholder="Enter name"
                                        maxLength={15}
                                    />
                                    <InputObservable
                                        model={extraCaretaker.lastName}
                                        label="last name"
                                        placeholder="Enter last name"
                                        maxLength={15}
                                    />
                                    <InputObservable
                                        model={extraCaretaker.email}
                                        label="email"
                                        placeholder="example@example.com"
                                    />
                                </View>
                                <View className="row">
                                    <InputObservable
                                        model={extraCaretaker.relationship}
                                        label="Relationship to client"
                                        placeholder="Father, Mother, Sister, Brother etc."
                                        className="relationship"
                                    />
                                    <InputObservable
                                        model={extraCaretaker.phone}
                                        label="phone"
                                        placeholder="ex.9497973232"
                                    />
                                </View>
                            </View>
                        </View>
                    </>
                }
            </View>
        );
    }
}
