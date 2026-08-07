export interface KbTemplateItem {
  question: string;
  answer: string;
}

export interface KbTemplatePack {
  id: string;
  name: string;
  category: string;
  iconName: string;
  description: string;
  entries: KbTemplateItem[];
}

export const INDUSTRY_KB_TEMPLATES: KbTemplatePack[] = [
  {
    id: 'law-accounting',
    name: 'Law & Accounting Firm',
    category: 'Legal & Finance',
    iconName: 'Scale',
    description: 'Consultation fees, document intake, retainer requirements, billing cycles, and emergency legal intake.',
    entries: [
      {
        question: 'How much is your initial legal or financial consultation?',
        answer: 'Our initial consultation fee is $250 for up to 45 minutes. During this session, an attorney or senior CPA will review your documents and outline your legal options.',
      },
      {
        question: 'What documents should I bring to my first appointment?',
        answer: 'Please bring a valid photo ID, relevant tax returns, contracts, court summons, or financial statements pertaining to your matter.',
      },
      {
        question: 'What are your billing terms and retainer requirements?',
        answer: 'We require an upfront retainer deposit before beginning formal representation. Invoices are issued monthly with itemized hourly rates and expenses.',
      },
      {
        question: 'Do you offer flat-rate pricing for tax returns or corporate filings?',
        answer: 'Yes, we offer fixed flat-rate pricing for standard tax return preparation, corporate entity formation, and basic estate planning packages.',
      },
      {
        question: 'What is your procedure for urgent after-hours legal or tax emergencies?',
        answer: 'For emergency arrests, immediate court deadlines, or audit notices, callers can request an urgent callback or leave a message for our emergency duty officer.',
      },
    ],
  },
  {
    id: 'medical-dentist',
    name: 'Medical Clinic / Dentist',
    category: 'Healthcare',
    iconName: 'Stethoscope',
    description: 'Cancellation policies, accepted insurance, after-hours triage, new patient intake, and prescription refills.',
    entries: [
      {
        question: 'What is your appointment cancellation and late policy?',
        answer: 'Cancellations require at least 24 hours advance notice. Cancellations made with less than 24 hours notice or missed appointments may incur a $50 fee.',
      },
      {
        question: 'Which health and dental insurance plans do you accept?',
        answer: 'We accept Delta Dental, Cigna, MetLife, Aetna, Blue Cross Blue Shield, and most major PPO plans. We also process CareCredit payment plans.',
      },
      {
        question: 'How do I handle an urgent medical or dental emergency after hours?',
        answer: 'For life-threatening emergencies, please dial 911 immediately. For severe dental pain, bleeding, or urgent post-op issues, our receptionist can record your emergency for on-call triage.',
      },
      {
        question: 'What should new patients bring to their first visit?',
        answer: 'New patients should bring a government-issued photo ID, current insurance card, list of active medications, and arrive 15 minutes early to complete registration.',
      },
      {
        question: 'How can I request a prescription refill or medical records release?',
        answer: 'Prescription refill requests require 2 business days notice and can be submitted through our patient portal or requested via our receptionist during business hours.',
      },
    ],
  },
  {
    id: 'hotel-restaurant',
    name: 'Hotel & Restaurants',
    category: 'Hospitality',
    iconName: 'UtensilsCrossed',
    description: 'Check-in/check-out times, dining reservation policies, dietary options, parking, and private event bookings.',
    entries: [
      {
        question: 'What are your standard check-in and check-out times?',
        answer: 'Standard hotel check-in begins at 3:00 PM and check-out is at 11:00 AM. Early check-in or late check-out is subject to room availability and may carry a nominal fee.',
      },
      {
        question: 'What is your dining reservation deposit and cancellation rule?',
        answer: 'Dining reservations for parties of 6 or more require a credit card hold. Cancellations must be made at least 6 hours in advance to avoid a $25 per person no-show fee.',
      },
      {
        question: 'Do you accommodate dietary restrictions, allergies, and vegan diets?',
        answer: 'Yes! Our culinary team prepares dedicated gluten-free, dairy-free, vegetarian, and vegan options. Please inform your server or receptionist when reserving.',
      },
      {
        question: 'What are the parking and valet arrangements?',
        answer: 'We offer self-parking in our secured adjacent garage for $15 per day, and complimentary 2-hour valet parking for restaurant dining guests.',
      },
      {
        question: 'How do I inquire about private dining, weddings, or corporate event catering?',
        answer: 'Our private event team handles bookings for parties up to 150 guests. Our receptionist can gather your event date and guest count for an immediate callback.',
      },
    ],
  },
  {
    id: 'construction-realestate',
    name: 'Construction & Real Estate',
    category: 'Property & Building',
    iconName: 'Building2',
    description: 'Property tour bookings, tenant application criteria, estimate turnarounds, licensing, and security deposits.',
    entries: [
      {
        question: 'What are the tenant income and credit requirements for rental applications?',
        answer: 'Applicants must show gross monthly income equal to at least 3x the monthly rent, a minimum credit score of 650, and pass a background check.',
      },
      {
        question: 'How do I schedule an in-person property viewing or site walk?',
        answer: 'Property tours and site inspections can be scheduled directly with our AI receptionist. Tours are available Monday through Saturday from 9:00 AM to 5:00 PM.',
      },
      {
        question: 'How long does it take to receive a construction or renovation estimate?',
        answer: 'After an initial site assessment, formal detailed construction estimates are prepared and emailed within 3 to 5 business days.',
      },
      {
        question: 'Are your contractors fully licensed, bonded, and insured?',
        answer: 'Yes, all our project managers, general contractors, and trade specialists are state licensed, fully bonded, and hold $2M general liability insurance.',
      },
      {
        question: 'What is your security deposit and earnest money policy?',
        answer: 'Security deposits equal one month rent and are held in an escrow account. Earnest money for purchase contracts is due within 48 hours of offer acceptance.',
      },
    ],
  },
  {
    id: 'trades-homeservice',
    name: 'Trades & Home Service',
    category: 'Services',
    iconName: 'Wrench',
    description: 'Dispatch service call fees, emergency response times, warranty terms, and SMS payment link setup.',
    entries: [
      {
        question: 'What is your service call dispatch fee for home repair?',
        answer: 'Our standard service call dispatch fee is $89, which covers technician travel and preliminary diagnostic evaluation. This fee is applied toward any completed repair work.',
      },
      {
        question: 'How fast is your emergency response time for plumbing or HVAC breakdowns?',
        answer: 'For emergency pipe bursts, gas leaks, or zero AC/heat in extreme weather, our on-call technicians aim for an arrival window of 60 to 90 minutes.',
      },
      {
        question: 'What warranty is provided on parts and labor?',
        answer: 'All trade installations and repair services include a 1-year labor guarantee alongside manufacturer warranties on all replacement parts.',
      },
      {
        question: 'How do payments work for service calls and utility setups?',
        answer: 'Technicians accept all major credit cards on-site, or our receptionist can text an instant secure payment link directly to your mobile phone via SMS.',
      },
      {
        question: 'Do I need to be home during the service appointment?',
        answer: 'An adult (18 years or older) must be present during the entire appointment to authorize work and grant access to the service areas.',
      },
    ],
  },
  {
    id: 'it-managedservice',
    name: 'IT Managed Service',
    category: 'Technology',
    iconName: 'Server',
    description: 'SLA response tiers, 24/7 helpdesk support, onboarding audits, remote ticket creation, and cybersecurity compliance.',
    entries: [
      {
        question: 'What are your Service Level Agreement (SLA) response times for IT support tickets?',
        answer: 'Priority 1 (Critical Outage) tickets receive a guaranteed 15-minute response time. Priority 2 (Standard User) tickets are addressed within 2 hours.',
      },
      {
        question: 'How do employees submit an IT support ticket or report an outage?',
        answer: 'Tickets can be opened by emailing support, calling our helpdesk line, or submitting an issue through the desktop IT agent tray app.',
      },
      {
        question: 'Do you provide 24/7 after-hours emergency network monitoring and support?',
        answer: 'Yes, our Managed IT packages include 24/7 automated network monitoring and on-call engineering response for critical server or firewall failures.',
      },
      {
        question: 'What does your initial onboarding infrastructure audit include?',
        answer: 'Our onboarding audit evaluates network security, backup reliability, cloud licensing, hardware lifecycle, and regulatory compliance (HIPAA/SOC2).',
      },
      {
        question: 'How do you handle remote vs on-site technical support?',
        answer: 'Over 90% of IT issues are resolved instantly via remote access tools. If physical hardware replacement is needed, a field engineer is dispatched to your office.',
      },
    ],
  },
];
