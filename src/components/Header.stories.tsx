import type { Meta, StoryObj } from '@storybook/react-vite';
import '../styles/index.scss';
import { Header } from './Header';

const meta: Meta<typeof Header> = {
    title: 'Layout/Header',
    component: Header,
    tags: ['autodocs'],
    argTypes: {
        links: {
            control: 'object',
            description: 'Array of navigation links containing label and href',
        },
        children: {
            control: 'text',
            description: 'Optional elements rendered inside the navigation container',
        },
    },
};

export default meta;
type Story = StoryObj<typeof Header>;

// 1. Basic default state without links
export const Default: Story = {
    args: {},
};

// 2. State demonstrating navigation links
export const WithLinks: Story = {
    args: {
        links: [
            { label: 'Home', href: '/' },
            { label: 'About', href: '/about' },
            { label: 'Projects', href: '/projects' },
        ],
    },
};

// 3. State demonstrating children elements (e.g., custom button or badge)
export const WithChildren: Story = {
    args: {
        links: [
            { label: 'Documentation', href: '/docs' },
        ],
        children: (
            <span style={{ padding: '0.25rem 0.5rem', background: '#007acc', color: '#fff', borderRadius: '4px', fontSize: '12px' }}>
                v1.2.0
            </span>
        ),
    },
};