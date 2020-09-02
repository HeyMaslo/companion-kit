import React from 'react';
import { View } from 'app/common/components';
import ButtonArrow from 'app/components/ButtonArrow';
import { createLoader } from 'app/utils/ReactLoadable';

type ModalProps = {
    isOpen: boolean;
    videoUrl: string;
    onClose?: () => void;
    titleButton?: string;
};

const ReactPlayerLoader = createLoader({
    moduleLoader: () => import('react-player'),
});

export default class VideoModal extends React.Component<ModalProps> {

    private onCloseClick = () => {
        if (this.props.onClose) {
            this.props.onClose();
        }
    }

    render() {
        const { isOpen, videoUrl, titleButton } = this.props;

        return (
            <View className={`modal ${isOpen ? 'open' : ''}`}>
                <View className="player-wrap">
                    {
                    (isOpen && videoUrl) ?
                        (<ReactPlayerLoader
                            url={videoUrl}
                            playing={false}
                            controls
                            muted
                            volume={0}
                            playsinline
                            width="100%"
                            height="100%"
                        />)
                        :
                        null
                    }
                </View>
                <View className="btn-wrap">
                    <ButtonArrow
                        // greenArrow
                        typeButton="primary"
                        title={titleButton ? titleButton : 'take me to the workspace'}
                        titleClassName="type1"
                        onClick={this.onCloseClick}
                    />
                </View>
            </View>
        );
    }
}
