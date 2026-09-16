export interface FieldRules<T = unknown> {
    /** Error message shown when the field is empty (empty string, null/undefined, NaN, or an empty array). */
    required?: string;
    pattern?: { value: RegExp; message: string };
    min?: { value: number; message: string };
    max?: { value: number; message: string };
    /** Escape hatch for cross-field checks — receives the whole form's current values. */
    validate?: (value: T, values: Record<string, unknown>) => string | undefined;
}
