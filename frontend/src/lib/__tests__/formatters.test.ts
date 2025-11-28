/**
 * Unit tests for formatter utilities
 */
import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatPercent,
  formatNumber,
  formatDate,
  formatDateTime,
} from '../utils/formatters';

describe('formatCurrency', () => {
  it('should format positive numbers as currency', () => {
    expect(formatCurrency(1000)).toBe('$1,000');
    expect(formatCurrency(1234567)).toBe('$1,234,567');
  });

  it('should format negative numbers as currency', () => {
    expect(formatCurrency(-1000)).toBe('-$1,000');
  });

  it('should format zero', () => {
    expect(formatCurrency(0)).toBe('$0');
  });

  it('should format decimal numbers', () => {
    expect(formatCurrency(1234.56)).toBe('$1,235'); // Rounded to 0 decimals
  });
});

describe('formatPercent', () => {
  it('should format numbers as percentage', () => {
    expect(formatPercent(5.5)).toBe('5.50%');
    expect(formatPercent(10)).toBe('10.00%');
  });

  it('should format decimal percentages', () => {
    expect(formatPercent(4.123)).toBe('4.12%');
  });
});

describe('formatNumber', () => {
  it('should format numbers with default decimals', () => {
    expect(formatNumber(1234)).toBe('1,234');
  });

  it('should format numbers with specified decimals', () => {
    expect(formatNumber(1234.567, 2)).toBe('1,234.57');
    expect(formatNumber(1234.567, 0)).toBe('1,235');
  });
});

describe('formatDate', () => {
  it('should format date string', () => {
    const date = '2024-01-15T10:30:00Z';
    const formatted = formatDate(date);
    expect(formatted).toContain('2024');
    expect(formatted).toContain('Jan');
  });

  it('should format Date object', () => {
    const date = new Date('2024-01-15T10:30:00Z');
    const formatted = formatDate(date);
    expect(formatted).toContain('2024');
  });
});

describe('formatDateTime', () => {
  it('should format date and time', () => {
    const date = '2024-01-15T10:30:00Z';
    const formatted = formatDateTime(date);
    expect(formatted).toContain('2024');
    expect(formatted).toContain('Jan');
  });
});

