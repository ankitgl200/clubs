import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const SECRET_KEY = 'SM_CLUB_INVITE_SECURE_TOKEN_2026';

/**
 * Generates an 8-character invitation code:
 * - First 4 characters: random capital letters [A-Z]
 * - Last 4 characters: random digits [0-9]
 * - Starting is NOT fixed (purely randomized)
 * Example: LGIE8725
 */
export function generateInvitationCode() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits = '0123456789';
  let letterPart = '';
  let digitPart = '';
  for (let i = 0; i < 4; i++) {
    letterPart += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  for (let i = 0; i < 4; i++) {
    digitPart += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  return `${letterPart}${digitPart}`;
}

/**
 * Encrypts an invitation code for inclusion in shareable links.
 * Returns an encrypted, URL-safe token.
 */
export function encryptInvitationCode(code) {
  if (!code) return '';
  const cleanCode = code.toString().trim().toUpperCase();
  // Deterministic encryption (no random nonce) so the link remains 100% fixed and never changes every second
  const rawPayload = cleanCode;

  let hex = '';
  for (let i = 0; i < rawPayload.length; i++) {
    const charCode = rawPayload.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length);
    hex += charCode.toString(16).padStart(2, '0');
  }
  return `enc_${hex}`;
}

/**
 * Decrypts an encrypted invitation token or returns the plaintext code.
 * Handles full URLs, path segments, and raw codes gracefully.
 */
export function decryptInvitationCode(tokenOrCode) {
  if (!tokenOrCode) return '';
  const str = tokenOrCode.toString().trim();
  const clean = str.split('/').pop().split('?')[0].trim();

  // If not encrypted, return clean code
  if (!clean.startsWith('enc_')) {
    return clean.toUpperCase();
  }

  try {
    const hex = clean.slice(4);
    let decrypted = '';
    for (let i = 0; i < hex.length; i += 2) {
      const charCode = parseInt(hex.substr(i, 2), 16) ^ SECRET_KEY.charCodeAt((i / 2) % SECRET_KEY.length);
      decrypted += String.fromCharCode(charCode);
    }
    const [rawCode] = decrypted.split(':');
    const finalCode = (rawCode || decrypted).trim().toUpperCase();
    if (finalCode && /^[A-Z0-9_-]{4,16}$/i.test(finalCode)) {
      return finalCode;
    }
  } catch (e) {
    console.warn('Failed to decrypt invitation code:', e);
  }

  return clean.toUpperCase();
}

/**
 * Calculates remaining time until expiration
 */
export function calculateTimeRemaining(expiresAt) {
  if (!expiresAt) {
    return { isExpired: true, formatted: '00h 00m 00s', hours: 0, minutes: 0, seconds: 0 };
  }
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) {
    return { isExpired: true, formatted: '00h 00m 00s', hours: 0, minutes: 0, seconds: 0 };
  }
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  const pad = (n) => n.toString().padStart(2, '0');
  const formatted = `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
  return { isExpired: false, formatted, hours, minutes, seconds };
}

/**
 * Live Countdown component that ticks down every second
 */
export function LiveCountdown({ expiresAt, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeRemaining(expiresAt));

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = calculateTimeRemaining(expiresAt);
      setTimeLeft(remaining);
      if (remaining.isExpired && onExpire) {
        onExpire();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  if (timeLeft.isExpired) {
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 flex items-center gap-1 border border-rose-200 dark:border-rose-900">
        <Clock className="w-3 h-3 text-rose-500" />
        <span>Expired</span>
      </span>
    );
  }

  return (
    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 flex items-center gap-1.5 border border-amber-200 dark:border-amber-800/60 shadow-xs">
      <Clock className="w-3 h-3 animate-pulse text-amber-600 dark:text-amber-400" />
      <span>Expires in {timeLeft.formatted}</span>
    </span>
  );
}
