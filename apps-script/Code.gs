/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║          CLUBOS — GOOGLE APPS SCRIPT BACKEND             ║
 * ║                                                          ║
 * ║  SETUP INSTRUCTIONS:                                     ║
 * ║  1. Open Google Sheets → Extensions → Apps Script        ║
 * ║  2. Paste this entire file                               ║
 * ║  3. Deploy → New Deployment → Web App                    ║
 * ║     - Execute as: Me                                     ║
 * ║     - Who has access: Anyone                             ║
 * ║  4. Copy deployment URL → paste in js/config.js          ║
 * ║  5. Create the sheets listed in SHEET_NAMES below        ║
 * ╚══════════════════════════════════════════════════════════╝
 */

// ===== SHEET CONFIGURATION =====
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID'; // Replace this!

const SHEET_NAMES = {
  MEMBERS:   'Members',
  EVENTS:    'Events',
  BOOKINGS:  'Bookings',
  CHECKINS:  'CheckIns',
  SETTINGS:  'Settings',
};

// ===== COLUMN DEFINITIONS =====
// Members: ID | FirstName | LastName | Email | Phone | Password(hashed) | Membership | Status | Joined | Bookings | Balance
// Events:  ID | Title | Type | Date | StartTime | EndTime | Court | Capacity | Enrolled | Price | Status | Instructor
// Bookings: ID | MemberID | Type | CourtID | EventID | Date | StartTime | EndTime | Status | Price | CreatedAt
// CheckIns: ID | MemberID | Date | Time | Type

// ===== MAIN ROUTER =====
function doPost(e) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    let data = {};
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    }
    const action = data.action || e.parameter.action;
    const result = route(action, data);
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  const action = e.parameter.action;
  if (action === 'ping') {
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'ClubOS API is live!', timestamp: new Date().toISOString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  try {
    const result = route(action, e.parameter);
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function route(action, data) {
  switch (action) {
    case 'login':         return handleLogin(data);
    case 'register':      return handleRegister(data);
    case 'getMembers':    return getMembers();
    case 'getMember':     return getMember(data.id);
    case 'updateMember':  return updateMember(data);
    case 'getEvents':     return getEvents();
    case 'createEvent':   return createEvent(data);
    case 'updateEvent':   return updateEvent(data);
    case 'deleteEvent':   return deleteEvent(data.id);
    case 'enrollEvent':   return enrollEvent(data.eventId, data.memberId);
    case 'getBookings':   return getBookings(data.memberId);
    case 'createBooking': return createBooking(data);
    case 'cancelBooking': return cancelBooking(data.id);
    case 'getCheckins':   return getCheckins();
    case 'checkin':       return recordCheckin(data.memberId, data.type);
    case 'getStats':      return getStats();
    case 'lookupMember':  return lookupMember(data.query);
    default:              return { success: false, message: 'Unknown action: ' + action };
  }
}

// ===== HELPERS =====
function getSheet(name) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    initSheet(sheet, name);
  }
  return sheet;
}

function initSheet(sheet, name) {
  const headers = {
    Members:  ['ID','FirstName','LastName','Email','Phone','Password','Membership','Status','Joined','Bookings','Balance'],
    Events:   ['ID','Title','Type','Date','StartTime','EndTime','Court','Capacity','Enrolled','Price','Status','Instructor'],
    Bookings: ['ID','MemberID','Type','CourtID','EventID','Date','StartTime','EndTime','Status','Price','CreatedAt'],
    CheckIns: ['ID','MemberID','Date','Time','Type'],
    Settings: ['Key','Value'],
  };
  if (headers[name]) {
    sheet.appendRow(headers[name]);
    sheet.setFrozenRows(1);
    sheet.getRange(1,1,1,headers[name].length).setFontWeight('bold').setBackground('#1a1a24').setFontColor('#00e5a0');
  }
}

function sheetToObjects(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data[0];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h.toLowerCase()] = row[i] !== undefined ? String(row[i]) : '');
    return obj;
  });
}

function generateId(prefix) {
  return prefix + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
}

function hashPassword(password) {
  // Simple hash for demo - use a proper library in production
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    hash = ((hash << 5) - hash) + password.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}

// ===== AUTH =====
function handleLogin(data) {
  const sheet = getSheet(SHEET_NAMES.MEMBERS);
  const members = sheetToObjects(sheet);
  const member = members.find(m => m.email.toLowerCase() === data.email.toLowerCase());

  if (!member) return { success: false, message: 'No account found with that email.' };
  if (member.status === 'suspended') return { success: false, message: 'Account suspended. Contact the club.' };

  // In demo: accept any password. In production: compare hashed passwords
  // if (member.password !== hashPassword(data.password)) return { success: false, message: 'Incorrect password.' };

  return {
    success: true,
    user: {
      id: member.id,
      name: member.firstname + ' ' + member.lastname,
      email: member.email,
      membership: member.membership,
      role: data.portal === 'admin' ? 'admin' : 'member',
      portal: data.portal
    }
  };
}

function handleRegister(data) {
  const sheet = getSheet(SHEET_NAMES.MEMBERS);
  const members = sheetToObjects(sheet);

  if (members.find(m => m.email.toLowerCase() === data.email.toLowerCase())) {
    return { success: false, message: 'An account with that email already exists.' };
  }

  const id = generateId('m');
  const today = new Date().toISOString().split('T')[0];
  sheet.appendRow([
    id, data.firstName, data.lastName, data.email, data.phone || '',
    hashPassword(data.password || ''), data.membership || 'guest',
    'active', today, 0, 0
  ]);

  return { success: true, message: 'Account created!', id };
}

// ===== MEMBERS =====
function getMembers() {
  const sheet = getSheet(SHEET_NAMES.MEMBERS);
  const members = sheetToObjects(sheet).map(m => ({
    ...m, password: undefined // never return passwords
  }));
  return { success: true, data: members };
}

function getMember(id) {
  const members = sheetToObjects(getSheet(SHEET_NAMES.MEMBERS));
  const m = members.find(m => m.id === id);
  if (!m) return { success: false, message: 'Member not found' };
  return { success: true, data: { ...m, password: undefined } };
}

function updateMember(data) {
  const sheet = getSheet(SHEET_NAMES.MEMBERS);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const idIdx = headers.findIndex(h => h.toLowerCase() === 'id');

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idIdx]) === String(data.id)) {
      if (data.status) values[i][headers.findIndex(h => h.toLowerCase() === 'status')] = data.status;
      if (data.membership) values[i][headers.findIndex(h => h.toLowerCase() === 'membership')] = data.membership;
      if (data.firstname) values[i][headers.findIndex(h => h.toLowerCase() === 'firstname')] = data.firstname;
      if (data.lastname) values[i][headers.findIndex(h => h.toLowerCase() === 'lastname')] = data.lastname;
      if (data.phone) values[i][headers.findIndex(h => h.toLowerCase() === 'phone')] = data.phone;
      sheet.getDataRange().setValues(values);
      return { success: true };
    }
  }
  return { success: false, message: 'Member not found' };
}

function lookupMember(query) {
  const members = sheetToObjects(getSheet(SHEET_NAMES.MEMBERS));
  const found = members.find(m =>
    m.email.toLowerCase() === query.toLowerCase() ||
    m.id === query ||
    (m.firstname + ' ' + m.lastname).toLowerCase().includes(query.toLowerCase())
  );
  return { success: true, data: found ? { ...found, password: undefined } : null };
}

// ===== EVENTS =====
function getEvents() {
  return { success: true, data: sheetToObjects(getSheet(SHEET_NAMES.EVENTS)) };
}

function createEvent(data) {
  const sheet = getSheet(SHEET_NAMES.EVENTS);
  const id = generateId('e');
  sheet.appendRow([
    id, data.title, data.type, data.date, data.startTime, data.endTime,
    data.court, data.capacity || 12, 0, data.price || 0,
    'active', data.instructor || ''
  ]);
  return { success: true, data: { id, ...data, enrolled: 0, status: 'active' } };
}

function updateEvent(data) {
  const sheet = getSheet(SHEET_NAMES.EVENTS);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const idIdx = headers.findIndex(h => h.toLowerCase() === 'id');

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idIdx]) === String(data.id)) {
      Object.keys(data).forEach(key => {
        const idx = headers.findIndex(h => h.toLowerCase() === key.toLowerCase());
        if (idx >= 0 && key !== 'id') values[i][idx] = data[key];
      });
      sheet.getDataRange().setValues(values);
      return { success: true };
    }
  }
  return { success: false, message: 'Event not found' };
}

function deleteEvent(id) {
  const sheet = getSheet(SHEET_NAMES.EVENTS);
  const values = sheet.getDataRange().getValues();
  const idIdx = values[0].findIndex(h => h.toLowerCase() === 'id');
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idIdx]) === String(id)) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false, message: 'Event not found' };
}

function enrollEvent(eventId, memberId) {
  const sheet = getSheet(SHEET_NAMES.EVENTS);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const idIdx = headers.findIndex(h => h.toLowerCase() === 'id');
  const enrolledIdx = headers.findIndex(h => h.toLowerCase() === 'enrolled');
  const capacityIdx = headers.findIndex(h => h.toLowerCase() === 'capacity');
  const statusIdx = headers.findIndex(h => h.toLowerCase() === 'status');

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idIdx]) === String(eventId)) {
      const enrolled = parseInt(values[i][enrolledIdx]) + 1;
      const capacity = parseInt(values[i][capacityIdx]);
      values[i][enrolledIdx] = enrolled;
      if (enrolled >= capacity) values[i][statusIdx] = 'full';
      sheet.getDataRange().setValues(values);
      return { success: true };
    }
  }
  return { success: false, message: 'Event not found' };
}

// ===== BOOKINGS =====
function getBookings(memberId) {
  const bookings = sheetToObjects(getSheet(SHEET_NAMES.BOOKINGS));
  return { success: true, data: memberId ? bookings.filter(b => b.memberid === memberId) : bookings };
}

function createBooking(data) {
  const sheet = getSheet(SHEET_NAMES.BOOKINGS);
  const id = generateId('b');
  const now = new Date().toISOString();
  sheet.appendRow([
    id, data.memberId || 'm1', data.type || 'court',
    data.courtId || '', data.eventId || '',
    data.date, data.startTime, data.endTime,
    'confirmed', data.price || 0, now
  ]);

  // Increment member booking count
  incrementMemberBookings(data.memberId);

  return { success: true, data: { id, ...data, status: 'confirmed' } };
}

function cancelBooking(id) {
  const sheet = getSheet(SHEET_NAMES.BOOKINGS);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const idIdx = headers.findIndex(h => h.toLowerCase() === 'id');
  const statusIdx = headers.findIndex(h => h.toLowerCase() === 'status');

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idIdx]) === String(id)) {
      values[i][statusIdx] = 'cancelled';
      sheet.getDataRange().setValues(values);
      return { success: true };
    }
  }
  return { success: false, message: 'Booking not found' };
}

function incrementMemberBookings(memberId) {
  if (!memberId) return;
  const sheet = getSheet(SHEET_NAMES.MEMBERS);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const idIdx = headers.findIndex(h => h.toLowerCase() === 'id');
  const bookingsIdx = headers.findIndex(h => h.toLowerCase() === 'bookings');
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idIdx]) === String(memberId)) {
      values[i][bookingsIdx] = (parseInt(values[i][bookingsIdx]) || 0) + 1;
      sheet.getDataRange().setValues(values);
      break;
    }
  }
}

// ===== CHECK-INS =====
function getCheckins() {
  const today = new Date().toISOString().split('T')[0];
  const checkins = sheetToObjects(getSheet(SHEET_NAMES.CHECKINS));
  return { success: true, data: checkins.filter(c => c.date === today) };
}

function recordCheckin(memberId, type) {
  const sheet = getSheet(SHEET_NAMES.CHECKINS);
  const id = generateId('ci');
  const now = new Date();
  const time = now.toTimeString().slice(0, 5);
  const date = now.toISOString().split('T')[0];
  sheet.appendRow([id, memberId, date, time, type || 'walk-in']);
  return { success: true, data: { id, memberId, date, time, type } };
}

// ===== STATS =====
function getStats() {
  const members = sheetToObjects(getSheet(SHEET_NAMES.MEMBERS));
  const events = sheetToObjects(getSheet(SHEET_NAMES.EVENTS));
  const checkins = sheetToObjects(getSheet(SHEET_NAMES.CHECKINS));
  const bookings = sheetToObjects(getSheet(SHEET_NAMES.BOOKINGS));

  const today = new Date().toISOString().split('T')[0];
  const thisMonth = today.slice(0, 7);

  const activeMembers = members.filter(m => m.status === 'active').length;
  const todayCheckins = checkins.filter(c => c.date === today).length;
  const upcomingEvents = events.filter(e => e.date >= today && e.status !== 'cancelled').length;

  // Revenue: sum confirmed bookings this month
  const revenue = bookings
    .filter(b => b.date && b.date.startsWith(thisMonth) && b.status === 'confirmed')
    .reduce((sum, b) => sum + (parseFloat(b.price) || 0), 0);

  return {
    success: true,
    data: {
      totalMembers: members.length,
      activeMembers,
      activeToday: todayCheckins,
      revenueMonth: Math.round(revenue),
      courtUtilization: Math.floor(Math.random() * 30 + 55), // calculated from bookings in production
      upcomingEvents,
      openBookings: bookings.filter(b => b.status === 'confirmed').length,
    }
  };
}

// ===== SETUP HELPER =====
// Run this once to set up all sheets with proper headers
function setupSpreadsheet() {
  Object.values(SHEET_NAMES).forEach(name => getSheet(name));
  Logger.log('ClubOS sheets initialized! ✅');
}
