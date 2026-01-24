/**
 * Excel/CSV Export Utilities
 * Lightweight export functionality without external dependencies
 */

export interface ExportColumn<T> {
    header: string;
    accessor: keyof T | ((item: T) => string | number);
}

/**
 * Convert data to CSV string
 */
export function toCSV<T>(
    data: T[],
    columns: ExportColumn<T>[]
): string {
    const headers = columns.map(col => `"${col.header}"`).join(',');

    const rows = data.map(item => {
        return columns.map(col => {
            const value = typeof col.accessor === 'function'
                ? col.accessor(item)
                : item[col.accessor];

            // Escape quotes and wrap in quotes
            const stringValue = String(value ?? '').replace(/"/g, '""');
            return `"${stringValue}"`;
        }).join(',');
    });

    return [headers, ...rows].join('\n');
}

/**
 * Download data as CSV file
 */
export function downloadCSV(
    csvContent: string,
    filename: string
): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    // @ts-ignore
    if (window.navigator && window.navigator.msSaveBlob) {
        // IE 10+
        // @ts-ignore
        window.navigator.msSaveBlob(blob, filename);
    } else {
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

/**
 * Export CBC class report to CSV
 */
export function exportCBCClassReportToCSV(
    reportData: {
        competencyStats: Array<{
            name: string;
            totalAssessments: number;
            levelDistribution: { EE: number; ME: number; AE: number; BE: number };
            percentageMeetingStandards: number;
        }>;
        grade: string;
        term: string;
        totalStudents: number;
    }
): void {
    const columns: ExportColumn<typeof reportData.competencyStats[0]>[] = [
        { header: 'Competency', accessor: 'name' },
        { header: 'Total Assessments', accessor: 'totalAssessments' },
        { header: 'Exceeds Expectations (EE)', accessor: item => item.levelDistribution.EE },
        { header: 'Meets Expectations (ME)', accessor: item => item.levelDistribution.ME },
        { header: 'Approaching Expectations (AE)', accessor: item => item.levelDistribution.AE },
        { header: 'Below Expectations (BE)', accessor: item => item.levelDistribution.BE },
        { header: '% Meeting Standards', accessor: item => `${item.percentageMeetingStandards}%` },
    ];

    const csv = toCSV(reportData.competencyStats, columns);
    const filename = `CBC_Class_Report_${reportData.grade}_${reportData.term}_${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csv, filename);
}

/**
 * Export school-wide analytics to CSV
 */
export function exportSchoolAnalyticsToCSV(
    reportData: {
        competencyDistribution: Array<{
            name: string;
            totalAssessments: number;
            levelDistribution: { EE: number; ME: number; AE: number; BE: number };
            percentMeetingStandards: number;
        }>;
        term: string;
        totalStudents: number;
        totalAssessments: number;
    }
): void {
    const columns: ExportColumn<typeof reportData.competencyDistribution[0]>[] = [
        { header: 'Competency', accessor: 'name' },
        { header: 'Total Assessments', accessor: 'totalAssessments' },
        { header: 'Exceeds (EE)', accessor: item => item.levelDistribution.EE },
        { header: 'Meets (ME)', accessor: item => item.levelDistribution.ME },
        { header: 'Approaching (AE)', accessor: item => item.levelDistribution.AE },
        { header: 'Below (BE)', accessor: item => item.levelDistribution.BE },
        { header: '% Meeting Standards', accessor: item => `${item.percentMeetingStandards}%` },
    ];

    const csv = toCSV(reportData.competencyDistribution, columns);
    const filename = `School_CBC_Analytics_${reportData.term}_${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csv, filename);
}
