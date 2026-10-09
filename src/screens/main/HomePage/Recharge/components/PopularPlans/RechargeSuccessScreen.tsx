import React, { useEffect } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../../../../../../navigation/RootNavigator';
import TransactionReceipt from '../../../../../../components/Receipt/TransactionReceipt';

type RechargeSuccessRouteProp = RouteProp<RootStackParamList, 'RechargeSuccess'>;

const RechargeSuccessScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RechargeSuccessRouteProp>();
  const { mobileNumber, amount, operator, circle, isPostpaid, plan, data } = route.params;

  console.log('RechargeSuccessScreen received params:', route.params);

  let transactionData: any = {};
  let responseData: any = {};

  try {
    transactionData = typeof data === "string" ? JSON.parse(data) : data;
    responseData = transactionData;
  } catch (error) {
    console.log("JSON Parse Error:", error);
  }

  const isSuccess = responseData?.Status === "SUCCESS";

  useEffect(() => {
    if (isSuccess && transactionData?.P2ABalance !== undefined) {
      AsyncStorage.setItem('P2ABalance', transactionData.P2ABalance.toString());
    }
  }, [isSuccess, transactionData]);

  const statusMessage = transactionData?.Message || (isSuccess ? "Your payment has been processed securely" : "Transaction Failed.");
  const transactionId = transactionData?.TransactionId || "N/A"
  const operatorId = transactionData?.OperatorId || "N/A"

  const details = [
    { label: "Mobile Number", value: mobileNumber },
    { label: "Operator & Circle", value: `${operator} (${circle})` },
  ];

  return (
    <TransactionReceipt
      isSuccess={isSuccess}
      statusTitle={isSuccess ? "Recharge Successful" : "Recharge Failed"}
      statusSubtitle={statusMessage}
      amount={amount}
      amountLabel={isSuccess ? "AMOUNT PAID" : "AMOUNT ATTEMPTED"}
      details={details}
      transactionId={transactionId}
      operatorId={operatorId}
      paymentType={isPostpaid ? 'Postpaid Bill' : 'Prepaid Recharge'}
      onHomePress={() => navigation.navigate('MainTabs')}
      onRetryPress={!isSuccess ? () => navigation.goBack() : undefined}
    />
  );
};

export default RechargeSuccessScreen;