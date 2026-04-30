// ===== CLUBOS CONFIGURATION =====
// Replace SCRIPT_URL with your deployed Google Apps Script Web App URL
// Replace SPREADSHEET_ID with your Google Spreadsheet ID

const CONFIG = {
  // 🔧 REQUIRED: Deploy your Apps Script and paste the URL here
  SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbxLLVZf6XaTsbHgdTgXVRxTNXfF-Ryux2QDjKr8IcWfqjfFKkpEO9RLAGrCfsB-oVzu/exec',

  // 🔧 OPTIONAL: For direct Sheets API access (requires OAuth setup)
  SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID',

  // App settings
  CLUB_NAME: 'T Club',
  CLUB_LOGO: '⬡',
  CURRENCY: '₱',
  TIMEZONE: 'Philippine Time (PHT)',
  DEMO_MODE: false, // Set to false when connected to real Google Sheets

  // Court/facility configuration
  COURTS: [
    { id: 'court1', name: 'Court 1', type: 'pickleball' },
    { id: 'court2', name: 'Court 2', type: 'pickleball' },
  ],

  // Membership tiers
  MEMBERSHIPS: [
    { id: 'guest', name: 'Guest', price: 0, color: '#555577', perks: ['Limited court bookings', 'Event viewing'] },
    { id: 'basic', name: 'Basic', price: 29, color: '#00b8ff', perks: ['5 court bookings/month', 'Event registration', 'Locker access'] },
    { id: 'premium', name: 'Premium', price: 79, color: '#00e5a0', perks: ['Unlimited bookings', 'Priority booking', 'Guest passes (2/month)', 'Equipment rental'] },
    { id: 'family', name: 'Family', price: 129, color: '#ff6b35', perks: ['Up to 4 members', 'Unlimited bookings', 'Priority booking', 'Guest passes (4/month)'] },
  ],

  // Booking time slots (30-min intervals)
  OPEN_HOUR: 6,    // 6 AM
  CLOSE_HOUR: 22,  // 10 PM
  SLOT_DURATION: 60, // minutes

  // Admin codes (for demo - replace with proper auth in production)
  ADMIN_CODE: 'STAFF2024',

  // Session key
  SESSION_KEY: 'clubos_user',
};
