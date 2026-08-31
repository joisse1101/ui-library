import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { RadioSelector } from './RadioSelector';
import type { Option } from '../types/selectors';

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
    argTypes: {
        label: { control: 'text', description: 'Label text for the radio group' },
        options: { control: 'object', description: 'Array of radio options' },
        selectedOptions: { control: 'text', description: 'Currently selected option value' },
        onSelect: { action: 'optionSelected' },
    },
};

export default meta;
type Story = StoryObj<typeof RadioSelector>;

// 1. Default Static Story
export const Default: Story = {
    args: {
        label: 'Billing Cycle',
        options: sampleOptions.slice(0, 3),
        selectedOptions: 'monthly',
    },
};

// 2. Interactive Single Selection
export const Interactive: Story = {
    render: function Render(args) {
        const [selected, setSelected] = useState<string | number>('weekly');

        return (
            <RadioSelector
                {...args}
                selectedOptions={selected}
                onSelect={(val) => {
                    args.onSelect?.(val);
                    setSelected(val);
                }}
            />
        );
    },
    args: {
        label: 'Notification Frequency',
        options: sampleOptions,
    },
};

// 3. Overflow / Scrollable Container
export const Scrollable: Story = {
    render: function Render(args) {
        const [selected, setSelected] = useState<string | number>('biweekly');

        return (
            <div style={{ maxWidth: '300px' }}>
                <RadioSelector
                    {...args}
                    selectedOptions={selected}
                    onSelect={(val) => setSelected(val)}
                />
            </div>
        );
    },
    args: {
        label: 'Subscription Tier (Constrained)',
        options: sampleOptions,
    },
};