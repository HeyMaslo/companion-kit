import React from 'react';
import { observer } from 'mobx-react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import { ScenarioTriggers } from '../../abstractions';
import { MasloPage, Container, Card, Button } from 'src/components';
import Images from 'src/constants/images';
import TextStyles from 'src/styles/TextStyles';
import { ViewState } from '../base';
import Video from 'react-native-video';

@observer
export class VideoOnboardingView extends ViewState {

  private player: Video

  async start() { }

  onBack = () => {
    this.trigger(ScenarioTriggers.Back)
  }

  onNext = () => {
    this.trigger(ScenarioTriggers.Next)
  }

  onBuffer = () => {
    this.trigger(ScenarioTriggers.Next)
  }

  videoError = () => {
    this.trigger(ScenarioTriggers.Next)
  }

  renderContent() {
    const titleText = 'This is the title';
    const contentTextStyle = [TextStyles.p1, { color: this.theme.colors.foreground }];
    return (
      <MasloPage style={this.baseStyles.page} onBack={() => this.onBack()} theme={this.theme}>
        <Container style={[{ height: '100%', flexDirection: 'column', alignItems: 'center', paddingTop: 10 }]}>
          <Text style={[TextStyles.h1, styles.title, { color: this.theme.colors.foreground }]}>{titleText}</Text>
          <Text style={[TextStyles.p1, { textAlign: 'center', color: this.theme.colors.midground, marginBottom: 20 }]}>Subtitle goes here</Text>
          <Video source={{ uri: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4' }}   // Can be a URL or a local file.
            ref={(ref) => {
              this.player = ref
            }}                                      // Store reference
            onBuffer={this.onBuffer}                // Callback when remote video is buffering
            onError={this.videoError}               // Callback when video cannot be loaded
            paused={true}
            controls={true}
            style={styles.video} />
        </Container>
      </MasloPage>
    );
  }
}

const checkboxSize = 24;
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
