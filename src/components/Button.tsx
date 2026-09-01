import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'success' | 'danger' | 'danger-outline' | 'disabled' | 'invisible';
    icon?: boolean;
    size?: 'sm' | 'md' | 'lg';
    children?: React.ReactNode;
}

/**
 * The `Button` component represents a clickable button element with various visual styles (variants),
 * sizes, and optional icon support. It extends the native HTML button attributes, allowing for full
 * customization and integration with standard HTML button behavior.
 */
export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',    
    icon = false,
    size = 'md',
    className = '',
    children,
    ...props
}) => {
    const classes = [
        'btn',
        `btn-${variant}`,
        `btn-${size}`,
        icon ? 'btn-icon' : '',
        className,
    ].filter(Boolean).join(' ');

    return (
        <button className={classes} {...props}>
            {children}
        </button>
    );
};