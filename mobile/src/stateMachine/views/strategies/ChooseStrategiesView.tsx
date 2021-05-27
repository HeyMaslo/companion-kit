import { ViewState } from '../base';
import React from 'react';
import { observer } from 'mobx-react';
import AppViewModel from 'src/viewModels';
import { StyleSheet, Text, View, ScrollView, TouchableHighlight, TouchableOpacity, Animated, Dimensions, Alert, SafeAreaView } from 'react-native';
import { MasloPage, Container, Button, BackArrow, GradientChart, Card } from 'src/components';
import { ScenarioTriggers } from '../../abstractions';
import Images from 'src/constants/images';
import Colors from 'src/constants/colors';
import { months } from 'common/utils/dateHelpers';
import TextStyles, { mainFontMedium } from 'src/styles/TextStyles';

// import { styles } from 'react-native-markdown-renderer';

import AppController from 'src/controllers';

const minContentHeight = 300;

@observer
export class ChooseStrategiesView extends ViewState {
    constructor(props) {
        super(props);
        this._contentHeight = this.persona.setupContainerHeightForceScrollDown({ transition: { duration: 0} });
        this.hidePersona();
    }

    public get viewModel() {
        return AppViewModel.Instance.ChooseStrategy;
    }

    async start() {
        let possibleStrategies = await AppController.Instance.User.backend.getPossibleStrategies();
        this.viewModel.setAvailableStrategies(possibleStrategies);
        this.forceUpdate();
    }

    private cancel = () => {
        this.trigger(ScenarioTriggers.Cancel);
    }

    onClose = (): void | Promise<void> => this.runLongOperation(async () => {
        this.showModal({
            title: `Do you really want to stop? Your progress will not be saved.`,
            primaryButton: {
                text: 'yes, stop',
                action: this.cancel,
            },
            secondaryButton: {
                text: 'no, go back',
                action: this.hideModal,
            }
        });
    })

    onDetails = () => {
        this.trigger(ScenarioTriggers.Submit);
    }

    onSelectStrategy = (title: string) => {
        if (this.viewModel.selectStrategy(this.viewModel.getStrategyByTitle(title))) {
            AppController.Instance.User.backend.setStrategies(this.viewModel.selectedStrategies.map(s => s.id));
            this.trigger(ScenarioTriggers.Tertiary)
        } else {
            Alert.alert(
                'Oops',
                'Looks like you have already selected that Strategy.',
                [
                    { text: 'OK' },
                ]);
        }
    }




    renderContent() {
        return (
            <MasloPage style={this.baseStyles.page} onClose={() => this.cancel()} onBack={() => this.cancel()}>
                <Container style={[{height: this._contentHeight, paddingTop: 10, paddingBottom: 10}]}>
                    <View style={{justifyContent: 'space-between', flexDirection: 'row', marginBottom: 20}}>
                        <Text style={[TextStyles.p1, styles.Strategy]}>{'Strategy'}</Text>
                    </View>
                    <View style={{borderWidth: 1, borderRadius: 10, height: 350, justifyContent: 'center', alignItems: 'center'}}>
                        {/* <View style={{justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'red'}}> */}
                            <View style={{
                                flexDirection: 'row', 
                                margin: 10,
                                height: 36,
                                position: 'relative',
                                borderRadius: 4,
                                borderColor: 'green'
                            }}>
                            </View>
                            <ScrollView>
                                    <Text style={this.textStyles.p2}>
                                        {'importance'} 
                                        </Text>
                            </ScrollView>
                            <View style= {[{
                                    marginLeft: 'auto',
                                    flexDirection: 'row',
                                    paddingBottom: 10,
                                }]}
                                // onLayout = {event => this.setState({translateY: event.nativeEvent.layout.height})}
                                
                                >
                                    <Button
                                        title= {0 === 0? 'View Details' : 'Calendar'}
                                        style={styles.buttonDetails}
                                        titleStyles={styles.mailButtonTitle}
                                        onPress={0 === 0? () => this.onDetails() : null}
                                        isTransparent
                                     />

                                </View>
                    </View>
                </Container>
            </MasloPage>
        );
    }
}

const styles = StyleSheet.create({ 
    title: {
        width: '100%',
    },
    buttonContainer: {
        alignItems: 'center',
        width: '100%',
        height: 350,
        // justifyContent: 'space-between',
        paddingBottom: 50,
        // borderWidth: 1,
    },
    buttons: {
        height: 60,
        width: '90%',
    },
    topView: {
        borderWidth: 1,
        borderColor: 'red',
        width: '100%',
        height: '100%'

    },
    pView: {

    },
    tabs: {
        flex: 1,
        justifyContent: 'center', 
        alignItems: 'center',
        borderRadius: 4,
    },
    placeholderHeading: {
        marginTop: 16,
        marginBottom: 12,
    },
    placeholderSubtitle: {
        textAlign: 'center',
        maxWidth: '90%',
        marginVertical: 0,
        marginHorizontal: 'auto',
        color: Colors.secondarySubtitle,
    },
    buttonDetails : {
        borderTopLeftRadius: 25,
        borderBottomLeftRadius: 20,
        borderWidth: 1,
        backgroundColor: '#E0E0E0',
        height: 40,
        width: '45%',
    },
    mailButtonTitle: {
        color: 'black',
        fontSize: 10,
        padding: 10,
    },
    date: {
        textTransform: 'uppercase',
    },
    Strategy :{
        fontWeight: '500',
        letterSpacing: 1.79,
        fontFamily: mainFontMedium,
        // fontSize: 25
    },
    selectStrategy : {
        borderWidth: 1,
        borderRadius: 5,
        color: 'black',
        fontSize: 10,
        padding: 10,
    }
});
