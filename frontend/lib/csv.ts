import Papa from 'papaparse';
import type { RawRow } from './types';

export interface ParsedCsv {
  headers: string[];
  rows: RawRow[];
  fileName: string;
}

/**
 * Parses a CSV file entirely client-side (Step 2 of the brief: no AI, no
 * network call — just show the user what we're about to send).
 */
export function parseCsvFile(file: File): Promise<ParsedCsv> {
  return new Promise((resolve, reject) => {
    Papa.parse<RawRow>(file, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (h) => h.trim(),
      complete: (results) => {
        const headers = results.meta.fields ?? [];
        if (headers.length === 0) {
          reject(new Error('Could not find a header row in this file.'));
          return;
        }
        resolve({ headers, rows: results.data, fileName: file.name });
      },
      error: (err) => reject(err),
    });
  });
}

/** Turns imported CRM records back into a downloadable CSV string. */
export function toCsv<T extends object>(records: T[]): string {
  return Papa.unparse(records);
}

export function downloadCsv(fileName: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
