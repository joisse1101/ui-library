import React, { useRef, useId } from 'react';
import { useCanSideScroll } from '@hooks/useCanSideScroll';
import { useField } from '@form/useField';
import type { Option } from '../../types/selectors';

interface RadioSelectorProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
    label: string;
    options: Option[];
    name?: string;
    selectedOptions?: string | number | undefined;
    onSelect?: (value: string | number) => void;
}

/**
 * `RadioSelector` is a responsive radio button group component that allows users to select a single option from a list.
 *
 * ### Features
 * - **Single Selection:** Designed for scenarios where only one option can be selected at a time.
 * - **Responsive Handling:** Automatically turns into a horizontally scrollable container on small viewports to prevent overflow.
 * - **Form Binding:** Pass `name` (and render under a `FormProvider`) to bind selection to form state automatically instead of wiring `selectedOptions`/`onSelect` by hand.
 */
export const RadioSelector: React.FC<RadioSelectorProps> = ({ label, options, name, selectedOptions, onSelect, ...props }) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const { canScrollLeft, canScrollRight } = useCanSideScroll(containerRef);
    const groupName = useId();

    const normalisedSelection = Array.isArray(selectedOptions) ? selectedOptions[0] : selectedOptions;
    const field = useField<string | number>({ name, value: normalisedSelection });

    const handleSelect = (value: string | number) => {
        field.setValue(value);
        onSelect?.(value);
    };

    return (
        <div className="form-group" {...props}>
            <div className="label" id={`${groupName}-label`}>{label}</div>

            <div className="overlay-wrapper">
                <div className={`overlay-left ${!canScrollLeft ? 'hidden' : ''}`} />
                <div className={`overlay-right ${!canScrollRight ? 'hidden' : ''}`} />

                <div
                    className="overlay-component"
                    ref={containerRef}
                    aria-labelledby={`${groupName}-label`}
                >
                    {options.map((option) => {
                        const isChecked = field.value === option.value;
                        const optionId = `${groupName}-${option.value}`;

                        return (
                            <label
                                key={option.value}
                                htmlFor={optionId}
                                className={`radio-option ${isChecked ? 'selected' : ''}`}
                            >
                                <input
                                    type="radio"
                                    id={optionId}
                                    name={name ?? groupName}
                                    value={option.value}
                                    checked={isChecked}
                                    onChange={() => handleSelect(option.value)}
                                />
                                <span className="radio-label-text">{option.label}</span>
                            </label>
                        );
                    })}
                </div>
            </div>
            {field.error && <span className="error-message">{field.error}</span>}
        </div>
    );
};