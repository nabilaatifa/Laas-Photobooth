import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/button";
import { Camera, RotateCw, AlertCircle, Image } from "lucide-react";

type Mode = "strip" | "grid";
type SizeLabel = "6x2" | "4x6";
type FrameShape = "rounded" | "square";

export function CameraPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const layout = (location.state?.layout as number) || 3; // 2/3/4/6
  const mode = (location.state?.mode as Mode) || "strip";
  const sizeLabel = (location.state?.sizeLabel as SizeLabel) || "6x2";
  const layoutId = (location.state?.layoutId as string | undefined) ?? undefined;
  const frameShape = (location.state?.frameShape as FrameShape | undefined) ?? "rounded";

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [photos, setPhotos] = useState<string[]>([]);
  const [takenAt, setTakenAt] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [useMockPhotos, setUseMockPhotos] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);

  // ✅ required photos always = layout
  const requiredPhotos = useMemo(() => layout, [layout]);

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: "user" },
      });

      if (videoRef.current) videoRef.current.srcObject = mediaStream;

      streamRef.current = mediaStream;
      setCameraError(null);
      setUseMockPhotos(false);
    } catch (error) {
      console.error("Error accessing camera:", error);
      if (error instanceof Error) {
        if (error.name === "NotAllowedError") setCameraError("Camera permission denied. Please use mock photos instead.");
        else if (error.name === "NotFoundError") setCameraError("No camera found. Please use mock photos instead.");
        else setCameraError("Unable to access camera. Please use mock photos instead.");
      } else {
        setCameraError("Unable to access camera. Please use mock photos instead.");
      }
    }
  };

  const generateMockPhoto = (index: number): string => {
    const canvas = document.createElement("canvas");
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, "#b8a0d9");
      gradient.addColorStop(0.5, "#dcc5f0");
      gradient.addColorStop(1, "#e8dff5");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const nm = sessionStorage.getItem("pb_name") || "";
      ctx.fillStyle = "#ffffff";
      ctx.font = "52px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`Photo ${index}`, canvas.width / 2, canvas.height / 2);
      ctx.font = "26px sans-serif";
      ctx.fillText(nm ? `💜 ${nm} 💜` : "💜 photobooth 💜", canvas.width / 2, canvas.height / 2 + 64);
    }

    return canvas.toDataURL("image/jpeg");
  };

  const goToFrame = (finalPhotos: string[], ts: number) => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    navigate("/frame", {
      state: {
        photos: finalPhotos,
        layout,
        mode,
        sizeLabel,
        layoutId,
        frameShape,
        takenAt: ts,
      },
    });
  };

  const takePhoto = () => {
    if (countdown !== null) return;

    if (useMockPhotos) {
      const ts = takenAt ?? Date.now();
      if (!takenAt) setTakenAt(ts);

      const nextIndex = photos.length + 1;
      const mockPhoto = generateMockPhoto(nextIndex);
      const newPhotos = [...photos, mockPhoto];

      setPhotos(newPhotos);

      if (newPhotos.length >= requiredPhotos) goToFrame(newPhotos, ts);
      else setCurrentStep((s) => s + 1);
      return;
    }

    setCountdown(3);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(timer);
          capturePhoto();
          return null;
        }
        return (prev ?? 1) - 1;
      });
    }, 1000);
  };

  // ✅ capture result mirror (same as video preview)
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    const photoData = canvas.toDataURL("image/jpeg");

    const ts = takenAt ?? Date.now();
    if (!takenAt) setTakenAt(ts);

    const newPhotos = [...photos, photoData];
    setPhotos(newPhotos);

    if (newPhotos.length >= requiredPhotos) goToFrame(newPhotos, ts);
    else setCurrentStep((s) => s + 1);
  };

  const retakePhoto = () => {
    const newPhotos = photos.slice(0, -1);
    setPhotos(newPhotos);
    setCurrentStep(newPhotos.length + 1);
  };

  const handleUseMockPhotos = () => {
    setUseMockPhotos(true);
    setCameraError(null);
  };

  // ✅ smaller UI wrapper
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#f2f0f5] via-[#bcaacb] to-[#f0eff1] px-4 py-5">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl w-full">
        <div className="mb-4 text-center">
          <p className="text-sm text-[#9c8bb5] mb-2">
            Photo {Math.min(currentStep, requiredPhotos)} of {requiredPhotos}
          </p>
          <div className="flex gap-2 justify-center">
            {[...Array(requiredPhotos)].map((_, i) => (
              <div
                key={i}
                className={`h-2 w-10 rounded-full transition-all ${
                  i < photos.length ? "bg-[#b8a0d9]" : i === photos.length ? "bg-[#dcc5f0]" : "bg-[#e8dff5]"
                }`}
              />
            ))}
          </div>
        </div>

        {/* ✅ Camera Box consistent */}
        <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#382257]">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_210px]">
            <div className="relative bg-black" style={{ aspectRatio: "16 / 9" }}>
              {cameraError && !useMockPhotos ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#b8a0d9] to-[#dcc5f0] p-7">
                  <AlertCircle className="w-14 h-14 text-white mb-3" />
                  <p className="text-white text-center mb-5 max-w-md">{cameraError}</p>
                  <div className="flex gap-3 flex-wrap justify-center">
                    <Button onClick={handleUseMockPhotos} className="bg-white text-[#b8a0d9] hover:bg-gray-100">
                      <Image className="w-4 h-4 mr-2" />
                      Use Mock Photos
                    </Button>
                    <Button onClick={startCamera} variant="outline" className="border-white text-white hover:bg-white/10">
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : useMockPhotos ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#b8a0d9] to-[#dcc5f0]">
                  <div className="text-center text-white">
                    <Image className="w-20 h-20 mx-auto mb-3 opacity-80" />
                    <p className="text-lg">Mock Photo Mode</p>
                    <p className="text-xs mt-2 opacity-80">Click “Take Photo” to generate a placeholder</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* ✅ video mirrored */}
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                  <canvas ref={canvasRef} className="hidden" />

                  <AnimatePresence>
                    {countdown !== null && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center bg-black/50"
                      >
                        <motion.div key={countdown} initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-7xl text-white">
                          {countdown}
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>

            {/* Preview right */}
            <div className="hidden lg:block bg-gradient-to-b from-white to-[#a988c9] p-4 border-t lg:border-t-0 lg:border-l border-[#e8dff5]">
              <p className="text-xs text-[#9c8bb5] mb-3 text-center">Preview</p>
              <div className="flex flex-col gap-3">
                {[...Array(requiredPhotos)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-full rounded-xl overflow-hidden border shadow-sm ${
                      i < photos.length ? "border-[#b8a0d9]" : i === photos.length ? "border-[#dcc5f0]" : "border-[#e8dff5]"
                    }`}
                    style={{ aspectRatio: "16 / 9" }}
                  >
                    {photos[i] ? (
                      <img src={photos[i]} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#f5f0fa] text-[#b8a0d9] text-sm">{i + 1}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="px-5 py-4 bg-gradient-to-b from-white to-[#faf8fc]">
            <p className="text-center text-[#4a3b5c] mb-3 text-sm">Get ready and smile together 💜</p>
            <div className="flex gap-3 justify-center flex-wrap">
              {photos.length > 0 && (
                <Button onClick={retakePhoto} variant="outline" className="border-[#e8dff5] text-[#b8a0d9] hover:bg-[#f5f0fa]">
                  <RotateCw className="w-4 h-4 mr-2" />
                  Retake Last
                </Button>
              )}
              <Button
                onClick={takePhoto}
                disabled={countdown !== null || photos.length >= requiredPhotos}
                className="bg-gradient-to-r from-[#b8a0d9] to-[#dcc5f0] hover:from-[#a88dc7] hover:to-[#cdb3e3] text-white px-7"
              >
                <Camera className="w-4 h-4 mr-2" />
                Take Photo
              </Button>
            </div>
          </div>
        </div>

        {/* bottom thumbnails smaller */}
        {photos.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mt-5 flex gap-3 justify-center flex-wrap">
            {photos.map((photo, index) => (
              <div key={index} className="w-20 h-20 rounded-lg overflow-hidden border border-[#b8a0d9] shadow">
                <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
