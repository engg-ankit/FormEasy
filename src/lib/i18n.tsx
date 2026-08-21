'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'hi';

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.browse': 'Browse Forms',
    'nav.dashboard': 'Dashboard',
    'nav.login': 'Login',
    'nav.signup': 'Sign Up',
    'nav.admin': 'Admin',
    'nav.agent': 'Agent',
    'nav.logout': 'Logout',

    // Hero
    'hero.title': 'Every Form. One Platform.',
    'hero.subtitle': 'We fill and submit your exam application forms — so you can focus on studying.',
    'hero.cta': 'Browse Exam Forms',
    'hero.learn': 'How It Works',

    // Common
    'common.loading': 'Loading...',
    'common.submit': 'Submit',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.search': 'Search...',
    'common.noResults': 'No results found',
    'common.error': 'Something went wrong',
    'common.success': 'Success!',
    'common.fee': 'Fee',
    'common.total': 'Total',
    'common.amount': 'Amount',
    'common.status': 'Status',
    'common.date': 'Date',
    'common.name': 'Name',
    'common.email': 'Email',
    'common.phone': 'Phone',
    'common.mobile': 'Mobile',
    'common.password': 'Password',

    // Dashboard
    'dash.welcome': 'Welcome',
    'dash.myApps': 'My Applications',
    'dash.payments': 'Payment History',
    'dash.profile': 'Profile',
    'dash.overview': 'Overview',
    'dash.totalApps': 'Total Applications',
    'dash.inProgress': 'In Progress',
    'dash.completed': 'Completed',
    'dash.totalSpent': 'Total Spent',
    'dash.recentApps': 'Recent Applications',
    'dash.viewAll': 'View All',
    'dash.noApps': 'No Applications Yet',
    'dash.startApp': 'Start by browsing exam forms and submitting your first application.',

    // Application
    'app.status.submitted': 'Submitted',
    'app.status.inProcess': 'In Process',
    'app.status.formFilled': 'Form Filled',
    'app.status.completed': 'Completed',
    'app.status.rejected': 'Rejected',
    'app.cancel': 'Cancel Application',
    'app.details': 'Application Details',
    'app.progress': 'Overall Progress',

    // Exam
    'exam.category': 'Category',
    'exam.fee': 'Application Fee',
    'exam.serviceFee': 'Service Charge',
    'exam.totalFee': 'Total Fee',
    'exam.deadline': 'Last Date',
    'exam.apply': 'Apply Now',
    'exam.docs': 'Required Documents',
    'exam.expired': 'Deadline Passed',

    // Payment
    'pay.title': 'Payment',
    'pay.payNow': 'Pay Now',
    'pay.processing': 'Processing...',
    'pay.success': 'Payment Successful!',
    'pay.failed': 'Payment Failed',
    'pay.history': 'Payment History',
    'pay.receipt': 'Download Receipt',

    // Form
    'form.personalInfo': 'Personal Information',
    'form.education': 'Education Details',
    'form.documents': 'Upload Documents',
    'form.review': 'Review & Submit',
    'form.fullName': 'Full Name',
    'form.fatherName': "Father's Name",
    'form.motherName': "Mother's Name",
    'form.dob': 'Date of Birth',
    'form.gender': 'Gender',
    'form.male': 'Male',
    'form.female': 'Female',
    'form.other': 'Other',
    'form.category': 'Category',
    'form.address': 'Address',
    'form.state': 'State',
    'form.district': 'District',
    'form.pincode': 'Pincode',
    'form.educationLevel': 'Education Level',
    'form.board': 'Board / University',
    'form.yearOfPassing': 'Year of Passing',
    'form.percentage': 'Percentage / CGPA',
    'form.rollNumber': 'Roll Number',

    // Auth
    'auth.login': 'Login',
    'auth.signup': 'Create Account',
    'auth.forgotPass': 'Forgot Password?',
    'auth.resetPass': 'Reset Password',
    'auth.noAccount': "Don't have an account?",
    'auth.hasAccount': 'Already have an account?',
    'auth.loginHere': 'Login here',
    'auth.signupHere': 'Sign up here',

    // Footer
    'footer.about': 'About FormEasy',
    'footer.aboutText': 'We help students by filling and submitting exam application forms, so they can focus on what matters — studying.',
    'footer.services': 'Our Services',
    'footer.service1': 'Form Filling',
    'footer.service2': 'Document Verification',
    'footer.service3': 'Application Tracking',
    'footer.service4': 'Payment Processing',
    'footer.contact': 'Contact Us',
    'footer.rights': 'All rights reserved.',

    // Steps
    'steps.title': 'How It Works',
    'step1.title': 'Browse & Choose',
    'step1.desc': 'Find the exam you want to apply for from our curated list.',
    'step2.title': 'Fill Form',
    'step2.desc': 'Fill in your details — we\'ll guide you through every field.',
    'step3.title': 'Upload Docs',
    'step3.desc': 'Upload required documents like photo, signature, ID proof.',
    'step4.title': 'Pay & Done',
    'step4.desc': 'Pay the fees and we\'ll submit your form to the official portal.',

    // Contact
    'contact.title': 'Contact Us',
    'contact.subtitle': 'Have questions? We\'d love to hear from you.',
    'contact.name': 'Your Name',
    'contact.email': 'Email Address',
    'contact.message': 'Your Message',
    'contact.send': 'Send Message',
    'contact.sending': 'Sending...',
    'contact.sent': 'Message sent successfully!',
    'contact.phone': 'Phone',
    'contact.whatsapp': 'WhatsApp',
    'contact.hours': 'Working Hours',

    // About
    'about.title': 'About FormEasy',
    'about.mission': 'Our Mission',
    'about.missionText': 'We help students across India by filling and submitting their exam application forms online — so they never have to visit a cyber café again.',
    'about.why': 'Why Choose Us?',
    'about.whyText': 'FormEasy was built because we saw students struggling with complicated online forms, long queues at cyber cafés, and missed deadlines. We wanted to make it simple.',
    'about.values': 'Our Values',

    // FAQ
    'faq.title': 'Frequently Asked Questions',
    'faq.subtitle': 'Find answers to common questions about our service.',
    'faq.search': 'Search questions...',

    // Terms
    'terms.title': 'Terms & Conditions',
    'terms.subtitle': 'Please read these terms carefully before using our services.',

    // Privacy
    'privacy.title': 'Privacy Policy',
    'privacy.subtitle': 'Your privacy is important to us. Here\'s how we handle your data.',

    // Forgot Password
    'forgot.title': 'Reset Password',
    'forgot.subtitle': 'Enter your email to receive a reset link.',
    'forgot.sent': 'Reset link sent to your email!',

    // Request Form
    'request.title': 'Request a Form',
    'request.subtitle': 'Can\'t find the form you need? Request it here and we\'ll add it.',
    'request.formName': 'Form/Exam Name',
    'request.category': 'Category',
    'request.portal': 'Official Portal URL (if known)',
    'request.details': 'Additional Details',
    'request.phone': 'Your Phone Number',
    'request.submit': 'Submit Request',
    'request.submitted': 'Request submitted successfully!',
    'request.myRequests': 'My Requests',

    // Exam Detail
    'exam.about': 'About this Form',
    'exam.requiredDocs': 'Required Documents',
    'exam.feeBreakdown': 'Fee Breakdown',
    'exam.officialFee': 'Official Fee',
    'exam.serviceFeeLabel': 'Service Fee',
    'exam.totalFeeLabel': 'Total',
    'exam.securePay': 'Secure payment powered by Razorpay',
    'exam.needHelp': 'Need Help?',
    'exam.helpText': 'Our team is available to help you with any questions about this form application.',
    'exam.contactSupport': 'Contact Support',
    'exam.viewDetails': 'View Details',
  },
  hi: {
    // Navigation
    'nav.home': 'होम',
    'nav.browse': 'फॉर्म देखें',
    'nav.dashboard': 'डैशबोर्ड',
    'nav.login': 'लॉगिन',
    'nav.signup': 'साइन अप',
    'nav.admin': 'एडमिन',
    'nav.agent': 'एजेंट',
    'nav.logout': 'लॉगआउट',

    // Hero
    'hero.title': 'हर फॉर्म। एक प्लेटफॉर्म।',
    'hero.subtitle': 'हम आपके परीक्षा आवेदन फॉर्म भरते और जमा करते हैं — ताकि आप पढ़ाई पर ध्यान दे सकें।',
    'hero.cta': 'परीक्षा फॉर्म देखें',
    'hero.learn': 'कैसे काम करता है',

    // Common
    'common.loading': 'लोड हो रहा है...',
    'common.submit': 'जमा करें',
    'common.cancel': 'रद्द करें',
    'common.save': 'सहेजें',
    'common.delete': 'हटाएं',
    'common.edit': 'संपादित करें',
    'common.back': 'वापस',
    'common.next': 'आगे',
    'common.previous': 'पीछे',
    'common.search': 'खोजें...',
    'common.noResults': 'कोई परिणाम नहीं मिला',
    'common.error': 'कुछ गलत हो गया',
    'common.success': 'सफल!',
    'common.fee': 'शुल्क',
    'common.total': 'कुल',
    'common.amount': 'राशि',
    'common.status': 'स्थिति',
    'common.date': 'तारीख',
    'common.name': 'नाम',
    'common.email': 'ईमेल',
    'common.phone': 'फोन',
    'common.mobile': 'मोबाइल',
    'common.password': 'पासवर्ड',

    // Dashboard
    'dash.welcome': 'स्वागत है',
    'dash.myApps': 'मेरे आवेदन',
    'dash.payments': 'भुगतान इतिहास',
    'dash.profile': 'प्रोफ़ाइल',
    'dash.overview': 'सारांश',
    'dash.totalApps': 'कुल आवेदन',
    'dash.inProgress': 'प्रगति में',
    'dash.completed': 'पूर्ण',
    'dash.totalSpent': 'कुल खर्च',
    'dash.recentApps': 'हाल के आवेदन',
    'dash.viewAll': 'सभी देखें',
    'dash.noApps': 'अभी तक कोई आवेदन नहीं',
    'dash.startApp': 'परीक्षा फॉर्म देखकर अपना पहला आवेदन शुरू करें।',

    // Application
    'app.status.submitted': 'जमा किया गया',
    'app.status.inProcess': 'प्रक्रिया में',
    'app.status.formFilled': 'फॉर्म भरा गया',
    'app.status.completed': 'पूर्ण',
    'app.status.rejected': 'अस्वीकृत',
    'app.cancel': 'आवेदन रद्द करें',
    'app.details': 'आवेदन विवरण',
    'app.progress': 'समग्र प्रगति',

    // Exam
    'exam.category': 'श्रेणी',
    'exam.fee': 'आवेदन शुल्क',
    'exam.serviceFee': 'सेवा शुल्क',
    'exam.totalFee': 'कुल शुल्क',
    'exam.deadline': 'अंतिम तिथि',
    'exam.apply': 'अभी आवेदन करें',
    'exam.docs': 'आवश्यक दस्तावेज',
    'exam.expired': 'समय समाप्त',

    // Payment
    'pay.title': 'भुगतान',
    'pay.payNow': 'अभी भुगतान करें',
    'pay.processing': 'प्रसंस्करण...',
    'pay.success': 'भुगतान सफल!',
    'pay.failed': 'भुगतान विफल',
    'pay.history': 'भुगतान इतिहास',
    'pay.receipt': 'रसीद डाउनलोड करें',

    // Form
    'form.personalInfo': 'व्यक्तिगत जानकारी',
    'form.education': 'शैक्षणिक विवरण',
    'form.documents': 'दस्तावेज अपलोड करें',
    'form.review': 'समीक्षा और जमा करें',
    'form.fullName': 'पूरा नाम',
    'form.fatherName': 'पिता का नाम',
    'form.motherName': 'माता का नाम',
    'form.dob': 'जन्म तिथि',
    'form.gender': 'लिंग',
    'form.male': 'पुरुष',
    'form.female': 'महिला',
    'form.other': 'अन्य',
    'form.category': 'श्रेणी',
    'form.address': 'पता',
    'form.state': 'राज्य',
    'form.district': 'जिला',
    'form.pincode': 'पिन कोड',
    'form.educationLevel': 'शिक्षा स्तर',
    'form.board': 'बोर्ड / विश्वविद्यालय',
    'form.yearOfPassing': 'उत्तीर्ण वर्ष',
    'form.percentage': 'प्रतिशत / CGPA',
    'form.rollNumber': 'रोल नंबर',

    // Auth
    'auth.login': 'लॉगिन',
    'auth.signup': 'खाता बनाएं',
    'auth.forgotPass': 'पासवर्ड भूल गए?',
    'auth.resetPass': 'पासवर्ड रीसेट करें',
    'auth.noAccount': 'खाता नहीं है?',
    'auth.hasAccount': 'पहले से खाता है?',
    'auth.loginHere': 'यहाँ लॉगिन करें',
    'auth.signupHere': 'यहाँ साइन अप करें',

    // Footer
    'footer.about': 'FormEasy के बारे में',
    'footer.aboutText': 'हम छात्रों की मदद करते हैं — परीक्षा आवेदन फॉर्म भरकर और जमा करके, ताकि आप पढ़ाई पर ध्यान दे सकें।',
    'footer.services': 'हमारी सेवाएं',
    'footer.service1': 'फॉर्म भरना',
    'footer.service2': 'दस्तावेज सत्यापन',
    'footer.service3': 'आवेदन ट्रैकिंग',
    'footer.service4': 'भुगतान प्रसंस्करण',
    'footer.contact': 'संपर्क करें',
    'footer.rights': 'सर्वाधिकार सुरक्षित।',

    // Steps
    'steps.title': 'कैसे काम करता है',
    'step1.title': 'देखें और चुनें',
    'step1.desc': 'हमारी सूची में से वह परीक्षा चुनें जिसके लिए आवेदन करना चाहते हैं।',
    'step2.title': 'फॉर्म भरें',
    'step2.desc': 'अपनी जानकारी भरें — हम हर फ़ील्ड में आपकी मदद करेंगे।',
    'step3.title': 'दस्तावेज अपलोड',
    'step3.desc': 'फोटो, सिग्नेचर, ID प्रूफ जैसे जरूरी दस्तावेज अपलोड करें।',
    'step4.title': 'भुगतान और हो गया',
    'step4.desc': 'शुल्क का भुगतान करें और हम आपका फॉर्म आधिकारिक पोर्टल पर जमा कर देंगे।',

    // Contact
    'contact.title': 'संपर्क करें',
    'contact.subtitle': 'कोई सवाल है? हमसे बात करें।',
    'contact.name': 'आपका नाम',
    'contact.email': 'ईमेल पता',
    'contact.message': 'आपका संदेश',
    'contact.send': 'संदेश भेजें',
    'contact.sending': 'भेजा जा रहा है...',
    'contact.sent': 'संदेश सफलतापूर्वक भेजा गया!',
    'contact.phone': 'फोन',
    'contact.whatsapp': 'व्हाट्सएप',
    'contact.hours': 'कार्य समय',

    // About
    'about.title': 'FormEasy के बारे में',
    'about.mission': 'हमारा मिशन',
    'about.missionText': 'हम भारत भर के छात्रों की मदद करते हैं — उनके परीक्षा आवेदन फॉर्म ऑनलाइन भरकर और जमा करके, ताकि उन्हें कभी साइबर कैफ़े न जाना पड़े।',
    'about.why': 'हमें क्यों चुनें?',
    'about.whyText': 'FormEasy इसलिए बना क्योंकि हमने देखा कि छात्र जटिल ऑनलाइन फॉर्म, साइबर कैफ़े में लंबी कतारों और समय सीमा छूटने से जूझ रहे थे। हम इसे आसान बनाना चाहते थे।',
    'about.values': 'हमारे मूल्य',

    // FAQ
    'faq.title': 'अक्सर पूछे जाने वाले सवाल',
    'faq.subtitle': 'हमारी सेवा के बारे में आम सवालों के जवाब खोजें।',
    'faq.search': 'सवाल खोजें...',

    // Terms
    'terms.title': 'नियम और शर्तें',
    'terms.subtitle': 'कृपया हमारी सेवाओं का उपयोग करने से पहले इन नियमों को ध्यान से पढ़ें।',

    // Privacy
    'privacy.title': 'गोपनीयता नीति',
    'privacy.subtitle': 'आपकी गोपनीयता हमारे लिए महत्वपूर्ण है। यहाँ बताया गया है कि हम आपके डेटा को कैसे संभालते हैं।',

    // Forgot Password
    'forgot.title': 'पासवर्ड रीसेट करें',
    'forgot.subtitle': 'रीसेट लिंक प्राप्त करने के लिए अपना ईमेल दर्ज करें।',
    'forgot.sent': 'आपके ईमेल पर रीसेट लिंक भेजा गया!',

    // Request Form
    'request.title': 'फॉर्म का अनुरोध करें',
    'request.subtitle': 'जो फॉर्म आपको चाहिए वो नहीं मिल रहा? यहाँ अनुरोध करें और हम उसे जोड़ देंगे।',
    'request.formName': 'फॉर्म/परीक्षा का नाम',
    'request.category': 'श्रेणी',
    'request.portal': 'आधिकारिक पोर्टल URL (अगर पता हो)',
    'request.details': 'अतिरिक्त विवरण',
    'request.phone': 'आपका फोन नंबर',
    'request.submit': 'अनुरोध जमा करें',
    'request.submitted': 'अनुरोध सफलतापूर्वक जमा हो गया!',
    'request.myRequests': 'मेरे अनुरोध',

    // Exam Detail
    'exam.about': 'इस फॉर्म के बारे में',
    'exam.requiredDocs': 'आवश्यक दस्तावेज',
    'exam.feeBreakdown': 'शुल्क विवरण',
    'exam.officialFee': 'आधिकारिक शुल्क',
    'exam.serviceFeeLabel': 'सेवा शुल्क',
    'exam.totalFeeLabel': 'कुल',
    'exam.securePay': 'Razorpay द्वारा सुरक्षित भुगतान',
    'exam.needHelp': 'मदद चाहिए?',
    'exam.helpText': 'हमारी टीम इस फॉर्म आवेदन के बारे में किसी भी सवाल में आपकी मदद के लिए उपलब्ध है।',
    'exam.contactSupport': 'सहायता से संपर्क करें',
    'exam.viewDetails': 'विवरण देखें',
  },
} as const;

type TranslationKey = keyof typeof translations.en;

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('formeasy-lang') as Language) || 'en';
    }
    return 'en';
  });

  const handleSetLang = (newLang: Language) => {
    setLang(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('formeasy-lang', newLang);
    }
  };

  const t = (key: TranslationKey): string => {
    return translations[lang]?.[key] || translations.en[key] || key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang: handleSetLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    // Fallback — provider not yet mounted (e.g. during SSR / test)
    return {
      lang: 'en' as Language,
      setLang: () => {},
      t: (key: TranslationKey) => translations.en[key] || key,
    };
  }
  return context;
}

export { translations };
export type { Language, TranslationKey };
