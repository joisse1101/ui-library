import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { DateInput } from './DateInput';
import { DocsPage } from '@stories/DocsPage';
import { useForm } from '@hooks/useForm';
import { FormProvider } from '@providers/FormProvider';

const meta: Meta<typeof DateInput> = {
    title: 'User Input/DateInput',
    component: DateInput,
    tags: ['autodocs'],
    parameters: {
        docs: {
            page: DocsPage,
        },
    },
    argTypes: {
        label: { control: 'text', description: 'Label text for the input field' },
        id: { control: 'text', description: 'Unique identifier linking label to input' },
        value: { control: 'text', description: 'Selected date string (YYYY-MM-DD)' },
        disabled: { control: 'boolean', description: 'Disables the input field' },
        required: { control: 'boolean', description: 'Marks input as mandatory' },
        onChange: { action: 'dateChanged' },
    },
};

export default meta;
type Story = StoryObj<typeof DateInput>;

export const Default: Story = {
    render: (args) => <DateInput {...args} />,
    args: {
        id: 'birth-date',
        label: 'Date of Birth',
    },
};

/**
 * Component accepts and passes default input properties, which can be used to constrain the selectable date range.
 */
export const ConstrainedRange: Story = {
    args: {
        id: 'booking-date',
        label: 'Booking Date (Current Month Only)',
        min: '2026-08-01',
        max: '2026-08-31',
        defaultValue: '2026-08-15',
    },
};

/**
 * Disabled state of the component prevents user interaction and visually indicates that the input is not editable.
 */
export const Disabled: Story = {
    args: {
        id: 'disabled-date',
        label: 'Locked Release Date',
        defaultValue: '2026-12-25',
        disabled: true,
        onChange: fn(),
    },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const input = canvas.getByLabelText('Locked Release Date');

        await expect(input).toBeDisabled();

        await userEvent.type(input, '2026-01-01');
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
            <DateInput
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
        id: 'controlled-date',
        label: 'Controlled Date',
        onChange: fn(),
    },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const input = canvas.getByLabelText('Controlled Date');

        await expect(input).toHaveValue('');

        await userEvent.type(input, '2026-08-15');
        await expect(input).toHaveValue('2026-08-15');
        await expect(args.onChange).toHaveBeenCalled();
    },
};

const onValid = fn();

/**
 * Bound to form state via `name` alone: the required message is shown after a failed submit
 * and clears as soon as a date is entered.
 */
export const FormBound: Story = {
    render: function Render() {
        const form = useForm<{ startDate: string }>({
            defaultValues: { startDate: '' },
            rules: { startDate: { required: 'Start date is required.' } },
        });

        return (
            <FormProvider form={form}>
                <form onSubmit={form.handleSubmit(onValid)} noValidate>
                    <DateInput name="startDate" id="form-start-date" label="Start Date:" />
                    <button type="submit" className="btn btn-primary">Submit</button>
                </form>
            </FormProvider>
        );
    },
    play: async ({ canvasElement }) => {
        onValid.mockClear();
        const canvas = within(canvasElement);
        const input = canvas.getByLabelText('Start Date:');
        const submit = canvas.getByRole('button', { name: 'Submit' });

        await userEvent.click(submit);
        await expect(await canvas.findByText('Start date is required.')).toBeInTheDocument();
        await expect(onValid).not.toHaveBeenCalled();

        await userEvent.type(input, '2026-08-15');
        await expect(input).toHaveValue('2026-08-15');
        await expect(canvas.queryByText('Start date is required.')).not.toBeInTheDocument();

        await userEvent.click(submit);
        await expect(onValid).toHaveBeenCalledWith({ startDate: '2026-08-15' });
    },
};
/**
 * Standalone use without `value`: the input is uncontrolled, seeded from `defaultValue`.
 */
export const Uncontrolled: Story = {
    args: {
        id: 'uncontrolled-date',
        label: 'Uncontrolled Date',
        defaultValue: '2026-08-15',
        onChange: fn(),
    },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const input = canvas.getByLabelText('Uncontrolled Date');

        await expect(input).toHaveValue('2026-08-15');

        await userEvent.clear(input);
        await userEvent.type(input, '2026-09-01');
        await expect(input).toHaveValue('2026-09-01');
        await expect(args.onChange).toHaveBeenCalled();
    },
};
