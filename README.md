# WEARHUB — Student-to-Student Clothing & Wearables Marketplace

> **Wear more. Waste less.**  
> The modern sustainable fashion and clothing marketplace built by college students, for college students.

---

## 🌿 About WEARHUB

WEARHUB is a campus-first platform designed to solve the college clothing dilemma. Students frequently need expensive outfits for single-occasion events—such as placement interviews, college fests, traditional/ethnic days, dance and cultural performances, farewell galas, and hackathons—only to let them sit idle in hostel closets afterward.

WEARHUB enables students to:
- **Buy & Sell:** Affordable second-hand campus clothes and accessories.
- **Borrow & Lend:** Rent outfits for 1–4 days with clear daily rates and refundable deposits.
- **Exchange:** Swap garments with peers for fresh styles without spending money.
- **Donate:** Pass lab coats, textbooks, or surplus clothing directly to junior students.
- **Post Requests:** Ask the campus community for specific items needed for upcoming events.

---

## 🎨 Design & Aesthetic
- **Color Palette:** Dark forest green (`#12372A`), rich emerald (`#1E4D2B`, `#2D6A4F`), light mint/sage (`#D8F3DC`), cream (`#FAF9F6`), and warm neutral accents.
- **Typography:** Plus Jakarta Sans & Playfair Display for a modern editorial fashion feel.
- **Campus First:** Dedicated badges for universities, campus meetup spots, and student verification.

---

## 🚀 Key Features

1. **Multi-University Browsing & Filtering:**
   - Preloaded Indian universities: **VIT-AP University**, **VIT Vellore**, **SRM University AP**, **Andhra University**, **IIT Madras**, **IIT Bombay**, **BITS Pilani**, **Delhi University**, and more.
   - Filter by: "My University", "All Universities", or select specific colleges.
   - Built-in form to request missing universities.
   - Every listing prominently displays its host campus.

2. **Complete Marketplace & Search:**
   - Filter by Category (*Ethnic & Traditional, Western & Casual, Formal & Suits, Dance & Costumes, Party & Fest, Winterwear, Accessories & Bags, Footwear*).
   - Filter by Size (*XS to XXL, Free Size*), Condition (*Brand New with Tags, Like New, Gently Used, Well Loved*), Price range, and Transaction Type.
   - Sort by Newest, Price (Low-to-High, High-to-Low), and Most Popular.

3. **Borrowing System with Calculator:**
   - Select start date, return date, and college occasion.
   - Automatic fee calculation based on daily rate and duration.
   - Transparent security deposit and peer-to-peer campus handoff disclosure.

4. **Campus Request Board:**
   - Broadcast clothing needs to the campus community with date needed and purpose.
   - Students can submit offers directly with item descriptions and contact numbers.
   - Requesters can review incoming offers in a private response modal.

5. **Student Dashboard & Profile:**
   - Manage My Listings, My Requests, Borrowing Requests (sent & received), Items I Am Lending, and Saved Items.
   - Edit student bio, roll number, contact phone, and home campus.

6. **Peer-to-Peer Messaging:**
   - Built-in conversation threads tied directly to listings with item preview headers.
   - Instant inquiry buttons for buyers, borrowers, and swappers.

7. **Firebase & Local Test Mode:**
   - **Production Mode:** When Firebase environment variables are provided, connects to Firebase Auth and Cloud Firestore.
   - **Preview Mode:** When Firebase credentials are not yet configured, a test session mode activates with preloaded verified campus items and instant one-click demo user switching (e.g. Arjun @ VIT-AP or Priya @ SRM AP).

---

## 🛠️ Tech Stack

- **Frontend:** React 19 + TypeScript + Vite 8
- **Styling:** Tailwind CSS v4 + `@tailwindcss/vite`
- **Routing:** React Router v7 (`react-router-dom`)
- **Icons:** `lucide-react`
- **Backend / Authentication:** Firebase Authentication + Cloud Firestore
- **Deployment:** Netlify with SPA redirect rules (`netlify.toml`)

---

## 📋 Getting Started Locally

### 1. Prerequisites
- **Node.js:** v18+ (tested on Node v24)
- **npm:** v9+

### 2. Installation
Open your terminal inside the project directory:
```bash
cd "C:\Users\nalam\.gemini\antigravity\scratch\wearhub"
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 4. Build for Production
```bash
npm run build
```
The optimized production bundle will be generated in `dist/`.

---

## 🔥 Firebase Setup Guide

Follow these steps to connect your own live Firebase project:

### Step 1: Create a Firebase Project
1. Visit the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and name it (e.g. `wearhub-campus`).
3. Disable Google Analytics (optional) and click **Create Project**.

### Step 2: Enable Authentication Providers & Authorize Netlify Domain
1. In the Firebase console left menu, click **Build > Authentication**.
2. Click **Get Started**.
3. Under the **Sign-in method** tab:
   - Enable **Email/Password** > click **Save**.
   - Click **Add new provider** > choose **Google**:
     - Toggle **Enable**.
     - Set **Project public-facing name** (e.g. `WEARHUB`).
     - Select a **Project support email** and click **Save**.
4. In the **Settings** tab under **Authorized domains**:
   - Verify `localhost` is listed.
   - Click **Add domain** and enter your deployed Netlify domain (e.g., `wearhub.netlify.app`). This is required for Google OAuth popup verification.

### Step 3: Create Cloud Firestore Database
1. In the left menu, click **Build > Firestore Database**.
2. Click **Create database**.
3. Select your preferred Cloud Firestore location (e.g. `asia-south1` for India).
4. Start in **Production mode**.
5. Go to the **Rules** tab, paste the rules from `firestore.rules` (or below), and click **Publish**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if true;
      allow create, update: if request.auth != null && request.auth.uid == userId;
    }
    match /listings/{listingId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && resource.data.ownerId == request.auth.uid;
    }
    match /requests/{requestId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && resource.data.requesterId == request.auth.uid;
      match /responses/{responseId} {
        allow read: if true;
        allow create: if request.auth != null;
      }
    }
    match /borrowRequests/{borrowId} {
      allow read, update: if request.auth != null && (
        resource.data.requesterId == request.auth.uid || resource.data.ownerId == request.auth.uid
      );
      allow create: if request.auth != null;
    }
  }
}
```

### Step 4: Add Firebase Configuration to `.env`
1. Go to **Project Settings** (gear icon) > **General**.
2. Under **Your apps**, click the **Web icon (`</>`)**, register app `wearhub-web`.
3. Copy the Firebase config keys into a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef
```
4. Restart the development server (`npm run dev`). The top banner will immediately update to green: `Firebase Live Connected`.

---

## 🌐 Netlify Deployment Guide

The project is pre-configured with `netlify.toml` for seamless client-side single page routing and security headers.

### Deploy Option 1: Git Integration (Recommended)
1. Commit and push the project to GitHub, GitLab, or Bitbucket.
2. Log into [Netlify](https://app.netlify.com/).
3. Click **Add new site > Import an existing project**.
4. Select your repository.
5. Set:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
6. Click **Site configuration > Environment variables**, and add your Firebase credentials:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
7. Click **Deploy Site**. Netlify will provide your shareable public URL (e.g., `https://wearhub.netlify.app`).

### Deploy Option 2: Netlify CLI
1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```
2. Build the production files:
   ```bash
   npm run build
   ```
3. Deploy directly:
   ```bash
   netlify deploy --prod --dir=dist
   ```

---

## 🛡️ Campus Safety Guidelines
- **Public Campus Meetups:** Always arrange handoffs and returns in public campus spots with security or high foot traffic (e.g. Central Library foyer, Student Activity Center, Main Canteen).
- **Mutual Inspection:** Check seams, zippers, and fabric condition together before exchanging borrowing fees or security deposits.
- **Direct P2P Settlement:** WEARHUB connects students on campus without hidden online processing cuts. All deposits and fees are handled directly between peers.

---

## 📁 Recommended Workspace Directory
For working on this project in your code editor or IDE, set your workspace to:
`C:\Users\nalam\.gemini\antigravity\scratch\wearhub`
