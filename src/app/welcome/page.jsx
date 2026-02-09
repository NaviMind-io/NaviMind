"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { landingQuickChecks } from "@/data/landingQuickChecks";
import ParticleBackground from "@/components/landing/ParticleBackground";
import Logo from "@/components/branding/Logo";
import { loginWithGoogle } from "@/firebase/authClient";

export default function WelcomePage() {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");

    async function handleGoogle() {
    setAuthError("");
    try {
      setIsSubmitting(true);
      await loginWithGoogle();
      router.replace("/app");
    } catch (err) {
      console.error("Google sign-in error:", err);
      alert("Google sign-in failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const [qIndex, setQIndex] = useState(() =>
  Math.floor(Math.random() * landingQuickChecks.length)
);
  const [typed, setTyped] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [showOtherOptions, setShowOtherOptions] = useState(false);

  const TYPING_DURATION_MS = 4000;
  const READING_PAUSE_MS = 3000;
  const FADE_MS = 400;

  const current = landingQuickChecks[qIndex] || { text: "", ref: "" };
  const typingTimerRef = useRef(null);
  const holdTimerRef = useRef(null);

  useEffect(() => {
    clearTimeout(typingTimerRef.current);
    clearTimeout(holdTimerRef.current);

    setTyped("");
    setIsTyping(true);

    const full = current.text || "";
    const perChar =
      full.length > 0 ? TYPING_DURATION_MS / full.length : TYPING_DURATION_MS;

    let i = 0;
    const type = () => {
      setTyped(full.slice(0, i));
      i += 1;
      if (i <= full.length) {
        typingTimerRef.current = setTimeout(type, perChar);
      } else {
        setIsTyping(false);
        holdTimerRef.current = setTimeout(() => {
         setQIndex((prev) => {
  let next = prev;
  while (next === prev) {
    next = Math.floor(Math.random() * landingQuickChecks.length);
  }
  return next;
});
        }, READING_PAUSE_MS);
      }
    };

    typingTimerRef.current = setTimeout(type, perChar);

    return () => {
      clearTimeout(typingTimerRef.current);
      clearTimeout(holdTimerRef.current);
    };
  }, [qIndex, current.text]);

  return (
    <motion.div
      className="WelcomePage fixed inset-0 z-[100] flex flex-col items-center justify-center gradient-bg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Фон */}
      <div className="absolute inset-0 gradient-bg">
        <ParticleBackground />
      </div>

      {/* Контент */}
      <div className="
  relative z-10
  flex flex-col items-center justify-between flex-1
  px-6 text-center
  pt-10 sm:pt-16 md:pt-20 lg:pt-24
  pb-[calc(env(safe-area-inset-bottom)+4rem)]
">

  {/* Верх: логотип + слоган */}
  <div className="flex flex-col items-center mb-1 sm:mb-6">
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.8, ease: "easeOut" }}
    className="mb-2"
  >
    <Logo />
  </motion.div>
    <motion.p
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      className="mt-1 text-[14px] sm:text-[14px] md:text-[16px] 
           font-medium text-white/60 tracking-normal leading-tight"
>
      Your AI Copilot for Maritime Operations.
    </motion.p>
  </div>

  {/* Низ: typewriter */}
  <div className="in-h-[56px] sm:min-h-[80px] flex items-center justify-center w-full welcome-typewriter">
    <AnimatePresence mode="wait">
      <motion.div
        key={qIndex}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: FADE_MS / 1000 }}
      >
        <p className="text-[20px] sm:text-[30px] font-extrabold leading-snug px-4 text-center whitespace-normal break-words max-w-[800px] mx-auto">
  {typed}
  {isTyping && (
    <span
      aria-hidden="true"
      className="inline-block align-[-0.1em] w-[1px] h-[1.2em] bg-current ml-1"
    />
  )}
</p>
      </motion.div>
    </AnimatePresence>
  </div>
  
  {/* Auth buttons */}
<div className="mt-6 flex flex-col items-center gap-4">

  {/* Google — всегда видна */}
  <button
    type="button"
    onClick={handleGoogle}
    disabled={isSubmitting}
    className="
  w-[260px] sm:w-[280px]
  flex items-center justify-center gap-5
  py-3 px-6
  bg-white/90 backdrop-blur-sm
  text-gray-800
  border border-gray-300
  rounded-xl
  shadow-md
  hover:bg-white
  transition
  disabled:opacity-60 disabled:cursor-not-allowed
  text-sm font-medium
"
  >
    <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
    Continue with Google
  </button>

  {/* Toggle */}
  {!showOtherOptions && (
    <button
  type="button"
  onClick={() => setShowOtherOptions(true)}
  className="
    mt-3
    mb-6
    text-base
    text-white/60
    hover:text-white
    transition
  "
>
  Other options
</button>
  )}

  {/* Apple + Email */}
  <AnimatePresence>
  {showOtherOptions && (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex flex-col items-center gap-3 mt-2"
    >
      {/* Apple */}
      <button
        type="button"
        onClick={() => alert("Apple Sign-In coming next")}
        className="
          w-[260px] sm:w-[280px]
          flex items-center justify-center gap-5
          py-3 px-6
          bg-neutral-800/90 backdrop-blur-sm
          text-white
          border border-neutral-700
          rounded-xl
          shadow-md
          hover:bg-neutral-700
          transition
          text-sm font-medium
        "
      >
        <img src="/apple-icon.svg" alt="Apple" className="w-5 h-5" />
        Continue with Apple
      </button>

      {/* Email */}
      <button
        type="button"
        onClick={() => router.push("/landing")}
        className="
          w-[260px] sm:w-[280px]
          flex items-center justify-center gap-5
          py-3 px-6
          bg-white/5 backdrop-blur-sm
          text-white/80
          border border-white/20
          rounded-xl
          shadow-md
          hover:bg-white/15
          transition
          text-sm font-medium
        "
      >
        <img src="/mail.svg" alt="Email" className="w-5 h-5" />
        Continue with Email
      </button>
    </motion.div>
  )}
</AnimatePresence>
</div>

{/* Футер */}
      <footer className="absolute md:bottom-2 bottom-[max(env(safe-area-inset-bottom),0.5rem)] left-1/2 -translate-x-1/2 text-sm text-neutral-500">
        © 2026 NaviMind Inc.
      </footer>
      </div>
    </motion.div>
  );
}
