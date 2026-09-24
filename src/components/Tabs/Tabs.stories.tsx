import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { useState } from 'react';
import { Tabs, type TabItem } from './Tabs';
import { ResponsiveMatrix } from '@stories/ResponsiveMatrix';
import { DocsPage } from '@stories/DocsPage';
import { OVERFLOW_FRAME_TEST_ID, expectScrollOverlaysFollowScrolling } from '@stories/scrollOverlays';

const defaultTabs: TabItem[] = [
    {
        id: 'tab-1',
        label: 'Overview',
        content: <p style={{ padding: '1rem 0' }}>Overview tab content: Welcome to the component library design system.</p>,
    },
    {
        id: 'tab-2',
        label: 'Settings',
        content: <p style={{ padding: '1rem 0' }}>Settings tab content: Manage your workspace configurations here.</p>,
    },
    {
        id: 'tab-3',
        label: 'Disabled Option',
        content: <p style={{ padding: '1rem 0' }}>Disabled tab content: This content cannot be accessed directly.</p>,
        disabled: true,
    },
];

const meta: Meta<typeof Tabs> = {
    title: 'Display/Tabs',
    component: Tabs,
    tags: ['autodocs'],
    parameters: {
        docs: {
            page: DocsPage,
        },
    },
    argTypes: {
        tabs: { control: 'object', description: 'Array of tab items with id, label, content, and optional disabled state.' },
        defaultActiveId: { control: 'text', description: 'Initial active tab ID for uncontrolled mode.' },
        activeId: { control: 'text', description: 'Controlled active tab ID.' },
        onTabChange: { action: 'tabChanged' },
        onTabDelete: { action: 'tabDeleted' },
        onTabAdd: { action: 'tabAddClicked' },
    },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
    render: (args) => <ResponsiveMatrix component={Tabs} args={args} />,
    args: {
        tabs: defaultTabs,
        defaultActiveId: 'tab-1',
    },
};

/**
 * Demonstrates standard tabbed navigation. Use this pattern for static section 
 * switching where the set of tabs does not change after render.
 */
export const Standard: Story = {
    render: function Render(args) {
        return (
            <Tabs
                {...args}
                onTabAdd={undefined}
                onTabDelete={undefined}
            />
        );
    },
    args: {
        tabs: defaultTabs,
        onTabChange: fn(),
    },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const overview = canvas.getByText(/Overview tab content/);
        const settings = canvas.getByText(/Settings tab content/);
        const disabled = canvas.getByText(/Disabled tab content/);

        // Uncontrolled: the first tab starts active and only its panel is shown.
        await expect(overview).toBeVisible();
        await expect(settings).not.toBeVisible();
        await expect(disabled).not.toBeVisible();

        await userEvent.click(canvas.getByRole('button', { name: 'Settings' }));
        await expect(settings).toBeVisible();
        await expect(overview).not.toBeVisible();
        await expect(args.onTabChange).toHaveBeenLastCalledWith('tab-2');

        await userEvent.click(canvas.getByRole('button', { name: 'Overview' }));
        await expect(overview).toBeVisible();
        await expect(settings).not.toBeVisible();
        await expect(args.onTabChange).toHaveBeenLastCalledWith('tab-1');
        await expect(args.onTabChange).toHaveBeenCalledTimes(2);
    },
};

/**
 * A disabled tab can't be activated: clicking it neither shows its panel nor calls `onTabChange`.
 */
export const DisabledTabIgnoresClick: Story = {
    args: {
        tabs: defaultTabs,
        defaultActiveId: 'tab-2',
        onTabChange: fn(),
    },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const disabledTab = canvas.getByRole('button', { name: 'Disabled Option' });

        await expect(disabledTab).toHaveAttribute('aria-disabled', 'true');

        // Disabled tabs are `pointer-events: none`, so force the click through to prove the handler's own guard too.
        await userEvent.setup({ pointerEventsCheck: 0 }).click(disabledTab);
        await expect(canvas.getByText(/Disabled tab content/)).not.toBeVisible();
        await expect(canvas.getByText(/Settings tab content/)).toBeVisible();
        await expect(args.onTabChange).not.toHaveBeenCalled();
    },
};

/**
 * With `activeId` supplied the parent owns the active tab: `onTabChange` reports the requested
 * tab, but the visible panel only changes when the parent passes a new `activeId`.
 */
export const Controlled: Story = {
    args: {
        tabs: defaultTabs,
        activeId: 'tab-1',
        onTabChange: fn(),
    },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);

        // Regex name: the meta's `onTabDelete` action makes each tab render a trailing "✕" button.
        await userEvent.click(canvas.getByRole('button', { name: /^Settings/ }));
        await expect(args.onTabChange).toHaveBeenLastCalledWith('tab-2');
        await expect(canvas.getByText(/Overview tab content/)).toBeVisible();
        await expect(canvas.getByText(/Settings tab content/)).not.toBeVisible();
    },
};

/**
 * In a container narrower than its tab headers, the header scrolls horizontally and the fade
 * overlays track the scroll position (this exercises `useCanSideScroll`).
 */
export const Overflow: Story = {
    render: (args) => (
        <div data-testid={OVERFLOW_FRAME_TEST_ID} style={{ width: '280px' }}>
            <Tabs {...args} />
        </div>
    ),
    args: {
        tabs: Array.from({ length: 10 }, (_, i) => ({
            id: `overflow-tab-${i + 1}`,
            label: `Workspace ${i + 1}`,
            content: <p>Content for workspace {i + 1}</p>,
        })),
    },
    play: async ({ canvasElement }) => {
        await expectScrollOverlaysFollowScrolling(canvasElement);
    },
};

/**
 * Demonstrates dynamic tab management. Shows how to handle active state, insertion, 
 * and removal when tabs are managed externally via React state.
 */
export const DynamicManagement: Story = {
    render: function Render(args) {
        const [tabList, setTabList] = useState<TabItem[]>([
            { id: 'tab-1', label: 'Tab 1', content: <p style={{ padding: '1rem 0' }}>Content for Tab 1</p> },
            { id: 'tab-2', label: 'Tab 2', content: <p style={{ padding: '1rem 0' }}>Content for Tab 2</p> },
        ]);
        const [activeId, setActiveId] = useState<string>('tab-1');

        const handleAdd = () => {
            args.onTabAdd?.();
            const newId = `tab-${Date.now()}`;
            const newTab: TabItem = {
                id: newId,
                label: `Tab ${tabList.length + 1}`,
                content: <p style={{ padding: '1rem 0' }}>Content for new tab dynamic #{tabList.length + 1}</p>,
            };
            setTabList((prev) => [...prev, newTab]);
            setActiveId(newId);
        };

        const handleDelete = (idToDelete: string) => {
            args.onTabDelete?.(idToDelete);
            setTabList((prev) => {
                const filtered = prev.filter((t) => t.id !== idToDelete);
                if (activeId === idToDelete && filtered.length > 0) {
                    setActiveId(filtered[0].id);
                }
                return filtered;
            });
        };

        return (
            <Tabs
                {...args}
                tabs={tabList}
                activeId={activeId}
                onTabChange={(id) => {
                    args.onTabChange?.(id);
                    setActiveId(id);
                }}
                onTabAdd={handleAdd}
                onTabDelete={handleDelete}
            />
        );
    },
    args: {
        onTabChange: fn(),
        onTabAdd: fn(),
        onTabDelete: fn(),
    },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);

        await expect(canvas.getByText('Content for Tab 1')).toBeVisible();

        await userEvent.click(canvas.getByRole('button', { name: /Tab 2/ }));
        await expect(args.onTabChange).toHaveBeenLastCalledWith('tab-2');
        await expect(canvas.getByText('Content for Tab 2')).toBeVisible();
        await expect(canvas.getByText('Content for Tab 1')).not.toBeVisible();

        // Adding a tab appends it and makes it active.
        await userEvent.click(canvas.getByRole('button', { name: '+ Add Tab' }));
        await expect(args.onTabAdd).toHaveBeenCalledTimes(1);
        await expect(await canvas.findByText('Content for new tab dynamic #3')).toBeVisible();
        await expect(canvas.getByText('Content for Tab 2')).not.toBeVisible();

        // Deleting the active tab reports its id, removes it and falls back to the first tab.
        const newTab = canvas.getByRole('button', { name: /Tab 3/ });
        await userEvent.click(within(newTab).getByRole('button', { name: '✕' }));
        await expect(args.onTabDelete).toHaveBeenCalledTimes(1);
        await expect(canvas.queryByText('Content for new tab dynamic #3')).not.toBeInTheDocument();
        await expect(canvas.getByText('Content for Tab 1')).toBeVisible();
    },
};