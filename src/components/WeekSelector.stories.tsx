import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { WeekSelector, type WeekState } from './WeekSelector';
import { ResponsiveMatrix } from '../stories/ResponsiveMatrix';

// Helper to generate dynamic week dates
const getWeekRange = (weekNumber: number): WeekState => {
    const startDate = new Date(2026, 7, 31 + (weekNumber - 1) * 7); // Starts Mon Aug 31, 2026
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    return {
        week: weekNumber,
        startDate,
        endDate,
    };
};

const meta: Meta<typeof WeekSelector> = {
    title: 'Display/WeekSelector',
    component: WeekSelector,
    tags: ['autodocs'],
    argTypes: {
        weekState: { control: 'object', description: 'Object containing week number, startDate, and endDate' },
        maxWeeks: { control: 'number', description: 'Upper boundary for maximum allowed weeks' },
        incrementWeek: { action: 'weekChanged' },
    },
};

export default meta;
type Story = StoryObj<typeof WeekSelector>;

// 1. Default Static View
export const Default: Story = {
    render: (args) => <ResponsiveMatrix component={WeekSelector} args={args} />,
    args: {
        weekState: getWeekRange(5),
        maxWeeks: 52,
    },
};

// 2. Interactive Controlled State
export const Interactive: Story = {
    render: function Render(args) {
        const [weekNum, setWeekNum] = useState<number>(12);

        const handleIncrement = (step: number) => {
            args.incrementWeek?.(step);
            setWeekNum((prev) => Math.min(Math.max(1, prev + step), args.maxWeeks));
        };

        return (
            <WeekSelector
                {...args}
                weekState={getWeekRange(weekNum)}
                incrementWeek={handleIncrement}
            />
        );
    },
    args: {
        maxWeeks: 20,
    },
};

// 3. Lower Limit (Decrement Disabled)
export const FirstWeek: Story = {
    args: {
        weekState: getWeekRange(1),
        maxWeeks: 12,
    },
};

// 4. Upper Limit (Increment Disabled)
export const LastWeek: Story = {
    args: {
        weekState: getWeekRange(12),
        maxWeeks: 12,
    },
};

// 5. Mobile Layout Responsive Test
export const MobileView: Story = {
    parameters: {
        viewport: {
            defaultViewport: 'mobile1',
        },
    },
    args: {
        weekState: getWeekRange(3),
        maxWeeks: 52,
    },
};