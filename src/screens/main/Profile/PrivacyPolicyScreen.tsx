import React from 'react';
import LegalDocumentScreen from './LegalDocumentScreen';

const PrivacyPolicyScreen = ({ navigation, route }: any) => {
  return (
    <LegalDocumentScreen
      navigation={navigation}
      route={route}
      defaultDoc="privacy"
    />
  );
};

export default PrivacyPolicyScreen;
