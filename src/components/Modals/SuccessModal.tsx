import React from 'react';
import {
  StyleSheet,
  Modal,
  View,
  Text,
  TouchableOpacity
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import SharedPDFDownloadButton from '../PDF/SharedPDFDownload';
import { useSelector } from 'react-redux';
import { Poppins } from '../../theme/typography';
import { Dimensions } from '../../theme/spacing';

const Colors = {
  primary: '#0C52A1',
  bg: '#F8FAFC',
  bgSecondaryBox: '#F1F5F9',
};

interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
  transactionData?: {
    amount?: string | number;
    utrNumber?: string;
    transferType?: string;
    txnId?: string;
    date?: any;
    bankName?: string;
    accNo?: string;
    ifcecode?: string;
    commission?: string | number;
    requestId?: string;
    status?: string;
    beneficiary?: {
      accountHolderName?: string;
    };
  };
  amount?: string | number;
  transferType?: string;
  selectedBeneficiary?: {
    accountHolderName?: string;
  };
  formatDate: (date: any) => string;
}

const SuccessModal = ({
  visible,
  onClose,
  transactionData,
  amount,
  transferType,
  selectedBeneficiary,
  formatDate
}: SuccessModalProps) => {
  const user = useSelector((state: any) => state.auth.user);



  // Normalized Target Value fallbacks
  const targetAmount = transactionData?.amount || amount || '0.00';
  const targetUtr = transactionData?.utrNumber || 'N/A';
  const targetType = transactionData?.transferType || transferType || 'N/A';
  const targetTxnId = transactionData?.txnId || 'N/A';
  const targetDate = formatDate(transactionData?.date);
  const targetBeneficiary = transactionData?.beneficiary?.accountHolderName || selectedBeneficiary?.accountHolderName || 'N/A';

  // Additional layout properties mapped out safely
  const targetBankName = transactionData?.bankName || 'N/A';
  const targetAccNo = transactionData?.accNo || 'N/A';
  const targetIfsc = transactionData?.ifcecode || 'N/A';
  const targetCommission = transactionData?.commission || '0.00';
  const targetRequestId = transactionData?.requestId || 'N/A';
  const targetStatus = transactionData?.status || 'Successful';

  // Dynamic High-Fidelity Print Engine HTML Context String
  const receiptHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Transaction Receipt - Monexis</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      background-color: #F8FAFC;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      min-height: 100vh;
    }
    body {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }
    .receipt-container {
      width: 100%;
      max-width: 650px;
      background: #FFFFFF;
      border-radius: 24px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
      border: 1px solid #E2E8F0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .content-body {
      flex: 1;
      padding: 0 0 20px 0;
    }
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 35px 40px 20px 40px;
    }
    .brand-logo-area { display: flex; align-items: center; gap: 12px; }
    .logo-icon {
      width: 44px;
      height: 44px;
     
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .logo-icon img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .brand-text h1 { font-size: 22px; color: #003399; font-weight: 800; letter-spacing: 0.5px; }
    .brand-text p { font-size: 11px; color: #64748B; font-weight: 500; }
    
    .status-section { text-align: center; padding: 10px 40px 25px 40px; }
    .success-circle {
      width: 64px; height: 64px; background-color: #10B981;
      border-radius: 50%; display: inline-flex; align-items: center;
      justify-content: center; color: white; margin-bottom: 16px;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
    }
    .status-title { font-size: 24px; color: #10B981; font-weight: 700; margin-bottom: 6px; }
    .status-subtitle { font-size: 14px; color: #64748B; }
    
    .details-box {
      background: #FFFFFF; border: 1px solid #F1F5F9;
      border-radius: 18px; margin: 0 40px 25px 40px; padding: 10px 24px;
    }
    .detail-item {
      display: grid;
      grid-template-columns: 140px 15px 1fr;
      align-items: center;
      padding: 16px 0;
      border-bottom: 1px solid #F1F5F9;
    }
    .detail-item:last-child { border-bottom: none; }
    .item-label { font-size: 14px; color: #334155; font-weight: 500; }
    .item-separator { color: #334155; font-weight: 500; }
    .item-value { font-size: 14px; color: #1E293B; font-weight: 600; word-break: break-all; }
    .item-value.amount { color: #10B981; font-size: 18px; font-weight: 700; }
    
    .system-banner {
      background-color: #EFF6FF; border-radius: 14px;
      margin: 0 40px; padding: 16px 20px;
      display: flex; align-items: center; gap: 16px;
    }
    .banner-text h4 { font-size: 13px; color: #0044B3; font-weight: 700; margin-bottom: 2px; }
    .banner-text p { font-size: 12px; color: #64748B; }
    
    .footer-wrapper {
      background-color: #0052cc;
      padding: 20px 40px;
      color: #FFFFFF;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
    }
    .footer-left h3 { font-size: 15px; margin-bottom: 4px; }
    .footer-left p { font-size: 12px; opacity: 0.85; }
    .footer-right a { color: #FFF; text-decoration: none; font-size: 13px; font-weight: 500; }

    @media print {
      body { background-color: #FFF; padding: 0; }
      .receipt-container { box-shadow: none; border: none; max-width: 100%; }
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
      </div>
      <div class="status-section">
        <div class="success-circle">  
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <div class="status-title">Transaction Successful!</div>
        <div class="status-subtitle">Your money has been sent securely.</div>
      </div>
      <div class="details-box">
        <div class="detail-item">
          <div class="item-label">Amount</div>
          <div class="item-separator">:</div>
          <div class="item-value amount">₹ ${targetAmount}</div>
        </div>
        <div class="detail-item">
          <div class="item-label">Beneficiary Name</div>
          <div class="item-separator">:</div>
          <div class="item-value">${targetBeneficiary}</div>
        </div>
        <div class="detail-item">
          <div class="item-label">UTR Number</div>
          <div class="item-separator">:</div>
          <div class="item-value">${targetUtr}</div>
        </div>
        <div class="detail-item">
          <div class="item-label">Transaction ID</div>
          <div class="item-separator">:</div>
          <div class="item-value">${targetTxnId}</div>
        </div>
        <div class="detail-item">
          <div class="item-label">Date & Time</div>
          <div class="item-separator">:</div>
          <div class="item-value">${targetDate}</div>
        </div>
        <div class="detail-item">
          <div class="item-label">Transfer Type</div>
          <div class="item-separator">:</div>
          <div class="item-value">${targetType}</div>
        </div>
      </div>
      <div class="system-banner">
        <div class="banner-text">
          <h4>Thank you for using our service!</h4>
          <p>This is a system generated receipt. No signature is required.</p>
        </div>
      </div>
    </div>
    <div class="footer-wrapper">
      <div class="footer-left">
        <h3>Need Help?</h3>
        <p>Contact us at <a href="mailto:rajkotmonexis@gmail.com">rajkotmonexis@gmail.com</a></p>
        <p>or call us at <strong>+91 9104244451</strong></p>
      </div>
      <div class="footer-right">
        <a href="https://monexis.store" target="_blank" rel="noopener noreferrer">monexis.store</a>
      </div>
    </div>
  </div>
</body>
</html>
`;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalIcon, { backgroundColor: '#D1FAE5' }]}>
            <MaterialCommunityIcons name="check-circle" size={40} color="#10B981" />
          </View>
          <Text style={styles.modalTitle}>Transaction Successful</Text>
          <Text style={styles.modalSubtitle}>Your money has been sent securely.</Text>

          <View style={styles.receiptBox}>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Amount</Text>
              <Text style={styles.receiptValue}>₹{targetAmount}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>UTR Number</Text>
              <Text style={styles.receiptValue}>{targetUtr}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Transfer Type</Text>
              <Text style={styles.receiptValue}>{targetType}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Transaction ID</Text>
              <Text style={styles.receiptValue}>{targetTxnId}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Date & Time</Text>
              <Text style={styles.receiptValue}>{targetDate}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Beneficiary</Text>
              <Text style={styles.receiptValue}>{targetBeneficiary}</Text>
            </View>
          </View>

          <SharedPDFDownloadButton
            fileName={`Receipt_${targetTxnId}`}
            htmlContent={receiptHTML}
            title="Download PDF"
            shareTitle="Share PDF"
            buttonStyle={styles.pdfDownloadButtonSpacer}
          />

          <TouchableOpacity style={styles.secondaryModalButton} onPress={onClose}>
            <Text style={styles.secondaryModalButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    width: '100%',
  },
  modalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: Poppins.bold,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    fontFamily: Poppins.regular,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  receiptBox: {
    width: '100%',
    backgroundColor: Colors.bgSecondaryBox || '#F1F5F9',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  receiptLabel: {
    fontSize: 12,
    fontFamily: Poppins.regular,
    color: '#64748B',
  },
  receiptValue: {
    fontSize: 12,
    fontFamily: Poppins.bold,
    fontWeight: '700',
    color: '#1E293B',
  },
  pdfDownloadButtonSpacer: {
    marginBottom: 14,
  },
  secondaryModalButton: {
    width: '100%',
    height: Dimensions.buttonHeight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryModalButtonText: {
    color: '#64748B',
    fontSize: 16,
    fontFamily: Poppins.semiBold,
    fontWeight: '600',
  },
});

export default SuccessModal;