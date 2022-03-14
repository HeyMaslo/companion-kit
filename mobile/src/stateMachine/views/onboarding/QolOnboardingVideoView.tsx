import { observer } from 'mobx-react';
import { VideoOnboardingViewBase } from './VideoOnboardingViewBase';

@observer
export class QolOnboardingVideoView extends VideoOnboardingViewBase {

  constructor(props) {
    super(props);
    super.videoURL = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4'
    super.titleText = 'QoL Areas Explained in Video'
    this.persona.armsHidden = true;
  }

} 