import type { Meta, StoryObj } from '@storybook/react-vite';
import { DocsPage } from '@stories/DocsPage';
import { ThemeProvider } from './ThemeProvider';
import { useTheme } from './ThemeContext';

const meta: Meta<typeof ThemeProvider> = {
    title: 'Providers/ThemeProvider',
    component: ThemeProvider,
    tags: ['autodocs'],
    parameters: {
        docs: {
            page: DocsPage,
        },
    },
};

export default meta;

type Story = StoryObj<typeof ThemeProvider>;

function ThemeDemo() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start' }}>
            <p>
                Current theme: <strong>{theme}</strong>
            </p>
            <button
                className="btn btn-primary"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
                Toggle theme
            </button>
        </div>
    );
}

/**
 * Demonstrates uncontrolled `ThemeProvider` usage: a `useTheme()` consumer flips
 * `document.documentElement`'s `data-theme` attribute directly, independent of
 * Storybook's global toolbar toggle.
 */
export const Basic: Story = {
    render: () => (
        <ThemeProvider defaultTheme="dark">
            <ThemeDemo />
        </ThemeProvider>
    ),
};
