import { RECENT_Electricity, RECENT_DTH, RECENT_Gas, RECENT_Broadband, RECENT_Water, RECENT_Fastag, RECENT_GasBooking } from './rechargeData';
// ... other imports

export const BROADBAND_CONFIG: UtilityConfig = {
    type: 'Broadband',
    title: 'Broadband',
    operatorLabel: 'OPERATOR',
    consumerLabel: 'CUSTOMER ID / ACCOUNT NUMBER',
    placeholder: 'e.g. 12345678901',
    icon: 'router-wireless',
    bannerTitle: 'Reward Unlocked',
    bannerDesc: 'You earned 50 Tap Coins on your broadband payment.',
    bannerIcon: 'star',
    recentData: RECENT_Broadband,
    nextScreen: 'BroadbandBill',
};

export const BROADBAND_BILL_CONFIG: BillConfig = {
    title: 'Broadband Recharge',
    operatorName: 'Airtel Broadband',
    operatorIcon: 'router-wireless',
    consumerLabel: 'Consumer ID',
    consumerValue: '9876543210',
    validity: 'Oct 2023 Cycle',
    currentAmount: '799.00',
    plans: [
        { price: '499.00', validity: 'Fiber Basic (40 Mbps)', tag: 'Popular' },
        { price: '799.00', validity: 'Fiber Value (100 Mbps)', tag: 'Best Value' },
        { price: '1499.00', validity: 'Fiber Professional (300 Mbps)' },
    ],
    nextScreen: 'BroadbandPay',
};

export const BROADBAND_PAY_CONFIG: PayConfig = {
    title: 'Payment Successful',
    successMessage: 'Your Recharge has been successful',
    amount: '799.00',
    operatorName: 'Airtel Broadband',
    operatorIcon: 'router-wireless',
    details: [
        { label: 'Consumer ID', value: '9876543210' },
        { label: 'Billing Cycle', value: 'Oct 2023' },
        { label: 'Transaction ID', value: 'TXN123456789' },
        { label: 'Date & Time', value: '25 Oct 2023, 10:30 AM' },
    ],
};
// ... other imports

export const GAS_CONFIG: UtilityConfig = {
    type: 'Gas',
    title: 'Gas Pipeline',
    operatorLabel: 'OPERATOR',
    consumerLabel: 'CONSUMER NUMBER',
    placeholder: 'e.g. 12345678901',
    icon: 'fire',
    bannerTitle: 'First Bill Offer',
    bannerDesc: 'Get up to ₹150 Cashback on your first gas payment.',
    bannerIcon: 'gift',
    recentData: RECENT_Gas,
    nextScreen: 'GasBill',
};

export const GAS_BILL_CONFIG: BillConfig = {
    title: 'Gas Bill',
    operatorName: 'Indraprastha Gas',
    operatorIcon: 'fire',
    consumerLabel: 'Consumer ID',
    consumerValue: '1000192837',
    validity: 'Oct 2023 Cycle',
    currentAmount: '1,240.00',
    plans: [
        { price: '1,240.00', validity: 'Current Bill' },
        { price: '0.00', validity: 'Previous Dues' },
    ],
    nextScreen: 'GasPay',
};

export const GAS_PAY_CONFIG: PayConfig = {
    title: 'Payment Successful',
    successMessage: 'Your Indraprastha Gas bill has been paid',
    amount: '1,240.00',
    operatorName: 'Indraprastha Gas',
    operatorIcon: 'fire',
    details: [
        { label: 'Consumer ID', value: '1000192837' },
        { label: 'Billing Cycle', value: 'Oct 2023' },
        { label: 'Transaction ID', value: 'TXN123456789' },
        { label: 'Date & Time', value: '24 Oct 2023, 02:15 PM' },
    ],
};
import { UtilityConfig } from '../screens/main/HomePage/Recharge/components/UtilityBase/UtilityRechargeBase';
import { BillConfig } from '../screens/main/HomePage/Recharge/components/UtilityBase/UtilityBillBase';
import { PayConfig } from '../screens/main/HomePage/Recharge/components/UtilityBase/UtilityPayBase';

export const ELECTRICITY_CONFIG: UtilityConfig = {
    type: 'Electricity',
    title: 'Electricity Recharge',
    operatorLabel: 'ELECTRICITY OPERATOR',
    consumerLabel: 'CONSUMER NUMBER',
    placeholder: 'e.g. 12345678901',
    icon: 'lightning-bolt',
    bannerTitle: 'Auto-Pay Bills',
    bannerDesc: 'Never miss a due date. Enable smart auto-pay.',
    bannerIcon: 'bell',
    recentData: RECENT_Electricity,
    nextScreen: 'ElectricityBill',
};

export const DTH_CONFIG: UtilityConfig = {
    type: 'DTH',
    title: 'DTH Recharge',
    operatorLabel: 'DTH OPERATOR',
    consumerLabel: 'SUBSCRIBER ID / VC NUMBER',
    placeholder: 'e.g. 123456789',
    icon: 'television',
    bannerTitle: 'Auto-Recharge DTH',
    bannerDesc: 'Never miss your favorite shows. Enable auto-recharge.',
    bannerIcon: 'television-play',
    recentData: RECENT_DTH,
    nextScreen: 'DTHBill',
};

export const ELECTRICITY_BILL_CONFIG: BillConfig = {
    title: 'Electricity Bill',
    operatorName: 'Tata Power',
    operatorIcon: 'lightning-bolt',
    consumerLabel: 'Consumer Number',
    consumerValue: '9876 5432 1098',
    validity: 'DUE IN 5 DAYS',
    currentAmount: '2,450.00',
    plans: [
        { price: '2,450.00', validity: 'Current Bill' },
        { price: '1,800.00', validity: 'Previous Dues' },
    ],
    nextScreen: 'ElectricityPay',
};

export const DTH_BILL_CONFIG: BillConfig = {
    title: 'DTH Recharge',
    operatorName: 'Tata Play',
    operatorIcon: 'television',
    consumerLabel: 'Subscriber ID',
    consumerValue: '3029184756',
    validity: '28 DAYS',
    currentAmount: '349.00',
    plans: [
        { price: '499.00', validity: '3 Months Validity', tag: 'Trending' },
        { price: '999.00', validity: '6 Months Validity', tag: 'Best Value' },
        { price: '349.00', validity: '1 Month Validity' },
    ],
    nextScreen: 'DTHPay',
};

export const ELECTRICITY_PAY_CONFIG: PayConfig = {
    title: 'Payment Successful',
    successMessage: 'Your electricity bill has been paid',
    amount: '2,450.00',
    operatorName: 'Tata Power - Mumbai',
    operatorIcon: 'lightning-bolt',
    details: [
        { label: 'Consumer Number', value: '12345678901' },
        { label: 'Transaction ID', value: 'TXN902341108' },
        { label: 'Date & Time', value: '24 Oct 2023, 02:15 PM' },
    ],
};

export const DTH_PAY_CONFIG: PayConfig = {
    title: 'Recharge Successful',
    successMessage: 'Your DTH account has been recharged',
    amount: '350.00',
    operatorName: 'Tata Play',
    operatorIcon: 'television',
    details: [
        { label: 'Subscriber ID', value: '1234567890' },
        { label: 'Transaction ID', value: 'DTH902341108' },
        { label: 'Date & Time', value: '24 Oct 2023, 04:30 PM' },
    ],
};

export const WATER_CONFIG: UtilityConfig = {
    type: 'Water',
    title: 'Water Bill',
    operatorLabel: 'OPERATOR',
    consumerLabel: 'CONSUMER NUMBER',
    placeholder: 'e.g. 12345678901',
    icon: 'water',
    bannerTitle: 'Save Water',
    bannerDesc: 'Pay your water bill on time and get exclusive rewards.',
    bannerIcon: 'water-pump',
    recentData: RECENT_Water,
    nextScreen: 'WaterBill',
};

export const WATER_BILL_CONFIG: BillConfig = {
    title: 'Water Bill',
    operatorName: 'Delhi Jal Board',
    operatorIcon: 'water',
    consumerLabel: 'Consumer ID',
    consumerValue: '1029384756',
    validity: 'Oct 2023 Cycle',
    currentAmount: '842.00',
    plans: [
        { price: '842.00', validity: 'Current Bill' },
        { price: '0.00', validity: 'Previous Dues' },
    ],
    nextScreen: 'WaterPay',
    insights: {
        avgMonthly: '1,100',
        dueDate: '12 Oct',
    },
};

export const WATER_PAY_CONFIG: PayConfig = {
    title: 'Payment Successful',
    successMessage: 'Your Delhi Jal Board bill has been paid',
    amount: '842.00',
    operatorName: 'Delhi Jal Board',
    operatorIcon: 'water',
    details: [
        { label: 'Consumer ID', value: '1029384756' },
        { label: 'Billing Cycle', value: 'Oct 2023' },
        { label: 'Transaction ID', value: 'TXN90284711049' },
        { label: 'Date & Time', value: '24 Oct 2023, 11:42 AM' },
        { label: 'Payment Mode', value: 'NextGen Wallet' },
    ],
    similarPayments: [
        { label: 'Water Bill', subLabel: 'MCGM Mumbai', icon: 'water-pump' },
        { label: 'Broadband', subLabel: 'JioFiber', icon: 'router-wireless' },
    ],
};

export const FASTAG_CONFIG: UtilityConfig = {
    type: 'Fastag' as any,
    title: 'FastTag',
    operatorLabel: 'OPERATOR',
    consumerLabel: 'VEHICLE REGISTRATION NUMBER',
    placeholder: 'e.g. MH 12 AB 1234',
    icon: 'car',
    bannerTitle: 'Toll-Free Travel',
    bannerDesc: 'Recharge your FastTag and enjoy smooth highway travel.',
    bannerIcon: 'car-connected',
    recentData: RECENT_Fastag,
    nextScreen: 'FastagBill' as any,
};

export const FASTAG_BILL_CONFIG: BillConfig = {
    title: 'FastTag Recharge',
    operatorName: 'ICICI Bank',
    operatorIcon: 'bank',
    consumerLabel: 'Vehicle Number',
    consumerValue: '1029384756',
    validity: 'Oct 2023 Cycle',
    currentAmount: '500.00',
    plans: [
        { price: '100', validity: '+ ₹100' },
        { price: '500', validity: '+ ₹500' },
        { price: '1,000', validity: '+ ₹1,000' },
    ],
    nextScreen: 'FastagPay' as any,
    offers: [
        { title: 'Get 10% Cashback up to ₹50', desc: 'On your first FASTag recharge of the month', type: 'apply' },
        { title: 'Flat ₹25 off', desc: 'Using ICICI Bank Credit Cards', type: 'apply' },
    ],
};

export const FASTAG_PAY_CONFIG: PayConfig = {
    title: 'Payment Successful',
    successMessage: 'Your FastTag recharge has been paid',
    amount: '500.00',
    operatorName: 'ICICI Bank FastTag',
    operatorIcon: 'bank',
    details: [
        { label: 'Vehicle Number', value: 'MH 12 AB 1234' },
        { label: 'Transaction ID', value: 'TXN8029311049' },
        { label: 'Date & Time', value: '24 Oct 2023, 11:45 AM' },
        { label: 'Payment Mode', value: 'NextGen Wallet' },
    ],
    rewards: [
        { label: 'New Balance', value: '₹1,240.00', color: '#1A1D2E', icon: 'wallet' },
        { label: 'Loyalty Points', value: '+15 pts', color: '#E67E22', icon: 'star' },
    ],
};

export const GAS_BOOKING_CONFIG: UtilityConfig = {
    type: 'Gas' as any,
    title: 'Gas Booking',
    operatorLabel: 'OPERATOR',
    consumerLabel: 'CONSUMER NUMBER',
    placeholder: 'e.g. 12345678901',
    icon: 'fire',
    bannerTitle: 'Gas Refill',
    bannerDesc: 'Book your gas cylinder instantly and get it delivered at your doorstep.',
    bannerIcon: 'fire-truck',
    recentData: RECENT_GasBooking,
    nextScreen: 'GasBookingBill' as any,
};

export const GAS_BOOKING_BILL_CONFIG: BillConfig = {
    title: 'Gas Booking',
    operatorName: 'Indane Gas',
    operatorIcon: 'fire',
    consumerLabel: 'Consumer ID',
    consumerValue: '9844012234',
    validity: 'Oct 2023 Cycle',
    currentAmount: '1,053.00',
    plans: [
        { price: '100', validity: '+ ₹100' },
        { price: '500', validity: '+ ₹500' },
        { price: '1,000', validity: '+ ₹1,000' },
    ],
    nextScreen: 'GasBookingPay' as any,
    priceBreakdown: [
        { label: 'Cylinder Price', value: '980.00' },
        { label: 'Delivery Charges', value: '50.00' },
        { label: 'Taxes & GST (18%)', value: '23.00' },
    ],
    deliverySlots: [
        { title: 'TOMORROW', time: '09:00 AM - 12:00 PM', selected: true },
        { title: 'TOMORROW', time: '02:00 PM - 05:00 PM' },
    ],
};

export const GAS_BOOKING_PAY_CONFIG: PayConfig = {
    title: 'Payment Successful',
    successMessage: 'Your booking has been Confirmed',
    amount: '1,053.00',
    operatorName: 'Indane Gas',
    operatorIcon: 'fire',
    details: [
        { label: 'Consumer ID', value: '9844012234' },
        { label: 'Booking ID', value: 'BK-77492831' },
        { label: 'Transaction ID', value: 'TXN9028475510' },
        { label: 'ESTIMATED DELIVERY', value: 'Tomorrow, 12 Oct' },
        { label: 'Payment Mode', value: 'NextGen Wallet' },
    ],
    rewards: [
        { label: 'New Balance', value: '₹1,240.00', color: '#1A1D2E', icon: 'wallet' },
        { label: 'Loyalty Points', value: '+15 pts', color: '#E67E22', icon: 'star' },
    ],
};


export const LANDLINE_CONFIG: UtilityConfig = {
    type: 'Landline',
    title: 'Landline',
    operatorLabel: 'OPERATOR',
    consumerLabel: 'TELEPHONE NUMBER / ACCOUNT NUMBER',
    placeholder: 'e.g. 0112345678',
    icon: 'phone-classic',
    bannerTitle: 'Reward Unlocked',
    bannerDesc: 'You earned 50 Tap Coins on your landline payment.',
    bannerIcon: 'star',
    recentData: RECENT_Broadband,
    nextScreen: 'LandlineBill',
};

export const LANDLINE_BILL_CONFIG: BillConfig = {
    title: 'Landline Bill',
    operatorName: 'Airtel Landline',
    operatorIcon: 'phone-classic',
    consumerLabel: 'Telephone No',
    consumerValue: '0112345678',
    validity: 'Oct 2023 Cycle',
    currentAmount: '599.00',
    plans: [
        { price: '499.00', validity: 'Basic Plan', tag: 'Popular' },
        { price: '599.00', validity: 'Value Plan', tag: 'Best Value' },
        { price: '999.00', validity: 'Premium Plan' },
    ],
    nextScreen: 'LandlinePay',
};

export const LANDLINE_PAY_CONFIG: PayConfig = {
    title: 'Payment Successful',
    successMessage: 'Your Recharge has been successful',
    amount: '599.00',
    operatorName: 'Airtel Landline',
    operatorIcon: 'phone-classic',
    details: [
        { label: 'Telephone No', value: '0112345678' },
        { label: 'Billing Cycle', value: 'Oct 2023' },
        { label: 'Transaction ID', value: 'TXN123456789' },
        { label: 'Date & Time', value: '25 Oct 2023, 10:30 AM' },
    ],
};
