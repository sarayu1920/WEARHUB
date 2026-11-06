import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Database,
  ShieldCheck,
  CheckCircle2,
  Copy,
  ExternalLink,
  Key,
  Server,
  Cloud,
  Layers,
  Terminal,
  AlertTriangle,
  Globe,
} from 'lucide-react';

export const SetupGuidePage: React.FC = () => {
  const { isFirebaseReady } = useAuth();
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [copiedRules, setCopiedRules] = useState(false);
  const [copiedStorageRules, setCopiedStorageRules] = useState(false);

  const storageRulesTemplate = `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Listing item images: Public read, owner-authenticated upload with validation
    match /listings/{userId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null
        && request.auth.uid == userId
        && request.resource.contentType.matches('image/(jpeg|png|webp)')
        && request.resource.size < 5 * 1024 * 1024;
      allow delete: if request.auth != null && request.auth.uid == userId;
    }
  }
}`;

  const envTemplate = `# .env file for WEARHUB (in project root)
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=wearhub-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=wearhub-app
VITE_FIREBASE_STORAGE_BUCKET=wearhub-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef`;

  const firestoreRulesTemplate = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // User profiles: strictly private to the account owner
    // Document ID must equal request.auth.uid and uid field must remain immutable
    match /users/{userId} {
      allow read, delete: if isOwner(userId);
      allow create: if isAuthenticated() && request.auth.uid == userId && request.resource.data.uid == userId;
      allow update: if isOwner(userId) && request.resource.data.uid == resource.data.uid;
    }

    // Listings: Public read, authenticated users can create their own, owner can edit/delete
    // The ownerId field cannot be altered during updates
    match /listings/{listingId} {
      allow read: if true;
      allow create: if isAuthenticated() && request.resource.data.ownerId == request.auth.uid;
      allow update: if isAuthenticated() && 
        resource.data.ownerId == request.auth.uid &&
        request.resource.data.ownerId == resource.data.ownerId;
      allow delete: if isAuthenticated() && resource.data.ownerId == request.auth.uid;
    }

    // Requests: Public read, authenticated users can create their own, author can edit/delete
    // The requesterId field cannot be altered during updates
    match /requests/{requestId} {
      allow read: if true;
      allow create: if isAuthenticated() && request.resource.data.requesterId == request.auth.uid;
      allow update: if isAuthenticated() && 
        resource.data.requesterId == request.auth.uid &&
        request.resource.data.requesterId == resource.data.requesterId;
      allow delete: if isAuthenticated() && resource.data.requesterId == request.auth.uid;

      // Responses to requests: Public read, authenticated responder can create, author can edit/delete
      match /responses/{responseId} {
        allow read: if true;
        allow create: if isAuthenticated() && request.resource.data.responderId == request.auth.uid;
        allow update: if isAuthenticated() && 
          resource.data.responderId == request.auth.uid &&
          request.resource.data.responderId == resource.data.responderId &&
          request.resource.data.requestId == resource.data.requestId;
        allow delete: if isAuthenticated() && resource.data.responderId == request.auth.uid;
      }
    }

    // Borrow requests: Only borrower (requester) or lender (owner) can read or update
    // Critical relational fields (ownerId, requesterId, listingId) are immutable
    match /borrowRequests/{borrowId} {
      allow read: if isAuthenticated() && (
        resource.data.requesterId == request.auth.uid || 
        resource.data.ownerId == request.auth.uid
      );
      allow create: if isAuthenticated() && request.resource.data.requesterId == request.auth.uid;
      allow update: if isAuthenticated() && (
        resource.data.requesterId == request.auth.uid || 
        resource.data.ownerId == request.auth.uid
      ) &&
        request.resource.data.ownerId == resource.data.ownerId &&
        request.resource.data.requesterId == resource.data.requesterId &&
        request.resource.data.listingId == resource.data.listingId;
      allow delete: if isAuthenticated() && resource.data.requesterId == request.auth.uid;
    }

    // Conversations: Strictly restricted to conversation participants
    // Participant list cannot be manipulated during updates
    match /conversations/{conversationId} {
      allow read: if isAuthenticated() && request.auth.uid in resource.data.participantIds;
      allow create: if isAuthenticated() && request.auth.uid in request.resource.data.participantIds;
      allow update: if isAuthenticated() && 
        request.auth.uid in resource.data.participantIds &&
        request.resource.data.participantIds == resource.data.participantIds;
      allow delete: if false;

      // Messages subcollection: Strictly append-only by verified participants; immutable history
      match /messages/{messageId} {
        allow read: if isAuthenticated() && 
          request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participantIds;
        allow create: if isAuthenticated() && 
          request.resource.data.senderId == request.auth.uid &&
          request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participantIds;
        allow update, delete: if false;
      }
    }
  }
}`;

  const copyToClipboard = (text: string, setter: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Title */}
      <div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
          <Database className="w-3.5 h-3.5" />
          <span>System & Environment Configuration</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
          Firebase & Netlify Authentication & Deployment Guide
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Complete step-by-step setup to connect live Firebase Authentication, Google Sign-in provider, Cloud Firestore, and deploy to Netlify
        </p>
      </div>

      {/* Connection Status Card */}
      <div
        className={`p-6 rounded-3xl border ${
          isFirebaseReady
            ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
            : 'bg-amber-50 border-amber-300 text-amber-950'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2.5 rounded-2xl ${
                isFirebaseReady ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'
              }`}
            >
              {isFirebaseReady ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base">
                {isFirebaseReady ? 'Firebase is Connected & Active!' : 'Running in Local Demo / Preview Mode'}
              </h3>
              <p className="text-xs opacity-80 mt-0.5">
                {isFirebaseReady
                  ? 'All user sign-ups, logins, listings, requests, and borrow requests are synchronizing with your live Firebase backend.'
                  : 'No active Firebase API keys detected in environment variables. Full UI functionality, local preview registration, and test users are available locally.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Step 1: Firebase Project Setup & Google Sign-In Provider */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/90 shadow-2xs space-y-4">
        <div className="flex items-center space-x-2 text-sm font-bold text-neutral-900">
          <span className="w-6 h-6 rounded-full bg-[#12372A] text-white flex items-center justify-center text-xs">
            1
          </span>
          <h3>Create Firebase Project & Enable Auth Providers</h3>
        </div>
        <ol className="list-decimal list-inside space-y-2 text-xs text-neutral-600 leading-relaxed pl-2">
          <li>
            Open the{' '}
            <a
              href="https://console.firebase.google.com/"
              target="_blank"
              rel="noreferrer"
              className="text-[#12372A] font-bold underline inline-flex items-center"
            >
              Firebase Console <ExternalLink className="w-3 h-3 ml-1" />
            </a>{' '}
            and click <strong>Add project</strong> (e.g. name it <code className="bg-neutral-100 px-1.5 py-0.5 rounded font-mono">wearhub-marketplace</code>).
          </li>
          <li>
            Go to <strong>Authentication &gt; Sign-in method</strong> tab:
            <ul className="list-disc list-inside pl-4 pt-1 space-y-1 text-neutral-700">
              <li>
                Click <strong>Email/Password</strong> &gt; toggle <strong>Enable</strong> &gt; click <strong>Save</strong>.
              </li>
              <li>
                Click <strong>Add new provider</strong> &gt; choose <strong>Google</strong>:
                <ul className="list-circle list-inside pl-4 pt-0.5 text-neutral-600">
                  <li>Toggle <strong>Enable</strong>.</li>
                  <li>Set <strong>Project public-facing name</strong> (e.g. <code className="bg-neutral-100 px-1 py-0.5 rounded font-mono">WEARHUB</code>).</li>
                  <li>Select a <strong>Project support email</strong> from your Google account.</li>
                  <li>Click <strong>Save</strong>.</li>
                </ul>
              </li>
            </ul>
          </li>
          <li>
            Go to <strong>Firestore Database</strong> &gt; click <strong>Create database</strong> &gt; choose your nearest location (e.g., <code className="bg-neutral-100 px-1.5 py-0.5 rounded font-mono">asia-south1 (Mumbai)</code>).
          </li>
          <li>
            Go to <strong>Project Settings &gt; General</strong> &gt; under <strong>Your apps</strong> click the <strong>&lt;/&gt; Web</strong> icon &gt; register app name &gt; copy your SDK config keys.
          </li>
        </ol>
      </section>

      {/* Step 2: Authorize Netlify & Localhost Domains in Firebase Console */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/90 shadow-2xs space-y-4">
        <div className="flex items-center space-x-2 text-sm font-bold text-neutral-900">
          <span className="w-6 h-6 rounded-full bg-[#12372A] text-white flex items-center justify-center text-xs">
            2
          </span>
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4 text-emerald-700" />
            <h3>Authorize Your Netlify Domain in Firebase Console</h3>
          </div>
        </div>

        <p className="text-xs text-neutral-600 leading-relaxed">
          Google OAuth requires domain authorization. If your deployment domain is not added to the authorized list, Google sign-in will fail with an <code className="bg-neutral-100 px-1 py-0.5 rounded font-mono text-rose-700">auth/unauthorized-domain</code> error:
        </p>

        <ol className="list-decimal list-inside space-y-2 text-xs text-neutral-600 leading-relaxed pl-2">
          <li>
            In Firebase Console, navigate to <strong>Authentication &gt; Settings</strong> tab.
          </li>
          <li>
            Scroll down to the <strong>Authorized domains</strong> section.
          </li>
          <li>
            By default, <code className="bg-neutral-100 px-1.5 py-0.5 rounded font-mono">localhost</code> and your Firebase domain are present.
          </li>
          <li>
            Click <strong>Add domain</strong> and enter your Netlify site URL (e.g. <code className="bg-neutral-100 px-1.5 py-0.5 rounded font-mono">wearhub.netlify.app</code> or your custom domain).
          </li>
          <li>
            Click <strong>Add</strong> to save the authorized domain.
          </li>
        </ol>
      </section>

      {/* Step 3: Environment Variables (.env) */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm font-bold text-neutral-900">
            <span className="w-6 h-6 rounded-full bg-[#12372A] text-white flex items-center justify-center text-xs">
              3
            </span>
            <h3>Create .env File in Project Root</h3>
          </div>
          <button
            onClick={() => copyToClipboard(envTemplate, setCopiedEnv)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copiedEnv ? 'Copied!' : 'Copy Template'}</span>
          </button>
        </div>

        <p className="text-xs text-neutral-500">
          Create a file named <code className="bg-neutral-100 px-1 py-0.5 rounded font-mono text-neutral-800">.env</code> in the project root directory and add your Firebase credentials:
        </p>

        <pre className="p-4 rounded-2xl bg-neutral-900 text-emerald-400 font-mono text-xs overflow-x-auto">
          {envTemplate}
        </pre>
      </section>

      {/* Step 4: Firestore Security Rules */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm font-bold text-neutral-900">
            <span className="w-6 h-6 rounded-full bg-[#12372A] text-white flex items-center justify-center text-xs">
              4
            </span>
            <h3>Paste Firestore Security Rules</h3>
          </div>
          <button
            onClick={() => copyToClipboard(firestoreRulesTemplate, setCopiedRules)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copiedRules ? 'Copied!' : 'Copy Rules'}</span>
          </button>
        </div>
        <p className="text-xs text-neutral-500">
          In Firebase Console &gt; Firestore Database &gt; <strong>Rules</strong> tab, paste the rules below to enforce student ownership and prevent unauthorized profile modifications:
        </p>
        <pre className="p-4 rounded-2xl bg-neutral-900 text-emerald-300 font-mono text-xs overflow-x-auto max-h-56">
          {firestoreRulesTemplate}
        </pre>
      </section>

      {/* Step 5: Firebase Cloud Storage Rules */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm font-bold text-neutral-900">
            <span className="w-6 h-6 rounded-full bg-[#12372A] text-white flex items-center justify-center text-xs">
              5
            </span>
            <h3>Enable Cloud Storage & Paste Storage Rules</h3>
          </div>
          <button
            onClick={() => copyToClipboard(storageRulesTemplate, setCopiedStorageRules)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copiedStorageRules ? 'Copied!' : 'Copy Rules'}</span>
          </button>
        </div>
        <p className="text-xs text-neutral-500">
          In Firebase Console &gt; <strong>Storage</strong> (under Build), click <strong>Get Started</strong> to initialize your storage bucket. Then in the <strong>Rules</strong> tab, paste the rules below to allow authenticated students to upload listing photos (max 5 MB JPEG/PNG/WebP):
        </p>
        <pre className="p-4 rounded-2xl bg-neutral-900 text-emerald-300 font-mono text-xs overflow-x-auto max-h-48">
          {storageRulesTemplate}
        </pre>
      </section>

      {/* Step 6: Netlify Deployment */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/90 shadow-2xs space-y-4">
        <div className="flex items-center space-x-2 text-sm font-bold text-neutral-900">
          <span className="w-6 h-6 rounded-full bg-[#12372A] text-white flex items-center justify-center text-xs">
            6
          </span>
          <h3>Deploy to Netlify (Live Public URL)</h3>
        </div>

        <p className="text-xs text-neutral-600">
          The project already contains a pre-configured <code className="bg-neutral-100 px-1.5 py-0.5 rounded font-mono">netlify.toml</code> for single-page application (SPA) routing redirects.
        </p>

        <div className="space-y-3 text-xs text-neutral-600">
          <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
            <strong className="block text-neutral-900 mb-1">Via GitHub / Git Repository (Recommended)</strong>
            <p>1. Push this project to your GitHub repository.</p>
            <p>2. Log into Netlify &gt; <strong>Add new site &gt; Import an existing project</strong>.</p>
            <p>3. Build Command: <code className="bg-white px-1 py-0.5 border rounded font-mono">npm run build</code>, Publish Directory: <code className="bg-white px-1 py-0.5 border rounded font-mono">dist</code>.</p>
            <p>4. Under <strong>Site configuration &gt; Environment variables</strong>, add the 6 <code className="font-mono">VITE_FIREBASE_*</code> keys.</p>
            <p>5. Under Firebase Console &gt; Authentication &gt; Settings &gt; Authorized domains, add your generated Netlify subdomain.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
