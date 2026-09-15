import type { Meta, StoryObj } from '@storybook/react-vite';
import { DocsPage } from '@stories/DocsPage';
import { TextArea } from './TextArea';
import { ResponsiveMatrix } from '@stories/ResponsiveMatrix';

const meta: Meta<typeof TextArea> = {
    title: 'User Input/TextArea',
    component: TextArea,
    tags: ['autodocs'],
    parameters: {
        docs: {
            page: DocsPage,
        },
    },
    argTypes: {
        onSubmit: { action: 'submitted', description: 'Callback when the text area is submitted' },
    },
};

export default meta;

type Story = StoryObj<typeof TextArea>;

export const Basic: Story = {
    render: (args) => {
        return (
            <ResponsiveMatrix component={TextArea} args={args} />
        );
    },
    args: {
        onSubmit: (text: string) => alert(text),
    },
};