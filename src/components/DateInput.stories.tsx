import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { DateInput } from './DateInput';
import { ResponsiveMatrix } from '@stories/ResponsiveMatrix';

const meta: Meta<typeof DateInput> = {
    title: 'User Input/DateInput',
    component: DateInput,
    tags: ['autodocs'],
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

// 1. Default State
export const Default: Story = {
    render: (args) => <ResponsiveMatrix component={DateInput} args={args} />,
    args: {
        id: 'birth-date',
        label: 'Date of Birth',
    },
};

// 2. Interactive Controlled Story
export const Interactive: Story = {
    render: function Render(args) {
        const [selectedDate, setSelectedDate] = useState<string>('2026-08-31');

        return (
            <DateInput
                {...args}
                value={selectedDate}
                onChange={(e) => {
                    args.onChange?.(e);
                    setSelectedDate(e.target.value);
                }}
            />
        );
    },
    args: {
        id: 'interactive-date',
        label: 'Select Target Date',
    },
};

// 3. Min/Max Range Constrained State
export const ConstrainedRange: Story = {
    args: {
        id: 'booking-date',
        label: 'Booking Date (Current Month Only)',
        min: '2026-08-01',
        max: '2026-08-31',
        defaultValue: '2026-08-15',
    },
};

// 4. Disabled State
export const Disabled: Story = {
    args: {
        id: 'disabled-date',
        label: 'Locked Release Date',
        defaultValue: '2026-12-25',
        disabled: true,
    },
};