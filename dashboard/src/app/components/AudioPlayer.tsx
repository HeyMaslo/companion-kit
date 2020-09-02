import React from 'react';
import { View, Text, Image } from 'app/common/components';
import { observer } from 'mobx-react';
import AudioPlayerVeiwModel from 'app/viewModels/AudioPlayer';
import { formatMS } from 'common/utils/dateHelpers';
import logger from 'common/logger';

type Props = {
    model: AudioPlayerVeiwModel;
    skipTitle?: boolean;
};

type State = {
    tooltipTime: string;
    src: string;
};

@observer
export default class AudioPlayer extends React.Component<Props, State> {
    private _audioRef: React.RefObject<HTMLAudioElement> = React.createRef();
    private _tooltipRef: React.RefObject<HTMLDivElement> = React.createRef();

    state = {
        tooltipTime: '',
        src: '',
    };

    private get _audio() { return this._audioRef.current; }
    private get _tooltip() { return this._tooltipRef.current; }

    componentDidMount() {
        this._audio.onended = this.props.model.onEnded;

        this._setupAudioEvents();
    }

    _setupAudioEvents() {
        this._audio.onplay = () => {
            this.props.model.onStart();
            // logger.log('audio onPlay');
        };
        this._audio.onpause = () => {
            this.props.model.onPause();
            // logger.log('audio onPause');
        };
        this._audio.onended = () => {
            this.props.model.onEnded();
            // logger.log('audio onEnded');
        };
    }

    playAsync = async () => {
        const src = await this.props.model.getSource();

        if (src) {
            this.setState(
                { src },
                () => this._audio.play(),
                    // .then(this.props.model.onStart)
                    // .catch(err => logger.error('[AudioPlayer]: error during plaing audio', err, err.message)),
            );
        }
    }

    pause = () => {
        this._audio.pause();
        this.props.model.onPause();
    }

    stop = () => {
        this._audio.pause();
        this._audio.currentTime = 0;
        this.props.model.onEnded();
    }

    getAudioPositionMS = (e: any) => {
        const bar = e.target;
        const rect = bar.getBoundingClientRect();
        const { width, left } = rect;
        const clickX = e.clientX;

        const progress = (clickX - left) / width;

        return this.props.model.duration * progress;
    }

    onProgressBarMouseOver = (e: any) => {
        this._tooltip.style.left = `${e.clientX - e.target.getBoundingClientRect().left}px`;
        const formatted = formatMS(this.getAudioPositionMS(e));

        this.setState({ tooltipTime: formatted });
    }

    onProgressBarMouseLeave = () => {
        this.setState({ tooltipTime: null });
    }

    onProgressBarClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const position = this.getAudioPositionMS(e);
        this.seekTo(position);
    }

    seekTo = (toMS: number) => {
        this._audio.currentTime = toMS / 1000;
        this.props.model.onSeek(toMS);
    }

    componentWillUnmount() {
        this.stop();
    }

    render() {
        const { error, playing, elapsedMS, duration, progress, title, description, ready } = this.props.model;
        const { skipTitle } = this.props;
        const { src } = this.state;

        // logger.log('duration', duration, elapsedMS);

        return (
            <View className={`audio-player ${ready ? '' : 'disabled'} ${elapsedMS > 0 ? 'active' : ''}`}>
                {error
                    ? <View className="error-text">{error}</View>
                    : (
                        <React.Fragment>
                            {title && !skipTitle && (
                                <View className="title-block">
                                    { playing
                                        ? <View onClick={this.pause} className="pause" >
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <rect x="2.34375" y="1.59375" width="4.11429" height="12.8" fill="#43D8CF"/>
                                                <rect x="9.54376" y="1.59375" width="4.11429" height="12.8" fill="#43D8CF"/>
                                            </svg>
                                        </View>
                                        : <View onClick={this.playAsync} className="play">
                                             <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path opacity="0.4" d="M0 16V0L16 8L0 16Z" fill="#A29FAB"/>
                                            </svg>
                                        </View>
                                    }
                                    <View className="text-block">
                                        <Text className="desc-3 type1">{title}</Text>
                                        <Text className="desc-3 type4">{description}</Text>
                                    </View>
                                </View>
                            )}

                            {(!title || skipTitle) && (playing
                                ? <View onClick={this.pause} className="pause">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect x="2.34375" y="1.59375" width="4.11429" height="12.8" fill="#43D8CF"/>
                                        <rect x="9.54376" y="1.59375" width="4.11429" height="12.8" fill="#43D8CF"/>
                                    </svg>
                                </View>
                                : <View onClick={this.playAsync} className="play" >
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path opacity="0.4" d="M0 16V0L16 8L0 16Z" fill="#A29FAB"/>
                                    </svg>
                                </View>
                            )}

                            <View className="progress-wrapper">
                                <Text className="desc-5 type1 elapsed">{formatMS(elapsedMS)}</Text>
                                <View className={`progress-bar ${elapsedMS > 0 ? 'active' : ''}`}>
                                    <View
                                        className="event-handler"
                                        onClick={this.onProgressBarClick}
                                        onMouseEnter={this.onProgressBarMouseOver}
                                        onMouseMove={this.onProgressBarMouseOver}
                                        onMouseLeave={this.onProgressBarMouseLeave}
                                    />
                                    <View className="pseudo-line" />
                                    <View
                                        className="progress-line"
                                        style={{ width: `${progress}%` }}
                                    />

                                    <View
                                        className={`tooltip ${this.state.tooltipTime ? 'active' : ''}`}
                                        divRef={this._tooltipRef}
                                    >
                                        {this.state.tooltipTime}
                                    </View>
                                </View>
                                {duration && <Text className="desc-5 type1 elapsed">-{formatMS(duration - elapsedMS)}</Text>}
                            </View>
                        </React.Fragment>
                    )
                }
                <audio
                    style={{ visibility: 'hidden' }}
                    ref={this._audioRef}
                    src={src}
                />
            </View>
        );
    }
}
