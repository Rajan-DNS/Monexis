import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  LayoutAnimation,
  ScrollView,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Colors from '../../../theme/colors';
import AppHeader from '../../../components/Header/AppHeader';
import { useReportsService } from '../../../redux/services/mainApi/Report/ReportsService';
import { useAppSelector } from '../../../redux/hooks';
import { ListSkeleton } from '../../../components/Skeleton';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useGetdownlineuserListQuery, useGetDropDownQuery, useGetStatusTypeQuery } from '../../../redux/services/mainApi/Common/CommonApi';
import SharedPDFDownloadButton from '../../../components/PDF/SharedPDFDownload';
import { formatDate, today } from '../../../components/DATE/Dateformat';
import { string } from 'yup';
import { DropdownSelector } from '../../../components/Filters/DropdownSelector';
import { Poppins } from '../../../theme/typography';



const INITIAL_FILTER = {
  fromDate: today,
  toDate: today,
  statusId: 0,
  retailerId: 0,
};



const RechargeReportScreen = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [reports, setReports] = useState<any[]>([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(25);
  const [hasMore, setHasMore] = useState(true);

  const loginData = useAppSelector((state) => state.auth.user);
  const { fetchRetailerRechargeReport, isRetailerLoading } = useReportsService();
  console.log('loginData:', loginData?.role, loginData?.id);

  const [showFilter, setShowFilter] = useState(false);
  const [filterFields, setFilterFields] = useState(INITIAL_FILTER);
  const [appliedFilter, setAppliedFilter] = useState<any>({});
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [dropdownSearch, setDropdownSearch] = useState('');

  const { data: retailerData } = useGetdownlineuserListQuery();
  const { data: statusTypeData } = useGetStatusTypeQuery();
  console.log('Retailer Data:', retailerData);

  const retailerOptions = useMemo(() => {
    const list = retailerData?.data || [];
    return list.map((item: any) => ({
      value: item.value || item.id,
      text: item.text || item.fullName || item.name,
    }));
  }, [retailerData]);

  const filteredRetailerOptions = useMemo(() => {
    if (!dropdownSearch.trim()) return retailerOptions;
    return retailerOptions.filter((opt: any) =>
      opt.text.toLowerCase().includes(dropdownSearch.toLowerCase())
    );
  }, [retailerOptions, dropdownSearch]);

  const rechargeStatusOptions = useMemo(() => {
    const list = statusTypeData?.data || [];
    return list
      .filter((item: any) => item?.remark?.includes('Recharge'))
      .map((item: any) => ({
        value: item.id,
        text: item.typeName,
      }));
  }, [statusTypeData]);

  const handleDropdownSelect = (field: string, value: any) => {
    updateFilterField(field, value);
    setActiveDropdown(null);
    setDropdownSearch('');
  };

  const fetchReports = useCallback(async (index: number, isNewSearch = false) => {
    const filters = {
      fromDate: appliedFilter.fromDate || today,
      toDate: appliedFilter.toDate || today,
      statusId: appliedFilter.statusId || 0,
      searchQuery: searchQuery,
    };
    const targetUserId = appliedFilter.retailerId || loginData?.id || 0;
    const response = await fetchRetailerRechargeReport(index, pageSize, targetUserId, filters);
    if (response.success) {
      const newData = response.data || [];
      if (isNewSearch) {
        setReports(newData);
      } else {
        setReports((prev) => [...prev, ...newData]);
      }
      setHasMore(newData.length === pageSize);
    }
  }, [loginData?.id, appliedFilter, searchQuery]);

  useEffect(() => {
    setPageIndex(1);
    fetchReports(1, true);
  }, [appliedFilter]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPageIndex(1);
      fetchReports(1, true);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleLoadMore = () => {
    if (!isRetailerLoading && hasMore && reports.length >= pageSize) {
      const nextIndex = pageIndex + 1;
      setPageIndex(nextIndex);
      fetchReports(nextIndex);
    }
  };

  const toggleFilter = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowFilter(prev => !prev);
    if (!showFilter) {
      setFilterFields({ ...INITIAL_FILTER, ...appliedFilter });
    }
  };

  const updateFilterField = (field: string, value: any) => {
    setFilterFields(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyFilter = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAppliedFilter(filterFields);
    setShowFilter(false);
  };

  const handleClearFilter = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFilterFields(INITIAL_FILTER);
    setAppliedFilter({});
    setSearchQuery('');
    fetchReports(1, true);
    setShowFilter(false);
  };

  const onDateChange = (event: any, selectedDate?: Date, type: 'from' | 'to' = 'from') => {
    setShowFromPicker(false);
    setShowToPicker(false);
    if (selectedDate) {
      const formatted = formatDate(selectedDate);
      updateFilterField(type === 'from' ? 'fromDate' : 'toDate', formatted);
    }
  };

  const generateHTML = (item: any) => {
    const isSuccess = item.statusName?.toUpperCase() !== 'FAILED';
    const statusMessage = item.statusName?.toUpperCase() === 'SUCCESS' ? 'Your payment has been processed securely' : (item.statusName?.toUpperCase() === 'FAILED' ? 'Transaction Failed.' : 'Transaction Pending');
    const amount = item.rechargeAmount || item.amount || '0';
    const mobileNumber = item.customerNumber || item.mobileNumber || 'N/A';
    const operator = item.operatorFullName || item.operatorName || 'N/A';
    const circle = item.circleName ? `(${item.circleName})` : '';
    const transactionId = item.transactionId || item.txnId || 'N/A';
    const OperatorId = item.originalOperatorTransactionId || 'N/A';
    const formattedDate = item.rechargeTime || item.createdDate || 'N/A';
    const paymentType = (item.isPostpaid || item.operatorName?.toLowerCase().includes('postpaid')) ? 'Postpaid Bill' : 'Prepaid Recharge';
    const rechargeId = item.rechargeId || 'N/A';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Transaction Receipt - Monexis</title>
  <style>
    * { 
      box-sizing: border-box; 
      margin: 0;
      padding: 0;
    }
    html, body {
      background-color: #F8FAFC;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      min-height: 100vh;
    }
    body {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 24px 16px;
    }
    .receipt-container {
      width: 100%;
      max-width: 620px;
      background: #FFFFFF;
      border-radius: 20px;
      box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 4px 12px -2px rgba(0, 0, 0, 0.02);
      border: 1px solid #E2E8F0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      margin: auto;
    }
    .content-body {
      flex: 1 0 auto;
      padding: 32px 32px 16px 32px;
    }
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .brand-logo-area {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo-icon {
      width: 44px;
      height: 44px;
      
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      flex-shrink: 0;
    }
    .logo-icon img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .brand-text h1 {
      font-size: 20px;
      color: #003399;
      font-weight: 800;
      letter-spacing: 0.5px;
      line-height: 1.1;
    }
    .brand-text p {
      font-size: 11px;
      color: #64748B;
      font-weight: 500;
    }
    .pdf-button {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border: 1px solid #CBD5E1;
      border-radius: 8px;
      width: 44px;
      height: 48px;
      background: #FFFFFF;
      cursor: pointer;
    }
    .status-section {
      text-align: center;
      padding: 8px 0 24px 0;
    }
    .success-circle {
      width: 60px;
      height: 60px;
      background-color: ${isSuccess ? '#10B981' : '#EF4444'};
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: white;
      margin-bottom: 14px;
      box-shadow: 0 4px 14px ${isSuccess ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'};
    }
    .status-title {
      font-size: 22px;
      color: ${isSuccess ? '#059669' : '#DC2626'};
      font-weight: 700;
      margin-bottom: 4px;
    }
    .details-box {
      background: #FAFCFF;
      border: 1px solid #EBF1F6;
      border-radius: 16px;
      padding: 8px 20px;
      margin-bottom: 20px;
    }
    .detail-item {
      display: grid;
      grid-template-columns: 36px 140px 12px 1fr;
      align-items: center;
      padding: 14px 0;
      border-bottom: 1px solid #EDF2F7;
    }
    .detail-item:last-child {
      border-bottom: none;
    }
    .item-icon {
      width: 32px;
      height: 32px;
      background-color: #EFF6FF;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .item-label {
      font-size: 13px;
      color: #475569;
      font-weight: 500;
      padding-left: 4px;
    }
    .item-separator {
      color: #94A3B8;
      font-weight: 500;
      font-size: 13px;
    }
    .item-value {
      font-size: 13.5px;
      color: #0F172A;
      font-weight: 600;
      word-break: break-all;
    }
    .item-value.amount {
      color: ${isSuccess ? '#059669' : '#DC2626'};
      font-size: 17px;
      font-weight: 700;
    }
    .system-banner {
      background-color: #EFF6FF;
      border: 1px solid #DBEAFE;
      border-radius: 12px;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    .banner-icon {
      width: 28px;
      height: 28px;
      background: #0056C6;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }
    .banner-text h4 {
      font-size: 12.5px;
      color: #1E40AF;
      font-weight: 700;
      margin-bottom: 2px;
    }
    .banner-text p {
      font-size: 11.5px;
      color: #475569;
    }
    .footer-wrapper {
      margin-top: auto;
      background-color: #0052CC;
      color: #FFFFFF;
      position: relative;
    }
    .footer-wave-svg {
      display: block;
      width: 100%;
      height: 24px;
      margin-top: -23px;
    }
    .footer-container {
      padding: 16px 32px 24px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }
    .footer-left {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
    .support-icon {
      color: #FFFFFF;
      opacity: 0.9;
      margin-top: 2px;
      flex-shrink: 0;
    }
    .contact-text h3 {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 2px;
    }
    .contact-text p {
      font-size: 11.5px;
      opacity: 0.88;
      line-height: 1.4;
    }
    .contact-text a {
      color: #FFFFFF;
      text-decoration: underline;
      text-underline-offset: 2px;
    }
    .footer-right {
      display: flex;
      align-items: center;
      gap: 6px;
      border-left: 1px solid rgba(255, 255, 255, 0.25);
      padding-left: 20px;
      height: 36px;
    }
    .footer-right svg {
      opacity: 0.85;
      flex-shrink: 0;
    }
    .footer-right a {
      color: #FFFFFF;
      text-decoration: none;
      font-size: 12.5px;
      font-weight: 500;
    }
    .footer-right a:hover {
      text-decoration: underline;
    }

    @media (max-width: 520px) {
      .content-body { padding: 20px 16px; }
      .details-box { padding: 4px 12px; }
      .detail-item { grid-template-columns: 32px 115px 10px 1fr; }
      .footer-container { flex-direction: column; align-items: flex-start; gap: 14px; padding: 12px 20px 20px 20px; }
      .footer-right { border-left: none; padding-left: 0; height: auto; }
    }

    @media print {
      body { background-color: #FFFFFF; padding: 0; }
      .receipt-container { box-shadow: none; border: none; max-width: 100%; border-radius: 0; }
      .detail-item { page-break-inside: avoid; }
      .pdf-button { display: none; }
    }
  </style>
</head>
<body>
  <div class="receipt-container">
    <div class="content-body">
      <div class="header-bar">
        <div class="brand-logo-area">
          <div class="logo-icon">
            <img src="https://monexis.store/clients/monexis/logo2.png" alt="Logo" />
          </div>
          <div class="brand-text">
                      <h1>Monexis Tech LLP</h1>

          </div>
        </div>
        <div class="pdf-button" onclick="window.print()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2-2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
          <span style="font-size: 9px; font-weight: bold; color: #64748B; margin-top: 2px;">PDF</span>
        </div>
      </div>

      <div class="status-section">
        <div class="success-circle">
          ${isSuccess
        ? '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>'
        : '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
      }
        </div>
        <div class="status-title">${isSuccess ? 'Recharge Successful' : 'Recharge Failed'}</div>
      </div>

      <div class="details-box">
        <div class="detail-item">
          <div class="item-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0056C6" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
          </div>
          <div class="item-label">Amount ${isSuccess ? "Paid" : "Attempted"}</div>
          <div class="item-separator">:</div>
          <div class="item-value amount">₹ ${amount}</div>
        </div>

        <div class="detail-item">
          <div class="item-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0056C6" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
          </div>
          <div class="item-label">Mobile Number</div>
          <div class="item-separator">:</div>
          <div class="item-value">${mobileNumber}</div>
        </div>

        <div class="detail-item">
          <div class="item-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0056C6" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          </div>
          <div class="item-label">Operator</div>
          <div class="item-separator">:</div>
          <div class="item-value">${operator}</div>
        </div>
        
        <div class="detail-item">
          <div class="item-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0056C6" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
          </div>
          <div class="item-label">Transaction ID</div>
          <div class="item-separator">:</div>
          <div class="item-value">${transactionId}</div>
        </div>

        <div class="detail-item">
          <div class="item-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0056C6" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
          <div class="item-label">Operator ID</div>
          <div class="item-separator">:</div>
          <div class="item-value">${OperatorId}</div>
        </div>

        <div class="detail-item">
          <div class="item-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0056C6" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
          </div>
          <div class="item-label">Recharge ID</div>
          <div class="item-separator">:</div>
          <div class="item-value">${rechargeId}</div>
        </div>
        
        <div class="detail-item">
          <div class="item-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0056C6" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          </div>
          <div class="item-label">Date & Time</div>
          <div class="item-separator">:</div>
          <div class="item-value">${formattedDate}</div>
        </div>

        <div class="detail-item">
          <div class="item-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0056C6" stroke-width="2"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path></svg>
          </div>
          <div class="item-label">Payment Type</div>
          <div class="item-separator">:</div>
          <div class="item-value">${paymentType}</div>
        </div>
      </div>

      <div class="system-banner">
        <div class="banner-icon">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
        </div>
        <div class="banner-text">
          <h4>Thank you for using our service!</h4>
          <p>This is a system generated receipt. No signature is required.</p>
        </div>
      </div>
    </div>

    <div class="footer-wrapper">
      <svg class="footer-wave-svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M0,0 C150,90 350,-40 500,55 C650,150 900,-20 1200,40 L1200,120 L0,120 Z" fill="#0052CC"></path>
      </svg>
      <div class="footer-container">
        <div class="footer-left">
          <div class="support-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
              <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
            </svg>
          </div>
          <div class="contact-text">
            <h3>Need Help?</h3>
            <p>Contact us at <a href="mailto:rajkotmonexis@gmail.com">rajkotmonexis@gmail.com</a></p>
            <p>or call us at <strong>+91 9104244451</strong></p>
          </div>
        </div>
        <div class="footer-right">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
          </svg>
          <a href="https://monexis.store/" target="_blank" rel="noopener noreferrer">monexis.store</a>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
    `;
  };

  const renderTransactionCard = ({ item }: { item: any }) => {
    const status = item.statusName || 'SUCCESS';
    return (
      <View style={styles.txnCard}>
        <View style={styles.txnHeader}>
          <View style={styles.operatorInfo}>
            <View style={styles.operatorIconBg}>
              <MaterialCommunityIcons name="cellphone-wireless" size={24} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.operatorName}>{item.operatorFullName}</Text>
              <Text style={styles.mobileNumber}>{item.customerNumber}</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.amountText}>₹{item.rechargeAmount}</Text>
            <Text style={[styles.statusText, { color: status?.toUpperCase() === 'SUCCESS' ? '#27AE60' : status?.toUpperCase() === 'FAILED' ? '#EB5757' : '#27AE60' }]}>
              {status}
            </Text>
          </View>
        </View>

        <View style={styles.txnDetailsGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>RECHARGE ID</Text>
            <Text style={styles.detailValue}>{item.rechargeId || 'N/A'}</Text>
          </View>
          <View style={[styles.detailItem, { alignItems: 'flex-end' }]}>
            <Text style={styles.detailLabel}>DATE & TIME</Text>
            <Text style={styles.detailValue}>{item.rechargeTime}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>OPERATOR ID</Text>
            <Text style={styles.detailValue}>{item.originalOperatorTransactionId || 'N/A'}</Text>
          </View>
          <View style={[styles.detailItem, { alignItems: 'flex-end' }]}>
            <Text style={styles.detailLabel}>TXN ID</Text>
            <Text style={styles.detailValue}>{item.transactionId || 'N/A'}</Text>
          </View>
          <View style={[styles.detailItem,]}>
            <Text style={styles.detailLabel}>MEDIUM TYPE</Text>
            <Text style={styles.detailValue}>{item.mediumType || 'N/A'}</Text>
          </View>

          {/* mediumType  */}
        </View>
        <SharedPDFDownloadButton
          fileName={`Receipt_${item.rechargeId || item.transactionId || 'Unknown'}`}
          htmlContent={generateHTML(item)}
          title="Download PDF"
          shareTitle="Share PDF"
          buttonStyle={styles.pdfDownloadButtonSpacer}
        />
      </View>
    );
  };



  const displayReports = useMemo(() => {
    const data = reports.length ? reports : [];
    if (!searchQuery.trim()) return data;

    const query = searchQuery.toLowerCase();
    return data.filter((item: any) => {
      const customerNum = (item.customerNumber || item.mobileNumber || '').toString().toLowerCase();
      const recId = (item.rechargeId || '').toString().toLowerCase();
      const txnId = (item.transactionId || item.txnId || '').toString().toLowerCase();
      const opId = (item.originalOperatorTransactionId || '').toString().toLowerCase();
      const operatorName = (item.operatorFullName || item.operatorName || '').toString().toLowerCase();

      return (
        customerNum.includes(query) ||
        recId.includes(query) ||
        txnId.includes(query) ||
        opId.includes(query) ||
        operatorName.includes(query)
      );
    });
  }, [reports, searchQuery]);
  const activeFilterCount = Object.values(appliedFilter).filter(v => v !== '' && v !== 0 && v !== undefined).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <AppHeader title="Recharge Report" showBack onBackPress={() => navigation.goBack()} />

      <View style={styles.searchContainer}>
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={20} color={Colors.textSecondary} />
            <TextInput
              placeholder="Search by Mobile or ID"
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          <View style={styles.headerActionsGroup}>
            <TouchableOpacity
              style={[styles.filterButton, showFilter && styles.filterButtonActive]}
              onPress={toggleFilter}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="filter-variant"
                size={22}
                color={showFilter ? '#FFFFFF' : Colors.primary}
              />
              {activeFilterCount > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {showFilter && (
        <View style={styles.filterPanel}>
          <View style={styles.filterHeader}>
            <MaterialCommunityIcons name="filter-outline" size={18} color={Colors.primary} />
            <Text style={styles.filterTitle}>Filter Options</Text>
          </View>

          <View style={styles.filterGrid}>

            {loginData?.role === 'Distributor' ? <DropdownSelector
              label="Retailer Name"
              value={filterFields.retailerId}
              options={filteredRetailerOptions}
              onSelect={(id: number) => handleDropdownSelect('retailerId', id)}
              dropdownId="retailer"
              placeholder="Select Retailer"
              activeDropdown={activeDropdown}
              setActiveDropdown={setActiveDropdown}
              dropdownSearch={dropdownSearch}
              setDropdownSearch={setDropdownSearch}
            />
              : <></>
            }


            <DropdownSelector
              label="Status"
              value={filterFields.statusId}
              options={rechargeStatusOptions}
              onSelect={(id: number) => handleDropdownSelect('statusId', id)}
              dropdownId="status"
              placeholder="Select Status"
              activeDropdown={activeDropdown}
              setActiveDropdown={setActiveDropdown}
              dropdownSearch={dropdownSearch}
              setDropdownSearch={setDropdownSearch}
            />
            <View style={styles.filterRow}>
              <View style={[styles.filterInputGroup, { flex: 1 }]}>
                <Text style={styles.filterLabel}>From Date</Text>
                <TouchableOpacity
                  style={styles.filterInputWrapper}
                  onPress={() => setShowFromPicker(true)}
                >
                  <MaterialCommunityIcons name="calendar-range" size={18} color={Colors.textSecondary} />
                  <Text style={[styles.filterInput, !filterFields.fromDate && { color: Colors.textMuted }]}>
                    {filterFields.fromDate || 'DD/MM/YYYY'}
                  </Text>
                </TouchableOpacity>
                {showFromPicker && (
                  <DateTimePicker
                    value={new Date()}
                    mode="date"
                    display="default"
                    onChange={(e, d) => onDateChange(e, d, 'from')}
                    maximumDate={new Date()}
                  />
                )}
              </View>

              <View style={[styles.filterInputGroup, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.filterLabel}>To Date</Text>
                <TouchableOpacity
                  style={styles.filterInputWrapper}
                  onPress={() => setShowToPicker(true)}
                >
                  <MaterialCommunityIcons name="calendar-range" size={18} color={Colors.textSecondary} />
                  <Text style={[styles.filterInput, !filterFields.toDate && { color: Colors.textMuted }]}>
                    {filterFields.toDate || 'DD/MM/YYYY'}
                  </Text>
                </TouchableOpacity>
                {showToPicker && (
                  <DateTimePicker
                    value={new Date()}
                    mode="date"
                    display="default"
                    onChange={(e, d) => onDateChange(e, d, 'to')}
                    maximumDate={new Date()}
                  />
                )}
              </View>
            </View>
          </View>

          <View style={styles.filterActions}>
            <TouchableOpacity style={styles.clearButton} onPress={handleClearFilter}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilter}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {isRetailerLoading && reports.length === 0 ? (
        <ListSkeleton />
      ) : (
        <FlatList
          data={displayReports}
          renderItem={renderTransactionCard}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() =>
            isRetailerLoading ? <ActivityIndicator size="small" color={Colors.primary} style={{ margin: 10 }} /> : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="file-search-outline" size={64} color="#E0E0E0" />
              <Text style={styles.emptyText}>No records found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 45,
  },
  headerActionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    fontFamily: Poppins.regular,
    color: Colors.textDark,
    padding: 0,
  },
  filterButton: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF3B30',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: Poppins.bold,
    fontWeight: '700',
  },
  filterPanel: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 20,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
    gap: 8,
  },
  filterTitle: {
    fontSize: 16,
    fontFamily: Poppins.bold,
    fontWeight: '700',
    color: Colors.textDark,
  },
  filterGrid: {
    paddingHorizontal: 20,
  },
  filterRow: {
    flexDirection: 'row',
  },
  filterInputGroup: {
    marginBottom: 5,
  },
  filterLabel: {
    fontSize: 12,
    fontFamily: Poppins.semiBold,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    gap: 10,
  },
  filterInput: {
    fontSize: 16,
    fontFamily: Poppins.regular,
    color: Colors.textDark,
  },
  filterActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 15,
    gap: 12,
  },
  clearButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  clearButtonText: {
    fontSize: 16,
    fontFamily: Poppins.semiBold,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  applyButton: {
    flex: 2,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary,
  },
  applyButtonText: {
    fontSize: 16,
    fontFamily: Poppins.semiBold,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  activeDropdownBorder: {
    borderColor: Colors.primary,
  },
  inlineDropdownList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    padding: 5,
  },
  dropdownSearchInput: {
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingHorizontal: 10,
    fontSize: 16,
    fontFamily: Poppins.regular,
    color: Colors.textDark,
    marginBottom: 5,
  },
  inlineDropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  inlineDropdownText: {
    fontSize: 16,
    fontFamily: Poppins.regular,
    color: Colors.textDark,
  },
  selectedDropdownText: {
    color: Colors.primary,
    fontWeight: '700',
  },
  noOptionsText: {
    padding: 15,
    textAlign: 'center',
    color: Colors.textMuted,
    fontSize: 16,
    fontFamily: Poppins.regular,
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  txnCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 0.3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  txnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  operatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  operatorIconBg: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 86, 210, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  operatorName: {
    fontSize: 12,
    fontFamily: Poppins.semiBold,
    color: '#666',
    fontWeight: '600',
  },
  mobileNumber: {
    fontSize: 16,
    fontFamily: Poppins.bold,
    fontWeight: 'bold',
    color: '#333',
  },
  amountText: {
    fontSize: 16,
    fontFamily: Poppins.bold,
    fontWeight: 'bold',
    color: '#333',
  },
  statusText: {
    fontSize: 12,
    fontFamily: Poppins.bold,
    fontWeight: 'bold',
    marginTop: 2,
  },
  txnDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
  detailItem: {
    width: '50%',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 12,
    fontFamily: Poppins.semiBold,
    color: '#333',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: Poppins.regular,
    color: '#999',
  },
  pdfDownloadButtonSpacer: {
    marginBottom: 14,
  },
});

export default RechargeReportScreen;