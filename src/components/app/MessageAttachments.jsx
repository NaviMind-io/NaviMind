import React, { useState } from "react";

export default function MessageAttachments({ attachments = [] }) {
  if (!attachments.length) return null;

  const [activeImage, setActiveImage] = useState(null);
  const [activePdf, setActivePdf] = useState(null);
  const isMobile =
  typeof window !== "undefined" &&
  /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const renderFile = (file, idx) => {
    const isImage = file.type?.startsWith("image/");
    const previewUrl = file.previewUrl || file.url || file.downloadURL;

    let sizeClass = "";

if (attachments.length === 1) {
  sizeClass = "w-[220px] h-[220px]";
} else if (attachments.length === 2) {
  sizeClass = "w-[160px] h-[160px]";
} else {
  sizeClass = "w-[110px] h-[110px]";
}

    return (
      <div
        key={file.name + idx}
        onClick={() => {
  if (!previewUrl) return;

  const isPdf = file.type === "application/pdf";

  if (isImage) {
    setActiveImage(previewUrl);
  } else if (isPdf) {
    if (isMobile) {
      window.open(previewUrl, "_blank");
    } else {
      setActivePdf(previewUrl);
    }
  } else {
    window.open(previewUrl, "_blank", "noopener,noreferrer");
  }
}}


        className={`
  relative flex items-center justify-center
  ${sizeClass}
  bg-gray-200 dark:bg-gray-700
  rounded overflow-hidden
  cursor-pointer
  hover:scale-105 transition-transform
`}
      >
        {isImage ? (
          <img
            src={previewUrl}
            alt={file.name}
            className="object-cover w-full h-full"
            draggable={false}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-xs p-2 text-center select-none">
            <svg
              className="w-6 h-6 mb-1 text-gray-700 dark:text-gray-300"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                d="M9 12h6m-6 4h6M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="truncate max-w-full">{file.name}</span>
          </div>
        )}

        {/* overlay с названием */}
        {isImage && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-1 py-[2px] truncate">
            {file.name}
          </div>
        )}
      </div>
    );
  };

  return (
  <>
    {/* ===== ATTACHMENTS ===== */}
    {attachments.length === 1 && (
      <div className="flex mt-2 justify-end">
        {renderFile(attachments[0], 0)}
      </div>
    )}

    {(attachments.length === 2 || attachments.length === 3) && (
      <div className="flex gap-2 mt-2 justify-end">
        {attachments.map((file, idx) => renderFile(file, idx))}
      </div>
    )}

    {attachments.length === 4 && (
      <div className="flex flex-col gap-2 mt-2 items-end max-w-fit">
        <div className="flex gap-2">
          {attachments.slice(0, 2).map((file, idx) =>
            renderFile(file, idx)
          )}
        </div>
        <div className="flex gap-2">
          {attachments.slice(2, 4).map((file, idx) =>
            renderFile(file, idx + 2)
          )}
        </div>
      </div>
    )}

    {attachments.length === 5 && (
      <div className="flex flex-col gap-2 mt-2 items-end max-w-fit">
        <div className="flex gap-2">
          {attachments.slice(0, 2).map((file, idx) =>
            renderFile(file, idx)
          )}
        </div>
        <div className="flex gap-2">
          {attachments.slice(2, 5).map((file, idx) =>
            renderFile(file, idx + 2)
          )}
        </div>
      </div>
    )}

   {/* ===== MODAL PREVIEW ===== */}

{activeImage && (
  <div
    onClick={() => setActiveImage(null)}
    className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
  >
    <button
      onClick={() => setActiveImage(null)}
      className="
        absolute top-6 right-6
        w-11 h-11
        flex items-center justify-center
        rounded-full
        bg-black
        text-white
        text-xl
        shadow-lg
        hover:bg-gray-800
        transition
      "
    >
      ✕
    </button>

    <img
      src={activeImage}
      alt="preview"
      className="max-w-[95vw] max-h-[90vh] object-contain"
      onClick={(e) => e.stopPropagation()}
    />
  </div>
)}

{activePdf && (
  <div
    onClick={() => setActivePdf(null)}
    className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
  >
    <button
      onClick={() => setActivePdf(null)}
      className="
        absolute top-6 right-6
        w-11 h-11
        flex items-center justify-center
        rounded-full
        bg-black
        text-white
        text-xl
        shadow-lg
        hover:bg-gray-800
        transition
      "
    >
      ✕
    </button>

    <div
      className="w-[60vw] h-[90vh] bg-white rounded-lg overflow-hidden shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <iframe
        src={activePdf}
        className="w-full h-full"
        title="PDF preview"
      />
    </div>
  </div>
)}

  </>
);
}
