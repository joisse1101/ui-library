import type { Meta, StoryObj } from '@storybook/react-vite';
import { DocsPage } from '@stories/DocsPage';
import { useState } from 'react';
import { useArraySelection } from '../hooks/useArraySelection';
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
        return <ButtonSelector {...args} selectedOptions={selectedOptions} onSelect={toggleOption} />;
    },
    args: {
        label: 'Select Frameworks',
        options: sampleOptions,
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
    },
};