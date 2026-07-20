export interface CallTurn {
  role: 'agent' | 'user';
  text: string;
  timestamp: string;
}

export interface MockCall {
  id: string;
  sid: string;
  direction: 'INBOUND' | 'OUTBOUND';
  status: 'COMPLETED' | 'BUSY' | 'NO_ANSWER' | 'FAILED' | 'IN_PROGRESS' | 'FORWARD_REQUESTED';
  callerName: string | null;
  callerPhone: string;
  duration: number; // in seconds
  recordingUrl: string | null;
  summary: string | null;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | null;
  transcript: CallTurn[];
  agentId: string;
  leadId: string | null;
  createdAt: string;
}

export interface MockLead {
  id: string;
  name: string | null;
  phone: string;
  email: string | null;
  status: 'NEW' | 'QUALIFIED' | 'BOOKED' | 'COLD';
  interest: 'HIGH' | 'MEDIUM' | 'LOW';
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MockAgent {
  id: string;
  name: string;
  prompt: string;
  voiceId: string;
  phoneNumber: string | null;
  calendarConnected: boolean;
  calendarEmail: string | null;
}

export interface MockTenant {
  id: string;
  name: string;
  twilioPhone: string;
  forwardPhone: string;
  stripeSecret: string;
}

export interface MockAppointment {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  leadId: string;
  leadName: string;
  agentId: string;
  createdAt: string;
}

export const mockTenants: MockTenant[] = [
  { id: "tenant-1", name: "Bright Smile Dental", twilioPhone: "+1 (888) 555-0101", forwardPhone: "+1 (415) 555-0111", stripeSecret: "sk_test_51Px...Dental" },
  { id: "tenant-2", name: "Recruiting Hive", twilioPhone: "+1 (888) 555-0102", forwardPhone: "+1 (415) 555-0122", stripeSecret: "sk_test_51Px...Hive" },
  { id: "tenant-3", name: "Apex Auto Service", twilioPhone: "+1 (888) 555-0103", forwardPhone: "+1 (415) 555-0133", stripeSecret: "sk_test_51Px...Apex" }
];

export const mockAgents: MockAgent[] = [
  {
    id: "agent-1",
    name: "Clara (Dental Front Desk)",
    prompt: "You are Clara, a friendly and professional front desk AI receptionist for Apex Dental. Your goals are: 1. Greet the patient warmly. 2. Collect their name, phone number, and email. 3. Qualify their dental needs (routine cleaning, emergency checkup, or cosmetic). 4. Check calendar availability and book an appointment. Be concise, empathetic, and professional.",
    voiceId: "elevenlabs-clara-id",
    phoneNumber: "+1 (555) 234-5678",
    calendarConnected: true,
    calendarEmail: "frontdesk@apexdental.com",
  },
  {
    id: "agent-2",
    name: "Ethan (Outbound Sales Recruiter)",
    prompt: "You are Ethan, an energetic outbound recruiter for Recruiting Hive. Your goal is to call companies who posted job listings on LinkedIn but haven't hired yet. Introduce Recruiting Hive's placement and candidate sourcing service, qualify their hiring timeline, and schedule a 15-minute demo with one of our lead account managers.",
    voiceId: "elevenlabs-ethan-id",
    phoneNumber: "+1 (555) 876-5432",
    calendarConnected: false,
    calendarEmail: null,
  }
];

export const mockLeads: MockLead[] = [
  {
    id: "lead-1",
    name: "John Doe",
    phone: "+1 (555) 111-2222",
    email: "john.doe@gmail.com",
    status: "BOOKED",
    interest: "HIGH",
    notes: "Needs routine teeth cleaning. Booking confirmed for next Tuesday at 10 AM. Mentioned he has dental insurance with Delta Dental.",
    createdAt: "2026-07-10T14:32:00Z",
    updatedAt: "2026-07-12T09:40:00Z"
  },
  {
    id: "lead-2",
    name: "Sarah Jenkins",
    phone: "+1 (555) 333-4444",
    email: "sarah.j@outlook.com",
    status: "QUALIFIED",
    interest: "HIGH",
    notes: "Inquired about veneers cost. Wants an appointment, but needs to check her work calendar first. AI recommended cosmetic consultation.",
    createdAt: "2026-07-11T09:15:00Z",
    updatedAt: "2026-07-11T09:18:00Z"
  },
  {
    id: "lead-3",
    name: "Robert Chen",
    phone: "+1 (555) 555-6666",
    email: "robert.chen@techcorp.io",
    status: "NEW",
    interest: "MEDIUM",
    notes: "Outbound call answered. Robert is looking to hire 3 senior React developers. Interested in Recruiting Hive candidate sourcing, wants to review placement terms first.",
    createdAt: "2026-07-12T11:00:00Z",
    updatedAt: "2026-07-12T11:04:00Z"
  },
  {
    id: "lead-4",
    name: "Emily Watson",
    phone: "+1 (555) 777-8888",
    email: null,
    status: "COLD",
    interest: "LOW",
    notes: "Called about toothache, but hung up abruptly when asked for email address. Failed to qualify.",
    createdAt: "2026-07-09T16:45:00Z",
    updatedAt: "2026-07-09T16:47:00Z"
  }
];

export const mockCalls: MockCall[] = [
  {
    id: "call-1",
    sid: "CA1234567890abcdef1",
    direction: "INBOUND",
    status: "COMPLETED",
    callerName: "John Doe",
    callerPhone: "+1 (555) 111-2222",
    duration: 112,
    recordingUrl: "/mock-recordings/call-1.mp3",
    summary: "John booked a routine dental cleaning appointment. He provided his email and phone number. His insurance is Delta Dental.",
    sentiment: "POSITIVE",
    agentId: "agent-1",
    leadId: "lead-1",
    createdAt: "2026-07-12T09:38:00Z",
    transcript: [
      { role: "agent", text: "Hello! Thank you for calling Apex Dental Front Desk. My name is Clara. How can I help you today?", timestamp: "09:38:02" },
      { role: "user", text: "Hi Clara, I need to schedule an appointment for a dental cleaning. I haven't been in for about a year.", timestamp: "09:38:12" },
      { role: "agent", text: "I would be happy to help you book that, routine cleanings are so important! May I please have your first and last name?", timestamp: "09:38:20" },
      { role: "user", text: "Yes, it's John Doe.", timestamp: "09:38:26" },
      { role: "agent", text: "Thank you, John. And is this phone number the best way to reach you if we need to contact you?", timestamp: "09:38:33" },
      { role: "user", text: "Yes, this number is perfect.", timestamp: "09:38:37" },
      { role: "agent", text: "Great. Could you also share your email address so we can send confirmation and intake forms?", timestamp: "09:38:44" },
      { role: "user", text: "Sure, it is john dot doe at gmail dot com.", timestamp: "09:38:52" },
      { role: "agent", text: "Perfect, I've got john.doe@gmail.com. Do you have dental insurance you'd like to use?", timestamp: "09:39:00" },
      { role: "user", text: "Yes, I have Delta Dental.", timestamp: "09:39:04" },
      { role: "agent", text: "Excellent, we accept Delta Dental. Let's see: I have an opening next Tuesday, July 21st at 10:00 AM or next Thursday, July 23rd at 2:00 PM. Do either of those work for you?", timestamp: "09:39:18" },
      { role: "user", text: "Tuesday at 10:00 AM works great.", timestamp: "09:39:24" },
      { role: "agent", text: "Perfect! I've booked you in for a routine cleaning on Tuesday, July 21st at 10:00 AM with Dr. Smith. I've sent a calendar invite and intake forms to your email. We look forward to seeing you!", timestamp: "09:39:40" },
      { role: "user", text: "Awesome, thanks Clara. Bye!", timestamp: "09:39:45" },
      { role: "agent", text: "You're welcome, John. Have a wonderful day! Goodbye.", timestamp: "09:39:50" }
    ]
  },
  {
    id: "call-2",
    sid: "CA1234567890abcdef2",
    direction: "INBOUND",
    status: "COMPLETED",
    callerName: "Sarah Jenkins",
    callerPhone: "+1 (555) 333-4444",
    duration: 88,
    recordingUrl: "/mock-recordings/call-2.mp3",
    summary: "Sarah called to ask about the price of porcelain veneers. Clara explained the pricing and consultation process. Sarah was qualified as interested but was busy to book an appointment immediately.",
    sentiment: "POSITIVE",
    agentId: "agent-1",
    leadId: "lead-2",
    createdAt: "2026-07-11T09:15:00Z",
    transcript: [
      { role: "agent", text: "Hello! Thank you for calling Apex Dental Front Desk. My name is Clara. How can I help you today?", timestamp: "09:15:02" },
      { role: "user", text: "Hi, I was calling to check how much you charge for porcelain veneers? I've been thinking about getting my front teeth done.", timestamp: "09:15:15" },
      { role: "agent", text: "Porcelain veneers are a wonderful way to transform your smile! Typically, veneers range from $1,200 to $2,500 per tooth depending on customization, but the exact estimate requires a cosmetic consultation. May I have your name, please?", timestamp: "09:15:35" },
      { role: "user", text: "Yes, my name is Sarah Jenkins.", timestamp: "09:15:41" },
      { role: "agent", text: "Hi Sarah! Would you like to schedule a free 15-minute cosmetic consult with Dr. Smith next week to get an exact cost breakdown?", timestamp: "09:15:52" },
      { role: "user", text: "I definitely want to, but I'm actually driving right now and don't have my calendar. Let me check when I get home and I can call you back.", timestamp: "09:16:04" },
      { role: "agent", text: "I understand, safety first! Can I text you a link to our online calendar at this phone number so you can easily book it later?", timestamp: "09:16:15" },
      { role: "user", text: "Yes, that would be very helpful.", timestamp: "09:16:19" },
      { role: "agent", text: "Great. And if you'd like, I can write down your email address so Dr. Smith can email you our cosmetic pricing guide.", timestamp: "09:16:28" },
      { role: "user", text: "Yes, it is sarah dot j at outlook dot com.", timestamp: "09:16:34" },
      { role: "agent", text: "Perfect, Sarah. I have sent the text link and email guide. Let us know if you have any questions!", timestamp: "09:16:42" },
      { role: "user", text: "Excellent, thank you so much Clara.", timestamp: "09:16:46" }
    ]
  },
  {
    id: "call-3",
    sid: "CA1234567890abcdef3",
    direction: "OUTBOUND",
    status: "COMPLETED",
    callerName: "Robert Chen",
    callerPhone: "+1 (555) 555-6666",
    duration: 95,
    recordingUrl: "/mock-recordings/call-3.mp3",
    summary: "Ethan called Robert regarding Recruiting Hive placement services. Robert is looking to hire 3 senior React developers. He is interested in the placement model but needs to review docs before booking a live demo.",
    sentiment: "NEUTRAL",
    agentId: "agent-2",
    leadId: "lead-3",
    createdAt: "2026-07-12T11:00:00Z",
    transcript: [
      { role: "agent", text: "Hi, Robert! This is Ethan from Recruiting Hive. I noticed you posted a senior React developer opening on LinkedIn last week. How is the candidate search going?", timestamp: "11:00:03" },
      { role: "user", text: "Oh, hi. Yeah, I got a bit busy. I wasn't sure if your agency specializes in vetted developers or just does general placement?", timestamp: "11:00:15" },
      { role: "agent", text: "That is a great question! Yes, Recruiting Hive specializes strictly in vetted technical talent, placing senior engineers in under 7 days. How many open positions are you currently looking to fill?", timestamp: "11:00:30" },
      { role: "user", text: "We have about 3 open developer roles, and we are planning to hire immediately.", timestamp: "11:00:36" },
      { role: "agent", text: "Awesome, 3 roles is perfect. Our vetted pipeline is ready. We can deliver top profiles by tomorrow. Would you be open to a quick 15-minute intro screen-share with our lead placement specialist tomorrow?", timestamp: "11:00:52" },
      { role: "user", text: "I'd like to check out some details on your pricing and vetting process first, if you have it. Can you email me some links?", timestamp: "11:01:05" },
      { role: "agent", text: "Absolutely, I can send our vetting checklist and pricing model right away. Is your email robert.chen@techcorp.io?", timestamp: "11:01:16" },
      { role: "user", text: "Yes, that is correct.", timestamp: "11:01:19" },
      { role: "agent", text: "Perfect! I am sending that over. I'll follow up in a couple of days to see if you have any questions or want to review profiles. Have a great day, Robert!", timestamp: "11:01:30" },
      { role: "user", text: "Thanks, Ethan. Appreciate it. Bye.", timestamp: "11:01:34" }
    ]
  },
  {
    id: "call-4",
    sid: "CA1234567890abcdef4",
    direction: "INBOUND",
    status: "FAILED",
    callerName: null,
    callerPhone: "+1 (555) 999-0000",
    duration: 12,
    recordingUrl: null,
    summary: "Call connected but user hung up immediately without saying anything.",
    sentiment: null,
    agentId: "agent-1",
    leadId: null,
    createdAt: "2026-07-12T15:20:00Z",
    transcript: [
      { role: "agent", text: "Hello! Thank you for calling Apex Dental Front Desk. My name is Clara. How can I help you today?", timestamp: "15:20:02" },
      { role: "user", text: "[Silence / Hanging up noise]", timestamp: "15:20:09" }
    ]
  }
];

export const mockAppointments: MockAppointment[] = [
  {
    id: "app-1",
    title: "Teeth Cleaning - John Doe",
    startTime: "2026-07-21T10:00:00Z",
    endTime: "2026-07-21T11:00:00Z",
    leadId: "lead-1",
    leadName: "John Doe",
    agentId: "agent-1",
    createdAt: "2026-07-12T09:40:00Z"
  }
];

export const mockStats = {
  totalCalls: 148,
  inboundCalls: 96,
  outboundCalls: 52,
  avgDurationSeconds: 78,
  conversionRatePercent: 68, // percent of qualified calls that booked
  leadsGenerated: 34,
  appointmentsBooked: 23,
  sentimentDistribution: {
    positive: 85,
    neutral: 45,
    negative: 18
  },
  callFrequencyOverTime: [
    { date: "07/07", inbound: 12, outbound: 8 },
    { date: "07/08", inbound: 15, outbound: 10 },
    { date: "07/09", inbound: 18, outbound: 6 },
    { date: "07/10", inbound: 10, outbound: 12 },
    { date: "07/11", inbound: 22, outbound: 7 },
    { date: "07/12", inbound: 19, outbound: 9 },
    { date: "07/13", inbound: 14, outbound: 4 }
  ]
};
