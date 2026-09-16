import type { Meta, StoryObj } from '@storybook/react-vite';
import { NumberInput } from './NumberInput';
import { DocsPage } from '@stories/DocsPage';

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
    },
};
