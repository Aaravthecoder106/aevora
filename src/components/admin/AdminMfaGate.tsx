"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  ShieldCheck,
  KeyRound,
  Copy,
  Check,
  ArrowLeft,
  Loader2,
  Lock,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface AdminMfaGateProps {
  mode: "enroll" | "verify";
  factorId?: string;
  adminEmail: string;
}

export function AdminMfaGate({
  mode,
  factorId: initialFactorId,
  adminEmail,
}: AdminMfaGateProps) {
  const router = useRouter();
  const [factorId, setFactorId] = useState(initialFactorId || "");
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [isInitializing, setIsInitializing] = useState(mode === "enroll");
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (mode !== "enroll") return;

    let active = true;

    async function startEnrollment() {
      setIsInitializing(true);
      setErrorMsg(null);
      try {
        // Clean up any stale unverified TOTP factors before starting a fresh enrollment
        const { data: existingFactors } = await supabase.auth.mfa.listFactors();
        const unverified = (existingFactors?.all || []).filter(
          (f) => f.factor_type === "totp" && (f.status as string) !== "verified"
        );
        for (const f of unverified) {
          await supabase.auth.mfa.unenroll({ factorId: f.id });
        }

        const { data, error } = await supabase.auth.mfa.enroll({
          factorType: "totp",
          friendlyName: "Aevora Admin Console",
        });

        if (!active) return;

        if (error || !data) {
          setErrorMsg(error?.message || "Failed to initialize 2FA enrollment.");
          return;
        }

        setFactorId(data.id);
        setQrCode(data.totp.qr_code);
        setSecret(data.totp.secret);
      } catch (err: any) {
        if (active) {
          setErrorMsg(err?.message || "Unexpected error setting up 2FA.");
        }
      } finally {
        if (active) setIsInitializing(false);
      }
    }

    startEnrollment();
    return () => {
      active = false;
    };
  }, [mode]);

  const handleCopySecret = async () => {
    if (!secret) return;
    await navigator.clipboard.writeText(secret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.replace(/\s+/g, "").trim();
    if (!/^\d{6}$/.test(cleanCode)) {
      setErrorMsg("Enter the 6-digit code from your authenticator app.");
      return;
    }

    if (!factorId) {
      setErrorMsg("Authenticator factor is missing. Reload the page and retry.");
      return;
    }

    setIsVerifying(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code: cleanCode,
      });

      if (error) {
        setErrorMsg(error.message || "Invalid 2FA verification code.");
        return;
      }

      // Ensure cookie-backed session reflects AAL2 before reloading server gate
      await supabase.auth.refreshSession();
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err?.message || "Verification failed.");
    } finally {
      setIsVerifying(false);
    }
  };

  const qrSrc = qrCode
    ? qrCode.startsWith("data:")
      ? qrCode
      : `data:image/svg+xml;utf8,${encodeURIComponent(qrCode)}`
    : "";

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white dark:bg-[#0d0e13] border border-slate-200 dark:border-[#1e1f25] rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-[#1e1f25] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-[#292a2f] text-blue-600 dark:text-[#adc6ff] flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 dark:text-[#e3e1e9]">
                {mode === "enroll"
                  ? "Admin 2FA Setup Required"
                  : "Admin 2FA Verification"}
              </h1>
              <p className="text-[11px] font-mono text-slate-500 dark:text-[#8c909f]">
                {adminEmail} · AAL2 Gate
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-mono text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </Link>
        </div>

        <div className="p-6 space-y-5">
          <div className="p-3.5 rounded-lg bg-blue-50/70 dark:bg-[#1a1b21] border border-blue-200/80 dark:border-[#292a2f] flex items-start gap-2.5 text-xs text-slate-700 dark:text-[#c2c6d6]">
            <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-[#adc6ff] shrink-0 mt-0.5" />
            <p className="leading-relaxed font-mono text-[11px]">
              {mode === "enroll"
                ? "Scan this QR code in Google Authenticator, Authy, or 1Password. Once verified, Postgres RLS permanently blocks admin writes without your 6-digit TOTP code."
                : "Your password session is verified at AAL1. Enter the live 6-digit code from your authenticator app to elevate this session to AAL2."}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-500/30 flex items-start gap-2 text-xs font-mono text-rose-700 dark:text-rose-300">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {mode === "enroll" && (
            <div className="space-y-3">
              {isInitializing ? (
                <div className="h-44 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f]">
                  <Loader2 className="w-6 h-6 text-blue-600 dark:text-[#adc6ff] animate-spin" />
                </div>
              ) : qrSrc ? (
                <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f]">
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <img
                      src={qrSrc}
                      alt="Admin TOTP QR Code"
                      className="w-40 h-40 object-contain"
                    />
                  </div>
                  {secret && (
                    <div className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md bg-white dark:bg-[#0d0e13] border border-slate-200 dark:border-[#292a2f]">
                      <span className="font-mono text-[11px] text-slate-600 dark:text-[#c2c6d6] truncate">
                        {secret}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopySecret}
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-blue-600 dark:text-[#adc6ff] hover:underline shrink-0"
                      >
                        {copiedSecret ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Key</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-[#8c909f] mb-1.5">
                6-Digit Authenticator Code
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#1a1b21] border border-slate-200 dark:border-[#292a2f] rounded-lg text-center font-mono text-lg tracking-[0.35em] text-slate-900 dark:text-[#e3e1e9] focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isVerifying || isInitializing}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying AAL2...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {mode === "enroll"
                      ? "Verify & Lock Admin 2FA"
                      : "Unlock Admin Console"}
                  </span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
