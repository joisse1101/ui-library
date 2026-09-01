import type { Meta, StoryObj } from '@storybook/react-vite';
import { ColourPalettePicker } from './ColourPalettePicker';
import { DocsPage } from '@stories/DocsPage';

const meta: Meta<typeof ColourPalettePicker> = {
    title: 'User Input/ColourPalettePicker',
    component: ColourPalettePicker,
    tags: ['autodocs'],
    parameters: {
        docs: {
            page: DocsPage,
        },
    },
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

export const Default: Story = {
    render: () => <ColourPalettePicker />,
};