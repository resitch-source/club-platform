# ⬡ ClubOS — Sports Club Management Platform

A complete, mobile-first sports club management platform that runs entirely on GitHub Pages + Google Sheets. No server required.

---

## 🌐 Live Demo
Visit your GitHub Pages URL after deployment.

---

## 📋 Features

### Admin Panel
- **Dashboard** — Stats, court utilization, recent check-ins, today's events
- **Members** — Full member directory, profiles, membership management, status control
- **Events** — Create/edit/delete events (open play, clinics, camps, tournaments, socials)
- **Bookings** — View and manage all court & event bookings
- **Scheduler** — Weekly calendar view (Expanded / Consolidated / Court View)
- **Memberships** — Tier management and distribution overview
- **Check-ins** — Today's attendance log, manual check-in
- **Settings** — Club config, Google Sheets connection

### Member Portal
- **Home** — Personalized dashboard with upcoming bookings and today's events
- **Book a Court** — Interactive time-slot picker with availability view
- **Events** — Browse and register for events (filtered by type)
- **My Bookings** — View/cancel personal bookings
- **Membership** — View current plan, upgrade options
- **Profile** — Personal info, notifications, password

### Kiosk
- **Check-In** — Member lookup by email + one-tap check-in
- **Quick Book** — Walk-in court booking
- **Member Lookup** — Find member info
- **Day Pass** — Purchase single-day access
- **Today's Events** — Live event list with walk-in registration
- **Staff Access** — Password-protected admin override

---

## 🚀 GitHub Pages Deployment

### Step 1: Fork or clone this repo
```bash
git clone https://github.com/yourusername/club-platform
cd club-platform
```

### Step 2: Push to GitHub
```bash
git add .
git commit -m "Initial ClubOS deployment"
git push origin main
```

### Step 3: Enable GitHub Pages
1. Go to your repo → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: **main** / **root**
4. Save — your site will be at `https://yourusername.github.io/club-platform/`

---

## 🔗 Google Sheets Integration

### Step 1: Create the Spreadsheet
1. Go to [sheets.google.com](https://sheets.google.com)
2. Create a new spreadsheet
3. Copy the **Spreadsheet ID** from the URL:
   `https://docs.google.com/spreadsheets/d/**SPREADSHEET_ID**/edit`

### Step 2: Set Up Apps Script
1. In your spreadsheet: **Extensions → Apps Script**
2. Delete any existing code
3. Paste the contents of `apps-script/Code.gs`
4. Replace `YOUR_SPREADSHEET_ID` with your actual ID
5. Run the `setupSpreadsheet()` function once (creates all sheets)
6. Click **Deploy → New Deployment**
   - Type: **Web App**
   - Execute as: **Me**
   - Who has access: **Anyone**
7. Copy the **deployment URL**

### Step 3: Connect the App
Edit `js/config.js`:
```javascript
const CONFIG = {
  SCRIPT_URL: 'https://script.google.com/macros/s/YOUR_ACTUAL_DEPLOYMENT_ID/exec',
  SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID',
  DEMO_MODE: false, // ← Set to false
  CLUB_NAME: 'Your Club Name',
  // ...
};
```

### Spreadsheet Sheet Structure
The Apps Script auto-creates these sheets with headers:

| Sheet | Columns |
|-------|---------|
| **Members** | ID, FirstName, LastName, Email, Phone, Password, Membership, Status, Joined, Bookings, Balance |
| **Events** | ID, Title, Type, Date, StartTime, EndTime, Court, Capacity, Enrolled, Price, Status, Instructor |
| **Bookings** | ID, MemberID, Type, CourtID, EventID, Date, StartTime, EndTime, Status, Price, CreatedAt |
| **CheckIns** | ID, MemberID, Date, Time, Type |
| **Settings** | Key, Value |

---

## 🔧 Configuration

All club settings are in `js/config.js`:

```javascript
const CONFIG = {
  CLUB_NAME: 'My Sports Club',      // Club display name
  CURRENCY: '$',                     // Currency symbol
  TIMEZONE: 'America/New_York',      // Your timezone

  COURTS: [                          // Your courts
    { id: 'court1', name: 'Court 1', type: 'pickleball' },
    { id: 'court2', name: 'Court 2', type: 'tennis' },
  ],

  MEMBERSHIPS: [                     // Membership tiers
    { id: 'guest', name: 'Guest', price: 0, perks: [...] },
    { id: 'basic', name: 'Basic', price: 29, perks: [...] },
    { id: 'premium', name: 'Premium', price: 79, perks: [...] },
  ],

  OPEN_HOUR: 6,                      // Facility open (6 AM)
  CLOSE_HOUR: 22,                    // Facility close (10 PM)
  SLOT_DURATION: 60,                 // Booking slot minutes

  ADMIN_CODE: 'STAFF2024',          // Kiosk staff override code
};
```

---

## 📱 Mobile Support
ClubOS is fully responsive and works on:
- 📱 iPhone / Android phones
- 📟 Tablets (ideal for kiosk mode)
- 💻 Desktop browsers
- 🖥️ Widescreen monitors

The sidebar collapses to a hamburger menu on mobile. The kiosk mode is designed for touch screens.

---

## 🎨 Terminology Reference

| Term | Definition |
|------|-----------|
| **Member Portal** | Web interface for players to manage bookings/account |
| **Admin Panel** | Staff dashboard for managing the facility |
| **Kiosk** | Self-service tablet station at your facility |
| **Events** | Structured activities (clinics, open play, camps) |
| **Schedulers** | Calendar views — Expanded (detailed) or Consolidated (roll-up) |
| **Membership** | Account tier — required for every account (even free Guest) |
| **Members/Players** | Account holders — paying or free guest level |
| **Check-in** | Attendance tracking via kiosk, app, or staff |

---

## 🏗️ File Structure

```
club-platform/
├── index.html                  # Login / portal selector
├── css/
│   ├── main.css               # Core design system
│   └── login.css              # Login page styles
├── js/
│   ├── config.js              # ← Edit this for your club
│   ├── api.js                 # Google Sheets API layer
│   └── auth.js                # Session management
├── pages/
│   ├── admin-panel.html       # Admin dashboard
│   ├── member-portal.html     # Member interface
│   └── kiosk.html            # Self-service kiosk
├── apps-script/
│   └── Code.gs               # Deploy this to Google Apps Script
└── README.md
```

---

## 🔒 Security Notes

- **Demo Mode**: Accepts any password. Set `DEMO_MODE: false` for production.
- **Admin Code**: Change `ADMIN_CODE` in config.js from the default.
- **Apps Script**: Deployed as "Execute as Me" — your Google account credentials are not exposed.
- **Passwords**: The provided hash is for demo only. For production, consider adding a proper auth service (Firebase Auth, Supabase, etc.) or using Google OAuth.
- **HTTPS**: GitHub Pages serves over HTTPS automatically ✅

---

## 💡 Tips

- **First run**: Keep `DEMO_MODE: true` to test all features with sample data
- **Kiosk mode**: Open `pages/kiosk.html` full-screen on a tablet at your facility
- **Staff code**: Default is `STAFF2024` — change it in config.js
- **Multiple clubs**: Fork the repo and deploy separate instances per location

---

## 📞 Support
This is an open-source project. Customize freely for your club's needs.