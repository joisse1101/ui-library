import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
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
        incrementWeek: fn(),
    },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const previous = canvas.getByRole('button', { name: '〈' });
        const next = canvas.getByRole('button', { name: '〉' });

        // Starts on week 2 of 3, so both directions are available.
        await expect(canvas.getByText(/Week 2.*Mon Sep 07 2026 - Sun Sep 13 2026/)).toBeInTheDocument();
        await expect(previous).toBeEnabled();
        await expect(next).toBeEnabled();

        // Stepping back to week 1 disables "previous".
        await userEvent.click(previous);
        await expect(args.incrementWeek).toHaveBeenLastCalledWith(-1);
        await expect(canvas.getByText(/Week 1.*Mon Aug 31 2026 - Sun Sep 06 2026/)).toBeInTheDocument();
        await expect(previous).toBeDisabled();
        await expect(next).toBeEnabled();

        // A disabled "previous" does nothing (`.btn:disabled` is `pointer-events: none`, so force the click).
        await userEvent.setup({ pointerEventsCheck: 0 }).click(previous);
        await expect(args.incrementWeek).toHaveBeenCalledTimes(1);

        // Stepping forward to the last week disables "next".
        await userEvent.click(next);
        await userEvent.click(next);
        await expect(args.incrementWeek).toHaveBeenLastCalledWith(1);
        await expect(canvas.getByText(/Week 3.*Mon Sep 14 2026 - Sun Sep 20 2026/)).toBeInTheDocument();
        await expect(next).toBeDisabled();
        await expect(previous).toBeEnabled();

        await userEvent.setup({ pointerEventsCheck: 0 }).click(next);
        await expect(args.incrementWeek).toHaveBeenCalledTimes(3);
    },
};