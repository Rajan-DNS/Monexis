import React from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../../navigation/RootNavigator';
import TransactionReceipt from '../../../../../components/Receipt/TransactionReceipt';
import { BROADBAND_PAY_CONFIG } from '../../../../../data/utilityConfigs';

const BroadbandPay = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<RouteProp<RootStackParamList, 'BroadbandPay'>>();
    const params = route.params as any || {};

    const responseData = params.responseData;
    
    let parsedData: any = {};
    if (typeof responseData?.data === 'string') {
        try {
            parsedData = JSON.parse(responseData.data);
        } catch (error) {
            console.log('Error parsing nested response data', error);
        }
    } else if (responseData?.data) {
        parsedData = responseData.data;
    }

    const isSuccess = responseData?.success;
    const amount = params.amount || BROADBAND_PAY_CONFIG.amount;
    const operatorName = params.operatorName || parsedData?.OperatorId || BROADBAND_PAY_CONFIG.operatorName;
    const transactionId = String(parsedData?.TransactionId ?? 'N/A');
    const operatorId = parsedData?.OperatorId || 'N/A';

    const details = [
        { label: 'Consumer Number', value: params.consumerNumber || 'N/A' },
        { label: 'Operator', value: operatorName },
        { label: 'P2A Balance', value: `₹ ${parsedData?.P2ABalance ?? 0}` },
        { label: 'P2P Balance', value: `₹ ${parsedData?.P2PBalance ?? 0}` },
        { label: 'BBPS Assured', value: 'Yes' },
    ];

    return (
        <TransactionReceipt
            isSuccess={isSuccess}
            statusTitle={isSuccess ? 'Payment Successful' : 'Payment Failed'}
            statusSubtitle={responseData?.message || 'Your broadband bill payment status fetched.'}
            amount={amount}
            amountLabel="AMOUNT PAID"
            details={details}
            transactionId={transactionId}
            operatorId={operatorId}
            paymentType="Broadband Bill"
            onHomePress={() => navigation.navigate('MainTabs' as any)}
            onRetryPress={!isSuccess ? () => navigation.goBack() : undefined}
        />
    );
};

export default BroadbandPay;
