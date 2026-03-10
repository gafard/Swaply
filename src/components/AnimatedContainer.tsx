"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  delay?: number;
  initialY?: number;
}

export function AnimatedContainer({ children, className, delay = 0, initialY = 20 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: initialY }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedItem({ children, className, index = 0 }: { children: ReactNode; className?: string; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
