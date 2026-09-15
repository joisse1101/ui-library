import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'control-panel' | 'output-logs' | 'rose';
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    children?: React.ReactNode;
}

/**
 * The `Card` component renders a styled container surface with several visual variants:
 * a plain `default` card, a padded `control-panel`, a monospaced `output-logs` panel,
 * and an accented `rose` highlight card.
 *
 * Each variant ships with a sensible default padding (`control-panel`/`rose` use `md`,
 * `output-logs` uses `sm`, `default` has none) which can be overridden via the `padding` prop.
 */
export const Card: React.FC<CardProps> = ({
    variant = 'default',
    padding,
    className = '',
    children,
    ...props
}) => {
    const classes = [
        variant === 'default' ? 'card' : `card-${variant}`,
        padding ? `card-padding-${padding}` : '',
        className,
    ].filter(Boolean).join(' ');

    return (
        <div className={classes} {...props}>
            {children}
        </div>
    );
};
