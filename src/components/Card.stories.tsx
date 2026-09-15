import type { Meta, StoryObj } from '@storybook/react-vite';
import { DocsPage } from '@stories/DocsPage';
import { Card } from './Card';
import { ResponsiveMatrix } from '@stories/ResponsiveMatrix';

const meta: Meta<typeof Card> = {
    title: 'Layout/Card',
    component: Card,
    tags: ['autodocs'],
    parameters: {
        docs: {
            page: DocsPage,
        },
    },
    argTypes: {
        variant: {
            control: 'select',
            options: ['default', 'control-panel', 'output-logs', 'rose'],
            description: 'Visual style of the card',
        },
        padding: {
            control: 'select',
            options: [undefined, 'none', 'sm', 'md', 'lg'],
            description: "Overrides the variant's default padding",
        },
        children: { control: 'text', description: 'Content rendered inside the card' },
    },
};

export default meta;

type Story = StoryObj<typeof Card>;

export const Basic: Story = {
    render: (args) => {
        return (
            <ResponsiveMatrix component={Card} args={args} />
        );
    },
    args: {
        variant: 'control-panel',
        children: 'This is a card.',
    },
};

/**
 * This story showcases the visual appearance of each card variant.
 */
export const Variants: Story = {
    render: () => {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Card variant="default">Default card</Card>
                <Card variant="control-panel">Control panel card</Card>
                <Card variant="output-logs">$ npm run build{'\n'}✓ build complete</Card>
                <Card variant="rose">Rose accent card</Card>
            </div>
        );
    },
};

/**
 * This story showcases the padding scale, which can override a variant's default padding.
 */
export const Padding: Story = {
    render: () => {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Card variant="control-panel" padding="none">No padding</Card>
                <Card variant="control-panel" padding="sm">Small padding</Card>
                <Card variant="control-panel" padding="md">Medium padding (default)</Card>
                <Card variant="control-panel" padding="lg">Large padding</Card>
            </div>
        );
    },
};
