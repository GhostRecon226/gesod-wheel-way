import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Image as ImageIcon, X } from "lucide-react";

interface ImageGalleryProps {
  images: string[];
  alt: string;
}

const ImageGallery = ({ images, alt }: ImageGalleryProps) => {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    setIndex(0);
  }, [images]);

  const go = (delta: number) => {
    if (images.length === 0) return;
    setIndex((i) => (i + delta + images.length) % images.length);
  };

  if (images.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-xl border border-border bg-surface-2 text-muted-foreground sm:h-96">
        <div className="text-center">
          <ImageIcon className="mx-auto mb-2" size={28} />
          <p className="text-sm">Photos not yet available for this lot</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="relative overflow-hidden rounded-xl border border-border bg-surface-2">
        <img
          src={images[index]}
          alt={`${alt} photo ${index + 1}`}
          className="h-72 w-full cursor-zoom-in object-cover sm:h-96"
          onClick={() => setLightbox(true)}
        />
        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-background/70 p-2 text-silver hover:bg-background"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-background/70 p-2 text-silver hover:bg-background"
            >
              <ChevronRight size={20} />
            </button>
            <span className="absolute bottom-3 right-3 rounded-full bg-background/70 px-3 py-1 text-xs text-muted-foreground">
              {index + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`View photo ${i + 1}`}
              className={`h-16 w-24 shrink-0 overflow-hidden rounded-md border-2 ${
                i === index ? "border-copper" : "border-border"
              }`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 p-4"
          onClick={() => setLightbox(false)}
        >
          <button
            type="button"
            aria-label="Close photo"
            className="absolute right-4 top-4 rounded-full bg-surface-2 p-2 text-silver"
            onClick={() => setLightbox(false)}
          >
            <X size={20} />
          </button>
          <img
            src={images[index]}
            alt={`${alt} enlarged photo ${index + 1}`}
            className="max-h-full max-w-full rounded-lg object-contain"
          />
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
