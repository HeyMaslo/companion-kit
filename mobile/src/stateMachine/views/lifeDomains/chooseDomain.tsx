import { ViewState } from '../base';
import React from 'react';
import { observer } from 'mobx-react';
import AppViewModel from 'src/viewModels';
import { StyleSheet, Text, View, ScrollView, TouchableHighlight, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { MasloPage, Container, Button, BackArrow, GradientChart, Card } from 'src/components';
import { ScenarioTriggers } from '../../abstractions';
import Images from 'src/constants/images';
import Colors from 'src/constants/colors';
import { months } from 'common/utils/dateHelpers';
import TextStyles, { mainFontMedium } from 'src/styles/TextStyles';

import { styles } from 'react-native-markdown-renderer';
import { color } from 'd3';

const minContentHeight = 300;
const { width } = Dimensions.get('window');
const date = new Date();
const today = `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
// const domains = ['','DOMAIN1', 'DOMAIN2', 'DOMAIN3',''];
// const content = [
//     "DOMANIN1 Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod", 
//     "DOMAIN2 tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam",
//     "DOMAIN3 quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
//     "it in volutate velit esse cillum dolore eu fugiat nulla pariatur."
// ];

@observer
export class ChooseDomainView extends ViewState {
    constructor(props) {
        super(props);
        this._contentHeight = this.persona.setupContainerHeightForceScrollDown({ rotation: -15, transition: { duration: 1}, scale: 1.2});
        // this._contentHeight = this.persona.setupContainerHeight(minContentHeight, { rotation: -15, transition: { duration: 1 }, scale: 1 });
    }

    state = {
        active: 0,
        xTabOne: 0,
        xTabTwo: 0,
        translateX: new Animated.Value(0),
        translateXTabTwo: new Animated.Value(width),
        translateXTabOne: new Animated.Value(0),
        translateY: 0,
        xDomain: 0,
        domain:1,
        lDomain: 0,
        rDomain: 2,
    }

    public get viewModel() {
        return AppViewModel.Instance.QOL;
    }

    handleSlide = type => {
        let {xTabOne, xTabTwo, active, translateX, translateXTabTwo, translateXTabOne } = this.state
        Animated.spring(translateX, {
            toValue: type,
            useNativeDriver: true,
        }).start()

        if (active === 0){
            Animated.parallel([
                Animated.spring(translateXTabOne, {
                    toValue: 0,
                    useNativeDriver: true,
                })
            ]).start()
            Animated.spring(translateXTabTwo, {
                toValue: width,
                useNativeDriver: true,
            }).start()
        } else {
            Animated.parallel([
                Animated.spring(translateXTabOne, {
                    toValue: -width,
                    useNativeDriver: true,
                })
            ]).start()
            Animated.spring(translateXTabTwo, {
                toValue: 0,
                useNativeDriver: true,
            }).start()
        }

    }

    async start() {}

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




    renderContent() {
        let {xTabOne, xTabTwo, active, translateX, translateXTabTwo, translateXTabOne, translateY, xDomain, domain, rDomain, lDomain} = this.state
        const domainLength = this.viewModel.domainCount;
        const domains = this.viewModel.Domains;
        const importance = this.viewModel.getDomainImportance;
        // let mainDomain, leftDomain, rightDomain = 0;
        // TODO: put styles in style sheet and abstract common styles
        // TODO: see if there are styles in basestyles that work
        // this.logger.log('DOMAINS', lDomain, rDomain, domain);
        return (
            <MasloPage style={this.baseStyles.page} onClose={() => this.cancel()} onBack={() => this.cancel()}>
                <Container style={[{height: this._contentHeight, paddingTop: 10, paddingBottom: 10}]}>
                    <View style={{justifyContent: 'space-between', flexDirection: 'row', marginBottom: 20}}>
                        <Text style={[TextStyles.p1, styles.domain]}>{domains[domain % domainLength]}</Text>
                        <Text style={[TextStyles.labelMedium, styles.date]}>{today}</Text>
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
                                <TouchableOpacity
                                style={[styles.tabs,{
                                    borderRightWidth: 0,
                                    borderTopRightRadius: 0,
                                    borderBottomRightRadius: 0
                                }]}
                                onLayout = {event => this.setState({xTabOne: event.nativeEvent.layout.x})}
                                onPress = {() => this.setState({active: 0}, () => this.handleSlide(xTabOne))}
                                >
                                    <Text style={{fontWeight: active===0? 'bold' : 'normal', textDecorationLine: active === 0? 'underline': 'none'}}>Importamce</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                 style={[ styles.tabs,{
                                    borderLeftWidth: 0,
                                    borderTopLeftRadius: 0,
                                    borderBottomLeftRadius: 0
                                }]}
                                onLayout = {event => this.setState({xTabTwo: event.nativeEvent.layout.x})}
                                onPress = {() => this.setState({active: 1}, () => this.handleSlide(xTabTwo))}
                                >
                                    <Text style={{fontWeight: active===1? 'bold' : 'normal', textDecorationLine: active === 1? 'underline': 'none'}}>Timeline</Text>
                                </TouchableOpacity>
                            </View>
                            <ScrollView>
                                <Animated.View style={{
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    margin: 10,
                                    transform: [{
                                        translateX: translateXTabOne
                                    }]
                                   
                                }}
                                onLayout = {event => this.setState({translateY: event.nativeEvent.layout.height})}
                    
                                
                                >
                                    <Text style={this.textStyles.p2}>
                                        {importance[domain % domainLength]}
                                    </Text>
                                </Animated.View>
                                <Animated.View style={{
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    transform: [{
                                        translateX: translateXTabTwo
                                    },
                                    {
                                        translateY: -translateY
                                    }]
                                }}>
                                    <Images.noStatistics width={200} height={100} />
                                    <Text style={[this.textStyles.h1, styles.placeholderHeading]}>No statistics yet</Text>
                                    <Text style={[this.textStyles.p1, styles.placeholderSubtitle]}>{`Complete at-least one week of check-ins to use your timeline.`}</Text>
                                </Animated.View>     
                            </ScrollView>
                            <View style= {[{
                                    marginLeft: 'auto',
                                    flexDirection: 'row',
                                    paddingBottom: 10,
                                }]}
                                // onLayout = {event => this.setState({translateY: event.nativeEvent.layout.height})}
                                
                                >
                                    <Button
                                        title= {active === 0? 'View Details' : 'Calendar'}
                                        style={styles.buttonDetails}
                                        titleStyles={styles.mailButtonTitle}
                                        onPress={active === 0? () => this.onDetails() : null}
                                        isTransparent
                                     />

                                </View>
                        {/* </View> */}
                    </View>
                    <View style={{justifyContent: 'center', marginLeft: 'auto', marginRight: 'auto', marginTop: 50, marginBottom: 50}}>
                                <Button
                                    title="Select Focus Domain"
                                    style={styles.domain}
                                    titleStyles={styles.selectDomain}
                                    onPress={null}
                                    isTransparent
                                />
                     </View>
                    <View 
                     style={{
                         flexDirection: 'row', 
                         justifyContent: 'space-between', 
                         marginBottom: 50,
                        //  transform: [{
                        //     translateX: 0
                        // },
                        // {
                        //     translateY:0
                        // }]
                         }}>
                    
                         <TouchableOpacity 
                        //  onLayout = {event => this.setState({xDomain: event.nativeEvent.layout.x})}
                        onPress = {() => this.setState({domain: lDomain === -1? domain: domain - 1, rDomain: lDomain === -1? rDomain:rDomain - 1, lDomain: lDomain === -1? lDomain:lDomain - 1})}
                        // onPress = {() => this.setState({domain: domain - 1, rDomain: rDomain - 1, lDomain: lDomain - 1})}
                         
                         >
                         <Images.backIcon width={20} height={20} />
                         </TouchableOpacity>
                         <Text style={[TextStyles.p1, styles.domain, {fontSize: 30}]}>{domains[domain % domainLength]}</Text>
                         <TouchableOpacity 
                        //  onPress = {() => this.setState({domain:domain + 1, rDomain:rDomain + 1, lDomain:lDomain + 1})}
                         
                         onPress = {() => this.setState({domain:rDomain === domainLength? domain: domain + 1, rDomain:rDomain === domainLength? rDomain: rDomain + 1, lDomain:rDomain === domainLength? lDomain: lDomain + 1})}
                         >
                         <Images.backIcon width={20} height={20} />
                         </TouchableOpacity>
                    </View>
                     <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                         <Text style={[TextStyles.labelMedium, styles.domain, {fontSize: 17}]}>{lDomain < 0? '' : domains[lDomain % domainLength]}</Text>
                         <Text style={[TextStyles.labelMedium, styles.domain, {fontSize: 17}]}>{rDomain > domainLength - 1? '' : domains[rDomain % domainLength]}</Text>
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
        // flex: 1,
        borderWidth: 1,
        borderColor: 'red',
        width: '100%',
        height: '100%'
        // marginLeft: 'auto',
        // marginRight: 'auto',
        // height: 100
        // borderRadius: 5

    },
    pView: {

    },
    tabs: {
        flex: 1,
        justifyContent: 'center', 
        alignItems: 'center',
        // borderWidth: 1,
        // borderColor: '#007aff',
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
    domain :{
        fontWeight: '500',
        letterSpacing: 1.79,
        fontFamily: mainFontMedium,
        // fontSize: 25
    },
    selectDomain : {
        borderWidth: 1,
        borderRadius: 5,
        color: 'black',
        fontSize: 10,
        padding: 10,
    }
});
