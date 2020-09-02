import React from 'react';
import { createLoader } from 'app/utils/ReactLoadable';
import { MarkdownOptions } from 'markdown-to-jsx';

const Markdown = createLoader({
    moduleLoader: () => import('markdown-to-jsx'),
});

type Props = {
    content?: React.ReactNode;
    options?: MarkdownOptions;
};

const DefaultOptions: MarkdownOptions = {
    forceBlock: true,
};

export default function MarkdownView(props: Props) {

    const content = props.content || '';
    const options = props.options
        ? Object.assign({ }, DefaultOptions, props.options)
        : DefaultOptions;

    return (
        <Markdown
            children={content}
            options={options}
        />
    );
}