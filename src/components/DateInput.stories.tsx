import type { Meta, StoryObj } from '@storybook/react-vite';
import { DateInput } from './DateInput';
import { DocsPage } from '@stories/DocsPage';

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
    },
};