import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Button } from "./ui/button";
import { Sparkles } from "lucide-react";
import Icon from "../../assets/icon.png";

export function HomePage() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState<string>(() => sessionStorage.getItem("pb_name") ?? "");

  const handleStart = () => {
    const clean = name.trim();
    if (!clean) {
      inputRef.current?.focus();
      return;
    }
    sessionStorage.setItem("pb_name", clean);
    navigate("/layout");
  };

  const blobs = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        size: Math.random() * 220 + 120,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        color:
          i % 4 === 0
            ? "#7c3aed"
            : i % 4 === 1
            ? "#a855f7"
            : i % 4 === 2
            ? "#ec4899"
            : "#60a5fa",
        opacity: i % 3 === 0 ? 0.18 : 0.14,
        blur: i % 2 === 0 ? 70 : 90,
        dur: 6 + Math.random() * 4,
        delay: Math.random() * 2,
        dx: (Math.random() > 0.5 ? 1 : -1) * (16 + Math.random() * 22),
        dy: (Math.random() > 0.5 ? 1 : -1) * (24 + Math.random() * 36),
      })),
    []
  );

  const sparkles = useMemo(
    () =>
      Array.from({ length: 22 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: 6 + Math.random() * 10,
        opacity: 0.25 + Math.random() * 0.35,
        dur: 2.4 + Math.random() * 2.5,
        delay: Math.random() * 2,
      })),
    []
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Base background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#fdf7ff] via-[#f7f0ff] to-[#eef3ff]" />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(124,58,237,0.10) 1px, transparent 1px), linear-gradient(to bottom, rgba(236,72,153,0.08) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      {/* EXTRA LAYER 1 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 36 }).map((_, i) => (
          <motion.div
            key={`dot-${i}`}
            className="absolute rounded-full"
            style={{
              width: 4 + (i % 5),
              height: 4 + (i % 5),
              left: `${(i * 17) % 100}%`,
              top: `${(i * 29) % 100}%`,
              background:
                i % 3 === 0
                  ? "rgba(168,85,247,0.6)"
                  : i % 3 === 1
                  ? "rgba(236,72,153,0.5)"
                  : "rgba(96,165,250,0.5)",
            }}
            animate={{ opacity: [0.15, 0.8, 0.15], scale: [1, 1.3, 1], y: [0, -12, 0] }}
            transition={{
              duration: 2.6 + (i % 6) * 0.35,
              repeat: Infinity,
              ease: "easeInOut",
              delay: (i % 8) * 0.12,
            }}
          />
        ))}

        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={`ribbon-${i}`}
            className="absolute -inset-x-24 h-56 rounded-full"
            style={{
              top: `${18 + i * 18}%`,
              background:
                i % 2 === 0
                  ? "linear-gradient(90deg, rgba(124,58,237,0), rgba(168,85,247,0.22), rgba(236,72,153,0.18), rgba(96,165,250,0))"
                  : "linear-gradient(90deg, rgba(96,165,250,0), rgba(236,72,153,0.18), rgba(168,85,247,0.22), rgba(124,58,237,0))",
              filter: "blur(30px)",
              opacity: 0.9,
            }}
            animate={{
              x: i % 2 === 0 ? ["-10%", "10%", "-10%"] : ["10%", "-10%", "10%"],
              rotate: i % 2 === 0 ? [-4, 4, -4] : [4, -4, 4],
            }}
            transition={{ duration: 12 + i * 2, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* BLOBS */}
      <div className="absolute inset-0 pointer-events-none">
        {blobs.map((b) => (
          <motion.div
            key={b.id}
            className="absolute rounded-full"
            style={{
              width: b.size,
              height: b.size,
              left: b.left,
              top: b.top,
              background: b.color,
              opacity: b.opacity,
              filter: `blur(${b.blur}px)`,
              transform: "translate(-50%, -50%)",
            }}
            animate={{
              x: [0, b.dx, 0],
              y: [0, b.dy, 0],
              scale: [1, 1.14, 1],
              rotate: [0, b.id % 2 === 0 ? 10 : -10, 0],
            }}
            transition={{ duration: b.dur, repeat: Infinity, ease: "easeInOut", delay: b.delay }}
          />
        ))}
      </div>

      {/* Sparkles */}
      <div className="absolute inset-0 pointer-events-none">
        {sparkles.map((s) => (
          <motion.div
            key={s.id}
            className="absolute"
            style={{ left: s.left, top: s.top, opacity: s.opacity }}
            animate={{ opacity: [s.opacity, s.opacity * 0.35, s.opacity] }}
            transition={{ duration: s.dur, repeat: Infinity, ease: "easeInOut", delay: s.delay }}
          >
            <Sparkles className="text-[#a855f7]" style={{ width: s.size, height: s.size }} />
          </motion.div>
        ))}
      </div>

      {/* ===== CONTENT ===== */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6 pt-6 scale-[1.20] origin-center"

      >
        {/* ICON: ✅ dibesarin dikit */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 220 }}
          className="mb-4"
        >
          <div className="relative">
            <div className="absolute -inset-6 rounded-full bg-purple-500/25 blur-2xl" />
            <img
              src={Icon}
              alt="Icon"
              className="relative mx-auto w-[92px] h-[92px] md:w-[108px] md:h-[108px] object-contain drop-shadow-[0_18px_45px_rgba(168,85,247,0.25)]"
              draggable={false}
            />
          </div>
        </motion.div>

        {/* ✅ tulisan kecilin dikit */}
        <p className="text-xs md:text-sm text-[#7a6a8e] mb-2 mt-1">Welcome Sweetheart 💜</p>

        <h1
          className="text-4xl md:text-5xl font-semibold tracking-tight"
          style={{
            background: "linear-gradient(90deg, #7c3aed 0%, #a855f7 35%, #ec4899 70%, #60a5fa 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            textShadow: "0 10px 40px rgba(168,85,247,0.25)",
          }}
        >
          Laa&apos;s Photobooth
        </h1>

        <p className="mt-3 text-sm md:text-base text-[#8f7fa6] max-w-xl">
          Capture moments, cherish memories together.
        </p>

        <div className="mt-6 w-full max-w-md">
          <label className="block text-left text-[11px] text-[#9c8bb5] mb-2">Your name</label>
          <input
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleStart();
            }}
            placeholder="Type your name…"
            maxLength={30}
            className="w-full rounded-2xl border border-purple-200/60 bg-white/70 px-4 py-3
                       text-[#5b4a72] placeholder:text-[#b0a1c6]
                       outline-none focus:ring-2 focus:ring-purple-300/60"
          />
          <div className="mt-2 text-right text-[11px] text-[#b7a7cd]">{name.trim().length}/30</div>
        </div>

        <Button
          onClick={handleStart}
          size="lg"
          className="relative mt-4 px-12 py-6 rounded-full text-white
                     bg-gradient-to-r from-[#7c3aed] via-[#a855f7] to-[#ec4899]
                     hover:from-[#6d28d9] hover:via-[#9333ea] hover:to-[#db2777]
                     shadow-[0_18px_60px_rgba(168,85,247,0.4)]
                     hover:shadow-[0_22px_70px_rgba(236,72,153,0.4)]
                     transition-all"
        >
          <span className="absolute inset-0 rounded-full blur-xl opacity-40 bg-white/30" />
          <span className="relative">START</span>
        </Button>

        <p className="mt-6 text-xs text-[#9c8bb5]">✨ Pick a layout → take photos → choose frame → download</p>
      </motion.div>
    </div>
  );
}
