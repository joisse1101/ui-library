import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { useState } from 'react';
import { RadioSelector } from './RadioSelector';
import type { Option } from '../../types/selectors';
import { ResponsiveMatrix } from '@stories/ResponsiveMatrix';
import { DocsPage } from '@stories/DocsPage';
import { OVERFLOW_FRAME_TEST_ID, expectScrollOverlaysFollowScrolling } from '@stories/scrollOverlays';
import { useForm } from '@hooks/useForm';
import { FormProvider } from '@providers/FormProvider';

const sampleOptions: Option[] = [
    { label: 'Weekly', value: 'weekly' },
    { label: 'Bi-Weekly', value: 'biweekly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Quarterly', value: 'quarterly' },
    { label: 'Annually', value: 'annually' },
];

const meta: Meta<typeof RadioSelector> = {
    title: 'User Input/RadioSelector',
    component: RadioSelector,
    tags: ['autodocs'],
    parameters: {
        docs: {
            page: DocsPage,
        },
    },
    argTypes: {
        label: { control: 'text', description: 'Label text for the radio group' },
        options: { control: 'object', description: 'Array of radio options' },
        selectedOptions: { control: 'text', description: 'Currently selected option value' },
        onSelect: { action: 'optionSelected' },
    },
};

export default meta;
type Story = StoryObj<typeof RadioSelector>;

export const Default: Story = {
    render: (args) => {
        const [selected, setSelected] = useState<string | number>('monthly');
        return <ResponsiveMatrix component={RadioSelector} args={{ ...args, selectedOptions: selected, onSelect: setSelected }} />;
    },
    args: {
        label: 'Billing Cycle',
        options: sampleOptions,
    },
};

/**
 * The parent owns the selection: choosing an option calls `onSelect` with its value, and exactly
 * one option is selected at a time.
 */
export const Standard: Story = {
    render: function Render(args) {
        const [selected, setSelected] = useState<string | number | undefined>('monthly');
        const handleSelect = (value: string | number) => {
            args.onSelect?.(value);
            setSelected(value);
        };
        return <RadioSelector {...args} selectedOptions={selected} onSelect={handleSelect} />;
    },
    args: {
        label: 'Billing Cycle',
        options: sampleOptions,
        onSelect: fn(),
    },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const checkedRadios = () => canvas.getAllByRole('radio').filter((radio) => (radio as HTMLInputElement).checked);

        await expect(canvas.getByRole('radio', { name: 'Monthly' })).toBeChecked();
        await expect(checkedRadios()).toHaveLength(1);

        await userEvent.click(canvas.getByRole('radio', { name: 'Weekly' }));
        await expect(canvas.getByRole('radio', { name: 'Weekly' })).toBeChecked();
        await expect(canvas.getByRole('radio', { name: 'Monthly' })).not.toBeChecked();
        await expect(args.onSelect).toHaveBeenLastCalledWith('weekly');
        await expect(checkedRadios()).toHaveLength(1);

        // Clicking the visible label text selects too.
        await userEvent.click(canvas.getByText('Quarterly'));
        await expect(canvas.getByRole('radio', { name: 'Quarterly' })).toBeChecked();
        await expect(canvas.getByRole('radio', { name: 'Weekly' })).not.toBeChecked();
        await expect(args.onSelect).toHaveBeenLastCalledWith('quarterly');
        await expect(args.onSelect).toHaveBeenCalledTimes(2);
        await expect(checkedRadios()).toHaveLength(1);
    },
};

const onValid = fn();

/**
 * Bound to form state via `name` alone: a failed submit shows the rule's error, and choosing
 * an option writes it to the form and clears the error.
 */
export const FormBound: Story = {
    render: function Render() {
        const form = useForm<{ cycle: string }>({
            defaultValues: { cycle: '' },
            rules: { cycle: { required: 'Choose a billing cycle.' } },
        });

        return (
            <FormProvider form={form}>
                <form onSubmit={form.handleSubmit(onValid)} noValidate>
                    <RadioSelector name="cycle" label="Billing Cycle" options={sampleOptions} />
                    <button type="submit" className="btn btn-primary">Submit</button>
                </form>
            </FormProvider>
        );
    },
    play: async ({ canvasElement }) => {
        onValid.mockClear();
        const canvas = within(canvasElement);
        const submit = canvas.getByRole('button', { name: 'Submit' });

        await expect(canvas.queryByText('Choose a billing cycle.')).not.toBeInTheDocument();

        await userEvent.click(submit);
        await expect(await canvas.findByText('Choose a billing cycle.')).toBeInTheDocument();
        await expect(onValid).not.toHaveBeenCalled();

        await userEvent.click(canvas.getByRole('radio', { name: 'Annually' }));
        await expect(canvas.getByRole('radio', { name: 'Annually' })).toBeChecked();
        await expect(canvas.queryByText('Choose a billing cycle.')).not.toBeInTheDocument();

        await userEvent.click(canvas.getByRole('radio', { name: 'Weekly' }));
        await expect(canvas.getByRole('radio', { name: 'Annually' })).not.toBeChecked();

        await userEvent.click(submit);
        await expect(onValid).toHaveBeenCalledWith({ cycle: 'weekly' });
    },
};

/**
 * In a container narrower than its options, the group scrolls horizontally and the fade overlays
 * track the scroll position (this exercises `useCanSideScroll`).
 */
export const Overflow: Story = {
    render: (args) => (
        <div data-testid={OVERFLOW_FRAME_TEST_ID} style={{ width: '220px' }}>
            <RadioSelector {...args} />
        </div>
    ),
    args: {
        label: 'Overflowing Billing Cycle',
        options: sampleOptions,
    },
    play: async ({ canvasElement }) => {
        await expectScrollOverlaysFollowScrolling(canvasElement);
    },
};
