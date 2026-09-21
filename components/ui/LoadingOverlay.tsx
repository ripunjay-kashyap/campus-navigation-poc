"use client";

import { AnimatePresence, motion } from "framer-motion";

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

export function LoadingOverlay({ isLoading, message = "Loading route…" }: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
          style={{ background: "rgba(6,14,32,0.4)" }}
        >
          <div
            className="rounded-2xl px-6 py-4 flex items-center gap-3"
            style={{
              background: "#090e1a",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(56, 189, 248,0.2)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
            }}
          >
            <div
              className="w-5 h-5 border-2 rounded-full animate-spin"
              style={{ borderColor: "#38bdf833", borderTopColor: "#38bdf8" }}
            />
            <span
              className="text-sm font-medium"
              style={{ color: "#dee5ff", fontFamily: "var(--font-inter)" }}
            >
              {message}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
