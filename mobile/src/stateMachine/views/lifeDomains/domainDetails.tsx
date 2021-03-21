import { ViewState } from '../base';
import React from 'react';
import { observer } from 'mobx-react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { MasloPage, Container, Button } from 'src/components';
import { ScenarioTriggers } from '../../abstractions';
import Colors from '../../../constants/colors';

import { styles } from 'react-native-markdown-renderer';

const minContentHeight = 560;

@observer
export class DomainDetailsView extends ViewState {
    constructor(props) {
        super(props);
        this._contentHeight = this.persona.setupContainerHeightForceScroll({ rotation: -15, transition: { duration: 1 }, scale: 0.8 });
        // this._contentHeight = minContentHeight;
    }

    async start() {}

    private cancel = () => {
        this.trigger(ScenarioTriggers.Cancel);
    }

    renderContent() {
        // TODO: put styles in style sheet and abstract common styles
        // TODO: see if there are styles in basestyles that work
        return (
            <MasloPage style={[this.baseStyles.page,{backgroundColor: '#E7E7F6'}]} onClose={() => this.cancel()}>
                <Container style={[{ height: this._contentHeight, paddingTop: 90, paddingBottom: 15, backgroundColor:'#E7E7F6', alignItems:'center' }]}>
                    <View style={{justifyContent:'center', alignItems:'center', marginBottom: 20}}>
                    <Text style={this.textStyles.h1}>Why leisure is important to your quality of life</Text>
                    </View>
                    <View style={{width: '90%', backgroundColor: '#ffff', padding: 10, borderRadius: 5}}>
                        <Text style={[this.textStyles.h3, {marginBottom: 10}]}>What to know:</Text>
                        <ScrollView>
                            <Text>DOMANIN1 Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod non provident, 
                        similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga</Text>
                        </ScrollView>
                    </View>
                    <View style={{alignItems:'center', width: '90%', marginTop:20}}>
                        <ScrollView>
                        <Text style={{lineHeight: 25}}>At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium 
                            voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate 
                            non provident, 
                            similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga Et harum 
                            quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio 
                            cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, 
                            omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus 
                            saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic 
                            tenetur a sapiente delectus, 
                            ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat."</Text>
                        </ScrollView>
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
        height: '72%',
        justifyContent: 'space-between',
        paddingBottom: 40,
        marginTop: 20
    },
    buttons: {
        height: 60,
        width: '90%',
        backgroundColor: Colors.survey.btnBackgroundColor,
    }
});
