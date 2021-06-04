import { observer } from 'mobx-react';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Container, MasloPage } from 'src/components';
import AppViewModel from 'src/viewModels';
import Colors from '../../../constants/colors';
import { ScenarioTriggers } from '../../abstractions';
import { ViewState } from '../base';


const minContentHeight = 560;

@observer
export class DomainDetailsView extends ViewState {
    constructor(props) {
        super(props);
        this._contentHeight = this.persona.setupContainerHeightForceScroll({ rotation: -15, transition: { duration: 1 }, scale: 0.8 });
        // this._contentHeight = minContentHeight;
    }

    async start() {}

    public get viewModel() {
        return AppViewModel.Instance.ChooseDomain;
    }
    

    private cancel = () => {
        this.trigger(ScenarioTriggers.Cancel);
    }

    renderContent() {
        const [l,domain,r,k] = this.viewModel.getDomainDisplay();
        // TODO: put styles in style sheet and abstract common styles
        // TODO: see if there are styles in basestyles that work
        return (
            <MasloPage style={[this.baseStyles.page,{backgroundColor: '#E7E7F6'}]} onClose={() => this.cancel()}>
                <Container style={[{ height: this._contentHeight, paddingTop: 90, paddingBottom: 15, backgroundColor:'#E7E7F6', alignItems:'center' }]}>
                    <View style={{justifyContent:'center', alignItems:'center', marginBottom: 20}}>
                    <Text style={this.textStyles.h1}>Why {domain} is important to your quality of life</Text>
                    </View>
                    <View style={{width: '90%', backgroundColor: '#ffff', padding: 10, borderRadius: 5}}>
                        <Text style={[this.textStyles.h3, {marginBottom: 10}]}>What to know:</Text>
                        <ScrollView>
                        <Text>{k}</Text>
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
