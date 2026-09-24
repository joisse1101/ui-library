import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { FormProvider } from './FormProvider';
import { useFormContext } from './FormContext';
import { useForm, type FormRules } from '../hooks/useForm';

interface Values {
  name: string;
}

const defaultValues: Values = { name: 'Sam' };
const rules: FormRules<Values> = { name: { required: 'Name is required' } };

describe('FormProvider', () => {
  it("exposes the form's values and errors to children via useFormContext", () => {
    const formHook = renderHook(() => useForm<Values>({ defaultValues, rules }));

    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <FormProvider form={formHook.result.current}>{children}</FormProvider>
    );
    const ctx = renderHook(() => useFormContext<Values>(), { wrapper: Wrapper });

    expect(ctx.result.current?.values).toEqual({ name: 'Sam' });
    expect(ctx.result.current?.errors).toEqual({});

    act(() => { formHook.result.current.setValue('name', ''); });
    act(() => { formHook.result.current.validate(); });
    ctx.rerender();

    expect(ctx.result.current?.values).toEqual({ name: '' });
    expect(ctx.result.current?.errors).toEqual({ name: 'Name is required' });
  });

  it('hands children the same form object it was given', () => {
    const formHook = renderHook(() => useForm<Values>({ defaultValues, rules }));
    const form = formHook.result.current;

    const ctx = renderHook(() => useFormContext<Values>(), {
      wrapper: ({ children }) => <FormProvider form={form}>{children}</FormProvider>,
    });

    expect(ctx.result.current).toBe(form);
  });

  it('useFormContext returns null outside a provider', () => {
    const { result } = renderHook(() => useFormContext());

    expect(result.current).toBeNull();
  });
});
