/**
 * Main Application Logic for Muslim Royal Wedding Invitation
 * Handles Envelope 3D Animation, URL Personalization, Modal Generator,
 * WhatsApp Pre-filled Links, Countdown Timer, Calendar .ics export, and RSVP Duas Wall.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const body = document.body;
  const envelopeOverlay = document.getElementById('envelopeOverlay');
  const waxSealBtn = document.getElementById('waxSealBtn');
  const waxSealImg = document.getElementById('waxSealImg');
  const audioToggleBtn = document.getElementById('audioToggleBtn');
  const reopenEnvelopeBtn = document.getElementById('reopenEnvelopeBtn');
  
  // Guest Personalization Targets
  const envelopeGuestPrefix = document.getElementById('envelopeGuestPrefix');
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
    name: 'Honored Guest & Family'
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
    if (envelopeGuestPrefix) envelopeGuestPrefix.textContent = `Especially Prepared For:`;
    if (envelopeGuestName) envelopeGuestName.textContent = `${prefix} ${name}`;
    if (mainGuestPrefix) mainGuestPrefix.textContent = prefix;
    if (mainGuestName) mainGuestName.textContent = name;
    if (rsvpNameInput && (!rsvpNameInput.value || rsvpNameInput.value === 'Honored Guest & Family')) {
      rsvpNameInput.value = `${prefix} ${name}`;
    }

    // Update modal fields
    if (customPrefixInput) customPrefixInput.value = prefix;
    if (customGuestInput) customGuestInput.value = (name === 'Honored Guest & Family' ? '' : name);
    updateModalPreviewAndUrl();
  }

  /* --------------------------------------------------
     2. ENVELOPE OPENING ANIMATION & AUDIO CHIME
     -------------------------------------------------- */
  let isEnvelopeOpened = false;

  function openEnvelope() {
    if (isEnvelopeOpened) return;
    isEnvelopeOpened = true;

    // Get seal coordinates for sparkle burst
    const rect = waxSealImg ? waxSealImg.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 };
    const burstX = rect.left + rect.width / 2;
    const burstY = rect.top + rect.height / 2;

    // Trigger visual sparkles & audio chime
    if (window.triggerSparkleBurst) {
      window.triggerSparkleBurst(burstX, burstY);
    }
    if (window.weddingAudio) {
      window.weddingAudio.playSealBreakChime();
      // Auto start soft ambient music if user clicked
      window.weddingAudio.start();
    }

    // Step 1: Flap opening and letter slide
    envelopeOverlay.classList.add('opening');

    // Step 2: Fade envelope out and reveal main invitation
    setTimeout(() => {
      envelopeOverlay.classList.add('opened');
      body.classList.remove('envelope-active');
      triggerScrollReveals();
    }, 1100);
  }

  if (waxSealBtn) {
    waxSealBtn.addEventListener('click', openEnvelope);
    waxSealBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openEnvelope();
      }
    });
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
    const rawName = customGuestInput.value.trim() || 'Honored Guest & Family';

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
      const name = customGuestInput.value.trim() || 'Honored Guest & Family';
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
      `We cordially invite you, *${prefix} ${name}*, and your honorable family to celebrate the auspicious Nikah & Wedding ceremony of our beloved:\n\n` +
      `💍 *Syed Zayan & Aiza Fatima*\n\n` +
      `📅 *Date:* Sunday, 15th November 2026\n` +
      `📍 *Venue:* The Royal Palm Grand Palace\n\n` +
      `Kindly open your personalized royal digital invitation with the interactive envelope here:\n` +
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
     -------------------------------------------------- */
  const cdDays = document.getElementById('cdDays');
  const cdHours = document.getElementById('cdHours');
  const cdMinutes = document.getElementById('cdMinutes');
  const cdSeconds = document.getElementById('cdSeconds');

  // Nikah Target: November 15, 2026, 11:30 AM
  const weddingDate = new Date('2026-11-15T11:30:00').getTime();

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
      const title = encodeURIComponent("Nikah Ceremony: Syed Zayan & Aiza Fatima");
      const details = encodeURIComponent("You are cordially invited to celebrate the Nikah and Wedding banquet of Syed Zayan & Aiza Fatima.");
      const location = encodeURIComponent("The Royal Palm Grand Palace, Ballroom Noor, MG Road, 560001");
      const dates = "20261115T060000Z/20261115T120000Z"; // UTC format
      const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
      window.open(googleCalUrl, '_blank');
    });
  }

  if (downloadIcsBtn) {
    downloadIcsBtn.addEventListener('click', () => {
      const icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Zayan & Aiza//Wedding Invitation//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "BEGIN:VEVENT",
        "SUMMARY:Nikah Ceremony: Syed Zayan & Aiza Fatima",
        "DESCRIPTION:In the name of Allah, Most Gracious, Most Merciful. Wedding & Nikah of Syed Zayan & Aiza Fatima.",
        "LOCATION:The Royal Palm Grand Palace, Ballroom Noor, MG Road",
        "DTSTART:20261115T113000",
        "DTEND:20261115T170000",
        "STATUS:CONFIRMED",
        "END:VEVENT",
        "END:VCALENDAR"
      ].join("\r\n");

      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute('download', 'Nikah_Zayan_Aiza.ics');
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
  const DUAS_STORAGE_KEY = 'wedding_duas_list_v1';

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
