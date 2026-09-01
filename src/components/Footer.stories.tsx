import type { Meta, StoryObj } from '@storybook/react-vite';
import { Footer } from './Footer';
import { ResponsiveMatrix } from '@stories/ResponsiveMatrix';

const meta: Meta<typeof Footer> = {
    title: 'Layout/Footer',
    component: Footer,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
    },
};

export default meta;
type Story = StoryObj<typeof Footer>;

// 1. Default Layout View
export const Default: Story = {
    render: () => <ResponsiveMatrix component={Footer} />,
};

// 2. Full Page Layout Context
export const MobileView: Story = {
    parameters: {
        viewport: {
            defaultViewport: 'mobile1',
        },
    },
};