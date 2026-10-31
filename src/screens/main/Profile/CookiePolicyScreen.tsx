import React from 'react';
import LegalDocumentScreen from './LegalDocumentScreen';

const CookiePolicyScreen = ({ navigation, route }: any) => {
  return (
    <LegalDocumentScreen
      navigation={navigation}
      route={route}
      defaultDoc="cookie"
    />
  );
};

export default CookiePolicyScreen;
