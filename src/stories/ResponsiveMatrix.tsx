import { type ComponentType } from 'react';

interface ScreenSize {
    label: string;
    width: string;
}

const defaultSizes: ScreenSize[] = [
    { label: 'Compact View', width: '360px' },
    { label: 'Full View', width: '100%' },
];

interface ResponsiveMatrixProps<P> {
    component: ComponentType<P>;
    args?: P;
    sizes?: ScreenSize[];
}

export function ResponsiveMatrix<P extends object>({
    component: Component,
    args = {} as P,
    sizes = defaultSizes,
}: ResponsiveMatrixProps<P>) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {sizes.map(({ label, width }) => (
                <div key={label}>
                    <span style={{ fontSize: '0.8rem', color: '#a1a1aa', display: 'block', marginBottom: '0.5rem' }}>
                        {label}
                    </span>
                    <div style={{ width, border: '1px dashed #b8738a', padding: '1rem', borderRadius: '8px', boxSizing: 'border-box' }}>
                        <Component {...args} />
                    </div>
                </div>
            ))}
        </div>
    );
}