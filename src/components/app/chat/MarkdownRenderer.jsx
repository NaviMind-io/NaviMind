"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy } from "lucide-react";
import { useState, useRef, useEffect } from "react";

// ─── Table wrapper с умными фейдами ──────────────────────────────────────────
function TableWrapper({ children }) {
  const scrollRef = useRef(null);
  const [scrollState, setScrollState] = useState({ left: false, right: false });

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setScrollState({
      left: el.scrollLeft > 4,
      right: el.scrollLeft < maxScroll - 4,
    });
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setScrollState({ left: false, right: maxScroll > 4 });
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative my-12">
      <div
        ref={scrollRef}
        className="relative w-full overflow-x-auto rounded-2xl border border-white/[0.07] bg-[#0d1424] custom-scroll"
        style={{ scrollbarWidth: "none" }}
      >
        <table className="w-full text-[13.5px] text-left border-collapse">
          {children}
        </table>
      </div>

      {/* Left fade — появляется только при скролле влево */}
      <div
        className="pointer-events-none absolute top-0 left-0 h-full w-10 transition-opacity duration-300 md:hidden rounded-l-2xl"
        style={{
          background: "linear-gradient(to right, #0b1220ee, transparent)",
          opacity: scrollState.left ? 1 : 0,
        }}
      />

      {/* Right fade — скрывается когда доехали до конца */}
      <div
        className="pointer-events-none absolute top-0 right-0 h-full w-10 transition-opacity duration-300 md:hidden rounded-r-2xl"
        style={{
          background: "linear-gradient(to left, #0b1220ee, transparent)",
          opacity: scrollState.right ? 1 : 0,
        }}
      />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function MarkdownRenderer({ content }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => (
          <p className="mb-5 last:mb-0 leading-relaxed">
            {children}
          </p>
        ),

        h2: ({ children }) => (
          <h2 className="mt-8 mb-3 text-[18px] sm:text-lg font-semibold text-white tracking-tight">
            {children}
          </h2>
        ),

        h3: ({ children }) => (
          <h3 className="mt-6 mb-2 text-[16px] sm:text-base font-semibold text-white/90 tracking-tight">
            {children}
          </h3>
        ),

        ul: ({ children }) => (
          <ul className="mb-5 pl-6 list-disc space-y-2">
            {children}
          </ul>
        ),

        ol: ({ children }) => (
          <ol className="mb-5 pl-6 list-decimal space-y-2">
            {children}
          </ol>
        ),

        li: ({ children }) => (
          <li className="leading-relaxed">
            {children}
          </li>
        ),

        hr: () => (
          <div className="my-8 h-px w-full bg-white/10" />
        ),

        strong: ({ children }) => (
          <strong className="font-semibold text-white">
            {children}
          </strong>
        ),

        code({ inline, children }) {
          if (inline) {
            return (
              <code className="bg-white/10 px-1.5 py-0.5 rounded text-sm text-blue-300">
                {children}
              </code>
            );
          }

          const codeText = String(children).replace(/\n$/, "");
          const [copiedLocal, setCopiedLocal] = useState(false);

          const handleBlockCopy = async () => {
            try {
              await navigator.clipboard.writeText(codeText);
              setCopiedLocal(true);
              setTimeout(() => setCopiedLocal(false), 2000);
            } catch {
              alert("Copy is not supported on this device.");
            }
          };

          return (
            <div className="relative bg-white/[0.04] border border-white/[0.05] rounded-2xl p-5 mt-5 mb-7 shadow-[0_4px_12px_rgba(0,0,0,0.25)]">
              <button
                onClick={handleBlockCopy}
                className="absolute top-4 right-4 flex items-center gap-1 text-[11px] text-gray-400/80 hover:text-white transition"
              >
                {copiedLocal ? (
                  <Check size={16} />
                ) : (
                  <>
                    <Copy size={16} />
                    Copy
                  </>
                )}
              </button>

              <pre className="text-sm text-gray-200 whitespace-pre-wrap break-words">
                <code>{codeText}</code>
              </pre>
            </div>
          );
        },

        table: ({ children }) => <TableWrapper>{children}</TableWrapper>,

        thead: ({ children }) => (
          <thead className="border-b border-white/[0.06]">
            {children}
          </thead>
        ),

        tbody: ({ children }) => (
          <tbody className="divide-y divide-white/[0.035]">
            {children}
          </tbody>
        ),

        tr: ({ children }) => (
          <tr className="transition-colors duration-150 hover:bg-white/[0.025]">
            {children}
          </tr>
        ),

        th: ({ children }) => (
          <th className="px-5 py-3.5 text-[10.5px] uppercase tracking-[0.14em] font-semibold text-white/30 whitespace-nowrap first:pl-6 last:pr-6">
            {children}
          </th>
        ),

        td: ({ children, index }) => (
          <td
            className={`px-5 py-4 align-top leading-relaxed first:pl-6 last:pr-6 ${
              index === 0
                ? "text-white/90 font-medium whitespace-nowrap"
                : "text-white/50"
            }`}
          >
            {children}
          </td>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}