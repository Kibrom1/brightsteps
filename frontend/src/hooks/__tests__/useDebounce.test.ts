/**
 * Tests for useDebounce hook
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDebounce } from '../../lib/hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('test', 300));
    expect(result.current).toBe('test');
  });

  it('should debounce value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 300 },
      }
    );

    expect(result.current).toBe('initial');

    // Change value
    rerender({ value: 'updated', delay: 300 });

    // Value should not change immediately
    expect(result.current).toBe('initial');

    // Fast-forward time
    vi.advanceTimersByTime(300);

    // Now value should be updated
    await waitFor(() => {
      expect(result.current).toBe('updated');
    });
  });

  it('should cancel previous timeout on rapid changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'first', delay: 300 },
      }
    );

    // Rapidly change values
    rerender({ value: 'second', delay: 300 });
    vi.advanceTimersByTime(100);
    rerender({ value: 'third', delay: 300 });
    vi.advanceTimersByTime(100);
    rerender({ value: 'fourth', delay: 300 });

    // Should still be first value
    expect(result.current).toBe('first');

    // Complete the delay
    vi.advanceTimersByTime(200);

    // Should be the last value
    await waitFor(() => {
      expect(result.current).toBe('fourth');
    });
  });
});

