import React from 'react';
import UtilityPayBase from '../components/UtilityBase/UtilityPayBase';
import { FASTAG_PAY_CONFIG } from '../../../../../data/utilityConfigs';
import { useDeviceLocation } from '../../../../../hooks/useDeviceLocation';

const FastagPay = () => {
    const { deviceModel, locationString } = useDeviceLocation();
    return <UtilityPayBase config={FASTAG_PAY_CONFIG} />;
};

export default FastagPay;
