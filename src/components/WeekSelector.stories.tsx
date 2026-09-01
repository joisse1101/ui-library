import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { WeekSelector, type WeekState } from './WeekSelector';
import { DocsPage } from '@stories/DocsPage';

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
    parameters: {
        docs: {
            page: DocsPage,
        },
    },
    argTypes: {
        weekState: { control: 'object', description: 'Object containing week number, startDate, and endDate' },
        maxWeeks: { control: 'number', description: 'Upper boundary for maximum allowed weeks' },
        incrementWeek: { action: 'weekChanged' },
    },
};

export default meta;
type Story = StoryObj<typeof WeekSelector>;

export const Interactive: Story = {
    render: function Render(args) {
        const [weekNum, setWeekNum] = useState<number>(2);

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
        maxWeeks: 3,
    },
};