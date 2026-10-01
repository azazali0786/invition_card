/**
 * Main Application Logic for Muslim Royal Wedding Invitation
 * Features:
 * 1. Encrypted URL Guest Tokens (No plain text names in URL).
 * 2. Strict Guest Mode: "Create Guest Link" & bottom banner hidden for guests.
 * 3. WhatsApp Redirect: In Guest mode, redirects directly to Admin Family (9250161314).
 *    In Admin mode, shares the personalized invitation message with encrypted link.
 * 4. Dual-side Star Spreading Animation on "OPEN INVITATION".
 * 5. Event Itinerary, Countdown, Map, Calendar .ics & RSVP Duas Wall.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const body = document.body;
  const envelopeOverlay = document.getElementById('envelopeOverlay');
  const openInvitationBtn = document.getElementById('openInvitationBtn');
  const audioToggleBtn = document.getElementById('audioToggleBtn');
  const reopenEnvelopeBtn = document.getElementById('reopenEnvelopeBtn');
  
  // Guest Personalization Targets
  const envelopeGuestName = document.getElementById('envelopeGuestName');
  const mainGuestPrefix = document.getElementById('mainGuestPrefix');
  const mainGuestName = document.getElementById('mainGuestName');
  const rsvpNameInput = document.getElementById('rsvpName');

  // Modal Elements
  const personalizeModal = document.getElementById('personalizeModal');
  const openPersonalizeModalBtn = document.getElementById('openPersonalizeModalBtn');
  const bottomPersonalizeBtn = document.getElementById('bottomPersonalizeBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const customPrefixInput = document.getElementById('customPrefixInput');
  const customGuestInput = document.getElementById('customGuestInput');
  const previewPrefixText = document.getElementById('previewPrefixText');
  const previewNameText = document.getElementById('previewNameText');
  const generatedUrlInput = document.getElementById('generatedUrlInput');
  const copyUrlBtn = document.getElementById('copyUrlBtn');
  const modalWhatsappBtn = document.getElementById('modalWhatsappBtn');
  const applyPreviewOnlyBtn = document.getElementById('applyPreviewOnlyBtn');
  const quickWhatsappShareBtn = document.getElementById('quickWhatsappShareBtn');
  const whatsappNavTooltip = document.getElementById('whatsappNavTooltip');

  // Admin Controls
  const hostAdminToggleLink = document.getElementById('hostAdminToggleLink');
  const hostLoginText = document.getElementById('hostLoginText');
  const adminIndicatorBadge = document.getElementById('adminIndicatorBadge');
  const logoutAdminLink = document.getElementById('logoutAdminLink');

  // Toast Element
  const toastNotification = document.getElementById('toastNotification');
  const toastMessage = document.getElementById('toastMessage');

  // Venue & Calendar
  const copyAddressBtn = document.getElementById('copyAddressBtn');
  const venueAddressText = document.getElementById('venueAddressText');
  const addToCalBtn = document.getElementById('addToCalBtn');
  const downloadIcsBtn = document.getElementById('downloadIcsBtn');

  // RSVP Form & Duas Wall
  const rsvpForm = document.getElementById('rsvpForm');
  const duasContainer = document.getElementById('duasContainer');

  // Configuration Constants
  const HOST_FAMILY_PHONE = '919250161314'; // Host/Admin family WhatsApp (+91 9250161314)
  const HOST_PASSCODES = ['9250', '9250161314', '8800', '8800646224', '1234', 'admin'];
  const CIPHER_KEY = [0x5A, 0x3C, 0x7E, 0x29, 0x8B, 0x14, 0x6D, 0x4F];

  // State
  let isAdmin = false;
  let currentGuest = {
    prefix: 'Dearest',
    name: 'Uncle Rashid & Family'
  };

  /* --------------------------------------------------
     1. ROBUST URL-SAFE ENCRYPTION / DECRYPTION ENGINE
     -------------------------------------------------- */
  function encryptGuestData(prefix, name) {
    try {
      const payload = JSON.stringify({ p: prefix, n: name, v: 1, ts: Date.now() });
      const utf8 = unescape(encodeURIComponent(payload));
      const enc = [];
      for (let i = 0; i < utf8.length; i++) {
        enc.push(String.fromCharCode(utf8.charCodeAt(i) ^ CIPHER_KEY[i % CIPHER_KEY.length]));
      }
      return btoa(enc.join(''))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    } catch (e) {
      console.error('Encryption error:', e);
      return '';
    }
  }

  function decryptGuestData(token) {
    try {
      if (!token) return null;
      let b64 = token.replace(/-/g, '+').replace(/_/g, '/');
      const padded = b64 + '==='.slice((b64.length + 3) % 4);
      const raw = atob(padded);
      const dec = [];
      for (let i = 0; i < raw.length; i++) {
        dec.push(String.fromCharCode(raw.charCodeAt(i) ^ CIPHER_KEY[i % CIPHER_KEY.length]));
      }
      const jsonStr = decodeURIComponent(escape(dec.join('')));
      const data = JSON.parse(jsonStr);
      if (data && data.n) {
        return { prefix: data.p || 'Dearest', name: data.n };
      }
    } catch (e) {
      console.warn('Could not decrypt token:', e);
    }
    return null;
  }

  /* --------------------------------------------------
     2. PARSE QUERY PARAMS & DETERMINE ADMIN VS GUEST
     -------------------------------------------------- */
  function parseQueryParamsAndMode() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('inv') || urlParams.get('code') || urlParams.get('token');
    const guestParam = urlParams.get('to') || urlParams.get('guest') || urlParams.get('name');
    const prefixParam = urlParams.get('prefix');

    // 1. Decrypt token if present
    if (token) {
      const decrypted = decryptGuestData(token);
      if (decrypted) {
        currentGuest.prefix = decrypted.prefix;
        currentGuest.name = decrypted.name;
      }
    } else if (guestParam) {
      // Legacy fallback
      currentGuest.name = decodeURIComponent(guestParam);
      if (prefixParam) currentGuest.prefix = decodeURIComponent(prefixParam);
    }

    // 2. Check Admin Status:
    // If a guest token/parameter is provided, strictly enforce GUEST MODE
    // unless the URL explicitly specifies &admin=true!
    const hasExplicitAdminQuery = urlParams.get('admin') === 'true' || urlParams.get('admin') === '1' || urlParams.get('host') === 'true';

    if (token || guestParam) {
      if (hasExplicitAdminQuery) {
        isAdmin = true;
      } else {
        isAdmin = false;
        sessionStorage.removeItem('wedding_host_admin');
      }
    } else if (hasExplicitAdminQuery) {
      isAdmin = true;
      sessionStorage.setItem('wedding_host_admin', 'true');
    } else if (sessionStorage.getItem('wedding_host_admin') === 'true') {
      isAdmin = true;
    } else {
      // Default direct visit to root URL -> ADMIN MODE
      isAdmin = true;
    }

    applyGuestToUI(currentGuest.prefix, currentGuest.name);
    applyAdminState();
  }

  function applyAdminState() {
    if (isAdmin) {
      body.classList.remove('guest-mode');
      body.classList.add('admin-mode');
      if (adminIndicatorBadge) adminIndicatorBadge.style.display = 'inline-flex';
      if (whatsappNavTooltip) whatsappNavTooltip.textContent = 'Share Invitation';
      if (hostLoginText) hostLoginText.textContent = 'Admin Mode Active';
    } else {
      body.classList.remove('admin-mode');
      body.classList.add('guest-mode');
      if (adminIndicatorBadge) adminIndicatorBadge.style.display = 'none';
      if (whatsappNavTooltip) whatsappNavTooltip.textContent = 'Contact Host Family';
      if (hostLoginText) hostLoginText.textContent = 'Host Login';
    }
  }

  function applyGuestToUI(prefix, name) {
    if (envelopeGuestName) envelopeGuestName.textContent = `${name}`;
    if (mainGuestPrefix) mainGuestPrefix.textContent = prefix;
    if (mainGuestName) mainGuestName.textContent = name;
    if (rsvpNameInput && (!rsvpNameInput.value || rsvpNameInput.value === 'Uncle Rashid & Family')) {
      rsvpNameInput.value = `${prefix} ${name}`;
    }

    // Update modal fields
    if (customPrefixInput) customPrefixInput.value = prefix;
    if (customGuestInput) customGuestInput.value = (name === 'Uncle Rashid & Family' ? '' : name);
    updateModalPreviewAndUrl();
  }

  /* --------------------------------------------------
     3. "OPEN INVITATION" CLICK & STARS SPREADING ANIMATION
     (Shoots only from 2 sides - center is clear)
     -------------------------------------------------- */
  let isEnvelopeOpened = false;

  function handleOpenInvitation() {
    if (isEnvelopeOpened) return;
    isEnvelopeOpened = true;

    // Trigger celebratory star spreading explosion from the 2 sides (left & right)
    if (window.triggerStarCelebration) {
      window.triggerStarCelebration();
    }

    // Play wedding ambient chime and start tranquil background melody
    if (window.weddingAudio) {
      window.weddingAudio.playSealBreakChime();
      window.weddingAudio.start();
    }

    // Envelope flap folding animation
    envelopeOverlay.classList.add('opening');

    // Smooth transition to main invitation
    setTimeout(() => {
      envelopeOverlay.classList.add('opened');
      body.classList.remove('envelope-active');
      triggerScrollReveals();
    }, 1100);
  }

  if (openInvitationBtn) {
    openInvitationBtn.addEventListener('click', handleOpenInvitation);
  }

  if (reopenEnvelopeBtn) {
    reopenEnvelopeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      envelopeOverlay.classList.remove('opened', 'opening');
      body.classList.add('envelope-active');
      isEnvelopeOpened = false;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* --------------------------------------------------
     4. AUDIO CONTROLS
     -------------------------------------------------- */
  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', () => {
      if (window.weddingAudio) {
        window.weddingAudio.toggle();
      }
    });
  }

  /* --------------------------------------------------
     5. GUEST INVITATION GENERATOR (ADMIN ONLY)
     Uses Encrypted Tokens (No plain text names in URL)
     -------------------------------------------------- */
  function openModal() {
    if (!isAdmin) {
      showToast('Guest Link Creator is restricted to Host/Admin.');
      return;
    }
    personalizeModal.classList.add('active');
    personalizeModal.setAttribute('aria-hidden', 'false');
    updateModalPreviewAndUrl();
  }

  function closeModal() {
    personalizeModal.classList.remove('active');
    personalizeModal.setAttribute('aria-hidden', 'true');
  }

  if (openPersonalizeModalBtn) openPersonalizeModalBtn.addEventListener('click', openModal);
  if (bottomPersonalizeBtn) bottomPersonalizeBtn.addEventListener('click', openModal);
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);

  personalizeModal.addEventListener('click', (e) => {
    if (e.target === personalizeModal) closeModal();
  });

  function updateModalPreviewAndUrl() {
    const prefix = customPrefixInput ? customPrefixInput.value : 'Dearest';
    const rawName = (customGuestInput && customGuestInput.value.trim()) ? customGuestInput.value.trim() : 'Uncle Rashid & Family';

    if (previewPrefixText) previewPrefixText.textContent = prefix;
    if (previewNameText) previewNameText.textContent = rawName;

    // Generate Encrypted Token (No plain text in link!)
    const encryptedToken = encryptGuestData(prefix, rawName);
    const baseUrl = window.location.origin + window.location.pathname;
    const finalUrl = `${baseUrl}?inv=${encryptedToken}`;
    
    if (generatedUrlInput) {
      generatedUrlInput.value = finalUrl;
    }
  }

  if (customPrefixInput) customPrefixInput.addEventListener('change', updateModalPreviewAndUrl);
  if (customGuestInput) customGuestInput.addEventListener('input', updateModalPreviewAndUrl);

  // Copy Link Button
  if (copyUrlBtn) {
    copyUrlBtn.addEventListener('click', () => {
      const url = generatedUrlInput.value;
      copyToClipboard(url, 'Encrypted invitation link copied to clipboard!');
    });
  }

  // Apply directly to screen
  if (applyPreviewOnlyBtn) {
    applyPreviewOnlyBtn.addEventListener('click', () => {
      const prefix = customPrefixInput.value || 'Dearest';
      const name = customGuestInput.value.trim() || 'Uncle Rashid & Family';
      applyGuestToUI(prefix, name);
      closeModal();
      showToast(`Preview applied for ${prefix} ${name}`);
    });
  }

  /* --------------------------------------------------
     6. WHATSAPP LOGIC (ADMIN SHARES VS GUEST CONTACTS 9250161314)
     -------------------------------------------------- */
  function handleNavbarWhatsApp() {
    if (isAdmin) {
      // Admin: Open Generator modal or share
      openModal();
    } else {
      // Guest: Redirect directly to Host Family at 9250161314
      contactHostOnWhatsApp();
    }
  }

  if (quickWhatsappShareBtn) {
    quickWhatsappShareBtn.addEventListener('click', handleNavbarWhatsApp);
  }

  // Guest clicks to message host family
  function contactHostOnWhatsApp() {
    const guestGreeting = currentGuest.name ? ` From: ${currentGuest.name}` : '';
    const message = `Assalamu Alaikum! Thank you so much for the royal wedding invitation for Ayan & Tehreem.${guestGreeting}`;
    const waLink = `https://api.whatsapp.com/send?phone=${HOST_FAMILY_PHONE}&text=${encodeURIComponent(message)}`;
    window.open(waLink, '_blank');
  }

  // Admin shares invite with encrypted link
  function shareInviteAsAdmin() {
    const prefix = customPrefixInput ? customPrefixInput.value : currentGuest.prefix;
    const name = customGuestInput && customGuestInput.value.trim() ? customGuestInput.value.trim() : currentGuest.name;
    const encryptedToken = encryptGuestData(prefix, name);
    const baseUrl = window.location.origin + window.location.pathname;
    const inviteUrl = `${baseUrl}?inv=${encryptedToken}`;

    const message = 
      `Assalamu Alaikum Warahmatullah!\n\n` +
      `We cordially invite you, *${prefix} ${name}*, and your honorable family to celebrate the auspicious Baraat & Sacred Nikah ceremony of our beloved:\n\n` +
      `💍 *Ayan Alvi & Tehreem Alvi*\n\n` +
      `📅 *Date:* Wednesday, 21 October 2026\n` +
      `⏰ *Program Timings:*\n` +
      `  • 06:00 PM - Baraat Ravangi (from Village Oledha)\n` +
      `  • 08:00 PM - Sacred Nikah\n` +
      `  • 09:00 PM - Khana (Royal Dinner)\n` +
      `  • 10:00 PM - Waapsi\n\n` +
      `📍 *Venue:* The White Rose Palace, Main Daadri Road, near Haldoni Mode, Kuleshra, Greater Noida, Gautam Buddh Nagar\n` +
      `🗺️ *Venue Map:* https://maps.google.com/?q=28.532343,77.445969\n\n` +
      `Kindly tap here to view your royal digital invitation with the interactive envelope:\n` +
      `${inviteUrl}\n\n` +
      `📞 *Contact / RSVP:* 9250161314, 9837130784, 9311705692, 8010873456, 7428156376\n\n` +
      `With best compliments from Mo. Naushad & Alvi Family.\n` +
      `Looking forward to your gracious presence and heartfelt Duas!`;

    const waLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(waLink, '_blank');
  }

  if (modalWhatsappBtn) {
    modalWhatsappBtn.addEventListener('click', shareInviteAsAdmin);
  }

  /* --------------------------------------------------
     7. HOST LOGIN / LOGOUT TOGGLE IN FOOTER
     -------------------------------------------------- */
  if (hostAdminToggleLink) {
    hostAdminToggleLink.addEventListener('click', (e) => {
      e.preventDefault();
      if (isAdmin) {
        showToast('You are currently in Host Admin mode.');
        return;
      }

      const pass = prompt('Enter Host Admin Passcode (Hint: 9250 or phone):');
      if (pass && HOST_PASSCODES.includes(pass.trim())) {
        sessionStorage.setItem('wedding_host_admin', 'true');
        isAdmin = true;
        applyAdminState();
        showToast('Host Admin Mode Activated! Create Guest Link is now enabled.');
      } else if (pass !== null) {
        showToast('Invalid passcode. Access restricted.');
      }
    });
  }

  if (logoutAdminLink) {
    logoutAdminLink.addEventListener('click', (e) => {
      e.preventDefault();
      sessionStorage.removeItem('wedding_host_admin');
      isAdmin = false;
      applyAdminState();
      showToast('Exited Admin Mode. Viewing as Guest.');
    });
  }

  /* --------------------------------------------------
     8. COUNTDOWN TIMER ENGINE
     Target: Wednesday, October 21, 2026, 8:00 PM
     -------------------------------------------------- */
  const cdDays = document.getElementById('cdDays');
  const cdHours = document.getElementById('cdHours');
  const cdMinutes = document.getElementById('cdMinutes');
  const cdSeconds = document.getElementById('cdSeconds');

  const weddingDate = new Date('2026-10-21T20:00:00').getTime();

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = weddingDate - now;

    if (distance <= 0) {
      if (cdDays) cdDays.textContent = '00';
      if (cdHours) cdHours.textContent = '00';
      if (cdMinutes) cdMinutes.textContent = '00';
      if (cdSeconds) cdSeconds.textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (cdDays) cdDays.textContent = String(days).padStart(2, '0');
    if (cdHours) cdHours.textContent = String(hours).padStart(2, '0');
    if (cdMinutes) cdMinutes.textContent = String(minutes).padStart(2, '0');
    if (cdSeconds) cdSeconds.textContent = String(seconds).padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* --------------------------------------------------
     9. CALENDAR INTEGRATION (.ICS & GOOGLE CALENDAR)
     -------------------------------------------------- */
  if (addToCalBtn) {
    addToCalBtn.addEventListener('click', () => {
      const title = encodeURIComponent("Baraat & Sacred Nikah: Ayan & Tehreem");
      const details = encodeURIComponent("You are cordially invited to celebrate the Baraat & Sacred Nikah of Ayan Alvi & Tehreem Alvi. Schedule: 06:00 PM Baraat Ravangi (from Village Oledha), 08:00 PM Nikah, 09:00 PM Khana, 10:00 PM Waapsi.");
      const location = encodeURIComponent("The White Rose Palace, Main Daadri Road, near Haldoni Mode, Kuleshra, Greater Noida, Gautam Buddh Nagar");
      const dates = "20261021T123000Z/20261021T173000Z";
      const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
      window.open(googleCalUrl, '_blank');
    });
  }

  if (downloadIcsBtn) {
    downloadIcsBtn.addEventListener('click', () => {
      const icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Ayan & Tehreem//Wedding Invitation//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "BEGIN:VEVENT",
        "SUMMARY:Baraat & Sacred Nikah: Ayan & Tehreem",
        "DESCRIPTION:In the name of Allah, Most Gracious, Most Merciful. Wedding & Nikah of Ayan Alvi & Tehreem Alvi. Schedule: 06:00 PM Baraat Ravangi (from Village Oledha), 08:00 PM Nikah, 09:00 PM Khana, 10:00 PM Waapsi.",
        "LOCATION:The White Rose Palace, Main Daadri Road, near Haldoni Mode, Kuleshra, Greater Noida, Gautam Buddh Nagar",
        "DTSTART:20261021T180000",
        "DTEND:20261021T230000",
        "STATUS:CONFIRMED",
        "END:VEVENT",
        "END:VCALENDAR"
      ].join("\r\n");

      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute('download', 'Nikah_Ayan_Tehreem.ics');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Calendar event downloaded (.ics)');
    });
  }

  /* --------------------------------------------------
     10. VENUE ADDRESS COPY
     -------------------------------------------------- */
  if (copyAddressBtn && venueAddressText) {
    copyAddressBtn.addEventListener('click', () => {
      copyToClipboard(venueAddressText.textContent, 'Venue address copied to clipboard!');
    });
  }

  /* --------------------------------------------------
     11. RSVP FORM & DUAS WALL (LOCALSTORAGE SYNC)
     -------------------------------------------------- */
  const DUAS_STORAGE_KEY = 'wedding_duas_list_v2';

  function loadSavedDuas() {
    try {
      const saved = localStorage.getItem(DUAS_STORAGE_KEY);
      if (saved) {
        const duas = JSON.parse(saved);
        duas.forEach(d => prependDuaCard(d.name, d.status, d.guests, d.message, false));
      }
    } catch (e) {
      console.warn('Could not read saved Duas from localStorage', e);
    }
  }

  function saveDuaToStorage(duaObj) {
    try {
      let duas = [];
      const saved = localStorage.getItem(DUAS_STORAGE_KEY);
      if (saved) duas = JSON.parse(saved);
      duas.unshift(duaObj);
      localStorage.setItem(DUAS_STORAGE_KEY, JSON.stringify(duas.slice(0, 50)));
    } catch (e) {
      console.warn('Could not save Dua to localStorage', e);
    }
  }

  function prependDuaCard(name, status, count, message, animate = true) {
    if (!duasContainer) return;

    const bubble = document.createElement('div');
    bubble.className = 'dua-bubble' + (animate ? ' reveal-slide-up revealed' : '');
    
    const sender = document.createElement('div');
    sender.className = 'dua-sender';
    sender.innerHTML = `<strong>${escapeHtml(name)}</strong> <span class="dua-time">${status} • ${count} ${count > 1 ? 'Guests' : 'Guest'}</span>`;

    const msg = document.createElement('p');
    msg.className = 'dua-msg';
    msg.textContent = message ? `"${message}"` : '"Barakallahu lakuma wa baraka alaykuma wa jama\'a baynakuma fee khayr."';

    bubble.appendChild(sender);
    bubble.appendChild(msg);

    duasContainer.insertBefore(bubble, duasContainer.firstChild);
  }

  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('rsvpName').value.trim();
      const attendance = document.getElementById('rsvpAttendance').value;
      const count = parseInt(document.getElementById('rsvpCount').value, 10) || 1;
      const duaText = document.getElementById('rsvpDua').value.trim();

      const newDua = {
        name: name || 'Well Wisher',
        status: attendance,
        guests: count,
        message: duaText || "Barakallahu lakuma! Wishing you both a lifetime of happiness."
      };

      prependDuaCard(newDua.name, newDua.status, newDua.guests, newDua.message, true);
      saveDuaToStorage(newDua);

      showToast("Jazakallahu Khair! Your RSVP & Duas have been received.");
      document.getElementById('rsvpDua').value = '';
    });
  }

  /* --------------------------------------------------
     12. SCROLL REVEAL OBSERVER
     -------------------------------------------------- */
  function triggerScrollReveals() {
    const revealElements = document.querySelectorAll('.reveal-fade, .reveal-slide-up, .reveal-slide-left, .reveal-slide-right');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
  }

  /* --------------------------------------------------
     13. HELPERS (CLIPBOARD & TOAST)
     -------------------------------------------------- */
  function copyToClipboard(text, successMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(successMsg);
      }).catch(() => fallbackCopy(text, successMsg));
    } else {
      fallbackCopy(text, successMsg);
    }
  }

  function fallbackCopy(text, successMsg) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showToast(successMsg);
    } catch (err) {
      showToast('Could not copy link automatically.');
    }
    document.body.removeChild(textArea);
  }

  let toastTimer = null;
  function showToast(message) {
    if (!toastNotification || !toastMessage) return;
    toastMessage.textContent = message;
    toastNotification.classList.add('show');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastNotification.classList.remove('show');
    }, 3500);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Init
  parseQueryParamsAndMode();
  loadSavedDuas();
});
