import { useFormContext } from './FormContext';

export interface UseFieldOptions<T> {
    /** When set and a `FormProvider` ancestor exists, the field binds to that key in form state. */
    name?: string;
    /** Value to fall back to when there's no `name`/form context — i.e. standalone controlled/uncontrolled use. */
    value?: T;
}

export interface UseFieldResult<T> {
    value: T | undefined;
    error?: string;
    setValue: (value: T) => void;
}

/**
 * `useField` is the binding layer behind field components (`TextInput`, `DateInput`,
 * `ButtonSelector`, etc.): when rendered under a `FormProvider` with a matching `name`,
 * it reads/writes that field's value and error from form context. Otherwise it's a no-op
 * passthrough so the component keeps working standalone with its own value/onChange props.
 */
export function useField<T>({ name, value }: UseFieldOptions<T>): UseFieldResult<T> {
    const form = useFormContext();

    if (name && form) {
        return {
            value: form.values[name] as T,
            error: form.errors[name],
            setValue: (next: T) => form.setValue(name, next),
        };
    }

    return {
        value,
        error: undefined,
        setValue: () => {},
    };
}
