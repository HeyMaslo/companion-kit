import React, { RefObject } from 'react';
import { observer } from 'mobx-react';
import Lottie from 'lottie-web';
import { View, Text, Tooltip } from 'app/common/components';
import logger from 'common/logger';
import { AnimationItem } from 'lottie-web';

interface ResilienceMeterProps {
    animationData: any;
    value: number;
    className?: string;
    isSpeedAnimation?: boolean;
    tooltipTitle?: string;
    tooltipMessage?: string;
    label?: string;
    color?: string;
}

interface LottieInterface extends  AnimationItem {
    loop: boolean | number
}

const GAP = 10;

const moods = [
    'Not enough data',
    'Rough',
    'Difficult',
    'Mixed',
    'Positive',
    'Very positive',
];

@observer
export default class ResilienceMeter extends React.Component<ResilienceMeterProps> {
    private readonly _lottieRef = React.createRef<HTMLDivElement>();

    private _totalFrames: number;
    _lottie: LottieInterface;

    componentDidMount() {
        this._lottie = Lottie.loadAnimation({
            container: this._lottieRef.current,
            renderer: 'svg',
            loop: false,
            autoplay: false,
            animationData: this.props.animationData,
        });

        this._totalFrames = this._lottie.getDuration(true);
        this._startAnimation();
    }

    componentDidUpdate(prevProps: ResilienceMeterProps) {
        if (prevProps.value !== this.props.value) {
            this._startAnimation();
        }
    }

    componentWillUnmount() {
        this._lottie.destroy();
    }

    private _startAnimation() {
        if (this.props.isSpeedAnimation) {
            this._energyAnimation();
        } else {
            this._playLoopSegment();
        }
    }

    private _Loop(min: number, max: number) {
        this._lottie.playSegments([[min, max], [max, min]], true);
    }

    private _energyAnimation() {
        const { value } = this.props;
        this._lottie.loop = true;

        const speed = value > 0 ? (value / 100) : 0.05;
        this._lottie.setSpeed(speed);
        this._lottie.play();
    }

    private _playLoopSegment = () => {
        const { value } = this.props;
        const gap =  this._totalFrames / GAP;

        const min = value > 0 && value > gap ? Math.round(( this._totalFrames * value / 100) - gap) : 0;
        const max = value < 100 ? Math.round(( this._totalFrames * value / 100) + gap) : 100;
        this._lottie.setSpeed(0.5);

        this._Loop(min, max);
        this._lottie.addEventListener('complete', () => {
            this._Loop(min, max);
        });
    }

    private _convertValueToWord(value: number): string {
        let mood = 0;

        switch (true) {
            case (value <= 10):
                mood = 0;
                break;
            case (value > 10 && value <= 20):
                mood = 1;
                break;
            case (value > 20 && value <= 30):
                mood = 2;
                break;
            case (value > 30 && value <= 40):
                mood = 3;
                break;
            case (value > 40 && value <= 70):
                mood = 4;
                break;
            case (value > 70 && value <= 100):
                mood = 5;
                break;
            default:
                mood = 0;
                break;
        }
        return moods[mood];
    }

    render() {
        const { className, tooltipMessage, tooltipTitle, label, value, color } = this.props;
        const wrapClassName = className ? className : '';

        const moodColor = color ? color : '#FDBDD6';

        return (
            <View className="infographic-item">
                <View divRef={this._lottieRef} className={`lottie-wrap ${wrapClassName}`} />
                <View className="infographic-text" style={{ color: moodColor }}>
                    {this._convertValueToWord(value)}
                </View>
                <View className="label-wrap">
                    <Text className="label-tag type1">{label}</Text>
                    { tooltipMessage &&
                        <Tooltip className="large" direction="bottom-center" title={tooltipTitle} message={tooltipMessage} />
                    }
                </View>
            </View>
        );
    }
}
