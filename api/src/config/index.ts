import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  databaseUrl: process.env.DATABASE_URL || '',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  groqApiKey: process.env.GROQ_API_KEY || '',
  deepgramApiKey: process.env.DEEPGRAM_API_KEY || '',
  elevenLabsApiKey: process.env.ELEVEN_LABS_API_KEY || '',
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || '',
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || '',
  twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_FROM_PHONE || '',
  publicApiUrl: process.env.PUBLIC_API_URL || process.env.APP_URL || 'https://api.yourdomain.com',
  emergencyKeywords: [
    'gas leak', 'fire', 'flooding', 'emergency', '911', 'smoke detector',
    'burst pipe', 'injured', 'injury', 'bleeding', 'explosion'
  ],
  adminEmail: process.env.ADMIN_EMAIL || '',
  adminPassword: process.env.ADMIN_PASSWORD || '',
  adminUsername: process.env.ADMIN_USERNAME || 'Platform Administrator',
  rateLimitCallsPerHour: 5
};

