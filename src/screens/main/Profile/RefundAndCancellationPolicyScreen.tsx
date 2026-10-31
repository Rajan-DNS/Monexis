import React from 'react';
import LegalDocumentScreen from './LegalDocumentScreen';

const RefundAndCancellationPolicyScreen = ({ navigation, route }: any) => {
  return (
    <LegalDocumentScreen
      navigation={navigation}
      route={route}
      defaultDoc="refund"
    />
  );
};

export default RefundAndCancellationPolicyScreen;
