import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { RadioSelector } from './RadioSelector';
import type { Option } from '../types/selectors';
import { ResponsiveMatrix } from '@stories/ResponsiveMatrix';
import { DocsPage } from '@stories/DocsPage';

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