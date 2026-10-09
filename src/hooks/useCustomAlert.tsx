import { useState } from 'react';
import { AlertType } from '../components/Modals/CustomAlertModal';

interface AlertConfig {
  visible: boolean;
  type: AlertType;
  title: string;
  message: string;
  confirmText?: string;
  onConfirm?: () => void;
}

export const useCustomAlert = () => {
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    visible: false,
    type: 'info',
    title: '',
    message: '',
  });

  const showAlert = (
    type: AlertType,
    title: string,
    message: string,
    confirmText: string = 'OK',
    onConfirm?: () => void
  ) => {
    setAlertConfig({
      visible: true,
      type,
      title,
      message,
      confirmText,
      onConfirm,
    });
  };

  const showSuccess = (title: string, message: string, onConfirm?: () => void) => {
    showAlert('success', title, message, 'OK', onConfirm);
  };

  const showError = (title: string, message: string, onConfirm?: () => void) => {
    showAlert('error', title, message, 'OK', onConfirm);
  };

  const showWarning = (title: string, message: string, onConfirm?: () => void) => {
    showAlert('warning', title, message, 'OK', onConfirm);
  };

  const showInfo = (title: string, message: string, onConfirm?: () => void) => {
    showAlert('info', title, message, 'OK', onConfirm);
  };

  const hideAlert = () => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  };

  return {
    alertConfig,
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideAlert,
  };
};
