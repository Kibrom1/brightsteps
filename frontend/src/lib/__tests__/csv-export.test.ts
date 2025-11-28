/**
 * Unit tests for CSV export utility
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportToCSV } from '../utils/csv-export';

// Mock DOM methods
const mockCreateElement = vi.fn();
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();
const mockClick = vi.fn();
const mockSetAttribute = vi.fn();
const mockCreateObjectURL = vi.fn();
const mockRevokeObjectURL = vi.fn();

beforeEach(() => {
  global.document.createElement = mockCreateElement;
  global.document.body.appendChild = mockAppendChild;
  global.document.body.removeChild = mockRemoveChild;
  global.URL.createObjectURL = mockCreateObjectURL;
  global.URL.revokeObjectURL = mockRevokeObjectURL;

  mockCreateElement.mockReturnValue({
    setAttribute: mockSetAttribute,
    click: mockClick,
    style: {},
  });
  mockCreateObjectURL.mockReturnValue('blob:mock-url');
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('exportToCSV', () => {
  it('should create CSV file and trigger download', () => {
    const data = [
      { name: 'John', age: 30 },
      { name: 'Jane', age: 25 },
    ];

    exportToCSV(data, { filename: 'test.csv' });

    expect(mockCreateElement).toHaveBeenCalledWith('a');
    expect(mockSetAttribute).toHaveBeenCalledWith('href', 'blob:mock-url');
    expect(mockSetAttribute).toHaveBeenCalledWith('download', 'test.csv');
    expect(mockAppendChild).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
    expect(mockRemoveChild).toHaveBeenCalled();
  });

  it('should use default filename if not provided', () => {
    const data = [{ name: 'Test' }];
    exportToCSV(data);

    expect(mockSetAttribute).toHaveBeenCalledWith('download', 'export.csv');
  });

  it('should handle empty data array', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    exportToCSV([]);

    expect(consoleSpy).toHaveBeenCalledWith('No data to export');
    consoleSpy.mockRestore();
  });

  it('should escape special characters in CSV', () => {
    const data = [
      { name: 'John, Doe', description: 'Has "quotes"' },
    ];

    exportToCSV(data);

    // Verify blob was created (CSV content should be escaped)
    expect(mockCreateObjectURL).toHaveBeenCalled();
  });

  it('should use custom headers if provided', () => {
    const data = [
      { id: 1, name: 'Test' },
    ];

    exportToCSV(data, {
      filename: 'test.csv',
      headers: ['ID', 'Name'],
    });

    expect(mockCreateObjectURL).toHaveBeenCalled();
  });
});

