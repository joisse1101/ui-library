import { Title, Subtitle, Description, Primary, Controls, Stories } from '@storybook/addon-docs/blocks';

export const DocsPage = () => (
    <>
        {/* Header elements */}
        <Title />
        <Subtitle />
        <Description />

        <Primary />
        <Controls />

        <Stories includePrimary={false} />
    </>
);