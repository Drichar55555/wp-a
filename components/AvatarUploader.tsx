"use client";

import { useState, useRef } from "react";
import imageCompression from "browser-image-compression";

interface AvatarUploaderProps {
  token: string;
  currentUrl: string | null;
  onAvatarChange: (url: string | null) => void;
}

export default function AvatarUploader({
  token,
  currentUrl,
  onAvatarChange,
}: AvatarUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      });

      const ext = compressed.type.split("/")[1] || "webp";
      const presignRes = await fetch(
        `/api/upload-url?token=${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contentType: `image/${ext}` }),
        }
      );

      if (!presignRes.ok) {
        const err = await presignRes.json();
        throw new Error(err.error || "Failed to get upload URL");
      }

      const { putUrl, publicUrl } = await presignRes.json();

      await fetch(putUrl, {
        method: "PUT",
        body: compressed,
        headers: { "Content-Type": `image/${ext}` },
      });

      onAvatarChange(publicUrl);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-stone-100 ring-2 ring-stone-200 hover:ring-teal-400 transition-colors disabled:opacity-50"
      >
        {currentUrl ? (
          <img
            src={currentUrl}
            alt="Avatar"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg
              className="h-7 w-7 text-stone-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          </div>
        )}
      </button>
      <div>
        <p className="text-sm font-medium text-stone-900">Avatar</p>
        <p className="mt-0.5 text-xs text-stone-400">
          {uploading
            ? "Uploading…"
            : currentUrl
            ? "Tap to change"
            : "Tap to upload"}
        </p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
