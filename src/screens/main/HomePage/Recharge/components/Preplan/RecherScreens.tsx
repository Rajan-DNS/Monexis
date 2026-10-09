import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, TextInput, Image, StyleSheet, Dimensions, Platform, PermissionsAndroid, Modal, FlatList, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Contacts from 'react-native-contacts';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useGetRechargeDataMutation, useGetRechargeOfffersMutation, useLazyGetOperatorQuery, useLazyGetCircleQuery } from '../../../../../../redux/services/RetailerServices/Recharge/RechargeAPI';
import { OperatorModal, CircleModal, SuccessModal } from './RechargeModals';
import { PostpaidBillCard } from '../Postplan/PostpaidBillCard';
import { RecentBills } from '../Postplan/RecentBills';
import { PopularPlans } from '../PopularPlans/PopularPlans';
import { RePopularPlans } from '../PopularPlans/RePopularPlans';
import { Colors } from '../../../../../../theme';
import { Poppins } from '../../../../../../theme/typography';
import { RootStackParamList } from '../../../../../../navigation/RootNavigator';

const { width } = Dimensions.get('window');
const baseUrl = 'https://webapi.monexis.store';

const schema = yup.object().shape({
    mobileNumber: yup
        .string()
        .required('Mobile number is required')
        .matches(/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits'),
    amount: yup
        .string()
        .required('Amount is required')
        .test('is-number', 'Amount must be a number', value => !isNaN(Number(value)))
        .test('min-amount', 'Minimum amount is ₹10', value => Number(value) >= 10),
});

const RechargeScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [activeTab, setActiveTab] = useState<'Prepaid' | 'Postpaid'>('Prepaid');
    const {
        control,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
        trigger
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            mobileNumber: '',
            amount: '',
        },
    });

    const mobileNumber = watch('mobileNumber');
    const amount = watch('amount');


    const [selectedOperator, setSelectedOperator] = useState<any>(null);
    const [selectedCircle, setSelectedCircle] = useState('Mumbai');
    const [plansData, setPlansData] = useState<any>(null);
    const [reData, setReData] = useState<any>(null);

    const [getRechargeData] = useGetRechargeDataMutation();
    const [getRechargeOfffers] = useGetRechargeOfffersMutation();

    const [getOperator, { data: operatorRawData }] = useLazyGetOperatorQuery();
    const [getCircle, { data: circleRawData }] = useLazyGetCircleQuery();

    useEffect(() => {
        getOperator({
            operatorTypeId: activeTab === 'Prepaid' ? 1 : 4,
        });

        getCircle();
    }, [activeTab,getOperator]);

    const operatorData = operatorRawData ? (Array.isArray(operatorRawData) ? operatorRawData : (operatorRawData.data || [])) : [];
    const circleData = circleRawData ? (Array.isArray(circleRawData) ? circleRawData : (circleRawData.data || [])) : [];

    useEffect(() => {
        if (mobileNumber && mobileNumber.length === 10) {
            fetchOperatorInfo(mobileNumber);
        }
    }, [mobileNumber]);

    useEffect(() => {
    if (operatorData.length > 0) {
        setSelectedOperator(operatorData[0]);
    } else {
        setSelectedOperator(null);
    }
}, [operatorData]);

    const fetchOperatorInfo = async (number: string) => {
        try {
            const response = await getRechargeData({ mobileNumber: number }).unwrap();
            if (response.success) {
                if (response.operatorName) {
                    const foundOp = operatorData.find((op: any) => op.name?.toLowerCase() === response.operatorName.toLowerCase() || op.operatorName?.toLowerCase() === response.operatorName.toLowerCase());
                    if (foundOp) {
                        setSelectedOperator(foundOp);
                    } else {
                        setSelectedOperator({
                            id: response.operatorId?.toString() || '0',
                            name: response.operatorName,
                            logo: operatorData.length > 0 ? operatorData[0].logoURL : undefined
                        });
                    }
                }
                if (response.circleName) {
                    setSelectedCircle(response.circleName);
                }
            }

            const offersResponse = await getRechargeOfffers({ mobileNumber: number }).unwrap();
            if (offersResponse.success && (offersResponse.otherPlans?.RDATA || offersResponse.rOffers?.RDATA)) {
                setPlansData(offersResponse.otherPlans?.RDATA || null);
                setReData(offersResponse.rOffers?.RDATA || null);
            } else if (response?.otherPlans?.RDATA) {
                setPlansData(response.otherPlans.RDATA);
            } else {
                setPlansData(null);
                setReData(null);
            }
        } catch (error) {
            console.error("Failed to fetch operator info or plans:", error);
            setPlansData(null);
            setReData(null);
        }
    };

    // UI states
    const [isOperatorModalVisible, setIsOperatorModalVisible] = useState(false);
    const [isCircleModalVisible, setIsCircleModalVisible] = useState(false);
    const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
    const [isOfferApplied, setIsOfferApplied] = useState(false);

    // Contact picker overlay state
    const [contactModalVisible, setContactModalVisible] = useState(false);
    const [allContacts, setAllContacts] = useState<any[]>([]);
    const [filteredContacts, setFilteredContacts] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const handlePickContact = async () => {
        try {
            if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
                    {
                        title: 'Contacts Permission',
                        message: 'This app needs access to your contacts to let you pick a number.',
                        buttonPositive: 'OK',
                    }
                );

                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    Alert.alert('Permission Denied', 'Contact permission was denied.');
                    return;
                }
            }

            const contactsList = await Contacts.getAll();
            const validContacts = contactsList.filter(c => c.phoneNumbers && c.phoneNumbers.length > 0);

            setAllContacts(validContacts);
            setFilteredContacts(validContacts);
            setContactModalVisible(true);
        } catch (error) {
            console.warn(error);
        }
    };

    const handleSearchContacts = (text: string) => {
        setSearchQuery(text);
        if (!text) {
            setFilteredContacts(allContacts);
            return;
        }

        const formattedQuery = text.toLowerCase();
        const filtered = allContacts.filter(contact => {
            const nameMatch = contact.displayName?.toLowerCase().includes(formattedQuery);
            const numberMatch = contact.phoneNumbers?.some((p: any) => {
                const numStr = p?.number ? String(p.number).replace(/\D/g, '') : '';
                return numStr.includes(formattedQuery);
            });
            return nameMatch || numberMatch;
        });
        setFilteredContacts(filtered);
    };

    const selectContactNumber = (rawNumber: any) => {
        const stringifiedNumber = String(rawNumber || '').trim();
        if (!stringifiedNumber) return;

        let cleanedNumber = stringifiedNumber.replace(/\D/g, '');
        if (cleanedNumber.length > 10) {
            cleanedNumber = cleanedNumber.slice(-10);
        }

        setValue('mobileNumber', cleanedNumber, { shouldValidate: true });
        setContactModalVisible(false);
        setSearchQuery('');
    };

    // Reset applied offer if amount drops below 199
    useEffect(() => {
        if (isOfferApplied && (Number(amount) < 199 || !amount)) {
            setIsOfferApplied(false);
        }
    }, [amount, isOfferApplied]);

    const handleApplyOffer = () => {
        const rechargeAmt = Number(amount);
        if (!rechargeAmt || isNaN(rechargeAmt)) {
            Alert.alert("Invalid Amount", "Please select or enter a recharge amount first.");
            return;
        }

        if (rechargeAmt < 199) {
            Alert.alert("Offer Not Applicable", "This special cashback offer is only applicable on recharges of ₹199 and above.");
            return;
        }

        setIsOfferApplied(true);
        Alert.alert("Offer Applied!", "Special Offer Flat ₹25 Cashback applied successfully on your recharge!");
    };

    const onFormSubmit = (data: any) => {
        navigation.navigate('PlanConfirmation', {
            mobileNumber: data.mobileNumber,
            amount: data.amount,
            operator: selectedOperator,
            circle: selectedCircle,
            isPostpaid: activeTab === 'Postpaid',
            plan: { rs: data.amount, desc: 'Custom Recharge Amount', validity: 'N/A' }
        });
    };

    const onSelectPlan = (plan: any) => {
        navigation.navigate('PlanConfirmation', {
            mobileNumber: mobileNumber,
            amount: plan.rs,
            operator: selectedOperator,
            circle: selectedCircle,
            isPostpaid: activeTab === 'Postpaid',
            plan: plan
        });
    };

    return (
        <View style={localStyles.screen}>
            {/* Custom Premium White Header */}
            <View style={localStyles.headerRow}>
                <View style={localStyles.headerLeft}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={localStyles.backBtn}>
                        <Ionicons name="arrow-back" size={26} color={Colors.textDark} />
                    </TouchableOpacity>
                    <Text style={localStyles.headerTitle}>Mobile Recharge</Text>
                </View>
                <TouchableOpacity
                    onPress={() => navigation.navigate('RechargeReport' as any)}
                    style={localStyles.historyBtn}
                >
                    <MaterialCommunityIcons name="history" size={18} color={Colors.textBody} style={{ marginRight: 4 }} />
                    <Text style={localStyles.historyBtnText}>History</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={localStyles.scrollView} showsVerticalScrollIndicator={false}>

                {/* Horizontal Promo Banners */}
                <View style={localStyles.promoRow}>
                    {/* Left Banner: Assured Cashback Banner */}
                    <View style={localStyles.cashbackBanner}>
                        <View style={localStyles.cashbackLeft}>
                            <Text style={localStyles.cashbackSub}>Recharge & Get Assured</Text>
                            <Text style={localStyles.cashbackTitle}>CASHBACK</Text>
                            <Text style={localStyles.cashbackPromo}>Upto <Text style={{ color: Colors.success }}>₹50</Text></Text>
                            <TouchableOpacity style={localStyles.viewOffersBtn} activeOpacity={0.8}>
                                <Text style={localStyles.viewOffersText}>View Offers</Text>
                                <Ionicons name="chevron-forward" size={10} color={Colors.white} style={{ marginLeft: 2 }} />
                            </TouchableOpacity>
                        </View>
                        {/* 3D Illustration inside banner */}
                        <View style={localStyles.illustrationContainer}>
                            <Image
                                source={require('../../../../../../Assets/img/DTH/rech.png')}
                                style={{ width: '100%', height: '100%' }}
                                resizeMode="contain"
                            />
                        </View>
                    </View>
                </View>

                {/* Prepaid / Postpaid Tab Switcher */}
                <View style={localStyles.tabContainer}>
                    <TouchableOpacity
                        style={[localStyles.tabBtn, activeTab === 'Prepaid' ? localStyles.activeTabBtn : null]}
                        onPress={() => {
                            setActiveTab('Prepaid');
                            setValue('amount', '');
                        }}
                        activeOpacity={0.8}
                    >
                        <MaterialCommunityIcons
                            name="cellphone"
                            size={20}
                            color={activeTab === 'Prepaid' ? Colors.white : Colors.textSecondary}
                            style={{ marginRight: 6 }}
                        />
                        <Text style={[localStyles.tabText, activeTab === 'Prepaid' ? localStyles.activeTabText : null]}>Prepaid</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[localStyles.tabBtn, activeTab === 'Postpaid' ? localStyles.activeTabBtn : null]}
                        onPress={() => {
                            setActiveTab('Postpaid');
                            setValue('amount', '549'); // default postpaid amount
                        }}
                        activeOpacity={0.8}
                    >
                        <MaterialCommunityIcons
                            name="file-document-outline"
                            size={20}
                            color={activeTab === 'Postpaid' ? Colors.white : Colors.textSecondary}
                            style={{ marginRight: 6 }}
                        />
                        <Text style={[localStyles.tabText, activeTab === 'Postpaid' ? localStyles.activeTabText : null]}>Postpaid</Text>
                    </TouchableOpacity>
                </View>

                {/* Unified Recharge Form Card */}
                <View style={localStyles.formCard}>

                    {/* Mobile Number Input */}
                    <Text style={localStyles.fieldLabel}>Mobile Number</Text>
                    <View style={[localStyles.inputWrapper, errors.mobileNumber && { borderColor: Colors.error }]}>
                        <MaterialCommunityIcons name="cellphone" size={20} color={Colors.textSecondary} style={{ marginRight: 10 }} />
                        <Controller
                            control={control}
                            name="mobileNumber"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    style={localStyles.textInput}
                                    placeholder="Enter 10 digit mobile number"
                                    keyboardType="phone-pad"
                                    maxLength={10}
                                    onBlur={onBlur}
                                    onChangeText={(text) => {
                                        onChange(text);
                                        if (text.length !== 10) {
                                            setPlansData(null);
                                            setReData(null);
                                        }
                                    }}
                                    value={value}
                                    placeholderTextColor={Colors.textMuted}
                                />
                            )}
                        />
                        <TouchableOpacity onPress={handlePickContact} activeOpacity={0.7} style={localStyles.contactsBtn}>
                            <MaterialCommunityIcons name="card-account-details-outline" size={22} color={Colors.primary} />
                        </TouchableOpacity>
                    </View>
                    {errors.mobileNumber && (
                        <Text style={localStyles.errorText}>{errors.mobileNumber.message}</Text>
                    )}

                    {/* Operator and Circle Side-by-side columns */}
                    <View style={localStyles.twoColRow}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <Text style={localStyles.fieldLabel}>Operator</Text>
                            <TouchableOpacity
                                style={localStyles.dropdownWrapper}
                                onPress={() => setIsOperatorModalVisible(true)}
                                activeOpacity={0.7}
                            >
                                <View style={localStyles.operatorLogoSmall}>
                                    {selectedOperator?.logoURL ? (
                                        <Image source={{ uri: `${baseUrl}${selectedOperator.logoURL}` }} style={localStyles.opLogo} resizeMode='cover' />
                                    ) : (
                                        <Text style={localStyles.operatorInitial}>
                                            {(selectedOperator?.name || selectedOperator?.operatorName)?.charAt(0).toUpperCase()}
                                        </Text>
                                    )}
                                </View>
                                <Text style={localStyles.dropdownText} numberOfLines={1}>
                                    {selectedOperator?.name || selectedOperator?.operatorName || 'Operator'}
                                </Text>
                                <MaterialCommunityIcons name="chevron-down" size={16} color={Colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <View style={{ flex: 1, marginLeft: 8 }}>
                            <Text style={localStyles.fieldLabel}>Circle</Text>
                            <TouchableOpacity
                                style={localStyles.dropdownWrapper}
                                onPress={() => setIsCircleModalVisible(true)}
                                activeOpacity={0.7}
                            >
                                <MaterialCommunityIcons name="map-marker-outline" size={20} color={Colors.primary} style={{ marginRight: 6 }} />
                                <Text style={localStyles.dropdownText} numberOfLines={1}>
                                    {selectedCircle}
                                </Text>
                                <MaterialCommunityIcons name="chevron-down" size={16} color={Colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {activeTab === 'Prepaid' ? (
                        <>
                            {/* Prepaid Amount Input Section */}
                            <Text style={localStyles.fieldLabel}>Amount</Text>
                            <View style={[localStyles.inputWrapper, errors.amount && { borderColor: Colors.error }]}>
                                <Text style={{ fontSize: 20, fontFamily: Poppins.bold, color: Colors.primary, marginRight: 10 }}>₹</Text>
                                <Controller
                                    control={control}
                                    name="amount"
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            style={localStyles.textInput}
                                            placeholder="Enter Amount"
                                            keyboardType="numeric"
                                            onBlur={onBlur}
                                            onChangeText={(text) => {
                                                onChange(text);
                                                setIsOfferApplied(false); // Reset offer apply on manual edits
                                            }}
                                            value={value}
                                            placeholderTextColor={Colors.textMuted}
                                        />
                                    )}
                                />
                            </View>
                            {errors.amount && (
                                <Text style={localStyles.errorText}>{errors.amount.message}</Text>
                            )}

                            {/* Special Offer Flat Cashback Banner */}
                            {/* <View style={localStyles.offerBanner}> */}
                            {/* <MaterialCommunityIcons name="gift-outline" size={24} color={Colors.success} /> */}
                            {/* <View style={localStyles.offerTextContainer}>
                                    <Text style={localStyles.offerTextTitle}>Special Offer! Flat ₹25 Cashback</Text>
                                    <Text style={localStyles.offerTextSubtitle}>on recharge of ₹199 and above</Text>
                                </View> */}
                            {/* <TouchableOpacity
                                    style={[
                                        localStyles.applyOfferBtn,
                                        isOfferApplied ? localStyles.applyOfferBtnApplied : null
                                    ]}
                                    onPress={handleApplyOffer}
                                    activeOpacity={0.8}
                                >
                                    <MaterialCommunityIcons
                                        name={isOfferApplied ? "check" : "tag-outline"}
                                        size={12}
                                        color={isOfferApplied ? Colors.white : Colors.success}
                                        style={{ marginRight: 3 }}
                                    />
                                    <Text style={[
                                        localStyles.applyOfferText,
                                        isOfferApplied ? localStyles.applyOfferTextApplied : null
                                    ]}>
                                        {isOfferApplied ? "Applied" : "Apply Offer"}
                                    </Text>
                                </TouchableOpacity>
                            </View> */}

                            {/* Proceed to Recharge Action */}
                            <TouchableOpacity
                                style={localStyles.proceedBtn}
                                onPress={handleSubmit(onFormSubmit)}
                                activeOpacity={0.8}
                            >
                                <Text style={localStyles.proceedBtnText}>Proceed to Recharge</Text>
                                <Ionicons name="arrow-forward" size={20} color={Colors.white} style={{ marginLeft: 6 }} />
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            {/* Postpaid Specific Layout */}
                            <View style={{ marginTop: 20 }}>
                                <PostpaidBillCard
                                    amount="549"
                                    dueDate="15 Nov 2023"
                                    onRechargeNow={() => {
                                        trigger('mobileNumber').then((isValid) => {
                                            if (isValid) {
                                                navigation.navigate('PlanConfirmation', {
                                                    mobileNumber,
                                                    amount: '549',
                                                    operator: selectedOperator,
                                                    circle: selectedCircle,
                                                    isPostpaid: true,
                                                    plan: { rs: '549', desc: 'Postpaid Monthly Bill Payment', validity: 'Current Bill' }
                                                });
                                            } else {
                                                Alert.alert("Required", "Please enter a valid 10-digit mobile number first.");
                                            }
                                        });
                                    }}
                                />
                                <RecentBills data={[]} />
                            </View>
                        </>
                    )}

                    {/* Footer Security Badges inside form container */}
                    <View style={localStyles.footerBadges}>
                        <View style={localStyles.footerBadgeItem}>
                            <View style={localStyles.badgeIconCircle}>
                                <MaterialCommunityIcons name="shield-check-outline" size={24} color={Colors.primary} />
                            </View>
                            <View style={localStyles.badgeTextContainer}>
                                <Text style={localStyles.badgeText} numberOfLines={1}>100% Secure</Text>
                                <Text style={localStyles.badgeSubText} numberOfLines={1}>Safe Transactions</Text>
                            </View>
                        </View>

                        <View style={localStyles.footerVerticalDivider} />

                        <View style={localStyles.footerBadgeItem}>
                            <View style={localStyles.badgeIconCircle}>
                                <MaterialCommunityIcons name="flash-outline" size={24} color={Colors.primary} />
                            </View>
                            <View style={localStyles.badgeTextContainer}>
                                <Text style={localStyles.badgeText} numberOfLines={1}>Instant Recharge</Text>
                                <Text style={localStyles.badgeSubText} numberOfLines={1}>Quick & Reliable</Text>
                            </View>
                        </View>

                        <View style={localStyles.footerVerticalDivider} />

                        <View style={localStyles.footerBadgeItem}>
                            <View style={localStyles.badgeIconCircle}>
                                <MaterialCommunityIcons name="check-decagram-outline" size={24} color={Colors.primary} />
                            </View>
                            <View style={localStyles.badgeTextContainer}>
                                <Text style={localStyles.badgeText} numberOfLines={1}>Best Prices</Text>
                                <Text style={localStyles.badgeSubText} numberOfLines={1}>Unbeatable Deals</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Popular plans & recommended offers underneath the form card in Prepaid */}
                {activeTab === 'Prepaid' && (
                    <View style={{ paddingVertical: 10 }}>
                        <RePopularPlans data={reData} onSelectPlan={onSelectPlan} />
                        <PopularPlans data={plansData} onSelectPlan={onSelectPlan} />
                    </View>
                )}

                {/* Quick Actions Row */}
                <View style={localStyles.quickActionsRow}>
                    <TouchableOpacity style={localStyles.quickActionBtn} activeOpacity={0.7}>
                        <View style={[localStyles.quickIconCircle, { backgroundColor: '#F3E8FF' }]}>
                            <Ionicons name="flash" size={20} color="#8B5CF6" />
                        </View>
                        <Text style={localStyles.quickActionText}>Instant{"\n"}Recharge</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={localStyles.quickActionBtn} activeOpacity={0.7} onPress={() => {
                        if (plansData || reData) {
                            Alert.alert("Offers", "Dynamic plans and recommended offers have been loaded below the form.");
                        } else {
                            Alert.alert("Best Offers", "Enter your mobile number to view customized offers.");
                        }
                    }}>
                        <View style={[localStyles.quickIconCircle, { backgroundColor: '#DCFCE7' }]}>
                            <MaterialCommunityIcons name="percent" size={20} color={Colors.success} />
                        </View>
                        <Text style={localStyles.quickActionText}>Best{"\n"}Offers</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={localStyles.quickActionBtn} activeOpacity={0.7}>
                        <View style={[localStyles.quickIconCircle, { backgroundColor: '#FFEDD5' }]}>
                            <MaterialCommunityIcons name="calendar-clock" size={20} color="#F97316" />
                        </View>
                        <Text style={localStyles.quickActionText}>Auto{"\n"}Recharge</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={localStyles.quickActionBtn} activeOpacity={0.7} onPress={() => Alert.alert("Refer & Earn", "Share your referral code and earn ₹50 cashback per registration.")}>
                        <View style={[localStyles.quickIconCircle, { backgroundColor: '#FCE7F3' }]}>
                            <MaterialCommunityIcons name="heart-outline" size={20} color="#EC4899" />
                        </View>
                        <Text style={localStyles.quickActionText}>Refer &{"\n"}Earn</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Operator Dropdown Modal */}
            <OperatorModal
                visible={isOperatorModalVisible}
                onClose={() => setIsOperatorModalVisible(false)}
                data={operatorData}
                selectedId={selectedOperator?.id || selectedOperator?.operatorId}
                onSelect={(item) => {
                    setSelectedOperator(item);
                    setIsOperatorModalVisible(false);
                }}
            />

            {/* Circle Dropdown Modal */}
            <CircleModal
                visible={isCircleModalVisible}
                onClose={() => setIsCircleModalVisible(false)}
                data={circleData}
                selected={selectedCircle}
                onSelect={(circle) => {
                    setSelectedCircle(circle);
                    setIsCircleModalVisible(false);
                }}
            />

            {/* Success Details Modal */}
            <SuccessModal
                visible={isSuccessModalVisible}
                onClose={() => setIsSuccessModalVisible(false)}
                mobileNumber={mobileNumber}
                amount={activeTab === 'Prepaid' ? amount : "549"}
                operatorName={selectedOperator?.name || selectedOperator?.operatorName || ''}
            />

            {/* Contacts Picker Overlay Modal */}
            <Modal visible={contactModalVisible} animationType="slide" transparent={true}>
                <View style={localStyles.contactsModalOverlay}>
                    <View style={localStyles.contactsModalContainer}>
                        <View style={localStyles.contactsModalHeader}>
                            <Text style={localStyles.contactsModalTitle}>Select Contact</Text>
                            <TouchableOpacity onPress={() => setContactModalVisible(false)}>
                                <Ionicons name="close" size={24} color={Colors.textDark} />
                            </TouchableOpacity>
                        </View>

                        <View style={localStyles.contactsSearchWrapper}>
                            <Ionicons name="search" size={20} color={Colors.textSecondary} style={{ marginRight: 8 }} />
                            <TextInput
                                style={localStyles.contactsSearchInput}
                                placeholder="Search by name or number..."
                                value={searchQuery}
                                onChangeText={handleSearchContacts}
                                placeholderTextColor={Colors.textMuted}
                            />
                        </View>

                        <FlatList
                            data={[...filteredContacts].sort((a, b) => {
                                const nameA = (a.displayName || '').toLowerCase();
                                const nameB = (b.displayName || '').toLowerCase();
                                return nameA.localeCompare(nameB);
                            })}
                            keyExtractor={(item, index) => item.recordID || String(index)}
                            renderItem={({ item }) => {
                                const phone = item.phoneNumbers?.[0];

                                if (!phone) return null;

                                return (
                                    <TouchableOpacity
                                        style={localStyles.contactCardItem}
                                        onPress={() => selectContactNumber(phone.number)}
                                    >
                                        <Text style={localStyles.contactNameText}>
                                            {item.displayName || 'Unknown Contact'}
                                        </Text>

                                        <Text style={localStyles.contactNumberText}>
                                            {phone.number}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            }}
                            ListEmptyComponent={
                                <Text style={localStyles.contactsEmptyText}>No contacts matched your search.</Text>
                            }
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const localStyles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: Colors.bgSurface,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 10 : 14,
        paddingBottom: 14,
        backgroundColor: Colors.bgSurface,
        borderBottomWidth: 1,
        borderColor: Colors.divider,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backBtn: {
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: Poppins.bold,
        color: Colors.textDark,
    },
    historyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.divider,
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: Colors.bgLightest,
    },
    historyBtnText: {
        fontSize: 12,
        fontFamily: Poppins.semiBold,
        color: Colors.textSecondary,
    },
    scrollView: {
        flex: 1,
        backgroundColor: Colors.bg,
    },
    promoRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginTop: 16,
        justifyContent: 'space-between',
    },
    cashbackBanner: {
        width: '100%',
        backgroundColor: Colors.infoBg,
        borderRadius: 20,
        paddingHorizontal: Platform.OS === 'ios' ? 20 : 20,
        borderWidth: 1,
        borderColor: Colors.infoLight,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        // gap: 10,
    },
    cashbackLeft: {
        zIndex: 2,
        flex: 1,
    },
    cashbackSub: {
        fontSize: 12,
        fontFamily: Poppins.medium,
        color: Colors.textBody,
    },
    cashbackTitle: {
        fontSize: 16,
        fontFamily: Poppins.bold,
        color: Colors.primary,
        marginVertical: 1,
        letterSpacing: 0.5,
    },
    cashbackPromo: {
        fontSize: 16,
        fontFamily: Poppins.bold,
        color: Colors.textDark,
    },
    viewOffersBtn: {
        backgroundColor: Colors.primary,
        borderRadius: 12,
        paddingHorizontal: 20,
        paddingVertical: 12,
        alignSelf: 'flex-start',
        marginTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    viewOffersText: {
        color: Colors.white,
        fontSize: 12,
        fontFamily: Poppins.bold,
    },
    illustrationContainer: {
        height: 200,
        width: 200,
    },
    phoneIcon: {
        position: 'absolute',
        right: 15,
        bottom: 10,
        opacity: 0.85,
    },
    walletIcon: {
        position: 'absolute',
        right: 5,
        bottom: 5,
        zIndex: 3,
    },
    arrowIcon: {
        position: 'absolute',
        right: 48,
        bottom: 40,
        zIndex: 4,
    },
    coinsIcon: {
        position: 'absolute',
        right: 5,
        top: 15,
    },
    dotsRow: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 10,
        left: 16,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: Colors.textMuted,
        marginRight: 4,
    },
    activeDot: {
        width: 12,
        backgroundColor: Colors.primary,
    },
    couponCard: {
        width: '34%',
        backgroundColor: Colors.bgSurface,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.divider,
        padding: 12,
        alignItems: 'flex-start',
    },
    couponIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    couponTitle: {
        fontSize: 12,
        fontFamily: Poppins.bold,
        color: Colors.textDark,
    },
    couponDesc: {
        fontSize: 12,
        fontFamily: Poppins.regular,
        color: Colors.textSecondary,
        marginTop: 1,
        lineHeight: 12,
    },
    couponLink: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    couponLinkText: {
        fontSize: 12,
        fontFamily: Poppins.bold,
        color: Colors.textLink,
    },
    quickActionsRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginTop: 20,
        justifyContent: 'space-between',
        borderRadius: 10,
        backgroundColor: Colors.bgLightest,
        paddingVertical: 16,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: Colors.divider,
        padding: 12,
        marginHorizontal: 16,
        gap: 4,
        marginBottom: 12,
    },
    quickActionBtn: {
        alignItems: 'center',
        width: '22%',
    },
    quickIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    quickActionText: {
        fontSize: 12,
        fontFamily: Poppins.medium,
        color: Colors.textBody,
        textAlign: 'center',
        lineHeight: 14,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: Colors.divider,
        borderRadius: 30,
        padding: 4,
        marginHorizontal: 16,
        marginVertical: 18,
        height: 52,
        alignItems: 'center',
    },
    tabBtn: {
        flex: 1,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        borderRadius: 26,
    },
    activeTabBtn: {
        backgroundColor: Colors.primary,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 3,
    },
    tabText: {
        fontSize: 16,
        fontFamily: Poppins.bold,
        color: Colors.textSecondary,
    },
    activeTabText: {
        color: Colors.white,
    },
    formCard: {
        backgroundColor: Colors.bgSurface,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: Colors.divider,
        marginHorizontal: 16,
        padding: 16,
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2,
    },
    fieldLabel: {
        fontSize: 12,
        fontFamily: Poppins.bold,
        color: Colors.textBody,
        marginBottom: 6,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.divider,
        borderRadius: 12,
        paddingHorizontal: 14,
        height: 50,
        backgroundColor: Colors.bgSurface,
        marginBottom: 16,
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        fontFamily: Poppins.medium,
        color: Colors.textDark,
        paddingVertical: 0,
    },
    contactsBtn: {
        padding: 4,
    },
    twoColRow: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    dropdownWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.divider,
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 50,
        backgroundColor: Colors.bgSurface,
    },
    operatorLogoSmall: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: Colors.bgLightest,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        overflow: 'hidden',
    },
    opLogo: {
        width: '100%',
        height: '100%',
    },
    dropdownText: {
        flex: 1,
        fontSize: 16,
        fontFamily: Poppins.medium,
        color: Colors.textDark,
    },
    errorText: {
        color: Colors.error,
        fontSize: 12,
        fontFamily: Poppins.medium,
        marginTop: -10,
        marginBottom: 14,
    },
    offerBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.successLight,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: Colors.badgeSuccessBg,
        borderStyle: 'dashed',
        padding: 12,
        marginBottom: 16,
    },
    offerTextContainer: {
        flex: 1,
        marginLeft: 10,
    },
    offerTextTitle: {
        fontSize: 12,
        fontFamily: Poppins.bold,
        color: Colors.successDark,
    },
    offerTextSubtitle: {
        fontSize: 12,
        fontFamily: Poppins.medium,
        color: Colors.successDark,
        marginTop: 1,
    },
    applyOfferBtn: {
        borderWidth: 1,
        borderColor: Colors.success,
        borderStyle: 'dashed',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        flexDirection: 'row',
        alignItems: 'center',
    },
    applyOfferBtnApplied: {
        backgroundColor: Colors.success,
        borderStyle: 'solid',
    },
    applyOfferText: {
        fontSize: 12,
        fontFamily: Poppins.bold,
        color: Colors.success,
    },
    applyOfferTextApplied: {
        color: Colors.white,
    },
    proceedBtn: {
        backgroundColor: Colors.primary,
        borderRadius: 12,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 4,
        marginTop: 10,
    },
    proceedBtnText: {
        color: Colors.white,
        fontSize: 16,
        fontFamily: Poppins.bold,
    },
    footerBadges: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 12,
        paddingVertical: 16,
        backgroundColor: '#fff',
    },
    footerBadgeItem: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    badgeIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0, 0, 0, 0.04)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
    },
    badgeTextContainer: {
        alignItems: 'center',
        width: '100%',
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1a1a1a',
        textAlign: 'center',
    },
    badgeSubText: {
        fontSize: 8,
        fontWeight: '400',
        color: '#757575',
        textAlign: 'center',
        marginTop: 2,
    },
    footerVerticalDivider: {
        width: 1,
        height: 32,
        backgroundColor: '#E0E0E0',
        marginHorizontal: 2,
    },


    contactsModalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    contactsModalContainer: {
        backgroundColor: Colors.bgSurface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '75%',
        padding: 16,
    },
    contactsModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    contactsModalTitle: {
        fontSize: 16,
        fontFamily: Poppins.bold,
        color: Colors.textDark,
    },
    contactsSearchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.divider,
        borderRadius: 10,
        paddingHorizontal: 12,
        height: 46,
        marginBottom: 16,
    },
    contactsSearchInput: {
        flex: 1,
        fontSize: 16,
        fontFamily: Poppins.medium,
        color: Colors.textDark,
        paddingVertical: 0,
    },
    contactCardItem: {
        borderBottomWidth: 1,
        borderBottomColor: Colors.divider,
        paddingVertical: 12,
    },
    contactNameText: {
        fontSize: 16,
        fontFamily: Poppins.bold,
        color: Colors.textDark,
        marginBottom: 4,
    },
    contactNumberRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
        paddingLeft: 4,
    },
    contactNumberText: {
        fontSize: 16,
        fontFamily: Poppins.medium,
        color: Colors.textBody,
    },
    contactsEmptyText: {
        textAlign: 'center',
        color: Colors.textMuted,
        marginTop: 40,
        fontSize: 16,
        fontFamily: Poppins.medium,
    },
    operatorInitial: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.primary, // Uses your primary theme color
        // padding: 10
    },

});

export default RechargeScreen;
