import React from 'react';
import { observer } from 'mobx-react';
import Placeholder from 'app/components/PlaceHolder';
import SessionsPageViewModel from 'app/viewModels/SessionsPage';
import SessionCard from './SessionCard';
import { View, Text, Page, Image, Button } from 'app/common/components';
import WebClientTracker, { Events } from 'app/services/webTracker';
import logger from 'common/logger';
import SessionsPlaceholder from 'assets/img/sessions-placeholder.svg';
import mp3Icon from 'assets/img/mp3-icon.svg';
import uploadIcon from 'assets/img/upload-icon-white.svg';

type SessionsProps = {
    model: SessionsPageViewModel;
};

type SessionsState = {
    dragging: boolean;
    error: string;
};

@observer
class Sessions extends React.Component<SessionsProps, SessionsState> {
    _dragLayer: React.RefObject<HTMLDivElement> = React.createRef();
    _input: React.RefObject<HTMLInputElement> = React.createRef();
    _clickInput: React.RefObject<HTMLInputElement> = React.createRef();

    state = {
        dragging: false,
        error: '',
    };

    get model() { return this.props.model; }

    componentDidUpdate() { this.setListener(); }
    componentDidMount() {
        this.setListener();
        WebClientTracker.Instance?.trackEvent(Events.Sessions(this.model.clientName));
    }

    setListener = () => {
        const layer = this._dragLayer.current;

        if (layer && !layer.ondragover) {
            layer.ondragover = this.onDragOver;
            layer.ondragleave = this.onDragLeave;
        }
    }

    componentWillUnmount() {
        const layer = this._dragLayer.current;

        if (layer) {
            layer.ondragover = null;
            layer.ondragleave = null;
        }
    }

    onDragLeave = () => {
        const { dragging } = this.state;
        const { inProgress } = this.model;

        if (dragging && !inProgress) {
            this.setState({ dragging: false });
        }
    }

    onLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { files } = e.target;
        const [file] = files;
        logger.log('Selected file for upload:', file);

        this.model.uploadSession({ file })
            .then(() => {
                // Clear value to detect uploading the same file
                this.clearFile();

                this.setState({ dragging: false, error: null });
            })
            .catch((err: Error) => {
                this.setState({ error: err.message, dragging: false }, this.clearFile);
            });
    }

    clearFile = () => {
        if (this._input.current) {
            this._input.current.value = '';
        }

        if (this._clickInput.current) {
            this._clickInput.current.value = '';
        }
    }

    onDragOver = () => {
        const { dragging } = this.state;

        if (!dragging) {
            this.setState({ dragging: true });
        }
    }

    _toPercentage (partialValue: number, totalValue: number): number {
        const percents = (100 * partialValue) / totalValue;

        return Math.round(percents);
    }

    render() {
        const { activeId, uploadProgress, inProgress, form } = this.model;
        const { dragging, error } = this.state;
        const progress = this._toPercentage(uploadProgress, 1);

        return (
            <Page inProgress={inProgress} className="sessions-wrap">
                <View className={`drag-zone ${dragging || uploadProgress != null ? 'active' : ''}`} divRef={this._dragLayer} >
                    <View className="drag-help">
                        {uploadProgress == null ?
                            <>
                                <Image src={uploadIcon}/>

                                <Text>Drop it to upload your audiofile</Text>
                            </>
                            :
                            <>
                                <Text className="progress">{progress}<Text className="percents">%</Text></Text>
                                <Text>uploading... it may take up to few minutes. </Text>
                            </>
                        }
                    </View>
                    {/* TODO? separate this input for reusing ? */}
                    <input
                        type="file"
                        onChange={this.onLoad}
                        onClick={e => e.preventDefault()}
                        title=""
                        onAbort={this.onDragOver}
                        ref={this._input}
                    />
                </View>
                {this.model.wrongExtension && (
                    <View className="modal-invalid-extention">
                        <View className="modal-body">
                            <View className="icon-wrap">
                                <Image className="icon" src={mp3Icon} />
                            </View>
                            <Text className="title-h1">Failed to upload the file</Text>
                            <Text className="desc-1">Only mp3 files supported</Text>
                            <Button
                                titleClassName="label-btn2"
                                onClick={() => this.model.wrongExtension = false}
                            >
                                got it
                            </Button>
                        </View>
                    </View>
                )}
                <View className="sessions-tab">
                    <View onClick={() => this._clickInput.current.click()} className="upload">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            {/* tslint:disable-next-line: max-line-length */}
                            <path d="M9.00008 11.6935C9.19052 11.6935 9.37315 11.6139 9.50781 11.4722C9.64248 11.3304 9.71813 11.1381 9.71813 10.9377V2.57266L12.6382 5.64655C12.703 5.71821 12.781 5.77525 12.8674 5.81423C12.9538 5.85321 13.0468 5.87331 13.1408 5.87331C13.2348 5.87331 13.3279 5.85321 13.4143 5.81423C13.5007 5.77525 13.5786 5.71821 13.6435 5.64655C13.7122 5.57612 13.7669 5.49189 13.8042 5.39885C13.8415 5.30581 13.8607 5.20584 13.8607 5.10484C13.8607 5.00385 13.8415 4.90388 13.8042 4.81083C13.7669 4.71779 13.7122 4.63357 13.6435 4.56313L9.50271 0.20426C9.43809 0.131091 9.3551 0.0786783 9.26336 0.053085C9.18193 0.010282 9.0906 -0.00719849 9.00008 0.00269319C8.90955 -0.00719849 8.81822 0.010282 8.73679 0.053085C8.64505 0.0786783 8.56207 0.131091 8.49744 0.20426L4.35668 4.56313C4.28792 4.63357 4.23327 4.71779 4.19595 4.81083C4.15863 4.90388 4.1394 5.00385 4.1394 5.10484C4.1394 5.20584 4.15863 5.30581 4.19595 5.39885C4.23327 5.49189 4.28792 5.57612 4.35668 5.64655C4.4215 5.71821 4.49948 5.77525 4.58589 5.81423C4.67229 5.85321 4.76531 5.87331 4.85931 5.87331C4.95331 5.87331 5.04634 5.85321 5.13274 5.81423C5.21914 5.77525 5.29712 5.71821 5.36195 5.64655L8.28202 2.57266V10.9377C8.28202 11.1381 8.35768 11.3304 8.49234 11.4722C8.627 11.6139 8.80964 11.6935 9.00008 11.6935Z" fill="#43D8CF" />
                            {/* tslint:disable-next-line: max-line-length */}
                            <path d="M17.2815 9.67818C17.0911 9.67818 16.9084 9.75782 16.7738 9.89957C16.6391 10.0413 16.5635 10.2336 16.5635 10.4341V15.7252C16.5635 15.8588 16.513 15.987 16.4233 16.0815C16.3335 16.176 16.2117 16.2291 16.0848 16.2291H1.91523C1.78827 16.2291 1.66651 16.176 1.57674 16.0815C1.48696 15.987 1.43653 15.8588 1.43653 15.7252V10.4341C1.43653 10.2336 1.36088 10.0413 1.22622 9.89957C1.09156 9.75782 0.908918 9.67818 0.718479 9.67818C0.623282 9.67467 0.528417 9.69181 0.439786 9.72855C0.351156 9.76529 0.270657 9.82084 0.203302 9.89175C0.135946 9.96265 0.0831753 10.0474 0.0482731 10.1407C0.0133708 10.234 -0.00291564 10.3338 0.000427708 10.4341V15.7252C0.000427708 16.2598 0.202165 16.7725 0.561261 17.1505C0.920356 17.5285 1.40739 17.7408 1.91523 17.7408H16.0848C16.5926 17.7408 17.0796 17.5285 17.4387 17.1505C17.7978 16.7725 17.9996 16.2598 17.9996 15.7252V10.4341C18.0029 10.3338 17.9866 10.234 17.9517 10.1407C17.9168 10.0474 17.8641 9.96265 17.7967 9.89175C17.7293 9.82084 17.6488 9.76529 17.5602 9.72855C17.4716 9.69181 17.3767 9.67467 17.2815 9.67818Z" fill="#43D8CF" />
                        </svg>

                        <Text className={`label-draganddrop ${this.state.error ? 'input-error-message' : ''}`}>
                            {error || (
                                <>
                                    simply
                                    <Text className="label-draganddrop type1"> Drag and drop your mp3 </Text>
                                    file here
                                    <Text className="label-draganddrop type1"> to upload </Text>
                                    it into sessions
                                </>
                            )}
                        </Text>
                    </View>
                    {this.model.list && this.model.list.length > 0
                        ? (
                            <View className="sessions-list">
                                {this.model.list.map(cardViewModel => {
                                    const jid = cardViewModel.id;
                                    return (
                                        <SessionCard
                                            key={jid}
                                            model={cardViewModel}
                                            active={activeId === jid}
                                            clientId={this.model.clientId}
                                            form={form}
                                        />
                                    );
                                })}
                            </View>
                        ) : (
                            <Placeholder
                                className="session-empty"
                                title="Your client doesn’t have sessions"
                                visual={SessionsPlaceholder}
                            />
                        )}
                    <input
                        type="file"
                        onChange={this.onLoad}
                        title=""
                        ref={this._clickInput}
                        hidden
                    />
                </View>
            </Page>
        );
    }
}

export default Sessions;
