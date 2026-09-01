import React, { useRef, useId } from 'react';
import { useCanSideScroll } from '@hooks/useCanSideScroll';
import type { Option } from '../types/selectors';

interface RadioSelectorProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
    label: string;
    options: Option[];
    selectedOptions: string | number | undefined;
    onSelect: (value: string | number) => void;
}

/**
 * `RadioSelector` is a responsive radio button group component that allows users to select a single option from a list.
 *
 * ### Features
 * - **Single Selection:** Designed for scenarios where only one option can be selected at a time.
 * - **Responsive Handling:** Automatically turns into a horizontally scrollable container on small viewports to prevent overflow.
 */
export const RadioSelector: React.FC<RadioSelectorProps> = ({ label, options, selectedOptions, onSelect, ...props }) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const { canScrollLeft, canScrollRight } = useCanSideScroll(containerRef);
    const groupName = useId();

    const selectedValue = Array.isArray(selectedOptions) ? selectedOptions[0] : selectedOptions;

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
                        const isChecked = selectedValue === option.value;
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
                                    name={groupName}
                                    value={option.value}
                                    checked={isChecked}
                                    onChange={() => onSelect(option.value)}
                                />
                                <span className="radio-label-text">{option.label}</span>
                            </label>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};