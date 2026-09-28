/**
 * Main Application Logic for Muslim Royal Wedding Invitation
 * Handles Open Invitation button, celebratory stars spreading animation,
 * URL Personalization, Modal Generator, WhatsApp Pre-filled Links,
 * Countdown Timer, Calendar .ics export, and RSVP Duas Wall.
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

  // State
  let currentGuest = {
    prefix: 'Dearest',
    name: 'Uncle Rashid & Family'
  };

  /* --------------------------------------------------
     1. URL QUERY PARAMETER INITIALIZATION
     -------------------------------------------------- */
  function parseQueryParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const guestParam = urlParams.get('to') || urlParams.get('guest') || urlParams.get('name');
    const prefixParam = urlParams.get('prefix');

    if (guestParam) {
      currentGuest.name = decodeURIComponent(guestParam);
    }
    if (prefixParam) {
      currentGuest.prefix = decodeURIComponent(prefixParam);
    }

    applyGuestToUI(currentGuest.prefix, currentGuest.name);
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
     2. "OPEN INVITATION" CLICK & STARS SPREADING ANIMATION
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
     3. AUDIO CONTROLS
     -------------------------------------------------- */
  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', () => {
      if (window.weddingAudio) {
        window.weddingAudio.toggle();
      }
    });
  }

  /* --------------------------------------------------
     4. PERSONALIZED INVITATION GENERATOR MODAL
     -------------------------------------------------- */
  function openModal() {
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
    const prefix = customPrefixInput.value || 'Dearest';
    const rawName = customGuestInput.value.trim() || 'Uncle Rashid & Family';

    previewPrefixText.textContent = prefix;
    previewNameText.textContent = rawName;

    // Generate Shareable Link
    const baseUrl = window.location.origin + window.location.pathname;
    const finalUrl = `${baseUrl}?prefix=${encodeURIComponent(prefix)}&to=${encodeURIComponent(rawName)}`;
    generatedUrlInput.value = finalUrl;
  }

  if (customPrefixInput) customPrefixInput.addEventListener('change', updateModalPreviewAndUrl);
  if (customGuestInput) customGuestInput.addEventListener('input', updateModalPreviewAndUrl);

  // Copy Link Button
  if (copyUrlBtn) {
    copyUrlBtn.addEventListener('click', () => {
      const url = generatedUrlInput.value;
      copyToClipboard(url, 'Personalized invitation link copied!');
    });
  }

  // Apply directly to screen
  if (applyPreviewOnlyBtn) {
    applyPreviewOnlyBtn.addEventListener('click', () => {
      const prefix = customPrefixInput.value || 'Dearest';
      const name = customGuestInput.value.trim() || 'Uncle Rashid & Family';
      applyGuestToUI(prefix, name);
      closeModal();
      showToast(`Applied invite for ${prefix} ${name}`);
    });
  }

  // WhatsApp Share Buttons
  function shareOnWhatsApp(customMessage = null) {
    const prefix = customPrefixInput ? customPrefixInput.value : currentGuest.prefix;
    const name = customGuestInput && customGuestInput.value.trim() ? customGuestInput.value.trim() : currentGuest.name;
    const inviteUrl = generatedUrlInput ? generatedUrlInput.value : window.location.href;

    const message = customMessage || 
      `Assalamu Alaikum Warahmatullah!\n\n` +
      `We cordially invite you, *${prefix} ${name}*, and your honorable family to celebrate the auspicious Baraat, Nikah & Walima ceremony of our beloved:\n\n` +
      `💍 *Zayd Tariq Khan & Ayah Farooq Al-Mansoor*\n\n` +
      `📅 *Date:* Friday & Saturday, 18 - 19 December 2026\n` +
      `📍 *Venue:* The Imperial Emerald Palace Gardens\n\n` +
      `Kindly tap here to view your royal digital invitation with the interactive envelope:\n` +
      `${inviteUrl}\n\n` +
      `Looking forward to your gracious presence and heartfelt Duas!`;

    const waLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(waLink, '_blank');
  }

  if (modalWhatsappBtn) {
    modalWhatsappBtn.addEventListener('click', () => shareOnWhatsApp());
  }

  if (quickWhatsappShareBtn) {
    quickWhatsappShareBtn.addEventListener('click', () => shareOnWhatsApp());
  }

  /* --------------------------------------------------
     5. COUNTDOWN TIMER ENGINE
     Target: Friday, December 18, 2026, 6:30 PM
     -------------------------------------------------- */
  const cdDays = document.getElementById('cdDays');
  const cdHours = document.getElementById('cdHours');
  const cdMinutes = document.getElementById('cdMinutes');
  const cdSeconds = document.getElementById('cdSeconds');

  const weddingDate = new Date('2026-12-18T18:30:00').getTime();

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
     6. CALENDAR INTEGRATION (.ICS & GOOGLE CALENDAR)
     -------------------------------------------------- */
  if (addToCalBtn) {
    addToCalBtn.addEventListener('click', () => {
      const title = encodeURIComponent("Baraat & Sacred Nikah: Zayd & Ayah");
      const details = encodeURIComponent("You are cordially invited to celebrate the Baraat, Nikah, and Walima of Zayd Tariq Khan & Ayah Farooq Al-Mansoor.");
      const location = encodeURIComponent("The Imperial Emerald Palace Gardens, 77 Royal Boulevard, Cantonment Enclave");
      const dates = "20261218T130000Z/20261219T180000Z"; // UTC format
      const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
      window.open(googleCalUrl, '_blank');
    });
  }

  if (downloadIcsBtn) {
    downloadIcsBtn.addEventListener('click', () => {
      const icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Zayd & Ayah//Wedding Invitation//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "BEGIN:VEVENT",
        "SUMMARY:Baraat & Sacred Nikah: Zayd & Ayah",
        "DESCRIPTION:In the name of Allah, Most Gracious, Most Merciful. Wedding & Nikah of Zayd Tariq Khan & Ayah Farooq Al-Mansoor.",
        "LOCATION:The Imperial Emerald Palace Gardens, 77 Royal Boulevard, Cantonment Enclave",
        "DTSTART:20261218T183000",
        "DTEND:20261219T230000",
        "STATUS:CONFIRMED",
        "END:VEVENT",
        "END:VCALENDAR"
      ].join("\r\n");

      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute('download', 'Nikah_Zayd_Ayah.ics');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Calendar event downloaded (.ics)');
    });
  }

  /* --------------------------------------------------
     7. VENUE ADDRESS COPY
     -------------------------------------------------- */
  if (copyAddressBtn && venueAddressText) {
    copyAddressBtn.addEventListener('click', () => {
      copyToClipboard(venueAddressText.textContent, 'Venue address copied to clipboard!');
    });
  }

  /* --------------------------------------------------
     8. RSVP FORM & DUAS WALL (LOCALSTORAGE SYNC)
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
     9. SCROLL REVEAL OBSERVER
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
     10. HELPERS (CLIPBOARD & TOAST)
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
  parseQueryParams();
  loadSavedDuas();
});
