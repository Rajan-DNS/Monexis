// Report Payload Builders - Types are defined in Type/type.ts
import type { ReportPayload, DayBookPayload } from '../Type/type';

export type { ReportPayload, DayBookPayload };

export const buildReportPayload = (
    pageNumber: number,
    pageSize: number,
    userId: number,
    filters: Record<string, any> = {}
): ReportPayload => ({
    pageNumber,
    pageSize,
    filter: {
        userId: userId,
        fromDate: filters.fromDate || '',
        toDate: filters.toDate || '',
        statusId: filters.statusId || 0,
        searchQuery: filters.searchQuery || '',
        ...filters,
    },
});

export const buildDayBookPayload = (
    pageNumber: number,
    pageSize: number,
    userId: number,
    filters: Record<string, any> = {}
): DayBookPayload => {
    const defaultDate = new Date().toISOString().split('T')[0];
    return {
        pageNumber,
        pageSize,
        filter: {
            userId: userId,
            fromDate: filters.fromDate || defaultDate,
            toDate: filters.toDate || defaultDate,
            searchQuery: filters.searchQuery || '',
            ...filters,
        },
    };
};
