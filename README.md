# 👑 Royal Islamic Wedding Digital Invitation Card
### *Ayan Alvi & Tehreem Alvi*

A state-of-the-art, luxury interactive digital wedding invitation designed specifically for a Muslim marriage celebration. Features rich emerald velvet & gold foil aesthetics, 3D envelope opening animation with dual-side star cannons, encrypted guest invitation links, role separation (Admin vs. Guest), Google Maps navigation, RSVP with a Duas wall, and direct WhatsApp contact.

---

## ✨ Features & Security Architecture

### 1. 🔒 Encrypted Guest Links (No Plain Text Names in URLs)
- When generating a link for any guest in the **Create Guest Link** modal, the name and greeting prefix are encrypted using a URL-safe multi-byte cipher.
- **Example Generated Link**:
  ```
  http://localhost:8080/?inv=IR4OC7E2KSo7Thta_zZBbTQeRAvPZkNvCV0SROp6TQQyXRAJrTQrLjdVElCpOE85eAZPBalgHm1gDUkQuyJfeGIOTB6zIhA
  ```
- **Privacy & Integrity**:
  - The guest's name is **NOT visible** in the link.
  - Guests cannot simply change the name in the browser address bar to forward the invite to someone else.
  - If a link is tampered with, it gracefully falls back without breaking.

---

## 2. 🛡️ Strict Guest Mode (No Guest Link Creator for Guests)
- **For Guests (when opening `?inv=...`)**:
  - The **"Create Guest Link"** button in the top navigation bar is **completely hidden**.
  - The bottom banner (*"Want to send this invitation to your relatives & friends?"*) is **completely hidden**.
  - Guests cannot access or generate links for other people.
- **For Admin / Host**:
  - Visiting the base URL or adding `?admin=true` enables **Admin Mode**.
  - The **"Create Guest Link"** button and generator modal are active.
  - Hosts can also click the discreet **"Host Login"** lock in the footer and enter their admin passcode (`8800` or family phone `8800646224`).

---

## 3. 💬 WhatsApp Integration & Redirection
- **For Guests**:
  - The WhatsApp button in the navigation bar redirects directly to chat with the host family at phone number: **`+91 8800646224`** (`8800646224`).
  - Pre-fills a polite message:
    *"Assalamu Alaikum! Thank you so much for the royal wedding invitation for Ayan & Tehreem. From: [Guest Name]"*
- **For Admin**:
  - The WhatsApp button opens the invitation generator and shares the pre-formatted royal invitation with the **encrypted link** to invited guests.

---

## 4. 🌟 "OPEN INVITATION" Button & Dual-Side Star Cannons
- Stadium pill button with glowing amber-gold gradient, open envelope icon, uppercase serif text, and spinning sparkle star.
- When clicked, celebratory 5-point gold & emerald stars fire strictly from the **left and right edges** inward and upward.
- The center and envelope area remain clear and unobstructed.

---

## 5. 📜 Main Celebration & Itinerary (Wednesday, 21 October 2026)
- **Baraat Ravangi**: 06:00 PM (Departure from Village "Oledha")
- **Sacred Nikah**: 08:00 PM
- **Khana (Dinner)**: 09:00 PM (Royal Dawat-e-Ta'am)
- **Waapsi**: 10:00 PM (Rukhsati / Return)
- **Venue**: The White Rose Palace, Main Daadri Road, near Haldoni Mode, Kuleshra, Greater Noida, Gautam Buddh Nagar

---

## 🚀 How to Run

```powershell
# Open terminal in project directory:
python -m http.server 8080
```
- **Host / Admin View**: [http://localhost:8080/?admin=true](http://localhost:8080/?admin=true)
- **Guest View Example**: Open any encrypted `?inv=...` link generated from the modal.
