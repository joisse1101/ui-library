import type { Meta, StoryObj } from '@storybook/react-vite';
import { CardCarousel, type CardProps } from './CardCarousel';

const mockCards: CardProps[] = [
    {
        id: '1',
        title: 'Design Systems',
        description: 'Explore consistent design tokens, dark themes, and scalable UI components.',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
        link: { label: 'Read docs', url: '#' },
    },
    {
        id: '2',
        title: 'React & Vite',
        description: 'Fast modern bundling paired with flexible component abstractions.',
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
        link: { label: 'Explore stack', url: '#' },
    },
    {
        id: '3',
        title: 'SCSS & Design Tokens',
        description: 'Leveraging CSS custom variables for dynamic runtime theme swappability.',
        image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80',
        link: { label: 'View variables', url: '#' },
    },
    {
        id: '4',
        title: 'Accessibility First',
        description: 'Built-in keyboard navigation, ARIA roles, and focus indicator loops.',
        image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=600&q=80',
        link: { label: 'Audit report', url: '#' },
    },
    {
        id: '5',
        title: 'CI/CD Automation',
        description: 'Automated Storybook deployment to GitHub Pages on every push.',
        image: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&w=600&q=80',
        link: { label: 'View pipeline', url: '#' },
    },
];

const meta: Meta<typeof CardCarousel> = {
    title: 'Display/CardCarousel',
    component: CardCarousel,
    tags: ['autodocs'],
    argTypes: {
        items: {
            control: 'object',
            description: 'List of card data objects to render inside the carousel track.',
        },
    },
    decorators: [
        (Story) => (
            <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
                <Story />
            </div>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof CardCarousel>;

export const Default: Story = {
    args: {
        items: mockCards,
    },
};

export const TextOnly: Story = {
    args: {
        items: mockCards.map(({ image, ...rest }) => rest),
    },
};

export const StaticTrack: Story = {
    args: {
        items: mockCards.slice(0, 2),
    },
};