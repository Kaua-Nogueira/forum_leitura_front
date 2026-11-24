import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Move,
  Check,
  RefreshCw,
  Upload,
  Crop,
} from 'lucide-react';

export interface ImageCropModalProps {
  isOpen: boolean;
  mode: 'AVATAR' | 'COVER';
  imageSrc: string;
  onClose: () => void;
  onApply: (croppedDataUrl: string) => Promise<void> | void;
  onPickAnotherFile?: () => void;
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  mode,
  imageSrc,
  onClose,
  onApply,
  onPickAnotherFile,
}) => {
  const isCover = mode === 'COVER';
  // High-definition target output dimensions (Retina-grade sharpness)
  const targetWidth = isCover ? 1920 : 640;
  const targetHeight = isCover ? 560 : 640;
  const aspect = targetWidth / targetHeight;

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const loadedImageRef = useRef<HTMLImageElement | null>(null);

  const [imgNatural, setImgNatural] = useState<{ w: number; h: number }>({
    w: 1,
    h: 1,
  });
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  // panX, panY in normalized units (-1..1 relative to extra overflow, or pixels in viewport)
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; ox: number; oy: number }>({
    x: 0,
    y: 0,
    ox: 0,
    oy: 0,
  });
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load image into memory
  useEffect(() => {
    if (!isOpen || !imageSrc) return;
    setLoadError(null);
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });

    const img = new window.Image();
    if (!imageSrc.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => {
      loadedImageRef.current = img;
      setImgNatural({
        w: img.naturalWidth || img.width || 1,
        h: img.naturalHeight || img.height || 1,
      });
    };
    img.onerror = () => {
      setLoadError(
        'Não foi possível carregar esta imagem para recorte. Tente enviar um arquivo do seu computador/celular.'
      );
    };
    img.src = imageSrc;
  }, [isOpen, imageSrc]);

  // Effective dimensions after rotation
  const effectiveDims = useCallback(() => {
    const swapped = rotation % 180 !== 0;
    return {
      w: swapped ? imgNatural.h : imgNatural.w,
      h: swapped ? imgNatural.w : imgNatural.h,
    };
  }, [imgNatural, rotation]);

  // Clamp offset so the image always covers the entire crop box without empty borders
  const clampOffset = useCallback(
    (rawX: number, rawY: number, currentZoom: number) => {
      const vp = viewportRef.current;
      if (!vp) return { x: rawX, y: rawY };
      const vpW = vp.clientWidth;
      const vpH = vp.clientHeight;
      const { w: natW, h: natH } = effectiveDims();

      // Base scale so image completely covers viewport at zoom = 1
      const baseScale = Math.max(vpW / natW, vpH / natH);
      const renderedW = natW * baseScale * currentZoom;
      const renderedH = natH * baseScale * currentZoom;

      const maxX = Math.max(0, (renderedW - vpW) / 2);
      const maxY = Math.max(0, (renderedH - vpH) / 2);

      return {
        x: Math.min(maxX, Math.max(-maxX, rawX)),
        y: Math.min(maxY, Math.max(-maxY, rawY)),
      };
    },
    [effectiveDims]
  );

  useEffect(() => {
    setOffset((prev) => clampOffset(prev.x, prev.y, zoom));
  }, [zoom, rotation, clampOffset]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      ox: offset.x,
      oy: offset.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setOffset(
      clampOffset(dragStartRef.current.ox + dx, dragStartRef.current.oy + dy, zoom)
    );
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.12 : -0.12;
    setZoom((prev) => Math.min(3.5, Math.max(1, Number((prev + delta).toFixed(2)))));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
    setOffset({ x: 0, y: 0 });
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  };

  const handleConfirmCrop = async () => {
    const img = loadedImageRef.current;
    const vp = viewportRef.current;
    if (!img || !vp) return;

    setIsApplying(true);
    try {
      const vpW = vp.clientWidth;
      const vpH = vp.clientHeight;
      const { w: natW, h: natH } = effectiveDims();

      const baseScale = Math.max(vpW / natW, vpH / natH);
      const renderedW = natW * baseScale * zoom;
      const renderedH = natH * baseScale * zoom;

      // Ratio between high-res target canvas and on-screen viewport
      const outRatio = targetWidth / vpW;

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Fill background just in case
      ctx.fillStyle = '#1E1B18';
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Translate to center of output canvas + scaled user pan offset
      ctx.save();
      ctx.translate(
        targetWidth / 2 + offset.x * outRatio,
        targetHeight / 2 + offset.y * outRatio
      );
      ctx.rotate((rotation * Math.PI) / 180);

      // When rotated 90 or 270, the unrotated draw width/height swap relative to effectiveDims
      const swapped = rotation % 180 !== 0;
      const drawW = (swapped ? renderedH : renderedW) * outRatio;
      const drawH = (swapped ? renderedW : renderedH) * outRatio;

      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      const highResDataUrl = canvas.toDataURL('image/jpeg', 0.94);
      await onApply(highResDataUrl);
      onClose();
    } catch {
      // If cross-origin tainted canvas, fallback to original src
      await onApply(imageSrc);
      onClose();
    } finally {
      setIsApplying(false);
    }
  };

  if (!isOpen) return null;

  // Compute on-screen preview style for the image inside the viewport
  const vpW = viewportRef.current?.clientWidth || (isCover ? 680 : 320);
  const vpH = viewportRef.current?.clientHeight || (isCover ? 200 : 320);
  const { w: effW, h: effH } = effectiveDims();
  const baseScale = Math.max(vpW / effW, vpH / effH);
  const swapped = rotation % 180 !== 0;
  const unrotatedW = (swapped ? effH : effW) * baseScale * zoom;
  const unrotatedH = (swapped ? effW : effH) * baseScale * zoom;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-parchment dark:bg-slateDark-card border-2 border-parchment-deep dark:border-slateDark-border rounded-2xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-parchment-deep dark:border-slateDark-border pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-burgundy/15 dark:bg-gold/20 text-burgundy dark:text-gold flex items-center justify-center shrink-0">
              <Crop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-ink dark:text-slateDark-text">
                {isCover
                  ? 'Cortar & Posicionar Imagem de Capa (HD 1920×560)'
                  : 'Cortar & Posicionar Foto de Perfil (HD 640×640)'}
              </h3>
              <p className="text-xs text-ink-muted dark:text-slateDark-muted">
                Arraste a imagem para escolher o enquadramento ideal e use o controle de zoom.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-muted hover:text-ink dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loadError ? (
          <div className="p-8 rounded-xl bg-red-500/10 border border-red-500/30 text-center space-y-3">
            <p className="text-sm font-semibold text-red-700 dark:text-red-300">
              {loadError}
            </p>
            {onPickAnotherFile && (
              <button
                type="button"
                onClick={onPickAnotherFile}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-burgundy text-parchment text-xs font-semibold"
              >
                <Upload className="w-4 h-4" />
                <span>Escolher Outro Arquivo</span>
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Interactive Crop Viewport */}
            <div className="flex flex-col items-center justify-center bg-ink/95 rounded-xl p-3 sm:p-5 select-none">
              <div
                ref={viewportRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onWheel={handleWheel}
                style={{
                  aspectRatio: `${aspect}`,
                }}
                className={`relative overflow-hidden cursor-grab active:cursor-grabbing shadow-2xl ring-2 ring-gold/80 bg-black ${
                  isCover
                    ? 'w-full max-w-[700px] rounded-xl'
                    : 'w-64 sm:w-72 rounded-2xl'
                }`}
              >
                <img
                  src={imageSrc}
                  alt="Preview de recorte"
                  draggable={false}
                  style={{
                    width: `${unrotatedW}px`,
                    height: `${unrotatedH}px`,
                    maxWidth: 'none',
                    maxHeight: 'none',
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) rotate(${rotation}deg)`,
                  }}
                  className="pointer-events-none select-none"
                />

                {/* Subtle Rule-of-Thirds Grid Overlay */}
                <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3">
                  <div className="border-r border-b border-white/20" />
                  <div className="border-r border-b border-white/20" />
                  <div className="border-b border-white/20" />
                  <div className="border-r border-b border-white/20" />
                  <div className="border-r border-b border-white/20" />
                  <div className="border-b border-white/20" />
                  <div className="border-r border-white/20" />
                  <div className="border-r border-white/20" />
                  <div />
                </div>

                {/* Drag hint pill */}
                <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 pointer-events-none px-2.5 py-1 rounded-full bg-black/65 text-white text-[11px] font-medium flex items-center gap-1.5 backdrop-blur-xs">
                  <Move className="w-3 h-3 text-gold-light" />
                  <span>Arraste para mover • Role para zoom</span>
                </div>
              </div>
            </div>

            {/* Zoom & Rotation Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl bg-parchment-warm dark:bg-slateDark-elevated border border-parchment-deep dark:border-slateDark-border">
              {/* Zoom Slider */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto flex-1 max-w-md">
                <button
                  type="button"
                  onClick={() =>
                    setZoom((z) => Math.max(1, Number((z - 0.15).toFixed(2))))
                  }
                  className="p-1.5 rounded-md border border-parchment-deep dark:border-slateDark-border bg-parchment dark:bg-slateDark-card text-ink dark:text-slateDark-text hover:border-burgundy"
                  title="Diminuir zoom"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>

                <input
                  type="range"
                  min={1}
                  max={3.5}
                  step={0.02}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1 accent-burgundy dark:accent-gold cursor-pointer"
                />

                <button
                  type="button"
                  onClick={() =>
                    setZoom((z) => Math.min(3.5, Number((z + 0.15).toFixed(2))))
                  }
                  className="p-1.5 rounded-md border border-parchment-deep dark:border-slateDark-border bg-parchment dark:bg-slateDark-card text-ink dark:text-slateDark-text hover:border-burgundy"
                  title="Aumentar zoom"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>

                <span className="text-xs font-mono font-bold text-ink-secondary dark:text-slateDark-text w-12 text-right">
                  {Math.round(zoom * 100)}%
                </span>
              </div>

              {/* Rotate, Reset & Change File */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleRotate}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-parchment-deep dark:border-slateDark-border bg-parchment dark:bg-slateDark-card text-xs font-semibold text-ink dark:text-slateDark-text hover:border-burgundy"
                >
                  <RotateCw className="w-3.5 h-3.5 text-burgundy dark:text-gold" />
                  <span>Girar 90°</span>
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-parchment-deep dark:border-slateDark-border bg-parchment dark:bg-slateDark-card text-xs font-semibold text-ink-secondary dark:text-slateDark-muted hover:text-ink"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Resetar</span>
                </button>

                {onPickAnotherFile && (
                  <button
                    type="button"
                    onClick={onPickAnotherFile}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-parchment-deep dark:border-slateDark-border bg-parchment dark:bg-slateDark-card text-xs font-semibold text-burgundy dark:text-gold hover:border-burgundy"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Outra Foto</span>
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-parchment-deep dark:border-slateDark-border text-xs sm:text-sm font-semibold text-ink-secondary dark:text-slateDark-muted hover:text-ink"
          >
            Cancelar
          </button>

          {!loadError && (
            <button
              type="button"
              disabled={isApplying}
              onClick={handleConfirmCrop}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-burgundy hover:bg-burgundy-hover dark:bg-gold dark:text-slateDark-bg text-parchment text-xs sm:text-sm font-semibold shadow-md transition-all disabled:opacity-60"
            >
              <Check className="w-4 h-4" />
              <span>
                {isApplying ? 'Gerando Recorte HD...' : 'Aplicar Recorte & Salvar'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
