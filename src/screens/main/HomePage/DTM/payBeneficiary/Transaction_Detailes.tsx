import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';

import { useNavigation, useRoute } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import AppHeader from '../../../../../components/Header/AppHeader';
import Colors from '../../../../../theme/colors';
import SharedPDFDownloadButton from '../../../../../components/PDF/SharedPDFDownload';
import { Poppins } from '../../../../../theme/typography';

const { width } = Dimensions.get('window');

const Transaction_Detailes = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();

  const rawTxn = route.params?.transaction || {};

  const statusRaw = (rawTxn.statusName || rawTxn.status || 'FAILED').toUpperCase();

  const transaction = {
    amount: rawTxn.amount !== undefined ? String(rawTxn.amount) : '0.00',
    status: statusRaw,
    date: rawTxn.requestTime
      ? new Date(rawTxn.requestTime).toLocaleString('en-IN', { hour12: true })
      : (rawTxn.date || 'N/A'),
    holderName: rawTxn.accountHolderName || rawTxn.holderName || 'N/A',
    bankName: rawTxn.bankName || 'N/A',
    accNo: rawTxn.accountNumber || rawTxn.accNo || 'N/A',
    ifsc: rawTxn.ifsccode || rawTxn.ifsc || 'N/A',
    mobile: rawTxn.mobileNumber || rawTxn.mobile || 'N/A',
    type: rawTxn.transferType || rawTxn.operatorName || rawTxn.type || 'DMT / IMPS',
    utrNumber: rawTxn.utrNumber || rawTxn.utr || 'N/A',
    txnId: rawTxn.txnId ? String(rawTxn.txnId) : 'N/A',
    commission: rawTxn.userCommAmount ? String(rawTxn.userCommAmount) : '0.00',
    requestId: rawTxn.ourRequestId || rawTxn.requestId || 'N/A',
  };

  const isSuccess = transaction.status === 'SUCCESS';
  const isProcessing = transaction.status === 'PROCESSING' || transaction.status === 'PENDING';

  // Dynamic Status Configurations
  const getStatusConfig = () => {
    if (isSuccess) {
      return {
        color: Colors.success || '#10B981',
        bg: '#ECFDF5',
        border: '#A7F3D0',
        label: 'Success',
        valueLabel: 'Successful',
        icon: 'check-circle',
        pdfCircleBg: '#10B981',
        pdfCircleShadow: 'rgba(16, 185, 129, 0.2)',
      };
    }
    if (isProcessing) {
      return {
        color: '#F59E0B',
        bg: '#FFFBEB',
        border: '#FDE68A',
        label: 'Processing',
        valueLabel: 'In Progress',
        icon: 'clock-outline',
        pdfCircleBg: '#F59E0B',
        pdfCircleShadow: 'rgba(245, 158, 11, 0.2)',
      };
    }
    return {
      color: Colors.error || '#EF4444',
      bg: '#FEF2F2',
      border: '#FECACA',
      label: 'Failed',
      valueLabel: 'Failed',
      icon: 'close-circle',
      pdfCircleBg: '#EF4444',
      pdfCircleShadow: 'rgba(239, 68, 68, 0.2)',
    };
  };

  const statusConfig = getStatusConfig();

  // HTML Printable Template
  const receiptHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Transaction Receipt - MONEXIS</title>
  <style>
    * { 
      box-sizing: border-box; 
      margin: 0; 
      padding: 0; 
    }
    html, body {
      background-color: #F8FAFC;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
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
      padding: 32px 32px 24px 32px;
    }
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 20px;
      border-bottom: 1px solid #F1F5F9;
    }
    .brand-section {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .brand-logo {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: #F1F5F9;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      flex-shrink: 0;
      border: 1px solid #E2E8F0;
    }
    .brand-logo img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .brand-text h1 {
      font-size: 20px;
      color: #003399;
      font-weight: 800;
      letter-spacing: 0.5px;
      line-height: 1.2;
    }
    .brand-text p {
      font-size: 11px;
      color: #64748B;
      font-weight: 500;
      margin-top: 2px;
    }
    .print-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      background: #F1F5F9;
      border: 1px solid #CBD5E1;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      color: #475569;
      cursor: pointer;
      transition: background 0.2s ease;
    }
    .print-btn:hover {
      background: #E2E8F0;
    }
    .status-section {
      text-align: center;
      padding: 8px 0 28px 0;
    }
    .status-circle {
      width: 60px;
      height: 60px;
      background-color: ${statusConfig.pdfCircleBg};
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
      margin-bottom: 12px;
      box-shadow: 0 4px 14px ${statusConfig.pdfCircleShadow};
    }
    .status-title {
      font-size: 22px;
      color: ${statusConfig.pdfCircleBg};
      font-weight: 700;
      margin-bottom: 4px;
    }
    .status-subtitle {
      font-size: 13px;
      color: #64748B;
      max-width: 80%;
      margin: 0 auto;
      line-height: 1.4;
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
      grid-template-columns: 140px 12px 1fr;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #EDF2F7;
    }
    .detail-item:last-child {
      border-bottom: none;
    }
    .item-label {
      font-size: 13px;
      color: #64748B;
      font-weight: 500;
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
      color: ${statusConfig.pdfCircleBg};
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
    }
    .banner-icon {
      width: 24px;
      height: 24px;
      background: #0056C6;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
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
      padding: 16px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      font-weight: 500;
    }
    .footer-wrapper a {
      color: #FFFFFF;
      text-decoration: none;
    }
    .footer-wrapper a:hover {
      text-decoration: underline;
    }

    @media (max-width: 520px) {
      .content-body { padding: 20px 16px; }
      .details-box { padding: 4px 12px; }
      .detail-item { grid-template-columns: 115px 10px 1fr; }
      .footer-wrapper { flex-direction: column; gap: 8px; text-align: center; padding: 16px; }
    }

    @media print {
      body { background-color: #FFFFFF; padding: 0; }
      .receipt-container { box-shadow: none; border: none; max-width: 100%; border-radius: 0; }
      .detail-item { page-break-inside: avoid; }
      .print-btn { display: none; }
    }
  </style>
</head>
<body>
  <div class="receipt-container">
    <div class="content-body">
      <div class="header-bar">
        <div class="brand-section">
          <div class="brand-logo">
            <img src= 'https://Monexis.store/clients/monexis/logo2.png' alt="Monexis" />
          </div>
          <div class="brand-text">
            <h1>Monexis</h1>
            <p>I M ENTERPRISES</p>
          </div>
        </div>
        <button class="print-btn" onclick="window.print()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
          Print
        </button>
      </div>

      <div class="status-section">
        <div class="status-circle">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            ${isSuccess
      ? '<polyline points="20 6 9 17 4 12"></polyline>'
      : isProcessing
        ? '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>'
        : '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>'
    }
          </svg>
        </div>
        <div class="status-title">Transaction ${statusConfig.label}!</div>
        <div class="status-subtitle">
          ${isSuccess
      ? 'Your transaction has been completed successfully.'
      : isProcessing
        ? 'Your transaction is being processed. Please check back shortly.'
        : 'Your transaction could not be completed.'
    }
        </div>
      </div>

      <div class="details-box">
        <div class="detail-item">
          <div class="item-label">Amount</div>
          <div class="item-separator">:</div>
          <div class="item-value amount">₹ ${transaction.amount}</div>
        </div>
        <div class="detail-item">
          <div class="item-label">Bank Name</div>
          <div class="item-separator">:</div>
          <div class="item-value">${transaction.bankName}</div>
        </div>
        <div class="detail-item">
          <div class="item-label">Account Number</div>
          <div class="item-separator">:</div>
          <div class="item-value">${transaction.accNo}</div>
        </div>
        <div class="detail-item">
          <div class="item-label">IFSC Code</div>
          <div class="item-separator">:</div>
          <div class="item-value">${transaction.ifsc}</div>
        </div>
        <div class="detail-item">
          <div class="item-label">Commission</div>
          <div class="item-separator">:</div>
          <div class="item-value">₹ ${transaction.commission}</div>
        </div>
        <div class="detail-item">
          <div class="item-label">Request ID</div>
          <div class="item-separator">:</div>
          <div class="item-value">${transaction.requestId}</div>
        </div>
        <div class="detail-item">
          <div class="item-label">Status</div>
          <div class="item-separator">:</div>
          <div class="item-value">${transaction.status}</div>
        </div>
        <div class="detail-item">
          <div class="item-label">UTR Number</div>
          <div class="item-separator">:</div>
          <div class="item-value">${transaction.utrNumber}</div>
        </div>
        <div class="detail-item">
          <div class="item-label">Transfer Type</div>
          <div class="item-separator">:</div>
          <div class="item-value">${transaction.type}</div>
        </div>
        <div class="detail-item">
          <div class="item-label">Transaction ID</div>
          <div class="item-separator">:</div>
          <div class="item-value">${transaction.txnId}</div>
        </div>
        <div class="detail-item">
          <div class="item-label">Date & Time</div>
          <div class="item-separator">:</div>
          <div class="item-value">${transaction.date}</div>
        </div>
      </div>

      <div class="system-banner">
        <div class="banner-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
        </div>
        <div class="banner-text">
          <h4>Thank you for using our service!</h4>
          <p>Contact us at <a href="mailto:rajkotmonexis@gmail.com">rajkotmonexis@gmail.com</a></p>
          <p>or call us at <strong>+91 9104244451</strong></p>
        </div>
      </div>
    </div>

    <div class="footer-wrapper">
      <div>Need Help? Support: <a href="mailto:rajkotmonexis@gmail.co">rajkotmonexis@gmail.co</a></div>
      <div><a href="https://Monexis.store/" target="_blank" rel="noopener noreferrer">Monexis.store</a></div>
    </div>
  </div>
</body>
</html>
`;
  return (
    <View style={styles.container}>
      <AppHeader
        title={`Transaction ${statusConfig.label}`}
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.receiptCard}>
          {/* Status Header Header */}
          <View style={styles.statusHeader}>
            <Text style={styles.headerTitle}>Transaction Receipt</Text>

            <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg, borderColor: statusConfig.border }]}>
              <MaterialCommunityIcons
                name={statusConfig.icon}
                size={16}
                color={statusConfig.color}
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>

            <Text style={styles.dateText}>{transaction.date}</Text>
          </View>

          <View style={styles.dashedDivider} />

          {/* Amount Box */}
          <View style={styles.amountBox}>
            <Text style={styles.amountLabel}>TRANSFER AMOUNT</Text>
            <Text style={styles.amountValue}>₹ {transaction.amount}</Text>
          </View>

          {/* Beneficiary Details Section */}
          <Text style={styles.sectionTitle}>BENEFICIARY DETAILS</Text>
          <View style={styles.gridContainer}>
            <View style={styles.gridRow}>
              <View style={styles.gridColLeft}>
                <Text style={styles.detailLabel}>Holder Name</Text>
                <Text style={styles.detailValue} numberOfLines={1}>{transaction.holderName}</Text>
              </View>
              <View style={styles.gridColRight}>
                <Text style={styles.detailLabel}>Bank Name</Text>
                <Text style={styles.detailValueRight} numberOfLines={1}>{transaction.bankName}</Text>
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridColLeft}>
                <Text style={styles.detailLabel}>Account Number</Text>
                <Text style={styles.detailValue} numberOfLines={1}>{transaction.accNo}</Text>
              </View>
              <View style={styles.gridColRight}>
                <Text style={styles.detailLabel}>IFSC Code</Text>
                <Text style={styles.detailValueRight} numberOfLines={1}>{transaction.ifsc}</Text>
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridColLeft}>
                <Text style={styles.detailLabel}>Mobile</Text>
                <Text style={styles.detailValue}>{transaction.mobile}</Text>
              </View>
              <View style={styles.gridColRight}>
                <Text style={styles.detailLabel}>Transfer Type</Text>
                <Text style={styles.detailValueRight}>{transaction.type}</Text>
              </View>
            </View>
          </View>

          <View style={styles.dashedDivider} />

          {/* Reference Info Section */}
          <Text style={styles.sectionTitle}>REFERENCE INFO</Text>

          <View style={styles.infoRow}>
            <Text style={styles.detailLabel}>UTR Number</Text>
            <Text style={styles.detailValue}>{transaction.utrNumber}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.detailLabel}>Transaction ID</Text>
            <Text style={styles.detailValue}>{transaction.txnId}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.detailLabel}>Commission</Text>
            <Text style={styles.detailValue}>₹ {transaction.commission}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.detailLabel}>Request ID</Text>
            <Text style={styles.detailValue}>{transaction.requestId}</Text>
          </View>

          <View style={[styles.infoRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
            <Text style={styles.detailLabel}>Status</Text>
            <Text style={[styles.detailValue, { color: statusConfig.color, fontFamily: Poppins.bold }]}>
              {statusConfig.valueLabel}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        {isSuccess || isProcessing ? (
          <SharedPDFDownloadButton
            fileName={`Receipt_${transaction.txnId}`}
            htmlContent={receiptHTML}
            title="Download PDF Receipt"
            shareTitle="Share PDF"
            buttonStyle={styles.pdfButtonSpacer}
          />
        ) : (
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: Colors.error || '#EF4444' }]}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.primaryButtonText}>Retry Payment</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.secondaryButtonText}>Close</Text>
        </TouchableOpacity>

        <View style={styles.secureFooter}>
          <MaterialCommunityIcons name="shield-check-outline" size={16} color={Colors.textSecondary || '#64748B'} />
          <Text style={styles.secureFooterText}>100% Secure Transaction by NextGen</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  receiptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusHeader: {
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: Poppins.bold,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    fontFamily: Poppins.semiBold,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 12,
    fontFamily: Poppins.regular,
    color: '#64748B',
  },
  dashedDivider: {
    borderWidth: 0.8,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    marginVertical: 18,
    width: '100%',
  },
  amountBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  amountLabel: {
    fontSize: 11,
    fontFamily: Poppins.medium,
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  amountValue: {
    fontSize: 24,
    fontFamily: Poppins.bold,
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: Poppins.bold,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  gridContainer: {
    gap: 14,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridColLeft: {
    flex: 1,
    paddingRight: 8,
  },
  gridColRight: {
    flex: 1,
    alignItems: 'flex-end',
    paddingLeft: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailLabel: {
    fontSize: 12,
    fontFamily: Poppins.regular,
    color: '#64748B',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontFamily: Poppins.semiBold,
    fontWeight: '600',
    color: '#1E293B',
  },
  detailValueRight: {
    fontSize: 14,
    fontFamily: Poppins.semiBold,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'right',
  },
  bottomActions: {
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  pdfButtonSpacer: {
    marginBottom: 10,
  },
  primaryButton: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontFamily: Poppins.bold,
  },
  secondaryButton: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: '#475569',
    fontSize: 15,
    fontFamily: Poppins.semiBold,
  },
  secureFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secureFooterText: {
    fontSize: 12,
    fontFamily: Poppins.regular,
    color: '#64748B',
    marginLeft: 6,
  },
});

export default Transaction_Detailes;