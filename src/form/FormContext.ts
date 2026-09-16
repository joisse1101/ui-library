import { createContext, useContext } from 'react';
import type { FormValues, UseFormReturn } from './useForm';

export const FormContext = createContext<UseFormReturn<FormValues> | null>(null);

export function useFormContext<TValues extends object = FormValues>(): UseFormReturn<TValues> | null {
    return useContext(FormContext) as UseFormReturn<TValues> | null;
}
