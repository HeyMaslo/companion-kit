import React from 'react';
import { observer } from 'mobx-react';
import { Page, View, Container, Image, Text } from 'app/common/components';
import History from 'app/services/history';
import ProjectImages from 'app/helpers/images';
import { RouteComponentProps } from 'react-router';
import Localization from 'app/services/localization';
import DocsImageInnerPage from 'app/viewModels/DocsImageInnerPage';

// @ts-ignore
import SimpleReactLightbox, { SRLWrapper } from 'simple-react-lightbox';

const optionsLightbox = {
    settings: {
        disablePanzoom: true,
        hideControlsAfter: false,
    },
    buttons: {
        showAutoplayButton: false,
        showDownloadButton: false,
        showFullscreenButton: false,
        showNextButton: true,
        showPrevButton: true,
        showThumbnailsButton: false,
    },
    thumbnails: {
        showThumbnails: false,
    },
    progressBar: {
        showProgressBar: false,
    },
};

const onGoBack = () => History.goBack();

export const DocsImagesInner = observer((props: RouteComponentProps<{ clientId: string}>) => {
    const model = React.useMemo(() => new DocsImageInnerPage(props.match.params.clientId), [props.match.params.clientId]);

    const { inProgress, clientName, images } = model;

    return (
        <SimpleReactLightbox>
            <Page inProgress={inProgress} className="prompts-page interventions-page docs-images-inner-page">
                <Container>
                    <View className="heading-wrap">
                        <View onClick={onGoBack} className="arrow-link">
                            <Image className="arrow-icon" src={ProjectImages.backArrow} />
                        </View>
                        <View className="nav-wrap">
                            <Text className="title-h2 type5">Check-Ins</Text>
                            <Text className="breadcrumbs label-draganddrop">{`${clientName} / `}<Text className="last-breadcrumb">Docs</Text></Text>
                        </View>
                    </View>
                    <View className="content">
                        <View className="prompt-wrap interventions-wrap docs-images-wrap">
                            <SRLWrapper options={optionsLightbox}>
                                <View className="images-list">
                                    {images.map((item, index) => (
                                        !item.image.url ?
                                            <View className="placeholder"></View>
                                        :
                                            <Image
                                                key={item.image.url || index}
                                                src={item.image.url}
                                                alt={item.caption}
                                            />
                                    ))}
                                </View>
                            </SRLWrapper>
                        </View>
                    </View>
                </Container>
            </Page>
        </SimpleReactLightbox>
    );
});
