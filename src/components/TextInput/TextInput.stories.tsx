import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { TextInput } from './TextInput';
import { DocsPage } from '@stories/DocsPage';
import { useForm } from '@hooks/useForm';
import { FormProvider } from '@providers/FormProvider';

const meta: Meta<typeof TextInput> = {
    title: 'User Input/TextInput',
    component: TextInput,
    tags: ['autodocs'],
    parameters: {
        docs: {
            page: DocsPage,
        },
    },
    argTypes: {
        label: { control: 'text', description: 'Label text for the input field' },
        id: { control: 'text', description: 'Unique identifier linking label to input' },
        type: { control: 'select', options: ['text', 'email', 'password'], description: 'Native input type' },
        value: { control: 'text', description: 'Text value' },
        disabled: { control: 'boolean', description: 'Disables the input field' },
        required: { control: 'boolean', description: 'Marks input as mandatory' },
        onChange: { action: 'valueChanged' },
    },
};

export default meta;
type Story = StoryObj<typeof TextInput>;

export const Default: Story = {
    render: (args) => <TextInput {...args} />,
    args: {
        id: 'goal-title',
        label: 'Goal Name:',
        placeholder: 'What is your goal?',
    },
};

/**
 * Uses the native `type` prop to switch validation/keyboard behaviour, e.g. for emails.
 */
export const Email: Story = {
    args: {
        id: 'email',
        label: 'Email Address:',
        type: 'email',
        placeholder: 'you@example.com',
    },
};

/**
 * Disabled state of the component prevents user interaction and visually indicates that the input is not editable.
 */
export const Disabled: Story = {
    args: {
        id: 'disabled-text',
        label: 'Locked Field',
        defaultValue: 'Cannot be edited',
        disabled: true,
        onChange: fn(),
    },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const input = canvas.getByLabelText('Locked Field');

        await expect(input).toBeDisabled();

        await userEvent.type(input, 'nope');
        await expect(args.onChange).not.toHaveBeenCalled();
    },
};

/**
 * Standalone use: the parent owns `value` and updates it from `onChange`.
 */
export const Controlled: Story = {
    render: function Render(args) {
        const [value, setValue] = useState('');

        return (
            <TextInput
                {...args}
                value={value}
                onChange={(e) => {
                    setValue(e.target.value);
                    args.onChange?.(e);
                }}
            />
        );
    },
    args: {
        id: 'controlled-text',
        label: 'Controlled Field',
        onChange: fn(),
    },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const input = canvas.getByLabelText('Controlled Field');

        await expect(input).toHaveValue('');

        await userEvent.type(input, 'Run');
        await expect(input).toHaveValue('Run');
        await expect(args.onChange).toHaveBeenCalledTimes(3);

        await userEvent.clear(input);
        await expect(input).toHaveValue('');
    },
};

const onValid = fn();

/**
 * Bound to form state via `name` alone: the rule's error message is shown after a failed
 * submit and clears as soon as the field's value changes.
 */
export const FormBound: Story = {
    render: function Render() {
        const form = useForm<{ goalTitle: string }>({
            defaultValues: { goalTitle: '' },
            rules: { goalTitle: { required: 'Goal name is required.' } },
        });

        return (
            <FormProvider form={form}>
                <form onSubmit={form.handleSubmit(onValid)} noValidate>
                    <TextInput name="goalTitle" id="form-goal-title" label="Goal Name:" />
                    <button type="submit" className="btn btn-primary">Submit</button>
                </form>
            </FormProvider>
        );
    },
    play: async ({ canvasElement }) => {
        onValid.mockClear();
        const canvas = within(canvasElement);
        const input = canvas.getByLabelText('Goal Name:');
        const submit = canvas.getByRole('button', { name: 'Submit' });

        await expect(canvas.queryByText('Goal name is required.')).not.toBeInTheDocument();

        await userEvent.click(submit);
        await expect(await canvas.findByText('Goal name is required.')).toBeInTheDocument();
        await expect(onValid).not.toHaveBeenCalled();

        await userEvent.type(input, 'Run');
        await expect(input).toHaveValue('Run');
        await expect(canvas.queryByText('Goal name is required.')).not.toBeInTheDocument();

        await userEvent.click(submit);
        await expect(onValid).toHaveBeenCalledWith({ goalTitle: 'Run' });
    },
};

/**
 * Standalone use without `value`: the input is uncontrolled, seeded from `defaultValue`.
 */
export const Uncontrolled: Story = {
    args: {
        id: 'uncontrolled-text',
        label: 'Uncontrolled Field',
        defaultValue: 'abc',
        onChange: fn(),
    },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const input = canvas.getByLabelText('Uncontrolled Field');

        await expect(input).toHaveValue('abc');

        await userEvent.type(input, 'X');
        await expect(input).toHaveValue('abcX');
        await expect(args.onChange).toHaveBeenCalledTimes(1);
    },
};
