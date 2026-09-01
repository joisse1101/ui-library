import { useCanSideScroll } from '@index';
import React, { useRef, useState, type ReactNode } from 'react';

export interface TabItem {
    id: string;
    label: ReactNode;
    content: ReactNode;
    disabled?: boolean;
}

interface TabsProps {
    tabs: TabItem[];
    defaultActiveId?: string;
    activeId?: string;
    onTabChange?: (tabId: string) => void;
    onTabDelete?: (tabId: string) => void;
    onTabAdd?: () => void;
}

/**
 * The `Tabs` component organizes related content into separate views, allowing users 
 * to switch between sections without leaving the page context.
 * 
 * ### Features
 * - **Flexibility:** Supports both controlled (`value`) and uncontrolled (`defaultValue`) active states.
 * - **Dynamic Management:** Add, remove, or update tabs programmatically via state.
 * - **Accessibility & Constraints:** Handles disabled tabs cleanly and manages focus keyboard interactions.
 * - **Responsive Design:** Includes scrollable tab headers with dynamic fade indicators for overflow content.
 */
export const Tabs: React.FC<TabsProps> = ({
    tabs,
    defaultActiveId,
    activeId: controlledActiveId,
    onTabChange,
    onTabDelete,
    onTabAdd,
}) => {
    const [internalActiveId, setInternalActiveId] = useState<string>(
        defaultActiveId || tabs[0]?.id || ''
    );

    // Support both controlled and uncontrolled usage
    const activeTabId = controlledActiveId !== undefined ? controlledActiveId : internalActiveId;

    const handleTabClick = (tabId: string, disabled?: boolean) => {
        if (disabled) return;

        if (controlledActiveId === undefined) {
            setInternalActiveId(tabId);
        }
        onTabChange?.(tabId);
    };

    const containerRef = useRef<HTMLDivElement | null>(null);
    const { canScrollLeft, canScrollRight } = useCanSideScroll(containerRef);

    return (
        <div className="tabs-container">
            {/* Tab Buttons Header */}
            <div className={`overlay-wrapper`}>

                <div className={`overlay-left ${!canScrollLeft ? 'hidden' : ''}`} />
                <div className={`overlay-right ${!canScrollRight ? 'hidden' : ''}`} />
                <div className="tabs-header overlay-component" ref={containerRef}>
                    {tabs.map((tab) => {
                        const isActive = tab.id === activeTabId;
                        return (
                            <div
                                key={tab.id}
                                className={`tab-btn ${isActive ? 'active' : ''}`}
                                data-tab={tab.id}
                                onClick={() => handleTabClick(tab.id, tab.disabled)}
                                role="button"
                                aria-disabled={tab.disabled}
                            >
                                {tab.label}
                                {!tab.disabled && onTabDelete && (
                                    <button
                                        className="btn btn-danger btn-icon"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onTabDelete(tab.id);
                                        }}
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        );
                    })}
                    {onTabAdd && (
                        <button
                            type="button"
                            className="tab-btn"
                            onClick={onTabAdd}
                        >
                            + Add Tab
                        </button>
                    )}
                </div>
            </div>

            {/* Tab Contents */}
            <div className="tabs-body">
                {tabs.map((tab) => {
                    const isActive = tab.id === activeTabId;
                    return (
                        <div
                            key={tab.id}
                            id={tab.id}
                            className={`tab-content ${isActive ? 'active' : ''}`}
                        >
                            {tab.content}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};