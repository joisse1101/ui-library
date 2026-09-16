import { useCanSideScroll } from "@hooks/useCanSideScroll";
import { useField } from "@form/useField";
import { useRef } from "react";
import type { Option } from "../../types/selectors";
interface ButtonSelectorProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
    label: string;
    options: Option[];
    name?: string;
    selectedOptions?: (string | number)[] | null;
    onSelect?: (value: string | number) => void;
}

/**
 * `ButtonSelector` is a flexible, responsive button-group component designed for choice selection.
 *
 * ### Features & Selection Modes
 * - **Multi-Select (Default):** Pair with the `useArraySelection` hook to allow users to select multiple options.
 * - **Single Select:** Intercept `onSelect` and set `selectedOptions` as a single-element array `[value]` to enforce single selection.
 * - **Responsive Handling:** Automatically turns into a horizontally scrollable container on small viewports to prevent overflow.
 * - **Form Binding:** Pass `name` (and render under a `FormProvider`) to have the multi-select toggle managed for you in form state, instead of pairing `selectedOptions`/`onSelect` with `useArraySelection` yourself.
 */
export const ButtonSelector: React.FC<ButtonSelectorProps> = ({ label, options, name, selectedOptions, onSelect, ...props }) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const { canScrollLeft, canScrollRight } = useCanSideScroll(containerRef);
    const field = useField<(string | number)[]>({ name, value: selectedOptions ?? undefined });
    const selected = field.value ?? [];

    const handleSelect = (value: string | number) => {
        const next = selected.includes(value)
            ? selected.filter((v) => v !== value)
            : [...selected, value];
        field.setValue(next);
        onSelect?.(value);
    };

    return (<div className="form-group" {...props}>
        <div id={label} className="label">{label}</div>
        <div className="overlay-wrapper">
            <div className={`overlay-left ${!canScrollLeft ? 'hidden' : ''}`} />
            <div className={`overlay-right ${!canScrollRight ? 'hidden' : ''}`} />
            <div className="overlay-component" aria-labelledby={label} ref={containerRef}>
                {options.map((option) => (

                    <button
                        key={option.value}
                        onClick={() => handleSelect(option.value)}

                        className={`btn btn-option${selected.includes(option.value) ? ' selected' : ''}`}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
        </div>
        {field.error && <span className="error-message">{field.error}</span>}
    </div>)
}
