import { useState, useEffect } from "react";

/**
 * Custom hook that debounces a value
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds (default: 300ms)
 * @returns The debounced value
 * 
 * @example
 * ```tsx
 * const [searchInput, setSearchInput] = useState("");
 * const debouncedSearch = useDebounce(searchInput, 300);
 * 
 * // Use debouncedSearch for API calls
 * const { data } = useQuery({
 *   queryKey: ["items", debouncedSearch],
 *   queryFn: () => fetchItems(debouncedSearch),
 * });
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up a timer to update the debounced value after the delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timer if the value changes before the delay completes
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
