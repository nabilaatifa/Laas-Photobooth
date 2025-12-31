import { useRef, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { Button } from "./ui/button";
import { Download, Home, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const frameColors: Record<string, string> = {
  white: "#FFFFFF",
  ivory: "#FFF7ED",
  lightGray: "#E5E7EB",
  charcoal: "#111827",
  black: "#000000",

  navy: "#1E3A8A",
  sky: "#93C5FD",
  pastelBlue: "#A7C7E7",
  babyBlue: "#BFDBFE",

  pastelPurple: "#B8A0D9",
  lavender: "#C4B5FD",
  lilac: "#E9D5FF",
  grape: "#7C3AED",

  pastelPink: "#FFC0D9",
  rose: "#FDA4AF",
  hotPink: "#EC4899",

  pastelGreen: "#C4E6C3",
  mint: "#BBF7D0",

  cream: "#FFEFD5",
  peach: "#FED7AA",
  brown: "#8B4513",
};

type Mode = "strip" | "grid";
type SizeLabel = "6x2" | "4x6";
type FrameShape = "rounded" | "square";
type TextColor = "black" | "white";

export function SavePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const photos = (location.state?.photos as string[]) || [];
  const layout = (location.state?.layout as number) || 3;
  const mode = (location.state?.mode as Mode) || "strip";
  const sizeLabel = (location.state?.sizeLabel as SizeLabel) || "6x2";
  const frameShape = (location.state?.frameShape as FrameShape) || "rounded";
  const frameColor = (location.state?.frameColor as string) || "pastelPurple";
  const takenAt = location.state?.takenAt as number | undefined;
  const mirror = (location.state?.mirror as boolean | undefined) ?? true;

  const textColor = ((location.state?.textColor as TextColor | undefined) ?? "black") as TextColor;

  const caption = useMemo(() => {
    const fromState = ((location.state?.caption as string | undefined) ?? "").trim();
    const fromStorage = (sessionStorage.getItem("pb_name") ?? "").trim();
    return fromState || fromStorage || "photobooth";
  }, [location.state?.caption]);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const dateLabel = useMemo(() => {
    const d = takenAt ? new Date(takenAt) : new Date();
    return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
  }, [takenAt]);

  useEffect(() => {
    if (photos.length) generateOutput();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photos, mirror, caption, frameColor, layout, mode, sizeLabel, frameShape, takenAt, textColor]);

  const loadImage = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(img);
      img.onerror = reject;
    });

  const generateOutput = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const DPI = 300;
    const CM_TO_IN = 1 / 2.54;

    const cmW = sizeLabel === "4x6" ? 10 : 5;
    const cmH = sizeLabel === "4x6" ? 15 : 15.5;

    const W = Math.round(cmW * CM_TO_IN * DPI);
    const H = Math.round(cmH * CM_TO_IN * DPI);
    canvas.width = W;
    canvas.height = H;

    // ✅ [FIX] tunggu font Poppins siap sebelum canvas nulis text
    const dateSize = Math.round(W * 0.04);
    const capSize = Math.round(W * 0.038);
    try {
      await document.fonts.load(`600 ${dateSize}px "Poppins"`);
      await document.fonts.load(`600 ${capSize}px "Poppins"`);
      await document.fonts.ready;
    } catch {
      // kalau browser ga support fonts API, lanjut aja (fallback)
    }

    // background = frame color (single)
    ctx.fillStyle = frameColors[frameColor] || "#B8A0D9";
    ctx.fillRect(0, 0, W, H);

    const pad = Math.round(W * 0.03);
    const gap = Math.round(W * 0.035);
    const footerH = Math.round(W * 0.22);

    const areaX = pad;
    const areaY = pad;
    const areaW = W - pad * 2;
    const areaH = H - pad * 2 - footerH;

    const imgs = await Promise.all(photos.slice(0, layout).map(loadImage));
    const radius = frameShape === "square" ? 0 : Math.round(W * 0.035);

    if (mode === "grid") {
      const cols = 2;
      const rows = Math.ceil(layout / 2);

      const cellW = (areaW - gap * (cols - 1)) / cols;
      const cellH = (areaH - gap * (rows - 1)) / rows;

      for (let i = 0; i < layout; i++) {
        const img = imgs[i];
        if (!img) continue;

        const r = Math.floor(i / cols);
        const c = i % cols;

        const x = areaX + c * (cellW + gap);
        const y = areaY + r * (cellH + gap);

        drawCoverClipped(ctx, img, x, y, cellW, cellH, mirror, radius);
      }
    } else {
      const count = Math.min(layout, imgs.length);
      const cellH = (areaH - gap * (count - 1)) / count;

      for (let i = 0; i < count; i++) {
        const img = imgs[i];
        if (!img) continue;

        const x = areaX;
        const y = areaY + i * (cellH + gap);

        drawCoverClipped(ctx, img, x, y, areaW, cellH, mirror, radius);
      }
    }

    const footerY = H - pad - footerH;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    const fill = textColor === "white" ? "rgba(255,255,255,0.95)" : "rgba(17,24,39,0.92)";
    const sub = textColor === "white" ? "rgba(255,255,255,0.85)" : "rgba(17,24,39,0.78)";

    ctx.fillStyle = fill;
    // ✅ [FIX] ganti fallback cursive -> sans-serif biar ga loncat font
    ctx.font = `600 ${Math.round(W * 0.04)}px "Poppins", sans-serif`;
    ctx.fillText(dateLabel, W / 2, footerY + Math.round(footerH * 0.4));

    ctx.fillStyle = sub;
    ctx.font = `600 ${Math.round(W * 0.038)}px "Poppins", sans-serif`;
    const cap = caption.trim() || "photobooth";
    const maxW = W - pad * 2 - Math.round(W * 0.6);
    const lines = wrapText(ctx, cap, maxW, 2);
    const startY = footerY + Math.round(footerH * 0.6);
    const lineH = Math.round(W * 0.075);
    lines.forEach((t, i) => ctx.fillText(t, W / 2, startY + i * lineH));
  };

  // ✅ [FIX] regenerate canvas dulu sebelum export
  const handleDownload = async () => {
    await generateOutput();

    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `photobooth-${Date.now()}.jpg`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Downloaded! 💜");
      },
      "image/jpeg",
      0.95
    );
  };

  const goBackToEdit = () => {
    navigate("/frame", {
      state: {
        photos,
        layout,
        mode,
        sizeLabel,
        frameShape,
        frameColor,
        caption,
        takenAt,
        mirror,
        textColor,
      },
    });
  };

  // preview params
  const frameBg = frameColors[frameColor] || "#B8A0D9";
  const shownPhotos = photos.slice(0, layout);

  const outerRadius = frameShape === "square" ? "rounded-none" : "rounded-[26px]";
  const slotRadius = frameShape === "square" ? "rounded-none" : "rounded-2xl";

  const gridCols = 2;
  const gridRows = Math.ceil(layout / 2);

  const previewWClass = sizeLabel === "4x6" ? "w-[350px] sm:w-[390px]" : "w-[210px] sm:w-[245px]";

  const textClass = textColor === "white" ? "text-white" : "text-[#111827]";
  const subTextClass = textColor === "white" ? "text-white/90" : "text-[#111827]/80";

  return (
    <div className="relative min-h-screen px-4 py-8 overflow-hidden bg-[#070014]">
      {/* neon gradient base */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(168,85,247,0.35),_transparent_55%),radial-gradient(ellipse_at_bottom,_rgba(236,72,153,0.25),_transparent_55%),radial-gradient(ellipse_at_left,_rgba(99,102,241,0.25),_transparent_55%)]" />

      {/* moving glow blobs */}
      <div className="pointer-events-none absolute inset-0 opacity-90">
        <motion.div
          className="absolute -top-32 -left-28 w-[560px] h-[560px] rounded-full bg-[#A855F7]/35 blur-3xl"
          animate={{ x: [0, 45, 0], y: [0, 35, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-44 -right-40 w-[640px] h-[640px] rounded-full bg-[#EC4899]/25 blur-3xl"
          animate={{ x: [0, -40, 0], y: [0, -30, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-[34%] left-[58%] w-[460px] h-[460px] rounded-full bg-[#6366F1]/22 blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, -22, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <SparkleLayer />

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-auto w-full max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-[auto_minmax(420px,1fr)] gap-10 items-center">
          {/* LEFT: preview */}
          <div className="flex justify-center lg:justify-start">
            <div className="relative">
              <div className="pointer-events-none absolute -inset-3 rounded-[32px] bg-white/10 blur-xl" />
              <div className={`${previewWClass} ${outerRadius} relative shadow-2xl overflow-hidden`} style={{ backgroundColor: frameBg }}>
                <div className="p-3">
                  {mode === "grid" ? (
                    <div
                      className="grid gap-3"
                      style={{
                        gridTemplateColumns: `repeat(${gridCols}, minmax(0,1fr))`,
                        gridTemplateRows: `repeat(${gridRows}, minmax(0,1fr))`,
                        aspectRatio: "4 / 6",
                      }}
                    >
                      {shownPhotos.map((p, i) => (
                        <div key={i} className={`${slotRadius} overflow-hidden bg-white/90`}>
                          <img
                            src={p}
                            alt={`Photo ${i + 1}`}
                            className="w-full h-full object-cover"
                            style={{ transform: mirror ? "scaleX(-1)" : "none" }}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3" style={{ aspectRatio: "5 / 15.5" }}>
                      {shownPhotos.map((p, i) => (
                        <div key={i} className={`flex-1 ${slotRadius} overflow-hidden bg-white/90`}>
                          <img
                            src={p}
                            alt={`Photo ${i + 1}`}
                            className="w-full h-full object-cover"
                            style={{ transform: mirror ? "scaleX(-1)" : "none" }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="px-3 pb-5 text-center">
                  <p className={`text-[12px] font-semibold ${textClass}`}>{dateLabel}</p>
                  <p className={`text-[13px] font-semibold ${subTextClass} line-clamp-2`}>{caption}</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: title + actions */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-xl">
              {/* ✅ title moved here */}
              <div className="text-center mb-5">
                <h2 className="text-3xl font-semibold text-white drop-shadow">Your Memory is Ready!</h2>
                <p className="text-white/70 text-sm">A memory made with love 💜</p>
              </div>

              <div className="relative rounded-2xl">
                <div className="pointer-events-none absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-white/15 via-white/10 to-white/15" />
                <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/15">
                  <div className="text-center mb-4">
                    <h3 className="text-white font-semibold text-lg">Download & Options</h3>
                  </div>

                  <div className="flex flex-col gap-3">
                    <Button
                      onClick={handleDownload}
                      className="w-full h-11 bg-gradient-to-r from-[#A855F7] via-[#7C3AED] to-[#EC4899] hover:from-[#9333EA] hover:via-[#6D28D9] hover:to-[#DB2777] text-white shadow-[0_10px_30px_rgba(168,85,247,0.25)]"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>

                    <Button
                      onClick={goBackToEdit}
                      variant="outline"
                      className="w-full h-11 border-white/25 bg-white/10 hover:bg-white/15 !text-white"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Edit
                    </Button>

                    <Button
                      onClick={() => navigate("/")}
                      variant="outline"
                      className="w-full h-11 border-white/25 bg-white/10 hover:bg-white/15 !text-white"
                    >
                      <Home className="w-4 h-4 mr-2" />
                      Start Over
                    </Button>
                  </div>

                  <p className="mt-4 text-center text-xs text-white/60">
                    Tip: Jangan lupa di download fotonya biar ngga kangen wlee ✨
                  </p>

                  <canvas ref={canvasRef} className="hidden" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/** sparkle dots */
function SparkleLayer() {
  const dots = Array.from({ length: 26 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: 2 + Math.random() * 3.5,
    delay: Math.random() * 2.5,
    duration: 2.8 + Math.random() * 3.2,
    opacity: 0.12 + Math.random() * 0.22,
  }));

  return (
    <div className="pointer-events-none absolute inset-0">
      {dots.map((d) => (
        <motion.span
          key={d.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: d.size,
            height: d.size,
            opacity: d.opacity,
            filter: "blur(0.2px)",
          }}
          animate={{
            opacity: [d.opacity, d.opacity + 0.35, d.opacity],
            transform: ["scale(1)", "scale(1.6)", "scale(1)"],
          }}
          transition={{ duration: d.duration, delay: d.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/** draw image cover + clip rounded/square */
function drawCoverClipped(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  mirror: boolean,
  r: number
) {
  ctx.save();

  if (r > 0) {
    roundRect(ctx, x, y, w, h, r);
    ctx.clip();
  } else {
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
  }

  const imgAR = img.width / img.height;
  const targetAR = w / h;

  let dw = w;
  let dh = h;
  let dx = x;
  let dy = y;

  if (imgAR > targetAR) {
    dh = h;
    dw = h * imgAR;
    dx = x + (w - dw) / 2;
  } else {
    dw = w;
    dh = w / imgAR;
    dy = y + (h - dh) / 2;
  }

  if (mirror) {
    ctx.translate(dx + dw, dy);
    ctx.scale(-1, 1);
    ctx.drawImage(img, 0, 0, dw, dh);
  } else {
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  ctx.restore();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number, maxLines: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";

  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width <= maxW) line = test;
    else {
      if (line) lines.push(line);
      line = w;
      if (lines.length >= maxLines) break;
    }
  }
  if (lines.length < maxLines && line) lines.push(line);
  return lines.slice(0, maxLines);
}
