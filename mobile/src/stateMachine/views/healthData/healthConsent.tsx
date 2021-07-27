import { observer } from 'mobx-react';
import { ViewState } from '../base';
import AppController from 'src/controllers';
import { ScenarioTriggers } from '../../abstractions';
import logger from 'common/logger';
import React from 'react';
import { styles } from 'react-native-markdown-renderer';
import { View } from 'react-native';
import { Button, Container, MasloPage} from 'src/components';
import Images from 'src/constants/images';
import BottomBar from 'src/screens/components/BottomBar';
import { PersonaScrollMask } from 'src/components/PersonaScollMask';


@observer
export class HealthConsentView extends ViewState {
    async start() {
        this.showModal({
            title: 'We need your health data to build a better personalized experience for you.',
            message: 'Would you like to grant permission?',
            primaryButton: {
                text: 'Continue',
                action: this.askNtfPermissions,
            },
        });
    }

    askNtfPermissions = () => this.runLongOperation(async () => {
    const enabled = await AppController.Instance.User.hasHealthDataPermissions.askPermission();
      logger.log("in ASKNOTIFICATIONS : ", enabled);
      this.trigger(ScenarioTriggers.Submit);
  })

  renderContent() {
    return (
        <MasloPage style={this.baseStyles.page}>
            <Container style={styles.topBarWrapWrap}>
                <PersonaScrollMask />
                {!process.appFeatures.GOALS_ENABLED &&
                    <View style={styles.topBarWrap}>
                        <Button style={styles.backBtn} underlayColor="transparent" onPress={() => this.trigger(ScenarioTriggers.Back)}>
                            <Images.backIcon width={28} height={14} />
                        </Button>
                    </View>
                }
            </Container>
            {process.appFeatures.GOALS_ENABLED && <BottomBar screen={'settings'} />}
            </MasloPage>
    );
}}