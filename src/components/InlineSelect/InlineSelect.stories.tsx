import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { useState } from 'react';
import { InlineSelect } from './InlineSelect';
import { DocsPage } from '@stories/DocsPage';

const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
];

const meta: Meta<typeof InlineSelect> = {
    title: 'User Input/InlineSelect',
    component: InlineSelect,
    tags: ['autodocs'],
    parameters: {
        docs: {
            page: DocsPage,
        },
    },
    argTypes: {
       options: { control: 'object', description: 'Array of options for the select dropdown' },
       label: { control: 'text', description: 'Label for the select dropdown' },
       value: { control: 'text', description: 'Currently selected or initially selected value' },
       onChange: { action: 'valueChanged', description: 'Callback when the selected value changes' },
    },
};

export default meta;
type Story = StoryObj<typeof InlineSelect>;

export const Default: Story = {
    render: (args) => <InlineSelect {...args} />,
    args: {
        label: 'Choose an option',
        options,
        value: 'option1',
    }
};

/**
 * With a `value` that matches an option the parent owns the selection: `onChange` reports the
 * requested value, and the select changes when the parent passes the new `value` back.
 */
export const Controlled: Story = {
    render: function Render(args) {
        const [value, setValue] = useState('option1');
        return (
            <InlineSelect
                {...args}
                value={value}
                onChange={(next) => {
                    args.onChange?.(next);
                    setValue(next);
                }}
            />
        );
    },
    args: {
        label: 'Controlled select',
        options,
        onChange: fn(),
    },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const select = canvas.getByLabelText('Controlled select');

        await expect(select).toHaveValue('option1');

        await userEvent.selectOptions(select, 'Option 3');
        await expect(select).toHaveValue('option3');
        await expect(args.onChange).toHaveBeenLastCalledWith('option3');

        await userEvent.selectOptions(select, 'Option 2');
        await expect(select).toHaveValue('option2');
        await expect(args.onChange).toHaveBeenLastCalledWith('option2');
        await expect(args.onChange).toHaveBeenCalledTimes(2);
    },
};

/**
 * A matching `value` the parent never updates pins the selection: `onChange` still fires with the
 * requested value, but the select stays put.
 */
export const ControlledIgnoresChangesUntilParentUpdates: Story = {
    args: {
        label: 'Pinned select',
        options,
        value: 'option1',
        onChange: fn(),
    },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const select = canvas.getByLabelText('Pinned select');

        await userEvent.selectOptions(select, 'Option 2');
        await expect(args.onChange).toHaveBeenLastCalledWith('option2');
        await expect(select).toHaveValue('option1');
    },
};

/**
 * Without a `value` the select keeps its own selection and still reports changes.
 */
export const Uncontrolled: Story = {
    args: {
        label: 'Uncontrolled select',
        options,
        value: undefined,
        onChange: fn(),
    },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const select = canvas.getByLabelText('Uncontrolled select');

        await userEvent.selectOptions(select, 'Option 2');
        await expect(select).toHaveValue('option2');
        await expect(args.onChange).toHaveBeenLastCalledWith('option2');

        await userEvent.selectOptions(select, 'Option 3');
        await expect(select).toHaveValue('option3');
        await expect(args.onChange).toHaveBeenLastCalledWith('option3');
        await expect(args.onChange).toHaveBeenCalledTimes(2);
    },
};

/**
 * A `value` that doesn't match any option is ignored, so the select behaves as uncontrolled.
 */
export const UnknownValueFallsBackToUncontrolled: Story = {
    args: {
        label: 'Fallback select',
        options,
        value: 'not-an-option',
        onChange: fn(),
    },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const select = canvas.getByLabelText('Fallback select');

        await userEvent.selectOptions(select, 'Option 3');
        await expect(select).toHaveValue('option3');
        await expect(args.onChange).toHaveBeenLastCalledWith('option3');
    },
};
