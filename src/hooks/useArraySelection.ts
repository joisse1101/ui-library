import { useState, useCallback } from 'react';

export function useArraySelection<T>(initialState: T[] = []) {
    const [selectedOptions, setSelectedOptions] = useState<T[]>(initialState);

    const toggleOption = useCallback((value: T) => {
        setSelectedOptions((prev = []) =>
            prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
        );
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedOptions([]);
    }, []);

    return {
        selectedOptions,
        setSelectedOptions,
        toggleOption,
        clearSelection,
    };
}