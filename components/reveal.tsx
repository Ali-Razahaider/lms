"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Reveals its children with a soft fade + rise the first time they
 * scroll into view. `once` keeps it from replaying on every scroll,
 * and `margin` triggers slightly before the element is fully on-screen
 * so the motion feels responsive rather than late.
 */
export default function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
