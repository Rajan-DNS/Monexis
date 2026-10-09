import React from 'react';
import UtilityBillBase, { BillConfig } from '../components/UtilityBase/UtilityBillBase';

const CableTVBillScreen = () => {
    const cableTVConfig: BillConfig = {
        title: 'Cable TV Bill Payment',
        operatorName: 'Hathway Cable',
        operatorIcon: 'television',
        consumerLabel: 'Subscriber ID',
        consumerValue: '123456789012',
        validity: '30 DAYS',
        currentAmount: '499',
        nextScreen: 'RechargeSuccess',
        
        plans: [
            { price: '299', validity: '1 Month', tag: 'Basic' },
            { price: '499', validity: '1 Month', tag: 'Popular' },
            { price: '799', validity: '1 Month', tag: 'Premium' },
            { price: '1299', validity: '1 Month', tag: 'Ultimate' },
            { price: '1499', validity: '3 Months' },
            { price: '2999', validity: '6 Months' },
        ],

        insights: {
            avgMonthly: '499',
            dueDate: '15 Feb 2025',
        },

        offers: [
            {
                title: 'Get ₹50 Cashback',
                desc: 'Pay via UPI and get instant cashback',
                type: 'apply',
            },
            {
                title: 'Save ₹100 on Annual Plan',
                desc: 'Subscribe to annual plan and save more',
                type: 'apply',
            },
        ],
    };

    return <UtilityBillBase config={cableTVConfig} />;
};

export default CableTVBillScreen;
