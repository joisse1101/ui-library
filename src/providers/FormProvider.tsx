import React from 'react';
import { FormContext } from './FormContext';
import type { FormValues, UseFormReturn } from '../hooks/useForm';

export interface FormProviderProps<TValues extends object> {
    form: UseFormReturn<TValues>;
    children: React.ReactNode;
}

/**
 * `FormProvider` puts a `useForm` result on context so field components underneath it
 * (given a matching `name` prop) can read/write values and show errors without manual wiring.
 */
export function FormProvider<TValues extends object>({ form, children }: FormProviderProps<TValues>) {
    return (
        <FormContext.Provider value={form as unknown as UseFormReturn<FormValues>}>
            {children}
        </FormContext.Provider>
    );
}
