/**
 * Utility functions for exporting and importing table data
 */
import Papa from "papaparse";

/**
 * Export data to CSV file
 * @param data - Array of objects to export
 * @param filename - Name of the file to download
 * @param columns - Optional array of column keys to include (if not provided, uses all keys from first object)
 * @param columnTitles - Optional array of column titles for CSV headers (if not provided, uses column keys)
 */
export const exportToCSV = (
  data: any[],
  filename: string = "export.csv",
  columns?: string[],
  columnTitles?: string[]
): void => {
  if (!data || data.length === 0) {
    console.warn("No data to export");
    return;
  }

  // Get all keys from first object if columns not provided
  const keys = columns || Object.keys(data[0]);
  const titles = columnTitles || keys;

  // Prepare data for CSV export with proper column mapping
  const csvData = data.map((row) => {
    const csvRow: any = {};
    keys.forEach((key, index) => {
      // Use column title as key in CSV, but map to original data key
      csvRow[titles[index]] = row[key] ?? "";
    });
    return csvRow;
  });

  // Convert to CSV using papaparse
  const csv = Papa.unparse(csvData, {
    header: true,
    columns: titles,
  });

  // Create blob and download
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Parse CSV file and return data
 * @param file - File object to parse
 * @returns Promise that resolves to parsed data array
 */
export const importFromCSV = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data as any[]);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

