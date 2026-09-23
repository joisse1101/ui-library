import type { Meta, StoryObj } from '@storybook/react-vite';
import { TextInput } from './TextInput';
import { DocsPage } from '@stories/DocsPage';

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
    },
};
