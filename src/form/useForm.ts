import { useCallback, useState } from 'react';
import type { FieldRules } from './types';

export type FormValues = Record<string, unknown>;

export type FormRules<TValues extends object> = Partial<{
    [K in keyof TValues]: FieldRules<TValues[K]>;
}>;

export interface UseFormOptions<TValues extends object> {
    defaultValues: TValues;
    rules?: FormRules<TValues>;
}

export interface UseFormReturn<TValues extends object> {
    values: TValues;
    errors: Partial<Record<keyof TValues, string>>;
    setValue: <K extends keyof TValues>(name: K, value: TValues[K]) => void;
    getValue: <K extends keyof TValues>(name: K) => TValues[K];
    reset: (values?: TValues) => void;
    validate: () => boolean;
    handleSubmit: (onValid: (values: TValues) => void) => () => void;
}

function isEmpty(value: unknown): boolean {
    if (value === undefined || value === null) return true;
    if (typeof value === 'string') return value.trim().length === 0;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'number') return Number.isNaN(value);
    return false;
}

/**
 * `useForm` manages a form's values and validation errors, driven by a declarative
 * per-field `rules` config, and hands the result to `FormProvider` so field components
 * (e.g. `TextInput`, `DateInput`, `ButtonSelector`) can bind to it by `name`.
 */
export function useForm<TValues extends object>({
    defaultValues,
    rules = {},
}: UseFormOptions<TValues>): UseFormReturn<TValues> {
    const [values, setValues] = useState<TValues>(defaultValues);
    const [errors, setErrors] = useState<Partial<Record<keyof TValues, string>>>({});

    const setValue = useCallback(<K extends keyof TValues>(name: K, value: TValues[K]) => {
        setValues((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => {
            if (!prev[name]) return prev;
            const next = { ...prev };
            delete next[name];
            return next;
        });
    }, []);

    const getValue = useCallback(<K extends keyof TValues>(name: K) => values[name], [values]);

    const reset = useCallback((next: TValues = defaultValues) => {
        setValues(next);
        setErrors({});
    }, [defaultValues]);

    const validateField = useCallback(<K extends keyof TValues>(name: K, value: TValues[K]): string | undefined => {
        const fieldRules = rules[name];
        if (!fieldRules) return undefined;

        if (fieldRules.required && isEmpty(value)) return fieldRules.required;
        if (isEmpty(value)) return undefined;

        if (fieldRules.pattern && typeof value === 'string' && !fieldRules.pattern.value.test(value)) {
            return fieldRules.pattern.message;
        }
        if (fieldRules.min && typeof value === 'number' && value < fieldRules.min.value) {
            return fieldRules.min.message;
        }
        if (fieldRules.max && typeof value === 'number' && value > fieldRules.max.value) {
            return fieldRules.max.message;
        }
        if (fieldRules.validate) {
            return fieldRules.validate(value, values as Record<string, unknown>);
        }
        return undefined;
    }, [rules, values]);

    const validate = useCallback((): boolean => {
        const nextErrors: Partial<Record<keyof TValues, string>> = {};
        (Object.keys(rules) as Array<keyof TValues>).forEach((name) => {
            const error = validateField(name, values[name]);
            if (error) nextErrors[name] = error;
        });
        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    }, [rules, values, validateField]);

    const handleSubmit = useCallback((onValid: (values: TValues) => void) => () => {
        if (validate()) onValid(values);
    }, [validate, values]);

    return { values, errors, setValue, getValue, reset, validate, handleSubmit };
}
