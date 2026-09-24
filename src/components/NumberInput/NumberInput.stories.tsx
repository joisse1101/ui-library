import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { NumberInput } from './NumberInput';
import { DocsPage } from '@stories/DocsPage';
import { useForm } from '@hooks/useForm';
import { FormProvider } from '@providers/FormProvider';

const meta: Meta<typeof NumberInput> = {
    title: 'User Input/NumberInput',
    component: NumberInput,
    tags: ['autodocs'],
    parameters: {
        docs: {
            page: DocsPage,
        },
    },
    argTypes: {
        label: { control: 'text', description: 'Label text for the input field' },
        id: { control: 'text', description: 'Unique identifier linking label to input' },
        suffix: { control: 'text', description: 'Unit label rendered inside the field, e.g. "km"' },
        value: { control: 'number', description: 'Numeric value' },
        disabled: { control: 'boolean', description: 'Disables the input field' },
        required: { control: 'boolean', description: 'Marks input as mandatory' },
        onChange: { action: 'valueChanged' },
    },
};

export default meta;
type Story = StoryObj<typeof NumberInput>;

export const Default: Story = {
    render: (args) => <NumberInput {...args} />,
    args: {
        id: 'expected-progress',
        label: 'Expected Progress Per Day:',
        placeholder: 'e.g., 5',
    },
};

/**
 * The optional `suffix` renders a unit label inside the field, right-aligned like the native date-picker icon.
 */
export const WithSuffix: Story = {
    args: {
        id: 'distance',
        label: 'Distance:',
        suffix: 'km',
        defaultValue: 5,
    },
};

/**
 * Disabled state of the component prevents user interaction and visually indicates that the input is not editable.
 */
export const Disabled: Story = {
    args: {
        id: 'disabled-number',
        label: 'Locked Value',
        defaultValue: 10,
        disabled: true,
        onChange: fn(),
    },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const input = canvas.getByLabelText('Locked Value');

        await expect(input).toBeDisabled();

        await userEvent.type(input, '99');
        await expect(args.onChange).not.toHaveBeenCalled();
    },
};

/**
 * Standalone use: the parent owns `value` and updates it from `onChange`.
 */
export const Controlled: Story = {
    render: function Render(args) {
        const [value, setValue] = useState<number | ''>('');

        return (
            <NumberInput
                {...args}
                value={value}
                onChange={(e) => {
                    setValue(e.target.value === '' ? '' : Number(e.target.value));
                    args.onChange?.(e);
                }}
            />
        );
    },
    args: {
        id: 'controlled-number',
        label: 'Controlled Number',
        onChange: fn(),
    },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const input = canvas.getByLabelText('Controlled Number');

        await expect(input).toHaveValue(null);

        await userEvent.type(input, '42');
        await expect(input).toHaveValue(42);
        await expect(args.onChange).toHaveBeenCalledTimes(2);

        await userEvent.clear(input);
        await expect(input).toHaveValue(null);
    },
};

const onValid = fn();

/**
 * Bound to form state via `name` alone: the required, min and max rule messages are shown
 * after a failed submit, and each clears as soon as the value changes.
 */
export const FormBound: Story = {
    render: function Render() {
        const form = useForm<{ progress: number | '' }>({
            defaultValues: { progress: '' },
            rules: {
                progress: {
                    required: 'Progress is required.',
                    min: { value: 1, message: 'Progress must be at least 1.' },
                    max: { value: 10, message: 'Progress must be at most 10.' },
                },
            },
        });

        return (
            <FormProvider form={form}>
                <form onSubmit={form.handleSubmit(onValid)} noValidate>
                    <NumberInput name="progress" id="form-progress" label="Progress:" />
                    <button type="submit" className="btn btn-primary">Submit</button>
                </form>
            </FormProvider>
        );
    },
    play: async ({ canvasElement }) => {
        onValid.mockClear();
        const canvas = within(canvasElement);
        const input = canvas.getByLabelText('Progress:');
        const submit = canvas.getByRole('button', { name: 'Submit' });

        await userEvent.click(submit);
        await expect(await canvas.findByText('Progress is required.')).toBeInTheDocument();

        await userEvent.type(input, '0');
        await expect(canvas.queryByText('Progress is required.')).not.toBeInTheDocument();
        await userEvent.click(submit);
        await expect(await canvas.findByText('Progress must be at least 1.')).toBeInTheDocument();

        await userEvent.clear(input);
        await userEvent.type(input, '11');
        await expect(canvas.queryByText('Progress must be at least 1.')).not.toBeInTheDocument();
        await userEvent.click(submit);
        await expect(await canvas.findByText('Progress must be at most 10.')).toBeInTheDocument();
        await expect(onValid).not.toHaveBeenCalled();

        await userEvent.clear(input);
        await userEvent.type(input, '5');
        await expect(canvas.queryByText('Progress must be at most 10.')).not.toBeInTheDocument();
        await userEvent.click(submit);
        await expect(onValid).toHaveBeenCalledWith({ progress: 5 });
    },
};

/**
 * Standalone use without `value`: the input is uncontrolled, seeded from `defaultValue`.
 */
export const Uncontrolled: Story = {
    args: {
        id: 'uncontrolled-number',
        label: 'Uncontrolled Number',
        defaultValue: 7,
        onChange: fn(),
    },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const input = canvas.getByLabelText('Uncontrolled Number');

        await expect(input).toHaveValue(7);

        await userEvent.type(input, '1');
        await expect(input).toHaveValue(71);
        await expect(args.onChange).toHaveBeenCalledTimes(1);
    },
};
