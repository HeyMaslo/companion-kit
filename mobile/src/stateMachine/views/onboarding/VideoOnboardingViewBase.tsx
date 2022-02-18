import React from 'react';
import { observer } from 'mobx-react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import { ScenarioTriggers } from '../../abstractions';
import { MasloPage, Container, Card, Button } from 'src/components';
import TextStyles from 'src/styles/TextStyles';
import { ViewState } from '../base';
import Video from 'react-native-video';
import { PersonaViewPresets } from 'src/stateMachine/persona';

@observer
export class VideoOnboardingViewBase extends ViewState {

  public videoURL: string
  public titleText: string

  private player: Video

  constructor(props) {
    super(props);
    this.persona.view = PersonaViewPresets.TopHalfOut;
  }

  async start() { }

  onBack = () => {
    this.trigger(ScenarioTriggers.Back)
  }

  onNext = () => {
    this.trigger(ScenarioTriggers.Next)
  }

  onBuffer = () => {

  }

  videoError = () => {

  }

  renderContent() {
    const contentTextStyle = [TextStyles.p1, { color: this.theme.colors.foreground }];
    return (
      <MasloPage style={[this.baseStyles.page, { paddingBottom: 40 }]} theme={this.theme}>
        <Container style={[{ height: '100%', flexDirection: 'column', alignItems: 'center', paddingTop: 60 }]}>
          <Text style={[TextStyles.h1, styles.title, { color: this.theme.colors.foreground }]}>{this.titleText}</Text>
          <Video source={{ uri: this.videoURL }}   // Can be a URL or a local file.
            ref={(ref) => {
              this.player = ref
            }}                                      // Store reference
            onBuffer={this.onBuffer}                // Callback when remote video is buffering
            onError={this.videoError}               // Callback when video cannot be loaded
            paused={true}
            controls={true}
            style={styles.video} />
          <Button
            title='Continue'
            style={{ marginTop: 'auto' }}
            onPress={this.onNext}
            theme={this.theme}
          // disabled={this.continueButtonDisabled}
          />
        </Container>
      </MasloPage>
    );
  }
}

const styles = StyleSheet.create({
  title: {
    marginBottom: 40,
    textAlign: 'center',
  },
  video: {
    position: 'absolute',
    top: 200,
    left: 20,
    right: 20,
    bottom: 100
  }
});
