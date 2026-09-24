import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
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
        onChange: fn(),
    },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const toggle = canvas.getByRole('switch', { name: 'Basic Switch' });

        await expect(toggle).not.toBeChecked();

        await userEvent.click(toggle);
        await expect(toggle).toBeChecked();
        await expect(args.onChange).toHaveBeenLastCalledWith(true);

        await userEvent.click(toggle);
        await expect(toggle).not.toBeChecked();
        await expect(args.onChange).toHaveBeenLastCalledWith(false);
        await expect(args.onChange).toHaveBeenCalledTimes(2);
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

/**
 * With `checked` supplied the parent owns the state: `onChange` reports the requested value,
 * but the switch only changes when the parent re-renders with a new `checked`.
 */
export const Controlled: Story = {
    args: {
        label: 'Controlled Switch',
        checked: true,
        onChange: fn(),
    },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const toggle = canvas.getByRole('switch', { name: 'Controlled Switch' });

        await expect(toggle).toBeChecked();

        await userEvent.click(toggle);
        await expect(args.onChange).toHaveBeenLastCalledWith(false);
        await expect(toggle).toBeChecked();
    },
};

/**
 * Without `checked` the switch keeps its own state, starting from `defaultChecked`.
 */
export const Uncontrolled: Story = {
    args: {
        label: 'Uncontrolled Switch',
        defaultChecked: true,
        onChange: fn(),
    },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const toggle = canvas.getByRole('switch', { name: 'Uncontrolled Switch' });

        await expect(toggle).toBeChecked();

        await userEvent.click(toggle);
        await expect(toggle).not.toBeChecked();
        await expect(args.onChange).toHaveBeenLastCalledWith(false);

        await userEvent.click(toggle);
        await expect(toggle).toBeChecked();
        await expect(args.onChange).toHaveBeenLastCalledWith(true);
    },
};

/**
 * A disabled switch ignores clicks: its state doesn't change and `onChange` is never called.
 */
export const DisabledIgnoresClick: Story = {
    args: {
        label: 'Disabled Switch',
        disabled: true,
        onChange: fn(),
    },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const toggle = canvas.getByRole('switch', { name: 'Disabled Switch' });

        await expect(toggle).toBeDisabled();

        await userEvent.click(toggle);
        await expect(toggle).not.toBeChecked();
        await expect(args.onChange).not.toHaveBeenCalled();
    },
};
