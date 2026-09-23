import React from 'react';
import { useField } from '@hooks/useField';

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    id: string;
}

/**
 * `TextInput` renders a labelled text-style input (`text`, `email`, `password`, etc. via the `type` prop) using the shared form styling.
 *
 * Pass `name` (and render under a `FormProvider`) to bind it to form state automatically instead of wiring `value`/`onChange` by hand.
 */
export const TextInput: React.FC<TextInputProps> = ({ label, id, name, value, onChange, type = 'text', ...props }) => {
    const field = useField<string>({ name, value: value as string | undefined });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        field.setValue(e.target.value);
        onChange?.(e);
    };

    return (
        <div className="form-group">
            <label htmlFor={id}>{label}</label>
            <input
                type={type}
                id={id}
                name={name}
                value={field.value ?? ''}
                onChange={handleChange}
                {...props}
            />
            {field.error && <span className="error-message">{field.error}</span>}
        </div>
    );
};
