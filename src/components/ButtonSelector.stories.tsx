import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { ButtonSelector } from './ButtonSelector';
import type { Option } from '../types/selectors';
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
    title: 'User Input/ButtonSelector',
    component: ButtonSelector,
    tags: ['autodocs'],
    argTypes: {
        label: { control: 'text', description: 'Label text for the group' },
        options: { control: 'object', description: 'List of options to select from' },
        selectedOptions: { control: 'object', description: 'Array of currently selected values' },
        onSelect: { action: 'optionSelected' },
    },
};

export default meta;
type Story = StoryObj<typeof ButtonSelector>;

// 1. Base Uncontrolled / Static Preview
export const Default: Story = {
    render: (args) => <ResponsiveMatrix component={ButtonSelector} args={args} />,
    args: {
        label: 'Select Frameworks',
        options: sampleOptions.slice(0, 4),
        selectedOptions: ['react'],
    },
};

// 2. Interactive Single-Select Story
export const SingleSelectInteractive: Story = {
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
    },
};

// 3. Interactive Multi-Select Story
export const MultiSelectInteractive: Story = {
    render: function Render(args) {
        const [selected, setSelected] = useState<(string | number)[] | null>(['react', 'scss']);

        const handleSelect = (value: string | number) => {
            args.onSelect?.(value);
            setSelected((prev) => {
                const exists = prev?.includes(value);
                if (exists) {
                    return prev?.filter((v) => v !== value) ?? null;
                }
                return [...(prev || []), value];
            });
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
        label: 'Multi Selection',
        options: sampleOptions.slice(0, 5),
    },
};

// 4. Overflowing Container (Tests custom hook `useCanSideScroll` overlays)
export const HorizontalScroll: Story = {
    render: function Render(args) {
        const [selected, setSelected] = useState<(string | number)[] | null>(['vite']);

        return (
            <div style={{ maxWidth: '350px' }}>
                <ButtonSelector
                    {...args}
                    selectedOptions={selected}
                    onSelect={(val) => setSelected([val])}
                />
            </div>
        );
    },
    args: {
        label: 'Scrollable Options (Constraint Width)',
        options: sampleOptions,
    },
};