import { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { Button } from "./ui/button";
import { Check, FlipHorizontal, Sparkles } from "lucide-react";

const frameColors = [
  { id: "white", name: "White", value: "#FFFFFF" },
  { id: "ivory", name: "Ivory", value: "#FFF7ED" },
  { id: "lightGray", name: "Light Gray", value: "#E5E7EB" },
  { id: "charcoal", name: "Charcoal", value: "#111827" },
  { id: "black", name: "Black", value: "#000000" },

  { id: "navy", name: "Navy", value: "#1E3A8A" },
  { id: "sky", name: "Sky", value: "#93C5FD" },
  { id: "pastelBlue", name: "Pastel Blue", value: "#A7C7E7" },
  { id: "babyBlue", name: "Baby Blue", value: "#BFDBFE" },

  { id: "pastelPurple", name: "Pastel Purple", value: "#B8A0D9" },
  { id: "lavender", name: "Lavender", value: "#C4B5FD" },
  { id: "lilac", name: "Lilac", value: "#E9D5FF" },
  { id: "grape", name: "Grape", value: "#7C3AED" },

  { id: "pastelPink", name: "Pastel Pink", value: "#FFC0D9" },
  { id: "rose", name: "Rose", value: "#FDA4AF" },
  { id: "hotPink", name: "Hot Pink", value: "#EC4899" },

  { id: "pastelGreen", name: "Pastel Green", value: "#C4E6C3" },
  { id: "mint", name: "Mint", value: "#BBF7D0" },

  { id: "cream", name: "Cream", value: "#FFEFD5" },
  { id: "peach", name: "Peach", value: "#FED7AA" },
  { id: "brown", name: "Brown", value: "#8B4513" },
];

type Mode = "strip" | "grid";
type SizeLabel = "6x2" | "4x6";
type FrameShape = "rounded" | "square";
type TextColor = "black" | "white";

export function FramePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const photos = (location.state?.photos as string[]) || [];
  const layout = (location.state?.layout as number) || 3;
  const mode = (location.state?.mode as Mode) || "strip";
  const sizeLabel = (location.state?.sizeLabel as SizeLabel) || "6x2";
  const frameShape = (location.state?.frameShape as FrameShape) || "rounded";
  const takenAt = location.state?.takenAt as number | undefined;

  const [selectedColor, setSelectedColor] = useState<string>(
    (location.state?.frameColor as string | undefined) ?? "pastelPurple"
  );
  const [mirror, setMirror] = useState<boolean>(
    (location.state?.mirror as boolean | undefined) ?? true
  );
  const [textColor, setTextColor] = useState<TextColor>(
    ((location.state?.textColor as TextColor | undefined) ?? "black") as TextColor
  );

  const caption = useMemo(() => {
    const nm = (sessionStorage.getItem("pb_name") ?? "").trim();
    return nm || "photobooth";
  }, []);

  const dateLabel = useMemo(() => {
    const d = takenAt ? new Date(takenAt) : new Date();
    return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
  }, [takenAt]);

  const frameBg = frameColors.find((c) => c.id === selectedColor)?.value || "#B8A0D9";
  const shownPhotos = photos.slice(0, layout);

  const outerRadius = frameShape === "square" ? "rounded-none" : "rounded-2xl";
  const slotRadius = frameShape === "square" ? "rounded-none" : "rounded-xl";

  const gridCols = 2;
  const gridRows = Math.ceil(layout / 2);

  // preview kecil (biar strip ga scroll)
  const previewWClass =
    sizeLabel === "4x6" ? "w-[360px] sm:w-[380px]" : "w-[210px] sm:w-[230px]";

  const textClass = textColor === "white" ? "text-white" : "text-[#111827]";
  const subTextClass = textColor === "white" ? "text-white/90" : "text-[#111827]/80";

  const handleContinue = () => {
    navigate("/save", {
      state: {
        photos,
        layout,
        mode,
        sizeLabel,
        frameShape,
        frameColor: selectedColor,
        caption,
        takenAt,
        mirror,
        textColor,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#a472d6] via-[#ded2e9] to-[#42177f] px-4 py-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-auto w-full max-w-6xl">
        <div className="text-center mb-3">
          <h2 className="text-[#4a3b5c] text-xl md:text-2xl font-semibold">Customize your photo</h2>
          <p className="text-[#9c8bb5] text-sm">
            {sizeLabel === "4x6"
              ? `4×6 (${mode === "grid" ? `grid 2×${gridRows}` : `strip ${layout} pose`})`
              : `6×2 (strip ${layout} pose)`}{" "}
            • frame color • mirror • text color
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-4 items-start">
          {/* LEFT: preview */}
          <div className="flex justify-center lg:justify-start">
            <div className={`${previewWClass} ${outerRadius} shadow-2xl overflow-hidden`} style={{ backgroundColor: frameBg }}>
              {/* photo area */}
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

              {/* ✅ NO BOX — just text + space */}
              <div className="px-3 pb-4 text-center">
                <p className={`text-[11px] font-semibold ${textClass}`}>{dateLabel}</p>
                <p className={`text-[12px] font-semibold ${subTextClass} line-clamp-2`}>{caption}</p>
              </div>
            </div>
          </div>

          {/* RIGHT: controls */}
          <div className="bg-white/70 backdrop-blur rounded-2xl border border-[#e8dff5] shadow-xl p-4">
            <h3 className="text-[#4a3b5c] font-semibold mb-2">Frame Color</h3>
            <div className="grid grid-cols-10 gap-2">
              {frameColors.map((color) => (
                <button
                  key={color.id}
                  onClick={() => setSelectedColor(color.id)}
                  className={`relative aspect-square rounded-full transition-transform hover:scale-110 ${
                    selectedColor === color.id ? "ring-4 ring-[#b8a0d9] ring-offset-2" : "ring-2 ring-[#e8dff5]"
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {selectedColor === color.id && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute inset-0 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-white shadow flex items-center justify-center">
                        <Check className="w-4 h-4 text-[#b8a0d9]" />
                      </div>
                    </motion.div>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-3 px-3 py-2 rounded-lg bg-[#f5f0fa]">
              <p className="text-sm text-[#9c8bb5]">
                Selected: <span className="text-[#4a3b5c]">{frameColors.find((c) => c.id === selectedColor)?.name}</span>
              </p>
            </div>

            <div className="mt-4">
              <h3 className="text-[#4a3b5c] font-semibold mb-2">Text Color (date & caption)</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTextColor("black")}
                  className={`px-4 py-2 rounded-full border text-sm transition ${
                    textColor === "black"
                      ? "border-[#b8a0d9] bg-[#f5f0fa] text-[#4a3b5c] font-semibold"
                      : "border-[#e8dff5] bg-white/70 text-[#6a5b80]"
                  }`}
                >
                  Black
                </button>
                <button
                  type="button"
                  onClick={() => setTextColor("white")}
                  className={`px-4 py-2 rounded-full border text-sm transition ${
                    textColor === "white"
                      ? "border-[#b8a0d9] bg-[#f5f0fa] text-[#4a3b5c] font-semibold"
                      : "border-[#e8dff5] bg-white/70 text-[#6a5b80]"
                  }`}
                >
                  White
                </button>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-[#4a3b5c] font-semibold mb-2">Mirror</h3>
              <button
                type="button"
                onClick={() => setMirror((v) => !v)}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 bg-white/75 backdrop-blur border border-[#dcc5f0] text-[#4a3b5c] hover:bg-white/95 transition text-sm"
              >
                <FlipHorizontal className="w-4 h-4 text-[#b8a0d9]" />
                Mirror: <span className="font-semibold">{mirror ? "ON" : "OFF"}</span>
              </button>
            </div>

            <div className="mt-4 rounded-xl border border-[#e8dff5] bg-[#faf8fc] p-3">
              <p className="text-xs text-[#9c8bb5] mb-1">Caption</p>
              <p className="text-sm text-[#4a3b5c] font-medium">{caption}</p>
            </div>

            <Button
              onClick={handleContinue}
              className="w-full mt-4 bg-gradient-to-r from-[#b8a0d9] to-[#dcc5f0] hover:from-[#a88dc7] hover:to-[#cdb3e3] text-white"
            >
              Continue to Save
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

