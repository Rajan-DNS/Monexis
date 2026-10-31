import React from 'react';
import LegalDocumentScreen from './LegalDocumentScreen';

const TermsConditionsScreen = ({ navigation, route }: any) => {
  return (
    <LegalDocumentScreen
      navigation={navigation}
      route={route}
      defaultDoc="terms"
    />
  );
};

export default TermsConditionsScreen;
