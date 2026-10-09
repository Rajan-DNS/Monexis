import { 
    useGetRetailerRechargeReportMutation, 
    useGetUserTxnLedgerDataMutation, 
    useGetDistributorUserDayBookMutation 
} from './ReportApi';
import { buildReportPayload, buildDayBookPayload } from './ReportPayload';

export const useReportsService = () => {
    const [getRetailerReport, { isLoading: isRetailerLoading }] = useGetRetailerRechargeReportMutation();
    const [getTxnLedger, { isLoading: isLedgerLoading }] = useGetUserTxnLedgerDataMutation();
    const [getDayBook, { isLoading: isDayBookLoading }] = useGetDistributorUserDayBookMutation();

    const fetchRetailerRechargeReport = async (
        pageNumber: number,
        pageSize: number,
        userId: number,
        filters?: any
    ) => {
        try {
            const payload = buildReportPayload(pageNumber, pageSize, userId, filters);
            const response = await getRetailerReport(payload).unwrap();
            return { success: true, data: response.data || response, message: response.message };
        } catch (error: any) {
            return { success: false, message: error?.data?.message || 'Failed to fetch retailer report' };
        }
    };

    const fetchUserTxnLedger = async (
        pageNumber: number,
        pageSize: number,
        userId: number,
        filters?: any
    ) => {
        try {
            const payload = buildReportPayload(pageNumber, pageSize, userId, filters);
            const response = await getTxnLedger(payload).unwrap();
            return { success: true, data: response.data || response, message: response.message };
        } catch (error: any) {
            return { success: false, message: error?.data?.message || 'Failed to fetch transaction ledger' };
        }
    };

    const fetchDistributorDayBook = async (
        pageNumber: number,
        pageSize: number,
        userId: number,
        filters?: any
    ) => {
        try {
            const payload = buildDayBookPayload(pageNumber, pageSize, userId, filters);
            const response = await getDayBook(payload).unwrap();
            return { success: true, data: response.data || response, message: response.message };
        } catch (error: any) {
            return { success: false, message: error?.data?.message || 'Failed to fetch day book' };
        }
    };

    return {
        fetchRetailerRechargeReport,
        fetchUserTxnLedger,
        fetchDistributorDayBook,
        isLoading: isRetailerLoading || isLedgerLoading || isDayBookLoading,
        isRetailerLoading,
        isLedgerLoading,
        isDayBookLoading,
    };
};
