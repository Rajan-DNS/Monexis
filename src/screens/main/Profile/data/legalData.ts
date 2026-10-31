export interface LegalSection {
  id: string;
  number: string;
  title: string;
  icon: string;
  tag: string;
  summary: string;
  paragraphs: string[];
  bullets?: string[];
  numberedList?: string[];
  highlight?: string;
}

export type LegalDocType = 'privacy' | 'terms' | 'refund' | 'cookie';

export interface LegalDocData {
  type: LegalDocType;
  title: string;
  subtitle: string;
  lastUpdated: string;
  version: string;
  domain: string;
  heroNotice: string;
  trustBadges: { icon: string; label: string; desc: string }[];
  sections: LegalSection[];
}

export const PRIVACY_POLICY_DATA: LegalDocData = {
  type: 'privacy',
  title: 'Privacy Policy',
  subtitle: 'Your privacy and data security are our highest priority',
  lastUpdated: 'October 2026',
  version: 'v2.4 (Active)',
  domain: 'www.monexis.store',
  heroNotice:
    'Welcome to www.monexis.store. This Agreement describes the terms and conditions governing the use of our website and the services provided to users. By registering as a user or using our website, you agree to be bound by the following terms and conditions.',
  trustBadges: [
    { icon: 'shield', label: '100% Protected', desc: 'Enterprise data encryption' },
    { icon: 'verified-user', label: 'No Unauthorized Sharing', desc: 'Strict regulatory privacy' },
    { icon: 'lock', label: 'DPDP Compliant', desc: 'Lawful data processing' },
  ],
  sections: [
    {
      id: 'sms',
      number: '01',
      title: 'SMS Communication',
      icon: 'message',
      tag: 'Communication',
      summary: 'Transactional & service SMS notifications',
      paragraphs: [
        'By providing your phone number, you agree to receive SMS messages from www.monexis.store.',
      ],
      highlight: 'SMS alerts are strictly transactional and service-related.',
    },
    {
      id: 'termination',
      number: '02',
      title: 'User Account Suspension and Termination',
      icon: 'gavel',
      tag: 'Account Safety',
      summary: 'Circumstances leading to warnings, suspension, or termination',
      paragraphs: [
        "The User hereby agrees that www.monexis.store may, at its sole discretion, issue a warning, revoke, suspend, or terminate the User's membership or use of the Service. The website may also cancel or suspend its services or temporarily or permanently remove or block a User without prior warning or refund of any deposit, for any reason whatsoever, including but not limited to the following circumstances:",
      ],
      numberedList: [
        'If www.monexis.store believes, in its sole discretion, that a User has abused or violated the letter or spirit of the applicable rules.',
        'If the User has breached this User Agreement.',
        'If the User is found, through conviction, settlement, investigation, or otherwise, to have engaged in fraudulent activity in connection with our website.',
        'If www.monexis.store is unable to verify or authenticate any information provided by the User.',
      ],
    },
    {
      id: 'changes',
      number: '03',
      title: 'Changes to Terms and Conditions',
      icon: 'history-edu',
      tag: 'Policy Updates',
      summary: 'Modification timeline and user notice requirements',
      paragraphs: [
        'The terms and conditions of this User Agreement may be amended, supplemented, or modified by www.monexis.store at its sole discretion.',
        "The website may amend this User Agreement by sending the revised terms to the User's account or any email address provided by the User, or by publishing the amended terms on our website.",
        'Such amendments will become effective 30 days after being sent or published, unless otherwise specified in accordance with applicable law.',
        'The website does not guarantee or warrant that all content available on the website is accurate, legal, or free from offensive material.',
        'Users are advised to read these terms and conditions carefully. By using the website, you acknowledge and agree that any claims relating to damages or losses arising from your use of the website will be subject to applicable law.',
      ],
      highlight: 'Amendments become effective 30 days following publication or email notification.',
    },
    {
      id: 'commitment',
      number: '04',
      title: 'Our Commitment to Privacy',
      icon: 'verified-user',
      tag: 'Commitment',
      summary: 'Lawful data usage principles and consent-based communications',
      paragraphs: [
        'We are committed to protecting your privacy. We will use the information we collect about you lawfully and in accordance with applicable data protection laws.',
        'We collect information about you for the following purposes:',
      ],
      numberedList: [
        'To process your orders and transactions.',
        'To provide you with the best possible service.',
        'To improve our products, services, and user experience.',
      ],
      highlight:
        'We will not send you marketing emails without consent and provide effortless opt-out mechanisms.',
    },
    {
      id: 'data-collected',
      number: '05',
      title: 'Information We Collect',
      icon: 'person-search',
      tag: 'Data Points',
      summary: 'Personal identification and document details collected',
      paragraphs: [
        'The types of information we may collect about you include the following records:',
      ],
      bullets: [
        'Your name',
        'Your address',
        'Your phone number',
        'Your email address',
        'Other information provided by you',
        'Images and photographs',
        'Location information',
        'Contact lists, where permission is granted',
        'Files and documents',
      ],
      highlight:
        'We may collect personal details, including name, contact information, residential address, date of birth, identity documents (Aadhaar, PAN, Voter ID, driving licence), and educational credentials when provided to access services.',
    },
    {
      id: 'mobile-devices',
      number: '06',
      title: 'Information Collected Through Mobile Devices',
      icon: 'smartphone',
      tag: 'Mobile App',
      summary: 'App permissions, device logs, and contact list usage',
      paragraphs: [
        'When you use our mobile application, we may collect certain information from your device, subject to your explicit consent and permissions granted by you.',
        'This information may include:',
      ],
      bullets: [
        'Device location',
        'Contact information',
        'Call logs, where applicable and specifically permitted',
        'Device information, including storage-related information',
        'Images, photographs, and documents uploaded through the application',
      ],
      highlight:
        'Where permission is granted, contact information is used strictly to facilitate mobile recharge services for numbers selected by you. Sensitive personal data is never collected without statutory consent.',
    },
    {
      id: 'storage-security',
      number: '07',
      title: 'Storage and Security of Personal Information',
      icon: 'lock',
      tag: 'Security',
      summary: 'Safeguards against unauthorized access, loss, and alteration',
      paragraphs: [
        'The personal information we collect will be protected in accordance with our internal security policies and applicable laws.',
        'We will take reasonable measures to protect your information against unauthorized access, misuse, loss, alteration, or disclosure.',
        'We will retain personal information only for as long as necessary to fulfil the purposes for which it was collected, or as required by applicable law.',
      ],
      highlight: 'Data is protected by rigorous technical, administrative, and physical safeguards.',
    },
    {
      id: 'accuracy',
      number: '08',
      title: 'Accuracy and Correction of Information',
      icon: 'check-circle',
      tag: 'User Rights',
      summary: 'Rights to inspect, update, or request data deletion',
      paragraphs: [
        'We aim to ensure that the personal information we hold about you is accurate and up to date.',
        'You may contact us to request access to, correction of, or deletion of your personal information, subject to applicable legal and regulatory requirements.',
        'If you identify any inaccuracies in your personal information, we will take appropriate steps to correct or update the information within a reasonable period.',
      ],
    },
    {
      id: 'cookies',
      number: '09',
      title: 'Cookies and Website Usage Information',
      icon: 'cookie',
      tag: 'Web Usage',
      summary: 'Visitor analytics, cookies usage, and browser controls',
      paragraphs: [
        'We may use cookies and similar technologies to understand visitor behaviour and improve the functionality and performance of our website.',
        'Cookies are small files stored on your browser that help us understand how visitors interact with our website.',
        'You can usually modify your browser settings to restrict or disable cookies. However, disabling cookies may affect certain website functionalities.',
        'Information collected through cookies will be handled in accordance with this Privacy Policy and applicable laws.',
      ],
    },
    {
      id: 'non-transferability',
      number: '10',
      title: 'Non-Transferability',
      icon: 'lock-person',
      tag: 'Account Terms',
      summary: 'Account credentials confidentiality & e-coupon guidelines',
      paragraphs: [
        'Users may not transfer or share their accounts with any other person.',
        'Users must not disclose their passwords or other account credentials to third parties.',
        'E-coupons issued through our services are non-transferable unless otherwise specified by us.',
        'Where an e-coupon or recharge benefit is valid for a specified period, its validity will be determined by the applicable product or service terms.',
      ],
    },
    {
      id: 'policy-updates',
      number: '11',
      title: 'Privacy Policy Updates',
      icon: 'update',
      tag: 'Revisions',
      summary: 'Periodic reviews and modification notices',
      paragraphs: [
        'www.monexis.store reserves the right to update or modify this Privacy Policy from time to time.',
        'Any changes will become effective upon publication on the website or on the date specified in the revised policy, subject to applicable law.',
        'Users are encouraged to review this page periodically to remain informed about how their information is collected, used, and protected.',
      ],
    },
    {
      id: 'intellectual-property',
      number: '12',
      title: 'Website Content and Intellectual Property',
      icon: 'copyright',
      tag: 'IP Rights',
      summary: 'Proprietary software, content rights, and copyright notices',
      paragraphs: [
        'The content and software available on this website may be owned by www.monexis.store and/or its respective suppliers and service providers.',
        'Such content and software are protected by applicable intellectual property and copyright laws.',
        'Users may not reproduce, distribute, modify, or otherwise use protected content without the necessary authorization, except as permitted by applicable law.',
      ],
    },
    {
      id: 'support',
      number: '13',
      title: 'Customer Support',
      icon: 'support-agent',
      tag: 'Assistance',
      summary: 'Inquiries, dispute resolution, and contact channels',
      paragraphs: [
        'If you experience any problems while using our website or services, or if you have any questions, concerns, or complaints regarding this Privacy Policy, please contact our customer support department for assistance.',
        'We will make reasonable efforts to address your concerns in accordance with our policies and applicable laws.',
        'Website: www.monexis.store\nThank you for using MONEXIS.STORE.',
      ],
      highlight: 'Dedicated customer support available to resolve all policy inquiries promptly.',
    },
  ],
};

export const TERMS_CONDITIONS_DATA: LegalDocData = {
  type: 'terms',
  title: 'Terms & Conditions',
  subtitle: 'Official agreement governing access and online transactions',
  lastUpdated: 'October 2026',
  version: 'v2.4 (Active)',
  domain: 'www.monexis.store',
  heroNotice:
    'We welcome you to www.monexis.store, a website owned and operated by MONEXIS. These Terms & Conditions constitute an agreement governing your use of www.monexis.store for online shopping. You are advised to read this Agreement carefully. If you do not agree with any of these Terms & Conditions, you should not use the Services. You may use the online shopping services available on www.monexis.store only if you agree to all the Terms & Conditions of this Agreement in their entirety. By clicking the acceptance option provided on the website, you will be deemed to have accepted this Agreement, which shall constitute a legally binding agreement between you and MONEXIS.',
  trustBadges: [
    { icon: 'verified', label: 'Legally Binding', desc: 'Official commercial contract' },
    { icon: 'credit-card', label: 'Secure Payments', desc: 'PCI-DSS certified gateway' },
    { icon: 'published-with-changes', label: '15-Day Refund', desc: 'Clear cancellation policy' },
  ],
  sections: [
    {
      id: 'definitions',
      number: '01',
      title: 'Definitions',
      icon: 'menu-book',
      tag: 'Legal Terms',
      summary: 'Meaning of Agreement, Customer, Buyer, and Platform terms',
      paragraphs: [
        '"Agreement" means these Terms & Conditions, including all schedules, shipping policies, privacy policies, disclaimers, and any references to this Agreement, as amended, supplemented, varied, or replaced from time to time.',
        '"Customer" / "Buyer" means any individual or legal entity that places an order for or purchases any products offered for sale on www.monexis.store.',
      ],
    },
    {
      id: 'eligibility',
      number: '02',
      title: 'Eligibility',
      icon: 'assignment-ind',
      tag: 'User Criteria',
      summary: 'Contractual competence and legal qualification to contract',
      paragraphs: [
        'You represent and warrant that you are competent and eligible to enter into a legally binding agreement and have the requisite authority to enter into this Agreement.',
        'You shall not use this website if you are not legally competent to contract under applicable laws, rules, and regulations.',
      ],
      highlight: 'Users must be legally competent to contract under applicable statutory laws.',
    },
    {
      id: 'term-service',
      number: '03',
      title: 'Term of Agreement / Service',
      icon: 'hourglass-bottom',
      tag: 'Platform Use',
      summary: 'Duration of service, acceptance terms, and termination rights',
      paragraphs: [
        'This Agreement shall remain in full force and effect for as long as you use the services provided by www.monexis.store.',
        'MONEXIS provides an online shopping platform through which users can purchase products listed on www.monexis.store (the "Services"), subject to the Terms & Conditions set forth herein.',
        'By clicking the "Close" button or otherwise proceeding to use the Services, you agree to use the Services in accordance with these Terms & Conditions, including the Privacy Policy and all applicable laws and regulations.',
        'Either you or MONEXIS may terminate the use of the Services at any time, with or without cause, subject to applicable law. MONEXIS reserves the right, to the extent permitted by applicable law, to suspend or terminate your access to the website, its Services, or any portion thereof.',
      ],
    },
    {
      id: 'modifications',
      number: '04',
      title: 'Modification of Terms & Conditions of Service',
      icon: 'edit-note',
      tag: 'Modifications',
      summary: 'Periodic revisions, continued use acknowledgment, and review',
      paragraphs: [
        'MONEXIS may modify these Terms & Conditions ("Terms") from time to time. The latest version of the Terms will be made available on www.monexis.store.',
        'You agree to review the Terms periodically. If any modified Terms are unacceptable to you, you should discontinue using the Services. Your continued use of the Services after changes are published will constitute your acceptance of the modified Terms, to the extent permitted by applicable law.',
      ],
    },
    {
      id: 'communications-orders',
      number: '05',
      title: 'Electronic Communication & Order Processing',
      icon: 'mail-outline',
      tag: 'Transactions',
      summary: 'Electronic notices, fraud verification, delivery, and sales offer',
      paragraphs: [
        'By using www.monexis.store, you consent to receiving communications from MONEXIS electronically. MONEXIS may communicate with users by email or by posting notices, updates, or offers on the website.',
        'You agree that you access and use the Services at your own risk and will exercise reasonable care and judgment before entering into any transaction through the website.',
        'All orders must be approved using an acceptable payment method available through the payment service providers connected with www.monexis.store. Additional verification or information may be required to process an order.',
        'MONEXIS may implement verification procedures to protect customers and prevent fraudulent transactions. If additional documentation is reasonably required to authenticate a transaction, you may be asked to provide relevant information through a secure and appropriate process, subject to applicable law and data-protection requirements.',
        'You are responsible for ensuring that the delivery address provided when placing an order is accurate and complete.',
        "After receiving and confirming the Buyer's payment, MONEXIS shall arrange for delivery of the product to the shipping address provided by the Buyer, subject to product availability and the applicable shipping policy.",
        'All orders placed by you on this website constitute an offer to purchase the selected products, subject to order acceptance and the applicable terms of sale.',
        'Before placing an order, you are advised to review the product description carefully. By placing an order, you agree to the applicable conditions of sale included in the product listing.',
      ],
      highlight:
        'All orders are subject to payment approval, security verification, and stock availability.',
    },
    {
      id: 'payment-details',
      number: '06',
      title: 'Credit Card Details and Payment Information',
      icon: 'credit-card',
      tag: 'Payment Terms',
      summary: 'Accurate billing credentials, security, and disclosure limits',
      paragraphs: [
        'You agree, understand, and confirm that the payment and credit card details provided by you when using www.monexis.store shall be correct, accurate, and lawfully owned or authorized for use by you.',
        'You agree to provide valid payment details to the applicable payment gateway or payment service provider.',
        'MONEXIS shall handle payment information in accordance with applicable laws, security requirements, and its Privacy Policy. Payment information shall not be disclosed or shared with third parties except where necessary to process payments, provide the Services, comply with applicable laws or regulations, respond to lawful orders, or protect legitimate business and security interests.',
      ],
      highlight:
        'Payment details must be lawfully owned by you and are safeguarded through secure payment gateways.',
    },
    {
      id: 'refund-policy',
      number: '07',
      title: 'Cancellation & Refund Policy',
      icon: 'currency-exchange',
      tag: 'Refunds & Returns',
      summary: 'Order cancellation terms, 15-day refund window, and procedures',
      paragraphs: [
        'Please note that certain orders may be unavailable for processing or may need to be cancelled even after initial approval. MONEXIS reserves the right to refuse or cancel an order for legitimate reasons, subject to applicable law.',
        'Reasons for cancellation may include product unavailability, inaccuracies or errors in product descriptions or pricing information, payment verification issues, or concerns identified during fraud-prevention checks.',
        'We will contact you if all or any portion of your order is cancelled or if additional information is required to process your order.',
        'If MONEXIS is unable to process your order within 15 working days, a refund will be initiated, subject to the applicable payment terms and refund procedures.',
        'If your order is cancelled after payment has been made by credit card, debit card, net banking, or another online payment method, the refund will be processed through the applicable payment service provider to the original payment method, wherever possible.',
        'If payment was made by cheque or demand draft (DD), any applicable refund will be processed through an appropriate method, subject to verification and applicable banking procedures.',
        'If MONEXIS receives a cancellation request before the order has been processed or approved for dispatch, the order may be cancelled and the eligible amount refunded in full.',
        'Orders that have already been processed or shipped may not be eligible for cancellation. In such cases, any return or refund request will be handled in accordance with the applicable return, cancellation, and refund policies and applicable law.',
        'For online service cancellations and refunds, where applicable, the request will be processed in accordance with the relevant service terms, payment provider requirements, and applicable rules and regulations.',
      ],
      highlight:
        'If an order cannot be processed within 15 working days, an automatic refund is initiated to the original payment source.',
    },
  ],
};

export const REFUND_CANCELLATION_DATA: LegalDocData = {
  type: 'refund',
  title: 'Refund & Cancellation',
  subtitle: 'Clear terms on cancellations, customer satisfaction, and refund reversals',
  lastUpdated: 'October 2026',
  version: 'v2.4 (Active)',
  domain: 'www.monexis.store',
  heroNotice:
    'Welcome to www.monexis.store. Our focus is complete customer satisfaction. If you are dissatisfied with the services provided, we will consider issuing a refund, provided the reasons are genuine and verified after investigation. Please read the details of each deal carefully before making a purchase, as they contain all the relevant information about the services or products you purchase. In case of dissatisfaction with our services, clients have the right to cancel their projects and request a refund from us. Our cancellation and refund policies are detailed below.',
  trustBadges: [
    { icon: 'verified', label: 'Satisfaction Focus', desc: 'Genuine claims investigated' },
    { icon: 'schedule', label: '7-Day Notice', desc: 'Clear cancellation cutoff' },
    { icon: 'credit-card', label: 'Direct Reversal', desc: 'Refunded to original method' },
  ],
  sections: [
    {
      id: 'customer-satisfaction',
      number: '01',
      title: 'Customer Satisfaction Commitment',
      icon: 'sentiment-very-satisfied',
      tag: 'Satisfaction',
      summary: 'Our focus on client satisfaction and verification before refunds',
      paragraphs: [
        'Welcome to www.monexis.store.',
        'Our focus is complete customer satisfaction. If you are dissatisfied with the services provided, we will consider issuing a refund, provided the reasons are genuine and verified after investigation.',
        'Please read the details of each deal carefully before making a purchase, as they contain all the relevant information about the services or products you purchase.',
        'In case of dissatisfaction with our services, clients have the right to cancel their projects and request a refund from us.',
      ],
      highlight:
        'Please read all deal terms carefully before purchase. Genuine dissatisfaction claims are verified through our formal investigation process.',
    },
    {
      id: 'cancellation-policy',
      number: '02',
      title: 'Cancellation Policy',
      icon: 'cancel',
      tag: 'Cancellations',
      summary: '7 business days notice requirement and Contact Us channels',
      paragraphs: [
        'For cancellations, please contact us through the Contact Us link available on www.monexis.store.',
        'Cancellation requests received later than 7 business days before the end of the current service period will be treated as requests for cancellation of services for the next service period.',
      ],
      highlight:
        'Cancellation requests must be submitted at least 7 business days before the current service period ends.',
    },
    {
      id: 'refund-policy-clause',
      number: '03',
      title: 'Refund Policy & Resolution',
      icon: 'currency-exchange',
      tag: 'Refunds',
      summary: 'Efforts to provide satisfactory solutions and refund assessment',
      paragraphs: [
        'We will make every effort to provide suitable services and satisfactory solutions to our clients.',
        'If a client is not completely satisfied with our products or services, we may provide a refund, subject to verification and the applicable refund terms.',
      ],
      highlight:
        'We make every reasonable effort to provide suitable solutions before issuing a verified refund.',
    },
    {
      id: 'payment-methods-reversal',
      number: '04',
      title: 'Refund Processing & Payment Methods',
      icon: 'account-balance-wallet',
      tag: 'Payment Methods',
      summary: 'Direct reversal to Credit Cards and Payment Gateway accounts',
      paragraphs: [
        'Once a refund is approved following verification, the disbursement is processed back through the original payment channel:',
      ],
      bullets: [
        'Credit Card Payments: If payment was made by credit card, the refund will be issued to the original credit card used at the time of purchase.',
        'Payment Gateway Transactions: If payment was made through a payment gateway, the refund will be processed to the same account or payment method, subject to the applicable payment gateway terms and conditions.',
      ],
      highlight:
        'Refunds are credited directly back to the original source card or payment gateway account.',
    },
    {
      id: 'refund-contact-support',
      number: '05',
      title: 'Contact Us for Cancellations & Inquiries',
      icon: 'support-agent',
      tag: 'Assistance',
      summary: 'Submitting cancellation requests and inquiry resolution',
      paragraphs: [
        'For assistance with cancellations or refund inquiries, please reach out via the Contact Us section on www.monexis.store.',
        'Our dedicated support desk is available to assist you with order verification, processing timelines, and resolution updates.',
      ],
    },
  ],
};

export const COOKIE_POLICY_DATA: LegalDocData = {
  type: 'cookie',
  title: 'Cookie Policy',
  subtitle: 'Understanding cookies, technologies, preferences, and security at MONEXIS STORE',
  lastUpdated: 'October 2026',
  version: 'v2.4 (Active)',
  domain: 'www.monexis.store',
  heroNotice:
    'Welcome to MONEXIS STORE (www.monexis.store). This Cookie Policy explains how MONEXIS STORE uses cookies and similar technologies when you visit or use our website. It describes what cookies are, why we use them, and how you can manage your cookie preferences. By accessing or using our website, you acknowledge that cookies and similar technologies may be used as described in this policy, subject to applicable laws and your consent where required.',
  trustBadges: [
    { icon: 'cookie', label: 'Transparent', desc: 'No hidden trackers' },
    { icon: 'tune', label: 'User Control', desc: 'Manage in browser settings' },
    { icon: 'security', label: 'Data Protected', desc: 'DPDP & Privacy aligned' },
  ],
  sections: [
    {
      id: 'cookie-intro',
      number: '01',
      title: '1. Introduction',
      icon: 'info-outline',
      tag: 'Introduction',
      summary: 'Welcome to MONEXIS STORE and scope of cookie technologies',
      paragraphs: [
        'Welcome to MONEXIS STORE (www.monexis.store).',
        'This Cookie Policy explains how MONEXIS STORE uses cookies and similar technologies when you visit or use our website. It describes what cookies are, why we use them, and how you can manage your cookie preferences.',
        'By accessing or using our website, you acknowledge that cookies and similar technologies may be used as described in this policy, subject to applicable laws and your consent where required.',
      ],
    },
    {
      id: 'what-are-cookies',
      number: '02',
      title: '2. What Are Cookies?',
      icon: 'cookie',
      tag: 'Definition',
      summary: 'Small text files stored on devices to remember settings and assist function',
      paragraphs: [
        'Cookies are small text files stored on your computer, mobile phone, tablet, or other device when you visit a website.',
        'Cookies help websites function properly, remember user preferences, improve website performance, understand visitor activity, and provide a better browsing experience.',
        'Some cookies are necessary for the website to operate, while others may be used for analytics, personalization, or advertising purposes.',
      ],
      highlight:
        'Cookies are small text files stored on your device that enable websites to work smoothly and remember your preferences.',
    },
    {
      id: 'why-cookies-used',
      number: '03',
      title: '3. Why Do We Use Cookies?',
      icon: 'category',
      tag: 'Purposes',
      summary: 'Essential, functional, analytics, shopping, and marketing cookie types',
      paragraphs: [
        'MONEXIS STORE may use cookies and similar technologies for the following purposes:',
      ],
      numberedList: [
        'A. Essential Cookies: These cookies are necessary for the basic functioning of our website. They may help with website navigation, secure access, session management, and other essential functions.',
        'B. Functional Cookies: These cookies help remember your preferences and settings, such as language preferences or other website choices, to provide a more convenient browsing experience.',
        'C. Analytics and Performance Cookies: These cookies may help us understand how visitors interact with our website, which pages are visited, and whether users experience technical issues. This information helps us improve website performance and usability.',
        'D. Shopping and Transaction Cookies: These cookies may be used to maintain your shopping session, remember items in your shopping cart, support checkout processes, and help process transactions securely.',
        'E. Advertising and Marketing Cookies: If advertising or marketing technologies are used on our website, these cookies may help measure advertising effectiveness and deliver relevant advertisements based on user preferences, subject to applicable consent requirements.',
      ],
      highlight:
        'Essential and transaction cookies maintain shopping session integrity, secure payments, and navigation reliability.',
    },
    {
      id: 'third-party-cookies',
      number: '04',
      title: '4. Third-Party Cookies',
      icon: 'hub',
      tag: 'Third Parties',
      summary: 'Integrated payment gateways, analytics, and security provider cookies',
      paragraphs: [
        'Certain services integrated into MONEXIS STORE may place cookies on your device. These services may include:',
      ],
      bullets: [
        'Payment gateways and payment service providers.',
        'Website analytics providers.',
        'Advertising and marketing platforms.',
        'Website security and performance services.',
        'Other third-party tools used to support website functionality.',
      ],
      highlight:
        "Third-party cookies are governed by the respective third parties' privacy and cookie policies. MONEXIS STORE does not control all cookies placed by third parties. We encourage you to review the applicable policies of these service providers to understand how they process information.",
    },
    {
      id: 'cookie-duration',
      number: '05',
      title: '5. How Long Do Cookies Remain on Your Device?',
      icon: 'timelapse',
      tag: 'Lifespan',
      summary: 'Session cookies (temporary) vs persistent cookies (stored until expiry)',
      paragraphs: [
        'Cookies may remain on your device for different periods depending on their purpose.',
        'Session Cookies: These cookies are generally deleted when you close your browser.',
        'Persistent Cookies: These cookies remain on your device until they expire or you delete them through your browser settings.',
        'The duration of individual cookies depends on their purpose and the settings of the relevant website or third-party service.',
      ],
      highlight:
        'Session cookies expire upon closing your browser, while persistent cookies stay until explicit deletion or expiry.',
    },
    {
      id: 'manage-cookies',
      number: '06',
      title: '6. How Can You Manage or Disable Cookies?',
      icon: 'tune',
      tag: 'User Controls',
      summary: 'Browser settings, deleting cookies, and impact on cart & checkout features',
      paragraphs: [
        'You can manage cookies through your browser settings. Most web browsers allow you to view, block, restrict, or delete cookies.',
        'Please note that disabling certain cookies may affect the functionality of our website. Features such as account access, shopping cart management, checkout, or other services may not work correctly if essential cookies are disabled.',
        'Where required by applicable law, we will provide appropriate options to accept, reject, or manage non-essential cookies.',
      ],
      highlight:
        'You can manage or delete cookies in your browser settings anytime. Disabling essential cookies may impact shopping cart and checkout features.',
    },
    {
      id: 'personal-info-privacy',
      number: '07',
      title: '7. Personal Information and Privacy',
      icon: 'shield',
      tag: 'Data Privacy',
      summary: 'Types of data collected, identifiers, and Privacy Policy compliance',
      paragraphs: [
        'Cookies may collect information such as your browser type, device information, IP address, browsing activity, session identifiers, and website preferences, depending on the type of cookie used.',
        'Where cookies involve personal information, MONEXIS STORE will handle such information in accordance with its Privacy Policy and applicable data-protection laws.',
        'We do not intend to use cookies to collect sensitive personal information unnecessarily.',
      ],
      highlight:
        'Cookie data is handled strictly under MONEXIS Privacy Policy and applicable data protection legislation.',
    },
    {
      id: 'data-security',
      number: '08',
      title: '8. Data Security',
      icon: 'lock',
      tag: 'Security',
      summary: 'Protective measures and user security recommendations',
      paragraphs: [
        'MONEXIS STORE takes reasonable measures to protect information processed through its website.',
        'However, no method of transmitting or storing information electronically can be guaranteed to be completely secure. Users are encouraged to follow appropriate security practices when accessing online services.',
      ],
      highlight:
        'Reasonable electronic and administrative safeguards are maintained to protect cookie and session data.',
    },
    {
      id: 'cookie-changes',
      number: '09',
      title: '9. Changes to This Cookie Policy',
      icon: 'update',
      tag: 'Updates',
      summary: 'Policy updates, revision dates, and user periodic review recommendation',
      paragraphs: [
        'MONEXIS STORE reserves the right to update or modify this Cookie Policy from time to time to reflect changes in our website functionality, technology, business practices, or applicable laws.',
        'Any changes will be published on this page with an updated revision date. We encourage users to review this policy periodically.',
      ],
      highlight:
        'Revisions are posted here with updated effective dates. Users are encouraged to review periodically.',
    },
    {
      id: 'cookie-contact',
      number: '10',
      title: '10. Contact Us',
      icon: 'support-agent',
      tag: 'Contact',
      summary: 'Support desk contact details and website information',
      paragraphs: [
        'If you have any questions or concerns regarding this Cookie Policy, please contact us through the contact details provided on our website.',
        'Website: www.monexis.store\nMONEXIS STORE\nThank you for visiting our website.',
      ],
    },
  ],
};

export const ALL_LEGAL_DOCS: Record<LegalDocType, LegalDocData> = {
  privacy: PRIVACY_POLICY_DATA,
  terms: TERMS_CONDITIONS_DATA,
  refund: REFUND_CANCELLATION_DATA,
  cookie: COOKIE_POLICY_DATA,
};

