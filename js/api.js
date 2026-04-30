// ===== CLUBOS API LAYER =====
// Handles all communication with Google Apps Script backend

const ClubAPI = (() => {

  // ---- DEMO DATA ----
  const DEMO = {
    members: [
      { id: 'm1', firstName: 'Alex', lastName: 'Rivera', email: 'alex@example.com', phone: '555-0101', membership: 'premium', status: 'active', joined: '2024-01-15', bookings: 24, balance: 0 },
      { id: 'm2', firstName: 'Jordan', lastName: 'Kim', email: 'jordan@example.com', phone: '555-0102', membership: 'basic', status: 'active', joined: '2024-03-20', bookings: 8, balance: 29 },
      { id: 'm3', firstName: 'Sam', lastName: 'Patel', email: 'sam@example.com', phone: '555-0103', membership: 'guest', status: 'active', joined: '2024-05-01', bookings: 2, balance: 0 },
      { id: 'm4', firstName: 'Morgan', lastName: 'Chen', email: 'morgan@example.com', phone: '555-0104', membership: 'family', status: 'active', joined: '2023-11-10', bookings: 41, balance: 0 },
      { id: 'm5', firstName: 'Casey', lastName: 'Walsh', email: 'casey@example.com', phone: '555-0105', membership: 'basic', status: 'suspended', joined: '2024-02-28', bookings: 5, balance: 58 },
      { id: 'm6', firstName: 'Taylor', lastName: 'Okonkwo', email: 'taylor@example.com', phone: '555-0106', membership: 'premium', status: 'active', joined: '2023-09-05', bookings: 67, balance: 0 },
    ],
    events: [
      { id: 'e1', title: 'Morning Open Play', type: 'open_play', date: getTodayStr(), startTime: '08:00', endTime: '10:00', court: 'court1', capacity: 16, enrolled: 12, price: 10, status: 'active', instructor: '' },
      { id: 'e2', title: 'Beginner Clinic', type: 'clinic', date: getTodayStr(), startTime: '10:30', endTime: '12:00', court: 'court2', capacity: 8, enrolled: 6, price: 35, status: 'active', instructor: 'Coach Martinez' },
      { id: 'e3', title: 'Advanced Drills', type: 'clinic', date: getDateStr(1), startTime: '09:00', endTime: '11:00', court: 'court3', capacity: 6, enrolled: 4, price: 45, status: 'active', instructor: 'Coach Lee' },
      { id: 'e4', title: 'Evening Open Play', type: 'open_play', date: getTodayStr(), startTime: '17:00', endTime: '19:00', court: 'court4', capacity: 20, enrolled: 20, price: 10, status: 'full', instructor: '' },
      { id: 'e5', title: 'Ladies\' Social', type: 'social', date: getDateStr(2), startTime: '13:00', endTime: '15:00', court: 'court1', capacity: 12, enrolled: 7, price: 15, status: 'active', instructor: '' },
      { id: 'e6', title: 'Junior Camp', type: 'camp', date: getDateStr(3), startTime: '14:00', endTime: '16:00', court: 'court2', capacity: 10, enrolled: 3, price: 25, status: 'active', instructor: 'Coach Smith' },
    ],
    bookings: [
      { id: 'b1', memberId: 'm1', courtId: 'court1', date: getTodayStr(), startTime: '14:00', endTime: '15:00', status: 'confirmed', type: 'court', price: 15 },
      { id: 'b2', memberId: 'm1', eventId: 'e2', date: getTodayStr(), startTime: '10:30', endTime: '12:00', status: 'confirmed', type: 'event', price: 35 },
      { id: 'b3', memberId: 'm2', courtId: 'court3', date: getDateStr(1), startTime: '09:00', endTime: '10:00', status: 'confirmed', type: 'court', price: 15 },
      { id: 'b4', memberId: 'm1', courtId: 'court2', date: getDateStr(-1), startTime: '16:00', endTime: '17:00', status: 'completed', type: 'court', price: 15 },
    ],
    checkins: [
      { id: 'c1', memberId: 'm1', date: getTodayStr(), time: '08:30', type: 'court' },
      { id: 'c2', memberId: 'm6', date: getTodayStr(), time: '09:15', type: 'open_play' },
      { id: 'c3', memberId: 'm4', date: getTodayStr(), time: '10:45', type: 'clinic' },
    ]
  };

  function getTodayStr() {
    return new Date().toISOString().split('T')[0];
  }
  function getDateStr(offset) {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toISOString().split('T')[0];
  }

  // ---- HTTP HELPER ----
  async function call(action, data = {}) {
    if (CONFIG.DEMO_MODE || CONFIG.SCRIPT_URL.includes('YOUR_SCRIPT_ID')) {
      return demoHandler(action, data);
    }
    try {
      const url = new URL(CONFIG.SCRIPT_URL);
      url.searchParams.append('action', action);

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action, ...data }),
      });
      const result = await response.json();
      return result;
    } catch (err) {
      console.warn('API call failed, using demo mode:', err);
      return demoHandler(action, data);
    }
  }

  // ---- DEMO HANDLER ----
  function demoHandler(action, data) {
    switch (action) {
      case 'login':
        return { success: true, user: { id: 'm1', name: 'Demo User', email: data.email, role: data.portal === 'admin' ? 'admin' : 'member', membership: 'premium' } };
      case 'register':
        return { success: true, message: 'Account created successfully' };
      case 'getMembers':
        return { success: true, data: DEMO.members };
      case 'getMember':
        return { success: true, data: DEMO.members.find(m => m.id === data.id) || DEMO.members[0] };
      case 'getEvents':
        return { success: true, data: DEMO.events };
      case 'getBookings':
        return { success: true, data: DEMO.bookings.filter(b => !data.memberId || b.memberId === data.memberId) };
      case 'getCheckins':
        return { success: true, data: DEMO.checkins };
      case 'createBooking': {
        const nb = { id: 'b' + Date.now(), ...data, status: 'confirmed' };
        DEMO.bookings.push(nb);
        return { success: true, data: nb };
      }
      case 'cancelBooking': {
        const idx = DEMO.bookings.findIndex(b => b.id === data.id);
        if (idx >= 0) DEMO.bookings[idx].status = 'cancelled';
        return { success: true };
      }
      case 'createEvent': {
        const ne = { id: 'e' + Date.now(), ...data, enrolled: 0, status: 'active' };
        DEMO.events.push(ne);
        return { success: true, data: ne };
      }
      case 'updateEvent': {
        const ei = DEMO.events.findIndex(e => e.id === data.id);
        if (ei >= 0) Object.assign(DEMO.events[ei], data);
        return { success: true };
      }
      case 'deleteEvent': {
        const di = DEMO.events.findIndex(e => e.id === data.id);
        if (di >= 0) DEMO.events.splice(di, 1);
        return { success: true };
      }
      case 'enrollEvent': {
        const ev = DEMO.events.find(e => e.id === data.eventId);
        if (ev) ev.enrolled = Math.min(ev.enrolled + 1, ev.capacity);
        return { success: true };
      }
      case 'checkin': {
        const ci = { id: 'c' + Date.now(), memberId: data.memberId, date: getTodayStr(), time: new Date().toTimeString().slice(0,5), type: data.type || 'walk-in' };
        DEMO.checkins.push(ci);
        return { success: true, data: ci };
      }
      case 'getStats':
        return { success: true, data: {
          totalMembers: 148,
          activeToday: 23,
          revenueMonth: 4280,
          courtUtilization: 72,
          upcomingEvents: DEMO.events.filter(e => e.status !== 'cancelled').length,
          openBookings: DEMO.bookings.filter(b => b.status === 'confirmed').length,
        }};
      case 'updateMember': {
        const mi = DEMO.members.findIndex(m => m.id === data.id);
        if (mi >= 0) Object.assign(DEMO.members[mi], data);
        return { success: true };
      }
      case 'lookupMember':
        return { success: true, data: DEMO.members.find(m => m.email === data.query || (m.firstName + ' ' + m.lastName).toLowerCase().includes(data.query.toLowerCase())) || null };
      default:
        return { success: false, message: 'Unknown action' };
    }
  }

  // ---- PUBLIC API ----
  return {
    login: (email, password, portal) => call('login', { email, password, portal }),
    register: (data) => call('register', data),
    getMembers: () => call('getMembers'),
    getMember: (id) => call('getMember', { id }),
    updateMember: (data) => call('updateMember', data),
    getEvents: () => call('getEvents'),
    createEvent: (data) => call('createEvent', data),
    updateEvent: (data) => call('updateEvent', data),
    deleteEvent: (id) => call('deleteEvent', { id }),
    enrollEvent: (eventId, memberId) => call('enrollEvent', { eventId, memberId }),
    getBookings: (memberId) => call('getBookings', { memberId }),
    createBooking: (data) => call('createBooking', data),
    cancelBooking: (id) => call('cancelBooking', { id }),
    getCheckins: () => call('getCheckins'),
    checkin: (memberId, type) => call('checkin', { memberId, type }),
    getStats: () => call('getStats'),
    lookupMember: (query) => call('lookupMember', { query }),
  };
})();