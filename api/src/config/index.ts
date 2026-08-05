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
  emergencyKeywords: [
    'gas leak', 'fire', 'flooding', 'emergency', '911', 'smoke detector',
    'burst pipe', 'injured', 'injury', 'bleeding', 'explosion'
  ],
  rateLimitCallsPerHour: 5
};
