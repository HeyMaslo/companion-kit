import React from 'react';
import { Page, Container } from '../common/components';
import MarkdownView from 'app/components/MarkdownView';
import Header from 'app/components/Header';

type State = {
    content?: string;
};

const ContentLoader = () => import('assets/terms.md');

export default class Terms extends React.Component<{}, State> {
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
                <Page className="text-page terms-page">
                    <Container>
                        <MarkdownView
                            content={this.state.content}
                        />
                    </Container>
                </Page>
            </>
        );
    }
}
