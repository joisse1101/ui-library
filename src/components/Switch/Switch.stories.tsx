import type { Meta, StoryObj } from '@storybook/react-vite';
import { DocsPage } from '@stories/DocsPage';
import { Switch } from './Switch';

const meta: Meta<typeof Switch> = {
    title: 'User Input/Switch',
    component: Switch,
    tags: ['autodocs'],
    parameters: {
        docs: {
            page: DocsPage,
        },
    },
    argTypes: {
        size: { control: 'select', options: ['sm', 'md'], description: 'Size of the switch' },
        checked: { control: 'boolean', description: 'Whether the switch is checked' },
        defaultChecked: { control: 'boolean', description: 'Whether the switch is checked by default' },
        disabled: { control: 'boolean', description: 'Whether the switch is disabled' },
        label: { control: 'text', description: 'Label for the switch' },
        onChange: { action: 'changed', description: 'Callback when the switch state changes' },
    },
};

export default meta;

type Story = StoryObj<typeof Switch>;

export const Basic: Story = {
    render: (args) => {
        return <Switch {...args} />;
    },
    args: {
        size: 'md',
        label: 'Basic Switch',
    },
};

/**
 * This story showcases the visual appearance of the switch component in various states.
 */
export const Icon: Story = {
    render: () => {
        return <div style={{ display: 'grid', columnGap: '1rem', rowGap: '1rem', gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <Switch size="sm" label="Small Switch" />
            <Switch size="md" label="Medium Switch" />
            <Switch size="md" checked={true} label="Checked Switch" />
            <Switch size="md" disabled={true} label="Disabled Switch" />
            <Switch size="md" checked={true} disabled={true} label="Checked & Disabled Switch" />
        </div>;
    },
}