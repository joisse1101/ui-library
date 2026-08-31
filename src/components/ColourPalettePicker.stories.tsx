import type { Meta, StoryObj } from '@storybook/react-vite';
import { ColourPalettePicker } from './ColourPalettePicker';
import { ResponsiveMatrix } from '@stories/ResponsiveMatrix';

const meta: Meta<typeof ColourPalettePicker> = {
    title: 'User Input/ColourPalettePicker',
    component: ColourPalettePicker,
    tags: ['autodocs'],
    argTypes: {
        onChange: { action: 'paletteChanged' },
        initialPalette: {
            control: 'object',
            description: 'Initial list of palette items (hex code, steps, and id)',
        },
    },
};

export default meta;
type Story = StoryObj<typeof ColourPalettePicker>;

// 1. Default State (uses internal DEFAULT_PALETTE)
export const Default: Story = {
    render: () => <ResponsiveMatrix component={ColourPalettePicker} />,
};

// 2. Custom Initial Palette (2-step simple gradient)
export const TwoColorGradient: Story = {
    args: {
        initialPalette: [
            { id: 1, hex: '#ff7e5f', stepsToNext: 8 },
            { id: 2, hex: '#feb47b', stepsToNext: 0 },
        ],
    },
};

// 3. Multi-color Theme Palette
export const OceanGradient: Story = {
    args: {
        initialPalette: [
            { id: 1, hex: '#000508', stepsToNext: 4 },
            { id: 2, hex: '#0052d4', stepsToNext: 4 },
            { id: 3, hex: '#4364f7', stepsToNext: 4 },
            { id: 4, hex: '#6fb1fc', stepsToNext: 0 },
        ],
    },
};