# 👑 Royal Islamic Wedding Digital Invitation Card
### *Syed Zayan Ahmed & Aiza Fatima*

A state-of-the-art, luxury interactive digital wedding invitation designed specifically for a Muslim marriage celebration. Features rich emerald velvet & gold foil aesthetics, 3D envelope opening animation with an authentic golden wax seal, live guest personalization, event timeline, countdown timer, Google Maps navigation, RSVP with a Duas wall, and 1-click WhatsApp sharing.

---

## ✨ Key Features

1. **Interactive 3D Royal Envelope & Wax Seal**:
   - Realistic 3D envelope with folding flaps and an embossed golden Arabic calligraphy wax seal medallion.
   - Floating illuminated Moroccan lanterns and glowing stardust particles.
   - Tap or click the wax seal to trigger a golden sparkle celebration burst and unseal the invitation.

2. **Personalized Invitee System (Send with Custom Name)**:
   - Send custom links to each family or friend via URL parameter:
     - `index.html?prefix=Respected&to=Uncle+Rashid+and+Family`
     - `index.html?prefix=Dearest&to=Dr.+Farhan+Khan`
     - `index.html?prefix=Brother&to=Hamza+and+Family`
   - Both the envelope cover badge and the greeting banner dynamically adapt with the guest's name!

3. **1-Click WhatsApp Guest Link Generator**:
   - Built-in **"Create Guest Link"** button in the header and footer.
   - Choose a greeting prefix (*Dearest*, *Respected*, *Honored*, *Beloved*, *Janab*, *Brother*, *Sister*, etc.).
   - Type any relative or friend's name to instantly get a **pre-filled WhatsApp invite message** and a shareable link.

4. **Authentic Islamic Nuances & Blessings**:
   - **Bismillah Ar-Rahman Ar-Rahim** calligraphy with glowing gold illumination and English translation.
   - **Quranic Verse**: Surah Ar-Rum (30:21) on love, tranquility, and mercy.
   - **Sunnah Dua**: *"Barakallahu laka wa baraka 'alayka wa jama'a baynakuma fee khayr"* (Sunan Abi Dawud).
   - **Prayer Facilities**: Separate prayer and wudu area indicators at the venue.

5. **Complete Program & Events Itinerary**:
   - **Mehndi & Mayun Night** — Friday, 13th Nov 2026
   - **Nikah Ceremony & Khutbah** — Sunday, 15th Nov 2026 (11:30 AM after Zuhr Athan)
   - **Barat & Dawat-e-Nikah (Dinner Reception)** — Sunday, 15th Nov 2026
   - **Dawat-e-Walima (Sunnah Feast)** — Tuesday, 17th Nov 2026

6. **Interactive Features**:
   - **Live Countdown Timer** counting down to the sacred Nikah date.
   - **Add to Google Calendar** and **Apple/Outlook (.ics)** download.
   - **Venue Location & Google Maps** with 1-click "Get Directions" and "Copy Address".
   - **RSVP Form & Duas Wall**: Guests can submit attendance and leave heartfelt Duas that immediately appear on the public Duas wall (persisted in browser storage).
   - **Ambient Spiritual Music Synthesizer**: Built with the Web Audio API — works 100% offline with zero external audio dependencies.

---

## 🚀 How to Run & View

### Option 1: Double-click to Open
Simply double-click `index.html` in your file explorer to open it in any modern browser (Chrome, Edge, Safari, Firefox).

### Option 2: Run Local Web Server
```powershell
# In PowerShell:
cd "c:\Users\HP\Desktop\invition_card"
python -m http.server 8080
```
Then visit:
- Standard invitation: `http://localhost:8080`
- Personalized invitation example: `http://localhost:8080/?prefix=Respected&to=Uncle+Rashid+and+Family`

---

## ✏️ How to Customize Names, Dates & Venue

All details are clearly organized in `index.html`:
- **Couple Names & Lineage**: Search for `<div class="couple-section">` to adjust names, parents, and grandparents.
- **Events & Dates**: Search for `<section class="events-section">` to modify event titles, dates, or timings.
- **Venue**: Search for `<section class="location-section">` to change the palace name, address, or Google Maps coordinates.
- **Countdown Target**: In `js/app.js`, edit the `weddingDate` line:
  ```javascript
  const weddingDate = new Date('2026-11-15T11:30:00').getTime();
  ```
