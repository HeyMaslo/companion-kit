import React from 'react';
import { observer } from 'mobx-react';
import History from 'app/services/history';
import * as Routes from 'app/constants/routes';
import Placeholder from 'app/components/PlaceHolder';
import DocsPageViewModel from 'app/viewModels/DocsPage';
import DocsCard from './DocsCard';
import { View, Text, Page, Image, Button } from 'app/common/components';
import WebClientTracker, { Events } from 'app/services/webTracker';
import logger from 'common/logger';
import { InputObservable } from 'app/common/components/Input';
import Modal, { ModalAgent } from 'app/components/Modal';
import ProjectImages from 'app/helpers/images';

// @ts-ignore
import SimpleReactLightbox, { SRLWrapper } from 'simple-react-lightbox';

import uploadIcon from 'assets/img/upload-icon-white.svg';

type DocsProps = {
    model: DocsPageViewModel;
};

type DocsState = {
    dragging: boolean;
    error: string;
    modalActive: boolean;
};

@observer
class Docs extends React.Component<DocsProps, DocsState> {
    _dragLayer: React.RefObject<HTMLDivElement> = React.createRef();
    _input: React.RefObject<HTMLInputElement> = React.createRef();
    _clickInput: React.RefObject<HTMLInputElement> = React.createRef();

    state = {
        dragging: false,
        error: '',
        modalActive: false,
    };

    private _onArrowClick = () => {
        History.push(Routes.ClientDetails.DocsImagesInner(this.model.clientId));
    }

    get model() { return this.props.model; }

    componentDidUpdate() { this.setListener(); }
    componentDidMount() {
        this.setListener();
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

        this.model.uploadFile({ file })
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

    _toPercentage(partialValue: number, totalValue: number): number {
        const percents = (100 * partialValue) / totalValue;

        return Math.round(percents);
    }

    getModalContent = () => {
        const { form } = this.props.model;

        return (
            <Modal
                title="Add link"
                okTitle="save Link"
                cancelTitle="Cancel"
                onOk={this.save}
                onCancel={this.cancel}
                onLayerClick={null}
                disabled={form.loading}
            >
                <InputObservable
                    model={form.docName}
                    errorMessage={form.error}
                    label="Title"
                    className="title"
                />
                <InputObservable
                    model={form.link}
                    errorMessage={form.error}
                    label="Link"
                    className="link"
                />
            </Modal>
        );
    }

    cancel = () => {
        this.closeModal();
    }

    save = async () => {
        const { form } = this.props.model;
        const res = await form.submit();
        if (res) {
            this.closeModal();
        }
    }

    openModal = () => {
        this.setState({ modalActive: true });
    }

    closeModal = () => {
        this.setState({ modalActive: false });
        this.props.model.form.reset();
    }

    render() {
        const { uploadProgress, inProgress, form, images } = this.model;
        const { dragging, error, modalActive } = this.state;
        const progress = this._toPercentage(uploadProgress, 1);

        const imagesNeedMore = images.length > 8;
        const imagesRenderCount = imagesNeedMore ? 7 : images.length;

        const optionsLightbox = {
            settings: {
                disablePanzoom: true,
                hideControlsAfter: false,
            },
            buttons: {
                showAutoplayButton: false,
                showDownloadButton: false,
                showFullscreenButton: false,
                showNextButton: imagesRenderCount > 1 ? true : false,
                showPrevButton: imagesRenderCount > 1 ? true : false,
                showThumbnailsButton: false,
            },
            thumbnails: {
                showThumbnails: false,
            },
            progressBar: {
                showProgressBar: false,
            },
        };

        return (
            <Page inProgress={inProgress} className="docs-wrap">
                <View className={`drag-zone ${dragging || uploadProgress != null ? 'active' : ''}`} divRef={this._dragLayer} >
                    <View className="drag-help">
                        {uploadProgress == null ?
                            <>
                                <Image src={uploadIcon}/>
                                <Text>Drop it to upload your document</Text>
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

                {modalActive && (
                    <ModalAgent>
                        {this.getModalContent()}
                    </ModalAgent>
                )}

                {
                    this.model.formatError &&
                    <View className="modal-invalid-extention">
                        <View className="modal-body">
                            <Text className="title-h1">Only single file upload supported</Text>
                            <Text className="desc-1">You cannot upload folders or multiple files. Use archives instead.</Text>
                            <Button
                                titleClassName="label-btn2"
                                onClick={() => this.model.formatError = false}
                            >
                                got it
                            </Button>
                        </View>
                    </View>
                }

                <View className="docs-tab">
                    <SimpleReactLightbox>
                        <View className="actions-block">
                            <View onClick={() => this._clickInput.current.click()} className="upload">
                                <Image src={ProjectImages.iconUploadFile} />
                                <Text className={`label-draganddrop ${this.state.error ? 'input-error-message' : ''}`}>
                                    {error || (
                                        <>
                                            Upload File
                                        </>
                                    )}
                                </Text>
                            </View>
                            <View onClick={this.openModal} className="add-link-button">
                                <Image src={ProjectImages.iconAddLink} />
                                <Text className="label-draganddrop">Add Link</Text>
                            </View>
                        </View>
                        {
/// #if PICTURE_CHECKINS_ENABLED === true
                            imagesRenderCount > 0 && (
                                <>
                                    <View className="images-wrap">
                                        <Text className="label-draganddrop">Check-ins</Text>
                                        <View className="images-list-wrap">
                                            <SRLWrapper options={optionsLightbox}>
                                                <View className="images-list">
                                                    { images.slice(0, imagesRenderCount).map((item, index) => (
                                                        !item.image.url ?
                                                            <View className="placeholder" key={index}></View>
                                                        :
                                                        <Image
                                                            key={item.image.url || index}
                                                            src={item.image.url}
                                                            alt={item.caption}
                                                        />
                                                    )) }
                                                </View>
                                            </SRLWrapper>
                                            { imagesNeedMore && (
                                                <View onClick={this._onArrowClick} className="inner-pictures-link">
                                                    <Image className="arrow-icon" src={ProjectImages.backArrow}/>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                    <Text className="label-draganddrop">Docs</Text>
                                </>
                            )
/// #endif
                        }
                        {this.model.list && this.model.list.length > 0 ?
                            (
                                <View className="docs-list">
                                    {
                                        this.model.list.map((cardViewModel, id) => {
                                            return (
                                                <DocsCard
                                                    key={id}
                                                    model={cardViewModel}
                                                    docId={cardViewModel.id}
                                                    form={form}
                                                />
                                            );
                                        })
                                    }
                                </View>
                            ) : (
                                <Placeholder
                                    className="docs-empty"
                                    title="No documents yet"
                                    description="Let’s upload your first document!"
                                    visual={ProjectImages.DocsPlaceholder}
                                />
                            )}
                        <input
                            type="file"
                            onChange={this.onLoad}
                            title=""
                            ref={this._clickInput}
                            hidden
                        />
                    </SimpleReactLightbox>
                </View>
            </Page>
        );
    }
}

export default Docs;
