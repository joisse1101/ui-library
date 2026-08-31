import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Modal } from './Modal';

const meta: Meta<typeof Modal> = {
    title: 'Display/Modal',
    component: Modal,
    tags: ['autodocs'],
    argTypes: {
        isOpen: { control: 'boolean', description: 'Controls whether the HTML native dialog is visible' },
        title: { control: 'text', description: 'Header text for the modal' },
        modalType: {
            control: 'select',
            options: ['form', 'destructive', 'confirmation'],
            description: 'Changes styling/variant of the primary call-to-action button',
        },
        buttonText: { control: 'object', description: 'Custom labels for primary and secondary buttons' },
        onClose: { action: 'closed' },
        onSubmit: { action: 'submitted' },
    },
};

export default meta;
type Story = StoryObj<typeof Modal>;

// 1. Standard Form View (Interactive trigger wrapper)
export const FormModal: Story = {
    render: function Render(args) {
        const [isOpen, setIsOpen] = useState(false);

        return (
            <>
                <button type="button" className="btn btn-primary" onClick={() => setIsOpen(true)}>
                    Open Form Modal
                </button>
                <Modal
                    {...args}
                    isOpen={isOpen}
                    onClose={() => {
                        args.onClose?.();
                        setIsOpen(false);
                    }}
                    onSubmit={() => {
                        args.onSubmit?.();
                        setIsOpen(false);
                    }}
                />
            </>
        );
    },
    args: {
        title: 'Edit User Settings',
        modalType: 'form',
        buttonText: { primary: 'Save Changes', secondary: 'Cancel' },
        children: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span>Username</span>
                    <input type="text" defaultValue="joisse1101" style={{ padding: '0.5rem', borderRadius: '4px' }} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span>Email</span>
                    <input type="email" defaultValue="thoiwei@gmail.com" style={{ padding: '0.5rem', borderRadius: '4px' }} />
                </label>
            </div>
        ),
    },
};

// 2. Destructive Action View (Red danger button styling)
export const Destructive: Story = {
    render: function Render(args) {
        const [isOpen, setIsOpen] = useState(false);

        return (
            <>
                <button type="button" className="btn btn-danger" onClick={() => setIsOpen(true)}>
                    Delete Repository
                </button>
                <Modal
                    {...args}
                    isOpen={isOpen}
                    onClose={() => {
                        args.onClose?.();
                        setIsOpen(false);
                    }}
                    onSubmit={() => {
                        args.onSubmit?.();
                        setIsOpen(false);
                    }}
                />
            </>
        );
    },
    args: {
        title: 'Are you absolutely sure?',
        modalType: 'destructive',
        buttonText: { primary: 'Delete Permanently', secondary: 'Keep Project' },
        children: (
            <p>
                This action cannot be undone. This will permanently delete the <strong>ui-library</strong> repository and remove all collaborators.
            </p>
        ),
    },
};

// 3. Simple Confirmation View
export const Confirmation: Story = {
    render: function Render(args) {
        const [isOpen, setIsOpen] = useState(false);

        return (
            <>
                <button type="button" className="btn btn-secondary" onClick={() => setIsOpen(true)}>
                    Publish Component Library
                </button>
                <Modal
                    {...args}
                    isOpen={isOpen}
                    onClose={() => {
                        args.onClose?.();
                        setIsOpen(false);
                    }}
                    onSubmit={() => {
                        args.onSubmit?.();
                        setIsOpen(false);
                    }}
                />
            </>
        );
    },
    args: {
        title: 'Confirm Publication',
        modalType: 'confirmation',
        buttonText: { primary: 'Publish v1.0.0', secondary: 'Back to Editing' },
        children: <p>You are about to release version 1.0.0 to NPM public registry.</p>,
    },
};