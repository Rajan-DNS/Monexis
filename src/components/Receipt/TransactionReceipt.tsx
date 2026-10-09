import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import SharedPDFDownloadButton from '../PDF/SharedPDFDownload';
import { Poppins } from '../../theme/typography';
import { Colors, Radius, Spacing } from '../../theme';


export interface TransactionDetail {
  label: string;
  value: string;
  isAmount?: boolean;
}

export interface TransactionReceiptProps {
  isSuccess: boolean;
  statusTitle: string;
  statusSubtitle: string;
  amount: string | number;
  amountLabel: string;
  details: TransactionDetail[];
  transactionId?: string;
  operatorId?: string;
  date?: string;
  paymentType?: string;
  onHomePress: () => void;
  onRetryPress?: () => void;
}

const TransactionReceipt: React.FC<TransactionReceiptProps> = ({
  isSuccess,
  statusTitle,
  statusSubtitle,
  amount,
  amountLabel,
  details,
  transactionId = "N/A",
  operatorId = "N/A",
  date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + ", " + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  paymentType = "Payment",
  onHomePress,
  onRetryPress
}) => {

  const getHTMLDetails = () => {
    return details.map(d => `
        <div class="detail-item">
          <div class="item-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0056C6" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          </div>
          <div class="item-label">${d.label}</div>
          <div class="item-separator">:</div>
          <div class="item-value ${d.isAmount ? 'amount' : ''}">${d.value}</div>
        </div>
    `).join('');
  };

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
      max-width: 600px;
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
      
      border-radius: 12px;
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
      line-height: 1.2;
    }
    .brand-text p {
      font-size: 11px;
      color: #64748B;
      font-weight: 500;
      letter-spacing: 0.2px;
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
    .status-subtitle {
      font-size: 13px;
      color: #64748B;
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
      grid-template-columns: 36px 130px 12px 1fr;
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
      padding-left: 6px;
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
      text-align: left;
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
      letter-spacing: 0.2px;
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
      .content-body { padding: 20px 18px; }
      .details-box { padding: 4px 12px; }
      .detail-item { grid-template-columns: 32px 110px 10px 1fr; }
      .footer-container { flex-direction: column; align-items: flex-start; gap: 14px; padding: 12px 20px 20px 20px; }
      .footer-right { border-left: none; padding-left: 0; height: auto; }
    }

    @media print {
      body { background-color: #FFFFFF; padding: 0; }
      .receipt-container { box-shadow: none; border: none; max-width: 100%; border-radius: 0; }
      .detail-item { page-break-inside: avoid; }
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
            <h1>Monexis</h1>
            <p> I M ENTERPRISES</p>
          </div>
        </div>
      </div>

      <div class="status-section">
        <div class="success-circle">
          ${isSuccess
      ? '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>'
      : '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
    }
        </div>
        <div class="status-title">${statusTitle}</div>
        <div class="status-subtitle">${statusSubtitle}</div>
      </div>

      <div class="details-box">
        <div class="detail-item">
          <div class="item-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0056C6" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
          </div>
          <div class="item-label">${amountLabel}</div>
          <div class="item-separator">:</div>
          <div class="item-value amount">₹ ${amount}</div>
        </div>

        ${getHTMLDetails()}
        
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
          <div class="item-value">${operatorId}</div>
        </div>
        
        <div class="detail-item">
          <div class="item-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0056C6" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          </div>
          <div class="item-label">Date & Time</div>
          <div class="item-separator">:</div>
          <div class="item-value">${date}</div>
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
          <p>This is a system-generated receipt. No physical signature is required.</p>
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
          <a href="https://apiimpay.com/" target="_blank" rel="noopener noreferrer">Monexis.com</a>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `;
  return (
    <View style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={{ height: 20 }} />

        <View style={styles.header}>
          <View style={[
            styles.iconContainer,
            { backgroundColor: isSuccess ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }
          ]} >
            <View style={[styles.iconBg, { shadowColor: isSuccess ? Colors.success : Colors.error }]}>
              <MaterialCommunityIcons
                name={isSuccess ? "check-bold" : "close-thick"}
                size={40}
                color={isSuccess ? Colors.success : Colors.error}
              />
            </View>
          </View>
          <Text style={styles.statusTitle}>{statusTitle}</Text>
          <Text style={styles.statusSubtitle}>{statusSubtitle}</Text>
        </View>

        <View style={styles.receiptCard}>
          <View style={styles.amountSection}>
            <Text style={styles.amountLabel}>{amountLabel}</Text>
            <Text style={styles.amountText}>
              <Text style={styles.currencySymbol}>₹</Text>
              {amount}
            </Text>
          </View>

          <View style={styles.rechargeDetails}>
            <View style={styles.detailsHeader}>
              <Text style={styles.detailsLabel}>TRANSACTION DETAILS</Text>
            </View>

            {details.map((detail, index) => (
              <View key={index} style={styles.detailRow}>
                <Text style={styles.detailTextLabel}>{detail.label}</Text>
                <Text style={styles.detailTextValue}>{detail.value}</Text>
              </View>
            ))}
          </View>

          <View style={styles.txnInfoGrid}>
            <View>
              <Text style={styles.infoLabel}>TRANSACTION ID</Text>
              <Text style={styles.infoValue}>{transactionId}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.infoLabel}>OPERATOR ID</Text>
              <Text style={styles.infoValue}>{operatorId}</Text>
            </View>
          </View>

          <View style={styles.divider} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', }}>
            <Text style={{
              fontSize: 12,
              color: '#1E293B',
              fontFamily: Poppins.bold,
              lineHeight: 12
            }}>DATE & TIME</Text>
            <Text style={styles.infoValue}>{date}</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {isSuccess ? (
        <View style={styles.footer}>
          <SharedPDFDownloadButton
            fileName={`Receipt_${transactionId}`}
            htmlContent={receiptHTML}
            title="Download PDF"
            shareTitle="Share PDF"
            buttonStyle={styles.pdfDownloadButtonSpacer}
          />

          <TouchableOpacity
            style={styles.homeButton}
            onPress={onHomePress}
          >
            <Text style={styles.homeText}>DONE</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.homeButton}
            onPress={onRetryPress || onHomePress}
          >
            <Text style={styles.homeText}>{onRetryPress ? 'Retry' : 'DONE'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bgLightest,
  },
  pdfDownloadButtonSpacer: {
    marginBottom: Spacing.sm + 6,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  iconBg: {
    width: 72,
    height: 72,
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  statusTitle: {
    fontSize: 20,
    color: Colors.textDark,
    marginBottom: Spacing.sm,
    fontFamily: Poppins.medium,
  },
  statusSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
    fontFamily: Poppins.medium,
  },
  receiptCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: Spacing.lg,
  },
  amountSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  amountLabel: {
    fontSize: 12,
    color: Colors.warningDark,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    fontFamily: Poppins.medium,
  },
  amountText: {
    fontSize: 20,
    color: Colors.textDark,
    fontFamily: Poppins.semiBold,
  },
  currencySymbol: {
    fontSize: 20,
    color: Colors.textDark,
    marginRight: Spacing.xs,
    fontFamily: Poppins.semiBold,
  },
  rechargeDetails: {
    backgroundColor: Colors.bgInput,
    borderRadius: Radius.md,
    padding: Spacing.lg - 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: Spacing.lg,
  },
  detailsHeader: {
    marginBottom: Spacing.sm + 4,
  },
  detailsLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: Spacing.sm + 4,
    fontFamily: Poppins.medium,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  detailTextLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: Poppins.medium,
  },
  detailTextValue: {
    fontSize: 14,
    color: Colors.textDark,
    fontFamily: Poppins.semiBold,
    flex: 1,
    textAlign: 'right',
  },
  txnInfoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  infoLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
    fontFamily: Poppins.medium,
  },
  infoValue: {
    fontSize: 14,
    color: '#1E293B',
    fontFamily: Poppins.semiBold,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: Spacing.lg,
  },
  footer: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
  },
  homeButton: {
    backgroundColor: Colors.bgInput,
    paddingVertical: 12,
    borderRadius: Radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  homeText: {
    fontSize: 16,
    color: Colors.textDark,
    fontFamily: Poppins.semiBold,
  },
});

export default TransactionReceipt;
