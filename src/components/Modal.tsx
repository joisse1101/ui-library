import React, { useRef, useEffect } from 'react';

export type ButtonText = {
    primary: string;
    secondary: string;
}

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
    onCancel?: () => void;
    title?: string;
    children?: React.ReactNode;
    modalType?: 'form' | 'destructive' | 'confirmation';
    buttonText?: ButtonText;
}

/**
 * `Modal` component represents a dialog box that can be used for forms, destructive actions, or confirmations. It provides a header, body, and footer with customizable buttons.
 */
export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title = '',
    children,
    onSubmit,
    onCancel,
    modalType = 'form',
    buttonText = { primary: 'Save Changes', secondary: 'Cancel' }
}) => {
    const dialogRef = useRef<HTMLDialogElement | null>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (isOpen) {
            if (!dialog.open) dialog.showModal();
        } else {
            if (dialog.open) dialog.close();
        }
    }, [isOpen]);

    // Prevent closing on ESC key press to keep modal strictly modal
    const handleCancel = (e: React.SyntheticEvent<HTMLDialogElement, Event>) => {
        e.preventDefault();
    };

    const primaryButtonClass = modalType === 'destructive' ? 'btn btn-danger' : 'btn btn-primary';

    return (
        <dialog
            ref={dialogRef}
            onCancel={handleCancel}
            className="modal"
        >
            <div className="modal-container">
                {/* Header */}
                <header className="modal-header">
                    <h2 className="modal-title">{title}</h2>
                    <button
                        type="button"
                        className="modal-close-btn"
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        ✕
                    </button>
                </header>

                {/* Body */}
                <div className="modal-body">
                    {children || (
                        <p>Set up your targets and parameters for this goal.</p>
                    )}
                </div>

                {/* Footer */}
                <footer className="modal-footer">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                            onCancel?.();
                            onClose();
                        }}
                    >
                        {buttonText.secondary}
                    </button>
                    <button
                        type="button"
                        className={primaryButtonClass}
                        onClick={() => {
                            onSubmit();
                        }}
                    >
                        {buttonText.primary}
                    </button>
                </footer>
            </div>
        </dialog>
    );
};