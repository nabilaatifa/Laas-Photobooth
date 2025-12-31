import { useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Card } from "./ui/card";
import { Camera, ChevronLeft, ChevronRight, Heart } from "lucide-react";

type LayoutMode = "strip" | "grid";
type SizeLabel = "2x6" | "4x6";
type FrameShape = "rounded" | "square";

type LayoutItem = {
  id: string;
  label: string;
  photos: number; // 2/3/4/6
  sizeLabel: SizeLabel;
  mode: LayoutMode;
  frameShape: FrameShape;
  desc: string;
};

const layouts: LayoutItem[] = [
  // Rounded (existing)
  { id: "6x2-2-r", label: "Layout A", photos: 2, sizeLabel: "2x6", mode: "strip", frameShape: "rounded", desc: "Size 2 x 6 Strip (2 Pose)" },
  { id: "6x2-3-r", label: "Layout B", photos: 3, sizeLabel: "2x6", mode: "strip", frameShape: "rounded", desc: "Size 2 x 6 Strip (3 Pose)" },
  { id: "6x2-4-r", label: "Layout C", photos: 4, sizeLabel: "2x6", mode: "strip", frameShape: "rounded", desc: "Size 2 x 6 Strip (4 Pose)" },

  // Square versions (NEW)
  { id: "6x2-2-s", label: "Layout A (Square)", photos: 2, sizeLabel: "2x6", mode: "strip", frameShape: "square", desc: "Size 2 x 6 Strip (2 Pose)" },
  { id: "6x2-3-s", label: "Layout B (Square)", photos: 3, sizeLabel: "2x6", mode: "strip", frameShape: "square", desc: "Size 2 x 6 Strip (3 Pose)" },
  { id: "6x2-4-s", label: "Layout C (Square)", photos: 4, sizeLabel: "2x6", mode: "strip", frameShape: "square", desc: "Size 2 x 6 Strip (4 Pose)" },

  // Layout D 6 photos (NEW)
  { id: "4x6-4-r", label: "Layout D", photos: 4, sizeLabel: "4x6", mode: "grid", frameShape: "rounded", desc: "Size 4 x 6 (4 Pose)" },
  { id: "4x6-6-r", label: "Layout E", photos: 6, sizeLabel: "4x6", mode: "grid", frameShape: "rounded", desc: "Size 4 x 6 (6 Pose)" },
];

export function LayoutPage() {
  const navigate = useNavigate();
  const scrollerRef = useRef<HTMLDivElement>(null);

  const handleLayoutSelect = (item: LayoutItem) => {
    navigate("/camera", {
      state: {
        layout: item.photos,
        sizeLabel: item.sizeLabel,
        mode: item.mode,
        layoutId: item.id,
        frameShape: item.frameShape,
      },
    });
  };

  const scrollBy = (dir: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -240 : 240, behavior: "smooth" });
  };

  // ✅ sama seperti sebelumnya, cuma ditambah "relative overflow-hidden" untuk background layer
  const bgClass = useMemo(
    () =>
      "relative overflow-hidden min-h-screen flex flex-col items-center justify-center " +
      "bg-gradient-to-br from-[#f7f2fb] via-[#fbf8ff] to-[#e9def6] px-4 py-5",
    []
  );

  const getAspect = (sizeLabel: SizeLabel) => (sizeLabel === "4x6" ? "4 / 6" : "5 / 15.5");

  return (
    <div className={bgClass}>
      {/* ✅ background meriah (love + sparkles + glow) — tidak ganggu klik */}
      <LayoutBackground />

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-5xl">
        <div className="text-center mb-5">
          <Camera className="w-9 h-9 mx-auto text-[#b8a0d9] mb-2" />
          <h2 className="text-xl md:text-2xl font-semibold text-[#4a3b5c] mb-1">choose your layout</h2>
          <p className="text-sm text-[#9c8bb5]">Pick your photobooth style</p>
        </div>

        <div className="relative w-full flex items-center justify-center">
          <button
            type="button"
            onClick={() => scrollBy("left")}
            className="hidden md:flex absolute -left-2 z-10 h-11 w-11 items-center justify-center rounded-full
                       bg-white/70 backdrop-blur border border-[#dcc5f0] shadow hover:bg-white/90 transition"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-6 w-6 text-[#b8a0d9]" />
          </button>

          <div ref={scrollerRef} className="w-full overflow-x-auto scroll-smooth flex gap-4 px-1 pb-3 snap-x snap-mandatory">
            {layouts.map((item, index) => {
              const is4x6 = item.sizeLabel === "4x6";
              const isSquare = item.frameShape === "square";

              // ✅ SQUARE benar2 tajam 90°
              const outerRadius = isSquare ? "rounded-none" : "rounded-2xl";
              const slotRadius = isSquare ? "rounded-none" : "rounded-xl";

              const cols = item.mode === "grid" ? 2 : 1;
              const rows = item.mode === "grid" ? Math.ceil(item.photos / 2) : item.photos;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="snap-center shrink-0"
                >
                  <Card
                    onClick={() => handleLayoutSelect(item)}
                    className={`group cursor-pointer overflow-hidden
                      border border-[#e8dff5] hover:border-[#b8a0d9]
                      bg-white/70 backdrop-blur shadow-[0_14px_36px_rgba(40,20,90,0.10)]
                      transition-all duration-300 hover:-translate-y-1
                      ${is4x6 ? "w-[235px] md:w-[245px]" : "w-[200px] md:w-[210px]"}
                      ${isSquare ? "rounded-2xl" : "rounded-3xl"}`}
                  >
                    <div className="p-4">
                      <div className={`mx-auto mb-3 ${is4x6 ? "w-[190px]" : "w-[125px]"}`}>
                        <div
                          className={`${outerRadius} p-2 shadow-inner border border-[#e7ddf6]
                                     bg-[#f7f2fb]`}
                          style={{ aspectRatio: getAspect(item.sizeLabel) }}
                        >
                          {item.mode === "strip" ? (
                            // ✅ jarak frame naik sedikit: gap-2
                            <div className="h-full flex flex-col gap-2">
                              {Array.from({ length: item.photos }).map((_, i) => (
                                <div key={i} className={`flex-1 ${slotRadius} border border-[#dcc5f0] bg-white/92 flex items-center justify-center`}>
                                  <Camera className="w-4 h-4 text-[#b8a0d9] opacity-45" />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div
                              className="h-full grid gap-2"
                              style={{
                                gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))`,
                                gridTemplateRows: `repeat(${rows}, minmax(0,1fr))`,
                              }}
                            >
                              {Array.from({ length: item.photos }).map((_, i) => (
                                <div key={i} className={`${slotRadius} border border-[#dcc5f0] bg-white/92 flex items-center justify-center`}>
                                  <Camera className="w-4 h-4 text-[#b8a0d9] opacity-45" />
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="mt-2 text-[10px] tracking-widest text-center text-[#6a5b80]/70">photobooth</div>
                        </div>
                      </div>

                      <div className="text-center">
                        <h3 className="text-[#4a3b5c] font-semibold text-[15px] group-hover:text-[#b8a0d9] transition-colors">
                          {item.label}
                        </h3>
                        <p className="text-xs text-[#9c8bb5] mt-1">{item.desc}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => scrollBy("right")}
            className="hidden md:flex absolute -right-2 z-10 h-11 w-11 items-center justify-center rounded-full
                       bg-white/70 backdrop-blur border border-[#dcc5f0] shadow hover:bg-white/90 transition"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-6 w-6 text-[#b8a0d9]" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function LayoutBackground() {
  // fixed positions biar konsisten (nggak random tiap refresh)
  const hearts = [
    { left: "6%", top: "14%", size: 18, dur: 6.5, delay: 0.2, opacity: 0.35 },
    { left: "14%", top: "72%", size: 22, dur: 7.2, delay: 0.6, opacity: 0.25 },
    { left: "28%", top: "22%", size: 16, dur: 5.8, delay: 0.1, opacity: 0.28 },
    { left: "42%", top: "10%", size: 20, dur: 7.8, delay: 0.4, opacity: 0.22 },
    { left: "58%", top: "78%", size: 24, dur: 8.4, delay: 0.9, opacity: 0.24 },
    { left: "70%", top: "18%", size: 18, dur: 6.9, delay: 0.3, opacity: 0.26 },
    { left: "82%", top: "62%", size: 20, dur: 7.6, delay: 0.7, opacity: 0.23 },
    { left: "92%", top: "16%", size: 16, dur: 6.1, delay: 0.5, opacity: 0.22 },
  ];

  return (
    <div className="pointer-events-none absolute inset-0">
      {/* glow ungu soft */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[680px] h-[680px] rounded-full bg-purple-500/15 blur-3xl" />
      <div className="absolute -bottom-44 right-[-120px] w-[620px] h-[620px] rounded-full bg-fuchsia-500/12 blur-3xl" />
      <div className="absolute top-1/3 left-[-140px] w-[520px] h-[520px] rounded-full bg-indigo-500/10 blur-3xl" />

      {/* sparkles */}
      <div
        className="absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage: "radial-gradient(rgba(184,160,217,0.35) 1px, transparent 1.6px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* floating hearts */}
      {hearts.map((h, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: h.left, top: h.top, opacity: h.opacity }}
          initial={{ y: 0, scale: 0.9, rotate: -8 }}
          animate={{ y: [0, -18, 0], x: [0, 6, 0], rotate: [-8, 8, -8] }}
          transition={{ duration: h.dur, repeat: Infinity, ease: "easeInOut", delay: h.delay }}
        >
          <Heart
            className="text-[#b8a0d9] fill-[#b8a0d9]"
            style={{
              width: h.size,
              height: h.size,
              filter: "drop-shadow(0 6px 18px rgba(124,58,237,0.20))",
            }}
          />
        </motion.div>
      ))}

      {/* vignette tipis */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/0 to-white/25" />
    </div>
  );
}
