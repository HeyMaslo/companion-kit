import React from 'react';
import { Page, Container } from 'app/common/components';
import Header from 'app/components/Header';
import MarkdownView from 'app/components/MarkdownView';

type State = {
    content?: string;
};

const ContentLoader = () => import('assets/privacy.md');

export default class Privacy extends React.Component<{}, State> {
    state = {} as State;

    componentDidMount() {
        this.loadContent();
    }

    async loadContent() {
        const mod = await ContentLoader();
        this.setState({ content: mod.default });
    }

    render() {
        return (
            <>
                <Header hasNav={true} profileOnly />
                <Page className="text-page privacy-page">
                    <Container>
                        <MarkdownView
                            content={this.state.content}
                        />
                    </Container>
                </Page>
            </>
        );
    }
};
