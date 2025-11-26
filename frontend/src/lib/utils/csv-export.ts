/**
 * CSV export utilities.
 */

export interface CSVExportOptions {
  filename?: string;
  headers?: string[];
}

/**
 * Convert an array of objects to CSV format and trigger download.
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  options: CSVExportOptions = {}
): void {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const { filename = 'export.csv', headers } = options;

  // Get headers from first object if not provided
  const csvHeaders = headers || Object.keys(data[0]);

  // Create CSV content
  const csvRows: string[] = [];

  // Add header row
  csvRows.push(csvHeaders.map((h) => escapeCSVValue(h)).join(','));

  // Add data rows
  for (const row of data) {
    const values = csvHeaders.map((header) => {
      const value = row[header];
      if (value === null || value === undefined) {
        return '';
      }
      return escapeCSVValue(String(value));
    });
    csvRows.push(values.join(','));
  }

  // Create blob and download
  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Escape CSV value (handle commas, quotes, newlines).
 */
function escapeCSVValue(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

