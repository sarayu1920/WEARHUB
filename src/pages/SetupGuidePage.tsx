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
} from 'lucide-react';

export const SetupGuidePage: React.FC = () => {
  const { isFirebaseReady } = useAuth();
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [copiedRules, setCopiedRules] = useState(false);

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
          Firebase & Netlify Deployment Guide
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Complete step-by-step setup to connect live Firebase Authentication, Cloud Firestore, and deploy to Netlify
        </p>
      </div>

      {/* Connection Status Card */}
      <div className={`p-6 rounded-3xl border ${
        isFirebaseReady
          ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
          : 'bg-amber-50 border-amber-300 text-amber-950'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-2xl ${isFirebaseReady ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'}`}>
              {isFirebaseReady ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base">
                {isFirebaseReady ? 'Firebase is Connected & Active!' : 'Running in Local Demo / Preview Mode'}
              </h3>
              <p className="text-xs opacity-80 mt-0.5">
                {isFirebaseReady
                  ? 'All user sign-ups, logins, listings, requests, and borrow requests are synchronizing with your live Firebase backend.'
                  : 'No active Firebase API keys detected in environment variables. Full UI functionality and test users are available locally.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Step 1: Firebase Project Setup */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/90 shadow-2xs space-y-4">
        <div className="flex items-center space-x-2 text-sm font-bold text-neutral-900">
          <span className="w-6 h-6 rounded-full bg-[#12372A] text-white flex items-center justify-center text-xs">
            1
          </span>
          <h3>Create Firebase Project & Enable Services</h3>
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
            and click <strong>Add project</strong> (e.g. name it <code className="bg-neutral-100 px-1.5 py-0.5 rounded">wearhub-marketplace</code>).
          </li>
          <li>
            Go to <strong>Authentication &gt; Sign-in method</strong>, enable <strong>Email/Password</strong> and <strong>Google</strong>.
          </li>
          <li>
            Go to <strong>Firestore Database</strong>, click <strong>Create database</strong>, and start in Production or Test mode.
          </li>
          <li>
            Go to <strong>Project Settings &gt; General</strong>, scroll down to <strong>Your apps</strong>, click the <strong>&lt;/&gt; Web</strong> icon, register the app, and copy the config credentials.
          </li>
        </ol>
      </section>

      {/* Step 2: Environment Variables */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm font-bold text-neutral-900">
            <span className="w-6 h-6 rounded-full bg-[#12372A] text-white flex items-center justify-center text-xs">
              2
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

        <pre className="p-4 rounded-2xl bg-neutral-900 text-emerald-400 font-mono text-xs overflow-x-auto">
          {envTemplate}
        </pre>
      </section>

      {/* Step 3: Firestore Security Rules */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm font-bold text-neutral-900">
            <span className="w-6 h-6 rounded-full bg-[#12372A] text-white flex items-center justify-center text-xs">
              3
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
          In Firebase Console &gt; Firestore Database &gt; <strong>Rules</strong> tab, paste the rules below to enforce user ownership:
        </p>
        <pre className="p-4 rounded-2xl bg-neutral-900 text-emerald-300 font-mono text-xs overflow-x-auto max-h-56">
          {firestoreRulesTemplate}
        </pre>
      </section>

      {/* Step 4: Netlify Deployment */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/90 shadow-2xs space-y-4">
        <div className="flex items-center space-x-2 text-sm font-bold text-neutral-900">
          <span className="w-6 h-6 rounded-full bg-[#12372A] text-white flex items-center justify-center text-xs">
            4
          </span>
          <h3>Deploy to Netlify (Live Public URL)</h3>
        </div>

        <p className="text-xs text-neutral-600">
          The project already contains a pre-configured <code className="bg-neutral-100 px-1.5 py-0.5 rounded font-mono">netlify.toml</code> for single-page application (SPA) routing redirects.
        </p>

        <div className="space-y-3 text-xs text-neutral-600">
          <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
            <strong className="block text-neutral-900 mb-1">Option A: Via GitHub / Git Repository (Recommended)</strong>
            <p>1. Push this project to your GitHub repository.</p>
            <p>2. Log into Netlify &gt; <strong>Add new site &gt; Import an existing project</strong>.</p>
            <p>3. Build Command: <code className="bg-white px-1 py-0.5 border rounded">npm run build</code>, Publish Directory: <code className="bg-white px-1 py-0.5 border rounded">dist</code>.</p>
            <p>4. Under <strong>Site configuration &gt; Environment variables</strong>, add your Firebase keys.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
            <strong className="block text-neutral-900 mb-1">Option B: Via Netlify CLI</strong>
            <pre className="p-2.5 rounded-lg bg-neutral-900 text-neutral-200 font-mono text-[11px] mt-1">
              npx netlify-cli deploy --prod --dir=dist
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
};
