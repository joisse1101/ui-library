import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Tabs, type TabItem } from './Tabs';
import { ResponsiveMatrix } from '@stories/ResponsiveMatrix';

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

// 1. Uncontrolled Basic Usage
export const Default: Story = {
    render: (args) => <ResponsiveMatrix component={Tabs} args={args} />,
    args: {
        tabs: defaultTabs,
        defaultActiveId: 'tab-1',
    },
};

// 2. Interactive Controlled State
export const Controlled: Story = {
    render: function Render(args) {
        const [activeId, setActiveId] = useState<string>('tab-2');

        return (
            <Tabs
                {...args}
                activeId={activeId}
                onTabChange={(id) => {
                    args.onTabChange?.(id);
                    setActiveId(id);
                }}
            />
        );
    },
    args: {
        tabs: defaultTabs,
    },
};

// 3. Dynamic Adding & Deleting Tabs
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
    args: {},
};