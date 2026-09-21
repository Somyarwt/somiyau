"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

interface CursorHeart {
  id: number;
  x: number;
  y: number;
  symbol: string;
  size: number;
  color: string;
}

interface PopHeart {
  id: number;
  x: number;
  y: number;
  symbol: string;
  dx: number;
  dy: number;
  rot: number;
  size: number;
}

export default function Home() {
  // Navigation states:
  // "intro" (Page 1: do you miss me?)
  // "fresh" (Page 2: should we start fresh?)
  // "tax"   (Tax note if he clicks "no I don't love you anymore")
  // "apology" (Page 3: yipppieeeeee, envelope letter & apology note)
  // "phool"   (Page 4: dedicated page for "a phool for my fool")
  // "forever" (Page 5: last page with detailed pixel flowers & "I love you alottttttttttt")
  const [currentPage, setCurrentPage] = useState<"intro" | "fresh" | "tax" | "apology" | "phool" | "forever">("intro");

  // Page 1: "no" click state
  const [noClicked, setNoClicked] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [teaseText, setTeaseText] = useState("");

  // Page 2: "no" clicked state (aggressive reasons note)
  const [showAggressiveReasons, setShowAggressiveReasons] = useState(false);
  const [aggressiveShake, setAggressiveShake] = useState(false);

  // Page 3 & 4: Envelope open state
  const [envelopeOpen, setEnvelopeOpen] = useState(true);
  const [phoolEnvelopeOpen, setPhoolEnvelopeOpen] = useState(true);
  const [isPhotoMagnified, setIsPhotoMagnified] = useState(false);

  // Last page interactive pixel flower message
  const [flowerLoveMsg, setFlowerLoveMsg] = useState<string | null>(null);

  // Couple bounce animation
  const [coupleBouncing, setCoupleBouncing] = useState(false);

  // Lily interactive message
  const [lilyMessage, setLilyMessage] = useState<string | null>(null);

  // Cursor following hearts
  const [cursorHearts, setCursorHearts] = useState<CursorHeart[]>([]);
  const lastCursorPos = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });

  // Random click / tap bursting hearts
  const [popHearts, setPopHearts] = useState<PopHeart[]>([]);

  // Music state: "Mrs Magic" by Strawberry Guy
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const ytPlayerRef = useRef<HTMLIFrameElement | null>(null);

  // Web Audio Context for romantic sound effects
  const audioCtxRef = useRef<AudioContext | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const getAudioContext = () => {
    if (!audioCtxRef.current && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Sound: Soft romantic chime
  const playRomanticChime = useCallback((freq = 587.33) => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {
      // Audio safety
    }
  }, []);

  // Sound: Playful buzzer
  const playBuzzer = () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(170, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.22);
      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    } catch {
      // Audio safety
    }
  };

  // Sound: Dramatic slam
  const playDramaticSound = () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(55, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio safety
    }
  };

  // Sound: Heartfelt victory chime
  const playVictoryFanfare = () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const notes = [329.63, 392.0, 493.88, 587.33, 659.25, 783.99, 987.77, 1174.66];
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        const startTime = ctx.currentTime + index * 0.08;
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.1, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.7);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.7);
      });
    } catch {
      // Audio safety
    }
  };

  // Handle Music Toggle for "Mrs Magic" by Strawberry Guy
  const toggleMusic = (forcePlay = false) => {
    if (forcePlay) {
      setIsPlayingMusic(true);
      return;
    }
    setIsPlayingMusic((prev) => !prev);
  };

  // Cursor following heart effect on mousemove & touchmove
  useEffect(() => {
    const symbols = ["💜", "💕", "✨", "🌸", "💖"];
    const colors = ["#c084fc", "#f472b6", "#e879f9", "#d8b4fe", "#fb7185"];

    const handlePointerMove = (clientX: number, clientY: number) => {
      const now = Date.now();
      const dist = Math.hypot(clientX - lastCursorPos.current.x, clientY - lastCursorPos.current.y);

      if (dist > 16 && now - lastCursorPos.current.time > 40) {
        lastCursorPos.current = { x: clientX, y: clientY, time: now };

        const newHeart: CursorHeart = {
          id: now + Math.random(),
          x: clientX,
          y: clientY,
          symbol: symbols[Math.floor(Math.random() * symbols.length)],
          size: Math.random() * 6 + 11,
          color: colors[Math.floor(Math.random() * colors.length)],
        };

        setCursorHearts((prev) => [...prev.slice(-18), newHeart]);

        setTimeout(() => {
          setCursorHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
        }, 850);
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      handlePointerMove(e.clientX, e.clientY);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  // Floating purple stars & lily petals canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    interface Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      rotation: number;
      rotSpeed: number;
      alpha: number;
      color: string;
      isHeart: boolean;
      isStar: boolean;
    }

    const colors = ["#d8b4fe", "#c084fc", "#f472b6", "#e9d5ff", "#a855f7", "#ffffff"];
    const particles: Particle[] = Array.from({ length: 36 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 4 + 2,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: -(Math.random() * 0.5 + 0.2),
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.02,
      alpha: Math.random() * 0.6 + 0.2,
      color: colors[Math.floor(Math.random() * colors.length)],
      isHeart: Math.random() > 0.6,
      isStar: Math.random() > 0.5,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotSpeed;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;

        if (p.isHeart) {
          ctx.fillRect(-2, -2, 2, 2);
          ctx.fillRect(1, -2, 2, 2);
          ctx.fillRect(-3, -1, 7, 2);
          ctx.fillRect(-2, 1, 5, 2);
          ctx.fillRect(-1, 3, 3, 1);
        } else if (p.isStar) {
          ctx.fillRect(-p.size / 2, -1, p.size, 2);
          ctx.fillRect(-1, -p.size / 2, 2, p.size);
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        }
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Spawn colorful bursting hearts on clicking anywhere
  const spawnHeartBurst = useCallback((clientX: number, clientY: number) => {
    const symbols = ["💜", "💖", "💕", "🌸", "✨", "💗", "🌷"];
    const count = 5 + Math.floor(Math.random() * 3);
    const newHearts: PopHeart[] = [];

    for (let i = 0; i < count; i++) {
      newHearts.push({
        id: Date.now() + Math.random() + i,
        x: clientX,
        y: clientY,
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        dx: (Math.random() - 0.5) * 90,
        dy: -(Math.random() * 55 + 35),
        rot: (Math.random() - 0.5) * 60,
        size: Math.random() * 8 + 18,
      });
    }

    playRomanticChime(587.33 + Math.random() * 160);
    setPopHearts((prev) => [...prev.slice(-40), ...newHearts]);

    setTimeout(() => {
      setPopHearts((prev) => prev.filter((h) => !newHearts.some((nh) => nh.id === h.id)));
    }, 1150);
  }, [playRomanticChime]);

  // Full-screen global pointer listener: hearts pop up anywhere across the entire screen!
  useEffect(() => {
    const handleGlobalPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      // Don't interrupt music or button clicks
      if (target.closest("button") || target.closest("a") || target.closest("iframe")) {
        return;
      }
      spawnHeartBurst(e.clientX, e.clientY);
      if (!isPlayingMusic) {
        toggleMusic(true);
      }
    };

    window.addEventListener("pointerdown", handleGlobalPointerDown);
    return () => {
      window.removeEventListener("pointerdown", handleGlobalPointerDown);
    };
  }, [spawnHeartBurst, isPlayingMusic]);

  // Screen click fallback for all containers
  const handleScreenClick = (e: React.MouseEvent<HTMLElement>) => {
    if (!isPlayingMusic) {
      toggleMusic(true);
    }
  };

  // Page 1: Clicking "no"
  const handleNoClick = () => {
    playBuzzer();
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);

    setNoClicked(true);
    setTeaseText("pagal kahike ,aapke liye no is not an option 🌸💜");
  };

  // Page 1: Clicking "me toooo" or "yes I do" -> proceeds to Page 2 (fresh start)
  const handleGoToPageTwo = () => {
    playVictoryFanfare();
    toggleMusic(true);
    setCurrentPage("fresh");
  };

  // Page 2: Clicking "no" / "no not interested" -> triggers aggressive note
  const handlePageTwoNoClick = () => {
    playDramaticSound();
    setAggressiveShake(true);
    setShowAggressiveReasons(true);
    setTimeout(() => setAggressiveShake(false), 600);
  };

  // Page 2: Clicking little "no I don't love you anymore" -> triggers tax note & ends there
  const handleTaxNoClick = () => {
    playBuzzer();
    setCurrentPage("tax");
  };

  // Page 2: Clicking "YES DEFINITELY" -> proceeds to Page 3 (Apology note & envelope)
  const handleYesDefinitely = () => {
    playVictoryFanfare();
    setCurrentPage("apology");
  };

  const resetToStart = () => {
    playRomanticChime(523.25);
    setCurrentPage("intro");
    setNoClicked(false);
    setTeaseText("");
    setShowAggressiveReasons(false);
    setLilyMessage(null);
    setFlowerLoveMsg(null);
  };

  const triggerCoupleBounce = () => {
    playRomanticChime(783.99);
    setCoupleBouncing(true);
    setTimeout(() => setCoupleBouncing(false), 800);
  };

  const triggerLily = (msg: string, freq: number) => {
    playRomanticChime(freq);
    setLilyMessage(msg);
    setTimeout(() => {
      setLilyMessage((curr) => (curr === msg ? null : curr));
    }, 4000);
  };

  return (
    <main
      onClick={handleScreenClick}
      className="relative min-h-screen w-full max-w-md mx-auto flex flex-col justify-between items-center px-4 py-4 font-pixel select-none overflow-hidden cursor-crosshair"
    >
      {/* Background Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0 opacity-80"
      />

      {/* Floating Purple Clouds */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-10 -left-20 w-[140%] h-64 bg-gradient-to-b from-purple-900/25 via-fuchsia-900/15 to-transparent blur-3xl rounded-full animate-clouds" />
        <div className="absolute top-28 -right-16 w-80 h-48 bg-gradient-to-r from-purple-600/20 via-pink-600/15 to-purple-800/20 blur-2xl rounded-full animate-clouds-reverse" />
        <div className="absolute bottom-20 -left-10 w-[120%] h-36 bg-gradient-to-t from-purple-950/40 via-indigo-950/20 to-transparent blur-2xl rounded-full animate-clouds" />
      </div>

      {/* CRT Scanline overlay */}
      <div className="fixed inset-0 scanline-overlay z-10 pointer-events-none" />

      {/* Cursor Following Hearts Trail */}
      {cursorHearts.map((heart) => (
        <div
          key={heart.id}
          style={{
            left: heart.x,
            top: heart.y,
            fontSize: `${heart.size}px`,
            color: heart.color,
          }}
          className="fixed z-50 pointer-events-none select-none transition-all duration-700 -translate-x-1/2 -translate-y-1/2 animate-float opacity-75"
        >
          {heart.symbol}
        </div>
      ))}

      {/* Random Click / Tap Pop Hearts Burst */}
      {popHearts.map((heart) => (
        <div
          key={heart.id}
          style={{
            left: heart.x,
            top: heart.y,
            fontSize: `${heart.size}px`,
            ["--dx" as string]: `${heart.dx}px`,
            ["--dy" as string]: `${heart.dy}px`,
            ["--rot" as string]: `${heart.rot}deg`,
          } as React.CSSProperties}
          className="fixed z-50 pointer-events-none select-none animate-heart-pop drop-shadow-[0_0_12px_rgba(244,114,182,0.8)]"
        >
          {heart.symbol}
        </div>
      ))}

      {/* Background Music: Strawberry Guy - Mrs Magic (https://youtu.be/3dZczoNnFWI) */}
      <div className="fixed -left-[9999px] top-0 w-1 h-1 opacity-0 pointer-events-none overflow-hidden">
        {isPlayingMusic && (
          <iframe
            ref={ytPlayerRef}
            width="200"
            height="200"
            src="https://www.youtube.com/embed/3dZczoNnFWI?autoplay=1&loop=1&playlist=3dZczoNnFWI&enablejsapi=1"
            title="Strawberry Guy - Mrs Magic"
            allow="autoplay; encrypted-media"
          />
        )}
      </div>

      {/* Top Bar: Title & Theme Song Player Widget */}
      <header className="relative z-20 w-full flex items-center justify-between pt-1 pb-2 border-b border-purple-900/40">
        <div className="flex items-center gap-1.5 bg-purple-950/70 border border-purple-400/40 px-3 py-1 rounded-full shadow-[0_0_12px_rgba(192,132,252,0.3)]">
          <span className="text-pink-400 text-xs animate-pulse">✦</span>
          <span className="text-[9px] sm:text-[10px] text-purple-200 tracking-wider uppercase">
            A message for Yuvi
          </span>
          <span className="text-pink-400 text-xs animate-pulse">✦</span>
        </div>

        {/* Music Player Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleMusic();
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[8px] sm:text-[9px] transition-all cursor-pointer ${isPlayingMusic
              ? "bg-pink-950/80 border-pink-400 text-pink-200 shadow-[0_0_12px_rgba(244,114,182,0.5)] animate-pulse"
              : "bg-purple-950/60 border-purple-800 text-zinc-400"
            }`}
          title="Theme Song: Mrs Magic - Strawberry Guy"
        >
          <span>{isPlayingMusic ? "🎶" : "🎵"}</span>
          <span className="tracking-wide">
            {isPlayingMusic ? "Mrs Magic ⏸" : "Mrs Magic ▶"}
          </span>
        </button>
      </header>

      {/* Main Content Area */}
      <section className="relative z-20 w-full flex-1 flex flex-col items-center justify-center my-2 max-w-sm">

        {/* ===================== PAGE 1: THE INITIAL QUESTION ===================== */}
        {currentPage === "intro" && (
          <div className={`w-full flex flex-col items-center transition-transform ${isShaking ? "animate-shake" : ""}`}>

            {/* Top Centerpiece: Glowing Purple Heart & Chibi Couple */}
            <div className="relative mb-3 flex flex-col items-center animate-float">
              <div className="absolute -top-12 w-28 h-48 bg-gradient-to-b from-transparent via-purple-600/30 to-pink-500/30 blur-xl pointer-events-none" />

              <div
                className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 animate-heart-glow cursor-pointer mb-2"
                onClick={(e) => {
                  e.stopPropagation();
                  playRomanticChime(783.99);
                }}
                title="Tap my heart"
              >
                <svg viewBox="0 0 16 16" className="w-full h-full pixelated drop-shadow-[0_0_25px_rgba(216,180,254,1)]" fill="#c084fc">
                  <rect x="2" y="2" width="4" height="2" fill="#fdf2f8" />
                  <rect x="10" y="2" width="4" height="2" fill="#fdf2f8" />
                  <rect x="1" y="4" width="6" height="2" fill="#e879f9" />
                  <rect x="9" y="4" width="6" height="2" fill="#e879f9" />
                  <rect x="1" y="6" width="14" height="2" fill="#c084fc" />
                  <rect x="2" y="8" width="12" height="2" fill="#a855f7" />
                  <rect x="3" y="10" width="10" height="2" fill="#9333ea" />
                  <rect x="5" y="12" width="6" height="2" fill="#7e22ce" />
                  <rect x="7" y="14" width="2" height="2" fill="#6b21a8" />
                  <rect x="3" y="3" width="2" height="2" fill="#ffffff" />
                </svg>
              </div>

              {/* Cute Chibi Couple: Yuvi & Somya Holding Hands */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  triggerCoupleBounce();
                }}
                className={`relative flex items-end justify-center gap-1.5 px-3 py-1.5 rounded-xl cursor-pointer transition-transform ${coupleBouncing ? "scale-110 -translate-y-2" : "hover:scale-105"
                  }`}
                title="Tap us!"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs animate-bounce text-pink-400 drop-shadow-[0_0_8px_#f472b6]">
                  💖
                </div>

                {/* Chibi on Left */}
                <div className="flex flex-col items-center">
                  <div className="relative">
                    {/* Boy short crop hair */}
                    <div className="w-6 h-6 bg-[#1f1917] rounded-t-lg border border-purple-300/40 relative overflow-hidden flex flex-col items-center justify-end pb-0.5">
                      {/* Boy side fringe */}
                      <div className="absolute top-0 left-0 w-3 h-1.5 bg-[#171210] rounded-br-sm z-10" />
                      <div className="w-5 h-4 bg-[#fae0cb] rounded-full relative flex items-center justify-around px-0.5">
                        <div className="w-1 h-1.5 bg-[#1a1210] rounded-full" />
                        <div className="w-1 h-1.5 bg-[#1a1210] rounded-full" />
                        {/* Subtle boy blush */}
                        <div className="absolute bottom-0.5 left-0.5 w-1.5 h-0.5 bg-rose-400/80 rounded-full" />
                        <div className="absolute bottom-0.5 right-0.5 w-1.5 h-0.5 bg-rose-400/80 rounded-full" />
                      </div>
                    </div>
                  </div>
                  {/* Boy collared hoodie / jacket */}
                  <div className="w-5 h-5 bg-gradient-to-b from-indigo-700 to-purple-900 rounded-t-md relative flex justify-center">
                    <div className="w-1 h-2 border-l border-purple-300/70" />
                    {/* Hand reaching to hold */}
                    <div className="absolute right-[-2px] bottom-1 w-1.5 h-1.5 bg-[#fae0cb] rounded-full" />
                  </div>
                  {/* Dark trousers / jeans */}
                  <div className="w-4.5 h-2.5 bg-zinc-800 rounded-b-sm" />
                  {/* Cool sneakers */}
                  <div className="flex gap-1 mt-0.5">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-sm" />
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-sm" />
                  </div>
                  <span className="text-[7px] text-pink-300 font-bold tracking-wider mt-0.5 flex items-center gap-0.5">
                    Somya 👧
                  </span>
                </div>

                <div className="w-3 h-1.5 bg-[#fde2d2] rounded-full self-center -translate-y-1 opacity-90" />

                {/* Chibi on Right */}
                <div className="flex flex-col items-center">
                  <div className="relative">
                    {/* Cute Girl Hair with side bobs/twin-tails */}
                    <div className="w-6 h-6 bg-[#38231e] rounded-full border border-pink-300/50 relative overflow-hidden flex flex-col items-center justify-end pb-0.5">
                      <div className="w-5 h-4 bg-[#fde2d2] rounded-full relative flex items-center justify-around px-0.5">
                        <div className="w-1 h-1.5 bg-[#261713] rounded-full" />
                        <div className="w-1 h-1.5 bg-[#261713] rounded-full" />
                        {/* Sweet pink blush */}
                        <div className="absolute bottom-0.5 left-0.5 w-1.5 h-0.5 bg-pink-400 rounded-full" />
                        <div className="absolute bottom-0.5 right-0.5 w-1.5 h-0.5 bg-pink-400 rounded-full" />
                      </div>
                    </div>
                    {/* Cute pink hair ribbon/flower clip */}
                    <div className="absolute -top-0.5 -right-1 w-2.5 h-2.5 bg-pink-400 rounded-full border border-pink-100 flex items-center justify-center text-[5px]">
                      🌸
                    </div>
                    {/* Girl side locks */}
                    <div className="absolute top-2.5 -left-0.5 w-1.5 h-3 bg-[#38231e] rounded-b-full" />
                    <div className="absolute top-2.5 -right-0.5 w-1.5 h-3 bg-[#38231e] rounded-b-full" />
                  </div>
                  {/* Cute pastel pink & purple top */}
                  <div className="w-5 h-5 bg-gradient-to-b from-pink-400 to-purple-500 rounded-t-md relative flex justify-center">
                    <div className="w-2 h-1 bg-white/90 rounded-b-sm" />
                    {/* Hand reaching to hold */}
                    <div className="absolute left-[-2px] bottom-1 w-1.5 h-1.5 bg-[#fde2d2] rounded-full" />
                  </div>
                  {/* Flared pleated skirt */}
                  <div className="w-5 h-2.5 bg-pink-600 rounded-b-md shadow-sm border-t border-pink-300/40" />
                  {/* Pink shoes */}
                  <div className="flex gap-1 mt-0.5">
                    <div className="w-1.5 h-1.5 bg-pink-300 rounded-full" />
                    <div className="w-1.5 h-1.5 bg-pink-300 rounded-full" />
                  </div>
                  <span className="text-[7px] text-purple-300 font-bold tracking-wider mt-0.5 flex items-center gap-0.5">
                    Yuvi 👦
                  </span>
                </div>
              </div>
            </div>

            {/* Undertale Dialogue Box */}
            <div className="w-full pixel-border-white bg-black/95 p-3.5 sm:p-4 relative mb-3">
              <div className="flex items-start gap-2.5">
                <span className="text-pink-400 text-sm sm:text-base animate-pulse shrink-0 mt-0.5">
                  ❤️
                </span>

                <div className="flex-1">
                  <p className="text-white text-xs sm:text-sm leading-relaxed tracking-wide font-medium">
                    &quot;hieeew bbg ,do you miss me??? Cause I surely do ;(&quot;
                  </p>
                </div>
              </div>

              <div className="w-full flex justify-between items-center mt-2 pt-2 border-t border-purple-950 text-[9px] text-purple-400">
                <span className="italic font-retro text-xs sm:text-sm text-pink-300">
                  * Answer honestly with your heart...
                </span>
                <span className="text-purple-300 text-xs animate-blink">▼</span>
              </div>
            </div>

            {/* Teaser text when "no" is clicked: pagal kahike */}
            {noClicked && (
              <div className="w-full bg-purple-950/95 border-2 border-pink-400 px-3 py-2 mb-3 rounded text-center animate-bounce shadow-[0_0_18px_rgba(244,114,182,0.6)]">
                <p className="text-[11px] sm:text-xs text-pink-100 tracking-wide font-bold">
                  {teaseText}
                </p>
              </div>
            )}

            {/* The Two Option Buttons */}
            <div className="w-full flex flex-col gap-2.5">
              {/* Option 1: "me toooo" */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleGoToPageTwo();
                }}
                className="w-full pixel-btn-action bg-gradient-to-r from-purple-900 via-pink-900 to-purple-900 border-2 border-pink-300 text-white text-xs sm:text-sm py-3 px-4 flex items-center justify-center gap-2 rounded cursor-pointer group active:scale-[0.98] shadow-[0_0_15px_rgba(236,72,153,0.4)]"
              >
                <span className="text-pink-300 group-hover:scale-125 transition-transform">❤️</span>
                <span className="tracking-wider text-pink-100 font-bold uppercase">
                  1- me toooo
                </span>
                <span className="text-pink-300 group-hover:scale-125 transition-transform">💕</span>
              </button>

              {/* Option 2: "no" -> converts into "yes I do" */}
              {!noClicked ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNoClick();
                  }}
                  className="w-full pixel-btn-no text-zinc-300 text-xs sm:text-sm py-2.5 px-4 flex items-center justify-center gap-2 rounded cursor-pointer hover:border-red-400 hover:text-red-300 active:scale-[0.98]"
                >
                  <span>💔</span>
                  <span className="tracking-wider uppercase">2- no</span>
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGoToPageTwo();
                  }}
                  className="w-full pixel-btn-action bg-gradient-to-r from-pink-800 via-purple-700 to-pink-800 border-2 border-pink-300 text-white text-xs sm:text-sm py-3 px-4 flex items-center justify-center gap-2 rounded cursor-pointer animate-pulse shadow-[0_0_25px_rgba(244,114,182,0.8)] active:scale-[0.98]"
                >
                  <span>✨</span>
                  <span className="tracking-wider text-pink-100 font-bold uppercase">
                    yes I do 💖
                  </span>
                  <span>🌸</span>
                </button>
              )}
            </div>

            <p className="text-[8px] sm:text-[9px] text-purple-400/80 mt-2 text-center">
              * Move cursor to spread hearts • Tap us to bounce 💜
            </p>

          </div>
        )}

        {/* ===================== PAGE 2: SHOULD WE START FRESH? ^^ ===================== */}
        {currentPage === "fresh" && (
          <div className={`w-full flex flex-col items-center transition-transform ${aggressiveShake ? "animate-shake" : ""}`}>

            <div className="mb-2 text-center">
              <span className="text-[9px] sm:text-[10px] text-pink-200 bg-pink-950/90 border border-pink-400 px-3.5 py-1 rounded-full uppercase tracking-wider shadow-[0_0_20px_rgba(244,114,182,0.6)]">
                ★ PAGE 2: A FRESH START ★
              </span>
            </div>

            {/* Question Dialogue Box */}
            <div className="w-full pixel-border-white bg-black/95 p-4 sm:p-5 relative mb-3 shadow-[0_0_25px_rgba(168,85,247,0.4)]">
              <div className="flex items-center gap-2.5">
                <span className="text-pink-400 text-sm sm:text-base animate-pulse shrink-0">
                  💜
                </span>

                <div className="flex-1">
                  <p className="text-white text-sm sm:text-base leading-relaxed tracking-wide font-bold">
                    &quot;should we start fresh? ^^&quot;
                  </p>
                </div>
              </div>

              <div className="w-full flex justify-end mt-2">
                <span className="text-purple-300 text-xs animate-blink">▼</span>
              </div>
            </div>

            {/* BIG AGGRESSIVE NOTE: LISTING WHY I WOULD BE A NICE GIRLFRIEND */}
            {showAggressiveReasons && (
              <div className="w-full border-4 border-rose-500 bg-gradient-to-b from-[#24081e] to-black p-4 mb-3.5 rounded-xl text-left shadow-[0_0_35px_rgba(244,63,94,0.85)] animate-bounce max-h-[60vh] overflow-y-auto">

                <div className="border-b-2 border-rose-500/80 pb-2 mb-2.5 flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm text-rose-300 font-pixel font-bold tracking-wider flex items-center gap-1.5 animate-pulse">
                    <span>😤💢</span> EXCUSE ME?! WHY I AM A NICE GF:
                  </h3>
                </div>

                <div className="space-y-2.5 text-xs sm:text-sm text-purple-100 font-retro tracking-wide leading-snug">
                  <p className="bg-rose-950/50 p-2 rounded border border-rose-800/60">
                    <strong className="text-pink-300 font-pixel text-[10px]">1-</strong> I am verrrrrrrry loyal and will always love you and only youuuuu. Won&apos;t look at any other girl or person who isn&apos;t you.
                  </p>

                  <p className="bg-rose-950/50 p-2 rounded border border-rose-800/60">
                    <strong className="text-pink-300 font-pixel text-[10px]">2-</strong> always ready to hear you yap: i would lovee to hear you yap about your interests and updates
                  </p>

                  <p className="bg-rose-950/50 p-2 rounded border border-rose-800/60">
                    <strong className="text-pink-300 font-pixel text-[10px]">3-</strong> I&apos;ll laugh even at your lame jokes 👍
                  </p>

                  <p className="bg-rose-950/50 p-2 rounded border border-rose-800/60">
                    <strong className="text-pink-300 font-pixel text-[10px]">4-</strong> I am really funny and will make you laugh
                  </p>

                  <p className="bg-rose-950/50 p-2 rounded border border-rose-800/60">
                    <strong className="text-pink-300 font-pixel text-[10px]">5-</strong> I&apos;ll draw you and sing for you whenever you want shawty
                  </p>
                </div>

                {/* The Punchline Requested by User */}
                <div className="mt-3 pt-2.5 border-t-2 border-rose-500/80 text-center">
                  <p className="text-xs sm:text-sm text-yellow-300 font-pixel font-bold tracking-wider animate-pulse drop-shadow-[0_0_10px_#facc15]">
                    ARE THESE NOT CONVINCING ENOUGHHHH??? 😤💥
                  </p>
                </div>
              </div>
            )}

            {/* Options on Page 2 */}
            <div className="w-full flex flex-col gap-2.5">
              {/* Option 1: "YES DEFINITELY" */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleYesDefinitely();
                }}
                className="w-full pixel-btn-action bg-gradient-to-r from-purple-800 via-pink-700 to-purple-800 border-2 border-pink-300 text-white text-xs sm:text-sm py-3.5 px-4 flex items-center justify-center gap-2 rounded cursor-pointer active:scale-[0.98] shadow-[0_0_20px_rgba(236,72,153,0.5)]"
              >
                <span>💖</span>
                <span className="tracking-wider text-pink-100 font-bold uppercase">
                  {showAggressiveReasons ? "OKAY FINE, YES DEFINITELY! 💕" : "1- YES DEFINITELY"}
                </span>
                <span>✨</span>
              </button>

              {/* Option 2: Initial "no not interested" -> triggers the aggressive note */}
              {!showAggressiveReasons ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePageTwoNoClick();
                  }}
                  className="w-full pixel-btn-no text-zinc-300 text-xs sm:text-sm py-2.5 px-4 flex items-center justify-center gap-2 rounded cursor-pointer hover:border-red-400 hover:text-red-300 active:scale-[0.98]"
                >
                  <span>💔</span>
                  <span className="tracking-wider uppercase">2- no not interested</span>
                </button>
              ) : (
                /* Little "no I don't love you anymore" option */
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTaxNoClick();
                  }}
                  className="w-full py-2 bg-zinc-950/70 hover:bg-red-950/40 border border-zinc-700 hover:border-red-500 text-zinc-400 hover:text-red-300 text-[9px] rounded tracking-wider cursor-pointer transition-all"
                >
                  no I don&apos;t love you anymore 💔
                </button>
              )}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentPage("intro");
              }}
              className="mt-3 text-[9px] text-purple-400 hover:text-purple-200 transition-colors"
            >
              ← Back to first question
            </button>

          </div>
        )}

        {/* ===================== THE TAX NOTE (IF HE CLICKS "no I don't love you anymore") ===================== */}
        {currentPage === "tax" && (
          <div className="w-full flex flex-col items-center animate-float">

            <div className="mb-2 text-center">
              <span className="text-[9px] sm:text-[10px] text-zinc-300 bg-zinc-950 border border-zinc-600 px-3.5 py-1 rounded-full uppercase tracking-wider">
                😞 THE FINAL TAX NOTE 😞
              </span>
            </div>

            {/* The Exact Tax Note from User */}
            <div className="w-full pixel-border-white bg-black/95 p-4 sm:p-5 relative text-left mb-4 shadow-[0_0_25px_rgba(244,63,94,0.4)]">

              <div className="font-handwritten text-purple-100 text-lg sm:text-xl leading-relaxed space-y-3">
                <p className="text-pink-300 font-bold text-xl">
                  ok yar if that&apos;s what you want.... 😞😞
                </p>

                <p className="text-purple-200">
                  Still tax toh lagega ,send me 2-3 or more vns and photos of yours fast fast
                </p>

                <p className="text-right text-pink-300 font-bold pt-2">
                  - Somya 💔
                </p>
              </div>

              <div className="mt-4 pt-2.5 border-t border-purple-900/80 flex justify-between items-center text-[9px] text-purple-400">
                <span>STATUS: TAX OWED</span>
                <span className="text-rose-400 font-bold">2-3 VNS + PHOTOS NOW</span>
              </div>
            </div>

            {/* Action Buttons for Tax */}
            <div className="w-full flex flex-col gap-2">
              <a
                href="https://wa.me/919968558240?text=Here%20is%20your%20tax%20Somya%20%F0%9F%93%B8%20(sending%20vns%20and%20photos)"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.stopPropagation();
                  playRomanticChime(659.25);
                }}
                className="w-full pixel-btn-action bg-gradient-to-r from-rose-700 via-purple-700 to-pink-700 border-2 border-rose-300 text-white text-xs sm:text-sm py-3.5 px-4 text-center rounded flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(244,63,94,0.6)] active:scale-[0.98]"
              >
                <span>📸</span>
                <span className="tracking-wider uppercase font-bold text-pink-50">
                  PAY TAX (SEND VNS & PHOTOS) 🥺
                </span>
              </a>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  resetToStart();
                }}
                className="w-full py-1.5 bg-transparent hover:bg-purple-950/40 border border-purple-500/40 text-purple-300 text-[9px] rounded tracking-widest cursor-pointer transition-colors"
              >
                [ 🔄 REPLAY FROM START ]
              </button>
            </div>

          </div>
        )}

        {/* ===================== PAGE 3: APOLOGY NOTE & YIPPPIEEEEEE ENVELOPE ===================== */}
        {currentPage === "apology" && (
          <div className="w-full flex flex-col items-center animate-float">
            
            {/* The Joyful Reaction */}
            <div className="w-full bg-gradient-to-r from-pink-900/90 via-purple-900/90 to-pink-900/90 border-2 border-pink-400 px-3.5 py-2.5 mb-3 rounded-xl text-center shadow-[0_0_25px_rgba(244,114,182,0.7)] animate-bounce">
              <p className="text-xs sm:text-sm text-pink-100 font-bold tracking-wide">
                🎉 &quot;I knew you would say yes yipppieeeeee&quot; 💖✨
              </p>
            </div>

            {/* Interactive Envelope Form Letter from Somya da great */}
            <div className="w-full relative mb-3">
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  playRomanticChime(783.99);
                  setEnvelopeOpen(!envelopeOpen);
                }}
                className="w-full bg-gradient-to-r from-purple-900 via-pink-950 to-purple-900 border-2 border-pink-400 p-3 rounded-xl cursor-pointer flex items-center justify-between shadow-[0_0_20px_rgba(236,72,153,0.5)] hover:brightness-110 active:scale-[0.99] transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{envelopeOpen ? "💌" : "✉️"}</span>
                  <div className="text-left">
                    <p className="text-[11px] sm:text-xs text-pink-200 font-pixel font-bold tracking-wider uppercase">
                      Letter from Somya da great
                    </p>
                    <p className="text-[8px] text-purple-300 font-retro">
                      {envelopeOpen ? "* Tap to close envelope" : "* Tap to open envelope"}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-pink-300 bg-pink-950/80 px-2 py-0.5 rounded border border-pink-500/50">
                  {envelopeOpen ? "▲" : "▼"}
                </span>
              </div>

              {/* Inside the Envelope: Letter */}
              {envelopeOpen && (
                <div className="w-full pixel-border-pink bg-gradient-to-b from-[#2a0d24] via-[#1a0820] to-black border-t-0 p-3.5 sm:p-4 rounded-b-xl shadow-[0_0_25px_rgba(244,114,182,0.6)] animate-float">
                  <div className="font-handwritten text-purple-100 text-base sm:text-lg leading-relaxed space-y-2.5">
                    <p className="text-pink-200">
                      thank you for choosing us again ,yuvraj. It means a lot to me that you&apos;ve decided to believe in me again and are willing to give me another chance...
                    </p>
                    <p className="text-purple-200">
                      I def won&apos;t let you down this time cutie. Let&apos;s start fesh and love each other even harder this time.
                    </p>
                    <p className="text-right text-pink-300 font-bold text-lg pt-1">
                      - somya da great 👑💜
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Somya's Apology Note & Promises */}
            <div className="w-full pixel-border-white bg-black/95 p-3.5 sm:p-4 relative mb-3 shadow-[0_0_25px_rgba(192,132,252,0.5)]">
              <div className="border-b border-purple-800/80 pb-2 mb-2.5 flex items-center justify-between">
                <h3 className="text-xs sm:text-sm text-pink-300 font-pixel font-bold tracking-wider flex items-center gap-1.5">
                  <span>💌</span> SOMYA&apos;S APOLOGY NOTE:
                </h3>
              </div>

              <div className="font-handwritten text-purple-100 text-base sm:text-lg leading-relaxed space-y-2 mb-3">
                <p className="text-pink-300 font-bold text-lg">
                  dear yuvi ,
                </p>
                <p>
                  I know we&apos;ve chosen to break-up entirely... But to be honest not a single moment passed where I didn&apos;t miss you and how happy your presence used to make me ,no matter the physical distance between us.
                </p>
                <p>
                  I really didn&apos;t want this to happen... It wasn&apos;t my intention to ignore your requests and to make you feel unloved. I hope you&apos;ll forgive me for what I did wrong.
                </p>
                <p className="text-pink-200 font-bold">
                  Can you please give US one more chance?? I promise I&apos;ll love you better this time
                </p>
                <p className="text-right text-pink-300 font-bold">
                  -from Somya 💜
                </p>
              </div>

              {/* The 4 Promises */}
              <div className="bg-purple-950/70 border border-purple-600/60 p-2.5 sm:p-3 rounded-lg text-left shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                <p className="text-[10px] sm:text-xs text-pink-300 font-pixel font-bold mb-2">
                  ✨ My promises -
                </p>
                <div className="space-y-1.5 text-xs sm:text-sm text-purple-100 font-retro leading-snug">
                  <p>
                    <strong className="text-pink-300 font-pixel text-[9px]">1-</strong> more listening,more understanding, no more silent treatment and NO TRYING TO HIDE THINGS
                  </p>
                  <p>
                    <strong className="text-pink-300 font-pixel text-[9px]">2-</strong> reminding you every day how deeply you are loved
                  </p>
                  <p>
                    <strong className="text-pink-300 font-pixel text-[9px]">3-</strong> always try my best and choosing you over any argument
                  </p>
                  <p>
                    <strong className="text-pink-300 font-pixel text-[9px]">4-</strong> sharing everything and no more being dry
                  </p>
                </div>
              </div>
            </div>

            {/* Button to turn to the Dedicated Page for "A Phool For My Fool" */}
            <div className="w-full flex flex-col gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playRomanticChime(783.99);
                  setCurrentPage("phool");
                }}
                className="w-full pixel-btn-action bg-gradient-to-r from-purple-800 via-fuchsia-700 to-purple-800 border-2 border-pink-300 text-white text-xs sm:text-sm py-3.5 px-4 text-center rounded flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(244,114,182,0.8)] active:scale-[0.98] animate-pulse"
              >
                <span>🌸</span>
                <span className="tracking-wider uppercase font-bold text-pink-50">
                  TURN TO NEXT PAGE: A PHOOL FOR MY FOOL ➔
                </span>
                <span>✉️</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  resetToStart();
                }}
                className="w-full py-1.5 bg-transparent hover:bg-purple-950/40 border border-purple-500/40 text-purple-300 text-[9px] rounded tracking-widest cursor-pointer transition-colors"
              >
                [ 🔄 REPLAY FROM BEGINNING ]
              </button>
            </div>

          </div>
        )}

        {/* ===================== PAGE 4: A PHOOL FOR MY FOOL (DEDICATED PAGE) ===================== */}
        {currentPage === "phool" && (
          <div className="w-full flex flex-col items-center animate-float">
            
            <div className="mb-2.5 text-center">
              <span className="text-[9px] sm:text-[10px] text-pink-200 bg-pink-950/90 border border-pink-400 px-3.5 py-1 rounded-full uppercase tracking-wider shadow-[0_0_20px_rgba(244,114,182,0.6)]">
                ★ PAGE 4: A PHOOL FOR MY FOOL ★
              </span>
            </div>

            {/* The Dedicated Purple Envelope */}
            <div className="w-full relative mb-3.5">
              {/* Envelope Cover Header */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  playRomanticChime(783.99);
                  setPhoolEnvelopeOpen(!phoolEnvelopeOpen);
                }}
                className="w-full bg-gradient-to-r from-purple-900 via-fuchsia-950 to-purple-900 border-2 border-purple-400 p-3 rounded-xl cursor-pointer flex items-center justify-between shadow-[0_0_20px_rgba(168,85,247,0.6)] hover:brightness-110 active:scale-[0.99] transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{phoolEnvelopeOpen ? "🌸" : "✉️"}</span>
                  <div className="text-left">
                    <p className="text-[11px] sm:text-xs text-pink-200 font-pixel font-bold tracking-wider uppercase">
                      a phool for my fool
                    </p>
                    <p className="text-[8px] text-purple-300 font-retro">
                      {phoolEnvelopeOpen ? "* Tap to close envelope" : "* Tap to open envelope"}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-pink-300 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-500/50">
                  {phoolEnvelopeOpen ? "▲" : "▼"}
                </span>
              </div>

              {/* Inside the Purple Envelope */}
              {phoolEnvelopeOpen && (
                <div className="w-full pixel-border-purple bg-gradient-to-b from-[#1b082e] via-[#120520] to-[#07020d] border-t-0 p-3.5 sm:p-4 rounded-b-xl shadow-[0_0_25px_rgba(168,85,247,0.7)] animate-float">
                  
                  <div className="flex items-center justify-center gap-2 mb-3 pb-2 border-b border-purple-800/60">
                    <span className="text-sm">🌸</span>
                    <span className="text-[10px] text-pink-300 font-bold uppercase tracking-wider">
                      A SPECIAL PHOOL FOR YUVI
                    </span>
                    <span className="text-sm">💜</span>
                  </div>

                  {/* Both Photos Covered Inside */}
                  <div className="grid grid-cols-2 gap-2.5 mb-2">
                    {/* Photo 1: Kid holding flower */}
                    <div className="bg-purple-950/80 p-2 rounded-lg border-2 border-pink-400/50 shadow-[0_0_10px_rgba(244,114,182,0.3)] flex flex-col items-center">
                      <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden border border-purple-400/40 mb-1.5 bg-black">
                        <Image
                          src="/images/kid_flower.jpg"
                          alt="giant me holding a chota fool for you"
                          fill
                          className="object-cover"
                          sizes="(max-width: 450px) 150px, 200px"
                        />
                      </div>
                      <p className="font-handwritten text-pink-200 text-sm sm:text-base text-center leading-snug">
                        giant me holding a chota fool for you
                      </p>
                    </div>

                    {/* Photo 2: Meme boy with giant purple flower (MAGNIFIED) */}
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsPhotoMagnified(!isPhotoMagnified);
                        playRomanticChime(659.25);
                      }}
                      className="bg-purple-950/80 p-2 rounded-lg border-2 border-purple-400/50 shadow-[0_0_10px_rgba(168,85,247,0.3)] flex flex-col items-center cursor-pointer group"
                      title="Tap to magnify even more!"
                    >
                      <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden border border-purple-400/40 mb-1.5 bg-black flex items-center justify-center">
                        <div className={`relative w-full h-full transition-transform duration-300 ${isPhotoMagnified ? "scale-[2.3] -translate-y-3" : "scale-[1.8] -translate-y-2"} group-hover:scale-[2.0]`}>
                          <Image
                            src="/images/meme_flower.jpg"
                            alt="My fool with his giant phool"
                            fill
                            className="object-contain"
                            sizes="(max-width: 450px) 150px, 200px"
                          />
                        </div>
                        <div className="absolute bottom-1 right-1 bg-purple-900/80 text-[7px] px-1 rounded text-purple-200 border border-purple-500/40">
                          {isPhotoMagnified ? "🔍 Max" : "🔍 1.8x"}
                        </div>
                      </div>
                      <p className="font-handwritten text-pink-200 text-sm sm:text-base text-center leading-snug">
                        and my fool with his giant phool 💜😤
                      </p>
                    </div>
                  </div>

                  <p className="text-center font-handwritten text-purple-200 text-base sm:text-lg mt-2 pt-1 border-t border-purple-900/60">
                    &quot;a phool for my fool... now and forever 🌸💜&quot;
                  </p>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="w-full flex flex-col gap-2">

              {/* Button to proceed to the Last Page: Detailed Pixel Flowers & Grand Love Declaration */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playVictoryFanfare();
                  setCurrentPage("forever");
                }}
                className="w-full pixel-btn-action bg-gradient-to-r from-purple-800 via-fuchsia-700 to-pink-700 border-2 border-pink-300 text-white text-xs sm:text-sm py-3.5 px-4 text-center rounded flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(244,114,182,0.8)] active:scale-[0.98] animate-pulse"
              >
                <span>🌸</span>
                <span className="tracking-wider uppercase font-bold text-pink-50">
                  TURN TO LAST PAGE: A GARDEN FOR YOU ➔
                </span>
                <span>✨</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playRomanticChime(659.25);
                  setCurrentPage("apology");
                }}
                className="w-full py-1.5 bg-transparent hover:bg-purple-950/40 border border-purple-500/40 text-purple-300 text-[9px] rounded tracking-widest cursor-pointer transition-colors"
              >
                [ ← BACK TO APOLOGY NOTE ]
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  resetToStart();
                }}
                className="w-full py-1 bg-transparent text-purple-400 text-[8px] rounded tracking-widest cursor-pointer hover:text-purple-200"
              >
                [ 🔄 REPLAY FROM START ]
              </button>
            </div>

          </div>
        )}

        {/* ===================== PAGE 5: LAST PAGE - DETAILED PIXEL FLOWERS & "I LOVE YOU ALOTTTTTTTTTT" ===================== */}
        {currentPage === "forever" && (
          <div className="w-full flex flex-col items-center animate-float">
            
            <div className="mb-2 text-center">
              <span className="text-[9px] sm:text-[10px] text-pink-200 bg-pink-950/90 border border-pink-400 px-3.5 py-1 rounded-full uppercase tracking-wider shadow-[0_0_20px_rgba(244,114,182,0.6)]">
                ★ LAST PAGE: A GARDEN FOR YOU ★
              </span>
            </div>

            {/* Detailed Pixel Flowers Art Showcase */}
            <div className="w-full relative mb-3">
              <div className="relative w-full h-52 sm:h-60 rounded-xl overflow-hidden border-2 border-purple-400/80 shadow-[0_0_30px_rgba(168,85,247,0.7)] group bg-black">
                <Image
                  src="/images/purple_pixel_flowers.jpg"
                  alt="Detailed magical pixel flowers in enchanted forest"
                  fill
                  className="object-cover pixelated scale-100 hover:scale-105 transition-transform duration-700"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-purple-950/20 pointer-events-none" />

                {/* Floating Badge */}
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 bg-black/75 border border-pink-400/50 px-2.5 py-0.5 rounded-full text-[8px] text-pink-200 backdrop-blur-sm animate-pulse">
                  <span>✨</span>
                  <span>16-Bit Night Garden</span>
                </div>

                {/* Floating Heart SOUL */}
                <div className="absolute top-3 left-3 w-6 h-6 animate-heart-glow drop-shadow-[0_0_10px_#f472b6]">
                  <svg viewBox="0 0 16 16" className="w-full h-full pixelated" fill="#f472b6">
                    <rect x="2" y="2" width="4" height="2" fill="#ffffff" />
                    <rect x="10" y="2" width="4" height="2" fill="#ffffff" />
                    <rect x="1" y="4" width="6" height="2" fill="#f472b6" />
                    <rect x="9" y="4" width="6" height="2" fill="#f472b6" />
                    <rect x="1" y="6" width="14" height="2" fill="#e879f9" />
                    <rect x="2" y="8" width="12" height="2" fill="#c084fc" />
                    <rect x="4" y="10" width="8" height="2" fill="#a855f7" />
                    <rect x="6" y="12" width="4" height="2" fill="#9333ea" />
                    <rect x="7" y="14" width="2" height="2" fill="#7e22ce" />
                  </svg>
                </div>

                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[8px] sm:text-[9px] text-purple-200 bg-black/80 px-3 py-1 rounded-full border border-purple-500/50 tracking-wider">
                  🌸 Tap any flower below to hear its secret whisper 💜
                </div>
              </div>
            </div>

            {/* Whisper Tooltip Bubble if a flower is clicked */}
            {flowerLoveMsg && (
              <div className="w-full mb-2.5 bg-pink-950/95 border-2 border-pink-400 px-3 py-2 rounded-xl shadow-[0_0_25px_rgba(244,114,182,0.8)] text-center animate-bounce">
                <p className="text-[11px] sm:text-xs text-pink-100 font-retro tracking-wide font-medium">
                  {flowerLoveMsg}
                </p>
              </div>
            )}

            {/* Row of 4 Detailed Pixel Flowers */}
            <div className="w-full grid grid-cols-4 gap-2 mb-3">
              {/* Flower 1: Purple Twilight Lotus */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  playRomanticChime(523.25);
                  setFlowerLoveMsg("🌸 Twilight Lily: 'You're my favourite person in the whole wide universe, Yuvi.'");
                }}
                className="bg-purple-950/80 hover:bg-purple-900/90 border border-purple-400/50 rounded-lg p-2 flex flex-col items-center cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-[0_0_12px_rgba(168,85,247,0.3)] animate-flower-sway"
                title="Tap Twilight Lily"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 relative">
                  <svg viewBox="0 0 16 16" className="w-full h-full pixelated drop-shadow-[0_0_8px_#c084fc]">
                    <rect x="7" y="1" width="2" height="3" fill="#ffffff" />
                    <rect x="4" y="3" width="3" height="3" fill="#e9d5ff" />
                    <rect x="9" y="3" width="3" height="3" fill="#e9d5ff" />
                    <rect x="2" y="5" width="4" height="4" fill="#c084fc" />
                    <rect x="10" y="5" width="4" height="4" fill="#c084fc" />
                    <rect x="5" y="5" width="6" height="4" fill="#f472b6" />
                    <rect x="7" y="6" width="2" height="2" fill="#fef08a" />
                    <rect x="1" y="9" width="14" height="2" fill="#9333ea" />
                    <rect x="7" y="11" width="2" height="5" fill="#15803d" />
                    <rect x="4" y="13" width="3" height="2" fill="#22c55e" />
                    <rect x="9" y="12" width="3" height="2" fill="#22c55e" />
                  </svg>
                </div>
                <span className="text-[7px] text-pink-200 mt-1 font-pixel">Lotus</span>
              </div>

              {/* Flower 2: Glowing Violet Rose */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  playRomanticChime(659.25);
                  setFlowerLoveMsg("🌷 Glowing Rose: 'Every promise I wrote down, I mean it with every beat of my heart.'");
                }}
                className="bg-purple-950/80 hover:bg-purple-900/90 border border-pink-400/50 rounded-lg p-2 flex flex-col items-center cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-[0_0_12px_rgba(244,114,182,0.3)] animate-flower-sway-delayed"
                title="Tap Glowing Rose"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 relative">
                  <svg viewBox="0 0 16 16" className="w-full h-full pixelated drop-shadow-[0_0_8px_#f472b6]">
                    <rect x="6" y="1" width="4" height="2" fill="#f43f5e" />
                    <rect x="4" y="3" width="8" height="4" fill="#e11d48" />
                    <rect x="5" y="4" width="2" height="2" fill="#fecdd3" />
                    <rect x="8" y="4" width="2" height="2" fill="#fb7185" />
                    <rect x="3" y="6" width="10" height="3" fill="#be123c" />
                    <rect x="5" y="9" width="6" height="2" fill="#9f1239" />
                    <rect x="7" y="11" width="2" height="5" fill="#15803d" />
                    <rect x="5" y="13" width="2" height="2" fill="#22c55e" />
                    <rect x="9" y="12" width="3" height="2" fill="#16a34a" />
                  </svg>
                </div>
                <span className="text-[7px] text-pink-200 mt-1 font-pixel">Rose</span>
              </div>

              {/* Flower 3: Midnight Violet */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  playRomanticChime(783.99);
                  setFlowerLoveMsg("💜 Midnight Violet: 'I never stopped thinking about you for a single second.'");
                }}
                className="bg-purple-950/80 hover:bg-purple-900/90 border border-purple-400/50 rounded-lg p-2 flex flex-col items-center cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-[0_0_12px_rgba(168,85,247,0.3)] animate-flower-sway"
                title="Tap Midnight Violet"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 relative">
                  <svg viewBox="0 0 16 16" className="w-full h-full pixelated drop-shadow-[0_0_8px_#a855f7]">
                    <rect x="7" y="2" width="2" height="2" fill="#ffffff" />
                    <rect x="5" y="3" width="6" height="3" fill="#d8b4fe" />
                    <rect x="3" y="5" width="4" height="4" fill="#a855f7" />
                    <rect x="9" y="5" width="4" height="4" fill="#a855f7" />
                    <rect x="6" y="6" width="4" height="3" fill="#facc15" />
                    <rect x="4" y="8" width="8" height="3" fill="#7e22ce" />
                    <rect x="7" y="11" width="2" height="5" fill="#15803d" />
                    <rect x="3" y="12" width="3" height="2" fill="#22c55e" />
                    <rect x="10" y="13" width="3" height="2" fill="#22c55e" />
                  </svg>
                </div>
                <span className="text-[7px] text-pink-200 mt-1 font-pixel">Violet</span>
              </div>

              {/* Flower 4: Star Blossom */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  playRomanticChime(880);
                  setFlowerLoveMsg("✨ Star Blossom: 'You are dearer to me than myself 💜'");
                }}
                className="bg-purple-950/80 hover:bg-purple-900/90 border border-pink-400/50 rounded-lg p-2 flex flex-col items-center cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-[0_0_12px_rgba(244,114,182,0.3)] animate-flower-sway-delayed"
                title="Tap Star Blossom"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 relative">
                  <svg viewBox="0 0 16 16" className="w-full h-full pixelated drop-shadow-[0_0_8px_#fde047]">
                    <rect x="7" y="1" width="2" height="4" fill="#fef08a" />
                    <rect x="3" y="3" width="3" height="3" fill="#fde047" />
                    <rect x="10" y="3" width="3" height="3" fill="#fde047" />
                    <rect x="1" y="6" width="14" height="2" fill="#facc15" />
                    <rect x="6" y="5" width="4" height="4" fill="#ffffff" />
                    <rect x="3" y="8" width="3" height="3" fill="#eab308" />
                    <rect x="10" y="8" width="3" height="3" fill="#eab308" />
                    <rect x="7" y="10" width="2" height="6" fill="#15803d" />
                    <rect x="4" y="12" width="3" height="2" fill="#22c55e" />
                  </svg>
                </div>
                <span className="text-[7px] text-pink-200 mt-1 font-pixel">Star</span>
              </div>
            </div>

            {/* The Grand Love Declaration Dialogue Box */}
            <div className="w-full pixel-border-pink bg-black/95 p-4 sm:p-5 relative mb-3.5 shadow-[0_0_30px_rgba(244,114,182,0.7)] text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-sm animate-bounce text-pink-400">💖</span>
                <span className="text-[10px] text-pink-300 font-pixel tracking-widest uppercase">
                  A MESSAGE FROM THE HEART
                </span>
                <span className="text-sm animate-bounce text-pink-400">💜</span>
              </div>

              {/* The Exact Line Requested by User */}
              <h2 className="font-handwritten text-pink-200 text-2xl sm:text-3xl leading-snug drop-shadow-[0_0_20px_rgba(244,114,182,1)] my-2.5 font-bold animate-pulse">
                &quot;I love you alottttttttttt&quot;
              </h2>

              <div className="mt-3 pt-2 border-t border-purple-900/80 flex justify-between items-center text-[8px] sm:text-[9px] text-purple-400">
                <span>FOREVER YOURS</span>
                <span className="text-pink-300 font-bold">- Somya 💜</span>
              </div>
            </div>

            {/* Direct Message and Navigation Buttons */}
            <div className="w-full flex flex-col gap-2">
              <a
                href="https://wa.me/919968558240?text=I%20love%20you%20too%20Somya!!!%20Imma%20text%20you%20rn%20%F0%9F%92%9C"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.stopPropagation();
                  playRomanticChime(880);
                }}
                className="w-full pixel-btn-action bg-gradient-to-r from-pink-700 via-purple-700 to-rose-700 border-2 border-pink-200 text-white text-xs sm:text-sm py-3.5 px-4 text-center rounded flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(244,114,182,0.8)] active:scale-[0.98]"
              >
                <span>💬</span>
                <span className="tracking-wider uppercase font-bold text-pink-50">
                  SEND A TEXT TO SOMYA RNNNN 💕
                </span>
              </a>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playRomanticChime(659.25);
                  setCurrentPage("phool");
                }}
                className="w-full py-1.5 bg-transparent hover:bg-purple-950/40 border border-purple-500/40 text-purple-300 text-[9px] rounded tracking-widest cursor-pointer transition-colors"
              >
                [ ← BACK TO A PHOOL FOR MY FOOL ]
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  resetToStart();
                }}
                className="w-full py-1 bg-transparent text-purple-400 text-[8px] rounded tracking-widest cursor-pointer hover:text-purple-200"
              >
                [ 🔄 REPLAY OUR STORY FROM START ]
              </button>
            </div>

          </div>
        )}

      </section>

      {/* Retro Pond with Glowing Purple Lilies & Whispering Pads */}
      <footer className="relative z-20 w-full mt-1 flex flex-col items-center">

        {/* Lily Whisper Tooltip Bubble */}
        {lilyMessage && (
          <div className="w-full max-w-xs mb-2 bg-pink-950/95 border-2 border-pink-400 px-3 py-1.5 rounded-lg shadow-[0_0_20px_rgba(244,114,182,0.6)] text-center animate-bounce">
            <p className="text-[10px] sm:text-xs text-pink-100 font-retro tracking-wider">
              {lilyMessage}
            </p>
          </div>
        )}

        {/* Lily Garden Container */}
        <div className="relative w-full h-20 sm:h-24 rounded-t-xl overflow-hidden border-t-2 border-x-2 border-purple-500/50 bg-gradient-to-t from-purple-950/95 via-black to-transparent flex items-end justify-center">

          <div className="absolute inset-0 opacity-45 mix-blend-screen pointer-events-none">
            <Image
              src="/images/purple_lilies.jpg"
              alt="Purple water lilies and night sky"
              fill
              className="object-cover object-bottom pixelated"
              priority
            />
          </div>

          {/* Foreground Animated Glowing Lilies */}
          <div className="relative z-10 w-full flex justify-around items-end px-3 pb-1.5">

            {/* Lily 1 */}
            <div
              className="flex flex-col items-center animate-flower-sway cursor-pointer group"
              onClick={(e) => {
                e.stopPropagation();
                triggerLily("🌸 Purple Lily: 'Somya misses your warm smile every day...'", 523.25);
              }}
              title="Tap Water Lily"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 relative group-hover:scale-125 transition-transform">
                <svg viewBox="0 0 16 16" className="w-full h-full pixelated drop-shadow-[0_0_12px_#c084fc]" fill="#c084fc">
                  <rect x="7" y="1" width="2" height="4" fill="#e9d5ff" />
                  <rect x="4" y="3" width="3" height="4" fill="#d8b4fe" />
                  <rect x="9" y="3" width="3" height="4" fill="#d8b4fe" />
                  <rect x="2" y="6" width="4" height="4" fill="#c084fc" />
                  <rect x="10" y="6" width="4" height="4" fill="#c084fc" />
                  <rect x="1" y="9" width="14" height="3" fill="#a855f7" />
                  <rect x="6" y="6" width="4" height="3" fill="#fde047" />
                  <rect x="7" y="7" width="2" height="2" fill="#ffffff" />
                </svg>
              </div>
              <div className="w-9 h-2 bg-emerald-700/80 rounded-full border-t border-emerald-400" />
            </div>

            {/* Lily 2 */}
            <div
              className="flex flex-col items-center animate-flower-sway-delayed cursor-pointer group -translate-y-1"
              onClick={(e) => {
                e.stopPropagation();
                triggerLily("💜 Glowing Lily: 'True love never ends, it just waits to heal.'", 659.25);
              }}
              title="Tap Glowing Lily"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 relative group-hover:scale-125 transition-transform">
                <svg viewBox="0 0 16 16" className="w-full h-full pixelated drop-shadow-[0_0_16px_#f472b6]" fill="#f472b6">
                  <rect x="7" y="1" width="2" height="5" fill="#fdf2f8" />
                  <rect x="4" y="2" width="3" height="6" fill="#f0abfc" />
                  <rect x="9" y="2" width="3" height="6" fill="#f0abfc" />
                  <rect x="2" y="5" width="4" height="5" fill="#e879f9" />
                  <rect x="10" y="5" width="4" height="5" fill="#e879f9" />
                  <rect x="0" y="9" width="16" height="3" fill="#d946ef" />
                  <rect x="6" y="5" width="4" height="4" fill="#fef08a" />
                  <rect x="7" y="6" width="2" height="2" fill="#ffffff" />
                </svg>
              </div>
              <div className="w-12 h-2.5 bg-emerald-800/90 rounded-full border-t border-emerald-300 shadow-[0_0_8px_#34d399]" />
            </div>

            {/* Lily 3 */}
            <div
              className="flex flex-col items-center animate-flower-sway cursor-pointer group"
              onClick={(e) => {
                e.stopPropagation();
                triggerLily("✨ Purple Lily: 'Yuvraj & Somya belong together 💜'", 783.99);
              }}
              title="Tap Violet Lily"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 relative group-hover:scale-125 transition-transform">
                <svg viewBox="0 0 16 16" className="w-full h-full pixelated drop-shadow-[0_0_12px_#c084fc]" fill="#c084fc">
                  <rect x="7" y="1" width="2" height="4" fill="#f5d0fe" />
                  <rect x="4" y="3" width="3" height="4" fill="#e879f9" />
                  <rect x="9" y="3" width="3" height="4" fill="#e879f9" />
                  <rect x="2" y="6" width="4" height="4" fill="#c084fc" />
                  <rect x="10" y="6" width="4" height="4" fill="#c084fc" />
                  <rect x="1" y="9" width="14" height="3" fill="#9333ea" />
                  <rect x="6" y="6" width="4" height="3" fill="#fde047" />
                  <rect x="7" y="7" width="2" height="2" fill="#ffffff" />
                </svg>
              </div>
              <div className="w-9 h-2 bg-emerald-700/80 rounded-full border-t border-emerald-400" />
            </div>

          </div>
        </div>

        <p className="text-[8px] sm:text-[9px] text-purple-400/80 tracking-widest uppercase mt-1">
          * Tap the purple lilies to read their secrets 💜
        </p>
      </footer>
    </main>
  );
}
