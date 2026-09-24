import type { Meta, StoryObj } from '@storybook/react-vite';
import { DocsPage } from '@stories/DocsPage';
import { ThemeAudit, type AuditTheme } from '@stories/ThemeAudit';
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

/**
 * Every themeable surface in one place, for tuning the palettes against real components.
 *
 * Covers all colour tokens (with live resolved hex values), RGB-triplet sync, shadows, WCAG contrast for
 * the pairings components actually render, and each shared/global style layer plus the component-owned ones.
 * Values re-read automatically when `_variables.scss` changes.
 *
 * Use the `theme` control to pick `light`, `dark`, or `side-by-side`. `global` follows the toolbar toggle instead.
 * Hover states can't be forced statically, so hover/press the real controls to check them.
 */
export const Audit: StoryObj<{ theme: AuditTheme }> = {
    args: { theme: 'light' },
    argTypes: {
        theme: {
            control: 'inline-radio',
            options: ['light', 'dark', 'side-by-side', 'global'],
        },
    },
    parameters: {
        layout: 'fullscreen',
        docs: { story: { inline: false, height: '900px' } },
    },
    render: ({ theme }) => <ThemeAudit theme={theme} />,
};
