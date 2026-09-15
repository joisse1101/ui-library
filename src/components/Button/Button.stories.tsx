import type { Meta, StoryObj } from '@storybook/react-vite';
import { DocsPage } from '@stories/DocsPage';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
    title: 'User Input/Button',
    component: Button,
    tags: ['autodocs'],
    parameters: {
        docs: {
            page: DocsPage,
        },
    },
    argTypes: {
        variant: { control: 'select', options: ['primary', 'secondary', 'ghost', 'success', 'danger', 'danger-outline', 'disabled', 'invisible'], description: 'Visual style of the button' },
        size: { control: 'select', options: ['sm', 'md', 'lg'], description: 'Size of the button' },
        icon: { control: 'boolean', description: 'Whether the button includes an icon' },
        children: { control: 'text', description: 'Button label or content' },
        className: { control: 'text', description: 'Additional CSS classes for custom styling' },
    },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Basic: Story = {
    render: () => {
        return <div style={{ display: 'grid', columnGap: '1rem', rowGap: '1rem', gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <Button variant="primary" size="md" icon={false} className="">Primary Button</Button>
            <Button variant="secondary" size="md" icon={false} className="">Secondary Button</Button>
            <Button variant="ghost" size="md" icon={false} className="">Ghost Button</Button>
            <Button variant="success" size="md" icon={false} className="">Success Button</Button>
            <Button variant="danger" size="md" icon={false} className="">Danger Button</Button>
            <Button variant="danger-outline" size="md" icon={false} className="">Danger Outline Button</Button>
        </div>
            ;
    },
};

/**
 * This story showcases the visual appearance of buttons that are intended to be used with SVGs, while still allowing for text content if desired.
 */
export const Icon: Story = {
    render: () => {
        return <div style={{ display: 'grid', columnGap: '1rem', rowGap: '1rem', gridTemplateColumns: 'repeat(3, 1fr)', alignItems: 'center', justifyItems: 'center' }}>
            <Button variant="primary" size="lg" icon={true} className=""><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            </Button>
            <Button variant="secondary" size="lg" icon={true} className=""><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
            </svg>
            </Button>
            <Button variant="ghost" size="lg" icon={true} className=""><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
            </svg>
            </Button>
            <Button variant="success" size="lg" icon={true} className=""><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
            </svg>
            </Button>
            <Button variant="danger" size="lg" icon={true} className=""><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
            </Button>
            <Button variant="danger-outline" size="lg" icon={true} className=""><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
            </Button>
        </div>
            ;
    },
}

/**
 * Disabled buttons showcase the appearance and behavior of buttons when they are not interactive.
 */
export const Disabled: Story = {
    render: () => {
        return <div style={{ display: 'grid', columnGap: '1rem', rowGap: '1rem', gridTemplateColumns: 'repeat(3, 1fr)', alignItems: 'center', justifyItems: 'center' }}>
            <Button variant="primary" size="lg" icon={false} className="" disabled>
                Primary Disabled
            </Button>
            <Button variant="secondary" size="lg" icon={false} className="" disabled>
                Secondary Disabled
            </Button>
            <Button variant="ghost" size="lg" icon={false} className="" disabled>
                Ghost Disabled
            </Button>
            <Button variant="primary" size="lg" icon={true} className="" disabled>
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
            </Button>
            <Button variant="secondary" size="lg" icon={true} className="" disabled>
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14" />
                </svg>
            </Button>
            <Button variant="ghost" size="lg" icon={true} className="" disabled>
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14" />
                </svg>
            </Button>
        </div>;
    },
}

/**
 * Invisible button variants demonstrate buttons that are visually hidden but still accessible for screen readers and assistive technologies. These buttons can be used in scenarios where a button's functionality is needed without displaying it on the UI.
 */
export const Invisible: Story = {
    render: () => {
        return <div style={{ display: 'grid', columnGap: '1rem', rowGap: '1rem', gridTemplateColumns: 'repeat(2, 1fr)', alignItems: 'center', justifyItems: 'center' }}>
            <Button variant="ghost" size="lg" icon={false} className="">
                Ghost
            </Button>
            <Button variant="ghost" size="lg" icon={true} className="">
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14" />
                </svg>
            </Button>
            <Button variant="invisible" size="lg" icon={false} className="">
                Invisible
            </Button>
            <Button variant="invisible" size="lg" icon={true} className="">
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14" />
                </svg>
            </Button>
        </div>;
    },
}