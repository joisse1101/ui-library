import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { DocsPage } from '@stories/DocsPage';
import { OVERFLOW_FRAME_TEST_ID, expectScrollOverlaysFollowScrolling } from '@stories/scrollOverlays';
import { useState } from 'react';
import { useForm } from '@hooks/useForm';
import { FormProvider } from '@providers/FormProvider';
import { useArraySelection } from '../../hooks/useArraySelection';
import { ButtonSelector } from './ButtonSelector';
import type { Option } from '../../types/selectors';
import { ResponsiveMatrix } from '@stories/ResponsiveMatrix';

const sampleOptions: Option[] = [
    { label: 'React', value: 'react' },
    { label: 'TypeScript', value: 'typescript' },
    { label: 'Sass / SCSS', value: 'scss' },
    { label: 'Vite', value: 'vite' },
    { label: 'Storybook', value: 'storybook' },
    { label: 'Vitest', value: 'vitest' },
    { label: 'Node.js', value: 'nodejs' },
    { label: 'GraphQL', value: 'graphql' },
];

const meta: Meta<typeof ButtonSelector> = {
    title: 'User Input/Button Selector',
    component: ButtonSelector,
    tags: ['autodocs'],
    parameters: {
        docs: {
            page: DocsPage,
        },
    },
    argTypes: {
        label: { control: 'text', description: 'Label text for the group' },
        options: { control: 'object', description: 'List of options to select from' },
        selectedOptions: { control: 'object', description: 'Array of currently selected values' },
        onSelect: { action: 'optionSelected' },
    },
};

export default meta;
type Story = StoryObj<typeof ButtonSelector>;

export const ResponsiveView: Story = {
    render: (args) => {
        const { selectedOptions, toggleOption } = useArraySelection<(string | number)>([]);
        return <ResponsiveMatrix component={ButtonSelector} args={{ ...args, selectedOptions, onSelect: toggleOption }} />;
    },
    args: {
        label: 'Select Frameworks',
        options: sampleOptions,
    },
};

/**
 * Uses `useArraySelection` to handle multi-option toggling. 
 */
export const MultiSelect: Story = {
    name: 'Multi-Select',
    render: (args) => {
        const { selectedOptions, toggleOption } = useArraySelection<(string | number)>([]);
        const handleSelect = (value: string | number) => {
            args.onSelect?.(value);
            toggleOption(value);
        };
        return <ButtonSelector {...args} selectedOptions={selectedOptions} onSelect={handleSelect} />;
    },
    args: {
        label: 'Select Frameworks',
        options: sampleOptions,
        onSelect: fn(),
    },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const react = canvas.getByRole('button', { name: 'React' });
        const vite = canvas.getByRole('button', { name: 'Vite' });

        await expect(react).not.toHaveClass('selected');
        await expect(vite).not.toHaveClass('selected');

        await userEvent.click(react);
        await expect(react).toHaveClass('selected');
        await expect(args.onSelect).toHaveBeenLastCalledWith('react');

        await userEvent.click(vite);
        await expect(react).toHaveClass('selected');
        await expect(vite).toHaveClass('selected');
        await expect(args.onSelect).toHaveBeenLastCalledWith('vite');

        await userEvent.click(react);
        await expect(react).not.toHaveClass('selected');
        await expect(vite).toHaveClass('selected');
        await expect(args.onSelect).toHaveBeenLastCalledWith('react');
        await expect(args.onSelect).toHaveBeenCalledTimes(3);
    },
};

/**
 * Single selection mode can be enforced by modifying `onSelect` to replace the array with a single selected item.
 */
export const SingleSelect: Story = {
    render: function Render(args) {
        const [selected, setSelected] = useState<(string | number)[] | null>(['typescript']);

        const handleSelect = (value: string | number) => {
            args.onSelect?.(value);
            setSelected([value]);
        };

        return (
            <ButtonSelector
                {...args}
                selectedOptions={selected}
                onSelect={handleSelect}
            />
        );
    },
    args: {
        label: 'Single Selection',
        options: sampleOptions.slice(0, 5),
        onSelect: fn(),
    },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const typescript = canvas.getByRole('button', { name: 'TypeScript' });
        const react = canvas.getByRole('button', { name: 'React' });

        await expect(typescript).toHaveClass('selected');
        await expect(react).not.toHaveClass('selected');

        await userEvent.click(react);
        await expect(react).toHaveClass('selected');
        await expect(typescript).not.toHaveClass('selected');
        await expect(args.onSelect).toHaveBeenLastCalledWith('react');

        // Re-selecting the current option keeps it selected rather than toggling it off.
        await userEvent.click(react);
        await expect(react).toHaveClass('selected');
        await expect(args.onSelect).toHaveBeenCalledTimes(2);
    },
};

const onValid = fn();

/**
 * Bound to form state via `name` alone: the multi-select toggle is managed in the form's value,
 * a failed submit shows the rule's error, and picking an option clears it.
 */
export const FormBound: Story = {
    render: function Render() {
        const form = useForm<{ frameworks: (string | number)[] }>({
            defaultValues: { frameworks: [] },
            rules: { frameworks: { required: 'Pick at least one framework.' } },
        });

        return (
            <FormProvider form={form}>
                <form onSubmit={form.handleSubmit(onValid)} noValidate>
                    <ButtonSelector name="frameworks" label="Frameworks" options={sampleOptions} />
                    <button type="submit" className="btn btn-primary">Submit</button>
                </form>
            </FormProvider>
        );
    },
    play: async ({ canvasElement }) => {
        onValid.mockClear();
        const canvas = within(canvasElement);
        const react = canvas.getByRole('button', { name: 'React' });
        const vite = canvas.getByRole('button', { name: 'Vite' });
        const submit = canvas.getByRole('button', { name: 'Submit' });

        await expect(canvas.queryByText('Pick at least one framework.')).not.toBeInTheDocument();

        await userEvent.click(submit);
        await expect(await canvas.findByText('Pick at least one framework.')).toBeInTheDocument();
        await expect(onValid).not.toHaveBeenCalled();

        await userEvent.click(react);
        await expect(react).toHaveClass('selected');
        await expect(canvas.queryByText('Pick at least one framework.')).not.toBeInTheDocument();

        await userEvent.click(vite);
        await userEvent.click(submit);
        await expect(onValid).toHaveBeenLastCalledWith({ frameworks: ['react', 'vite'] });

        await userEvent.click(react);
        await expect(react).not.toHaveClass('selected');
        await userEvent.click(submit);
        await expect(onValid).toHaveBeenLastCalledWith({ frameworks: ['vite'] });
    },
};

/**
 * In a container narrower than its options, the group scrolls horizontally and the fade overlays
 * track the scroll position (this exercises `useCanSideScroll`).
 */
export const Overflow: Story = {
    render: (args) => (
        <div data-testid={OVERFLOW_FRAME_TEST_ID} style={{ width: '280px' }}>
            <ButtonSelector {...args} />
        </div>
    ),
    args: {
        label: 'Overflowing Frameworks',
        options: sampleOptions,
    },
    play: async ({ canvasElement }) => {
        await expectScrollOverlaysFollowScrolling(canvasElement);
    },
};