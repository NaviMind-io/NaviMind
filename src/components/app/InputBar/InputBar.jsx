"use client";

import { useContext, useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { UIContext } from "@/context/UIContext";

import { auth } from "@/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { ChatContext } from "@/context/ChatContext";
import Tooltip from "@/components/common/Tooltip";
import FilePreview from "./FilePreview";
import { sendChatMessage } from "./sendChatMessage";

const FILES_LIMIT = 5;
const MAX_IMAGE_SIZE = 15 * 1024 * 1024; // 15MB
const MAX_DOCUMENT_SIZE = 30 * 1024 * 1024; // 30MB
const MAX_TOTAL_SIZE = 100 * 1024 * 1024; // 100MB


export default function InputBar() {
  const { isSidebarOpen, inputText, setInputText } = useContext(UIContext);
  const pathname = usePathname();
const topicIdFromURL =
  pathname && pathname.startsWith("/app/projects/")
    ? pathname.split("/app/projects/")[1]?.split("/")[0] || null
    : null;

  const {
    projectChatSessions,
    activeChatId,
    setProjectChatSessions,
    setActiveProject,
    setActiveChatId,
  } = useContext(ChatContext);

  const [inputValue, setInputValue] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [fileAlert, setFileAlert] = useState("");
  const inputRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const { isFullscreen } = useContext(UIContext);


  /* ───────── USER AUTH ───────── */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  /* ───────── TEXTAREA AUTO-RESIZE ───────── */
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(
        inputRef.current.scrollHeight,
        168
      )}px`;
    }
  }, [inputValue]);

  /////////////////////////////////////////////////////
  useEffect(() => {
  if (inputText) {
    setInputValue(inputText);
    setIsActive(true); 
    setInputText(""); 

    // 🖊️ фокусим textarea, чтобы Enter работал сразу
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }
}, [inputText]);

  /* ───────── MOBILE KEYBOARD FIX ───────── */
  useEffect(() => {
    const handleResize = () => {
      document.body.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ───────── HANDLERS ───────── */
  const handleSend = async () => {
  if (!inputValue.trim()) return;
  if (!currentUser?.uid) return;

  const message = inputValue;
  setInputValue("");
  setIsActive(false);

  const preparedAttachments = uploadedFiles;

  setUploadedFiles([]);

  await sendChatMessage({
    message,
    attachments: preparedAttachments,
    currentUser,
    activeChatId,
    topicIdFromURL,
    projectChatSessions,
    setProjectChatSessions,
    setActiveProject,
    setActiveChatId,
  });
};

const handleKeyDown = (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
};

const handleFileChange = (e) => {
  const files = Array.from(e.target.files);

  // Проверка количества
  if (uploadedFiles.length + files.length > FILES_LIMIT) {
    setFileAlert(`You can upload up to ${FILES_LIMIT} files`);
    setTimeout(() => setFileAlert(""), 7000);
    return;
  }

  let totalSize = uploadedFiles.reduce((acc, file) => acc + file.size, 0);
  const validFiles = [];

  for (const file of files) {
    const isImage = file.type.startsWith("image/");

    // Проверка размера одного файла
    if (isImage && file.size > MAX_IMAGE_SIZE) {
      setFileAlert(`Image "${file.name}" exceeds 15MB limit`);
      setTimeout(() => setFileAlert(""), 7000);
      continue;
    }

    if (!isImage && file.size > MAX_DOCUMENT_SIZE) {
      setFileAlert(`File "${file.name}" exceeds 30MB limit`);
      setTimeout(() => setFileAlert(""), 7000);
      continue;
    }

    // Проверка общего размера
    if (totalSize + file.size > MAX_TOTAL_SIZE) {
      setFileAlert(`Total upload limit is 100MB`);
      setTimeout(() => setFileAlert(""), 7000);
      break;
    }

    totalSize += file.size;
    validFiles.push(file);
  }

  if (validFiles.length > 0) {
    setUploadedFiles((prev) => [...prev, ...validFiles]);
  }

  e.target.value = "";
};

const removeFile = (filename) => {
  setUploadedFiles((prev) => prev.filter((f) => f.name !== filename));
};

  /* ───────── RENDER ───────── */
  return (
    <>
      {/* Input Bar Container */}
      <div
  className={`w-full bg-transparent transition-all ${
    isFullscreen
      ? "px-4 sm:px-6 mb-9" 
      : "px-1 sm:px-4 pb-1"
  }`}
>
        <div className="w-full md:max-w-[896px] mx-auto">
          <div
  className={`rounded-2xl p-1 md:p-2 flex flex-col transition duration-500
  border border-white/10 
  shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_2px_6px_rgba(0,0,0,0.4)]
  backdrop-blur-sm
  ${isActive ? "border-blue-500 animate-glow" : ""}`}
>
            {/* INPUT ROW — single line */}
<div className="flex items-end w-full gap-1 px-1">
  {/* 📎 Attach File */}
  <Tooltip content="Add photos & files" position="top">
    <label className="relative cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded min-w-[40px] min-h-[40px] flex items-center justify-center">
      <img
        src="/Attach_File.svg"
        alt="Attach"
        className="h-5 w-5"
      />
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        className="sr-only"
      />
    </label>
  </Tooltip>

  {/* ✍️ Textarea */}
  <textarea
    ref={inputRef}
    rows={1}
    value={inputValue}
    onChange={(e) => {
      setInputValue(e.target.value);
      if (e.target.value.trim()) setIsActive(true);
    }}
    onFocus={() => setIsActive(true)}

    onBlur={() => {
      if (!inputValue.trim()) setIsActive(false);
    }}
    onKeyDown={handleKeyDown}
    className="flex-1 resize-none bg-transparent outline-none text-base placeholder-gray-400 dark:placeholder-gray-500 min-h-[40px] max-h-[168px] overflow-y-auto custom-scroll py-2.5 px-3"
    placeholder="Ask anything in your language..."
    style={{ minWidth: 0 }}
  />

  {/* ⬆ Send Button */}
  <Tooltip content="Send" position="top">
    <button
      onClick={handleSend}
      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded min-w-[40px] min-h-[40px] flex items-center justify-center"
      disabled={!inputValue.trim()}
    >
      <img
        src="/Arrow_Send.svg"
        alt="Send"
        className="h-5 w-5"
      />
    </button>
  </Tooltip>
</div>

            {/* Uploaded Files Preview */}
            {fileAlert && (
              <div className="mx-auto my-2 px-4 py-2 rounded-lg flex items-center gap-2 bg-red-600 text-white shadow font-medium w-fit min-w-[160px] max-w-full animate-fade-in">
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M12 8v4m0 4h.01"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="flex-1">{fileAlert}</span>
                <button
                  onClick={() => setFileAlert("")}
                  className="ml-2 flex items-center justify-center text-white hover:text-gray-200 transition"
                  tabIndex={0}
                  aria-label="Close alert"
                  type="button"
                  style={{ lineHeight: 1 }}
                >
                  ✕
                </button>
              </div>
            )}

            <FilePreview files={uploadedFiles} onRemove={removeFile} />
          </div>
        </div>
      </div>

      {/* Footer — скрываем на мобильных, только md и выше */}
      <div className="w-full px-1 sm:px-4 pb-2 max-w-full overflow-x-hidden hidden md:block">
        <div className="w-full max-w-full md:max-w-[896px] mx-auto text-center">
          <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 leading-tight px-1 break-words text-center">
            <span className="inline-block">Powered by advanced AI</span>{" "}
            <span className="inline-block">
              — enhanced with verified maritime sources such as IMO, SOLAS, and
              ISM.
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
