"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Piece = {
  id: number;
  left: number;
  delay: number;
  color: string;
  rotate: number;
};

const colors = ["#9BC8A7", "#F2B6A0", "#9EC5E5", "#F4D38A", "#C7B2DE", "#A7DAD8"];

export function useCelebration() {
  const [pieces, setPieces] = useState<Piece[]>([]);
  const audioContext = useRef<AudioContext | null>(null);

  const celebrate = useCallback((tone: "success" | "done" | "quiet" = "success") => {
    if (typeof window === "undefined") return;

    if ("vibrate" in navigator) {
      navigator.vibrate(tone === "quiet" ? 20 : [30, 25, 30]);
    }

    playTone(audioContext, tone);

    if (tone !== "quiet") {
      setPieces(
        Array.from({ length: tone === "done" ? 34 : 24 }, (_, index) => ({
          id: Date.now() + index,
          left: Math.round(Math.random() * 100),
          delay: Math.random() * 0.2,
          color: colors[index % colors.length],
          rotate: Math.round(Math.random() * 180)
        }))
      );
    }
  }, []);

  useEffect(() => {
    if (!pieces.length) return;
    const timeout = window.setTimeout(() => setPieces([]), 1200);
    return () => window.clearTimeout(timeout);
  }, [pieces]);

  return { celebrate, confetti: <Confetti pieces={pieces} /> };
}

function Confetti({ pieces }: { pieces: Piece[] }) {
  if (!pieces.length) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-40 overflow-hidden">
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="absolute top-0 h-2.5 w-1.5 rounded-sm opacity-90"
          style={{
            left: `${piece.left}%`,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotate}deg)`,
            animation: `confetti-fall 1050ms ease-out ${piece.delay}s forwards`
          }}
        />
      ))}
    </div>
  );
}

function playTone(audioContext: React.MutableRefObject<AudioContext | null>, tone: "success" | "done" | "quiet") {
  try {
    const AudioCtor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return;

    audioContext.current ??= new AudioCtor();
    const context = audioContext.current;
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(tone === "done" ? 660 : tone === "quiet" ? 440 : 520, now);
    if (tone !== "quiet") {
      oscillator.frequency.exponentialRampToValueAtTime(tone === "done" ? 880 : 680, now + 0.12);
    }
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(tone === "quiet" ? 0.035 : 0.06, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.2);
  } catch {
    // Audio feedback is best-effort; form success messaging remains the source of truth.
  }
}
