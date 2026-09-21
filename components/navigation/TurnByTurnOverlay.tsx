"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUp,
  CornerUpLeft,
  CornerUpRight,
  ArrowUpLeft,
  ArrowUpRight,
  Flag,
  Navigation2
} from "lucide-react";
import { useNavigationStore } from "@/store/navigationStore";
import { formatDistance } from "@/utils/formatDistance";

function ManeuverIcon({ type, modifier }: { type: string; modifier?: string }) {
  const style = { color: "#050811" };
  const cls = "w-5 h-5 stroke-[2.5]";
  if (type === "arrive") return <Flag className={cls} style={{ color: "#050811", fill: "#050811" }} />;
  if (modifier === "left" || modifier === "sharp left") return <CornerUpLeft className={cls} style={style} />;
  if (modifier === "right" || modifier === "sharp right") return <CornerUpRight className={cls} style={style} />;
  if (modifier === "slight left") return <ArrowUpLeft className={cls} style={style} />;
  if (modifier === "slight right") return <ArrowUpRight className={cls} style={style} />;
  return <ArrowUp className={cls} style={style} />;
}

export function TurnByTurnOverlay() {
  const { viewMode, navSteps } = useNavigationStore();
  const visible = viewMode === "turn-by-turn";
  const step = navSteps[0];

  return (
    <AnimatePresence>
      {visible && step && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", damping: 26, stiffness: 240, mass: 0.8 }}
          className="absolute top-14 left-1/2 -translate-x-1/2 z-40 w-full max-w-[420px] px-4"
        >
          <div
            className="rounded-2xl overflow-hidden backdrop-blur-2xl bg-[#090d16]/95 border border-white/[0.08] shadow-2xl relative"
            style={{
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
            }}
          >
            <div className="flex items-center gap-4 px-5 py-3.5">
              {/* Maneuver icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#38bdf8] text-[#050811] shadow-md shadow-[#38bdf8]/25"
              >
                <ManeuverIcon type={step.maneuver.type} modifier={step.maneuver.modifier} />
              </div>

              {/* Instruction + distance */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm leading-snug tracking-tight text-white">
                  {step.instruction}
                </p>
                <p className="text-[11px] mt-0.5 font-semibold text-[#38bdf8] flex items-center gap-1">
                  <Navigation2 size={10} className="fill-current rotate-45" />
                  {formatDistance(step.distance)} remaining
                </p>
              </div>
            </div>

            {/* Next step preview */}
            {navSteps[1] && (
              <div className="flex items-center gap-3 px-5 py-2.5 bg-white/[0.03] border-t border-white/[0.06]">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/40">
                  THEN
                </span>
                <p className="text-xs font-medium truncate flex-1 text-white/80">
                  {navSteps[1].instruction}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
