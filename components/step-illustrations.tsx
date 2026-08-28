"use client";

import { motion } from "framer-motion";
import { UserPlus, Search, PlayCircle } from "lucide-react";

export function StepCreateAccountIllustration() {
  return (
    <div className="relative w-full h-full flex items-center justify-end pr-8 overflow-hidden group">
      <motion.div 
        className="relative z-10 w-32 h-20 bg-white rounded-xl shadow-sm border border-primary/10 flex items-center gap-3 p-3"
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
      >
        <div className="w-10 h-10 rounded-full bg-primary-soft flex items-center justify-center flex-shrink-0">
          <UserPlus size={18} className="text-primary" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="h-2 w-full bg-primary/10 rounded-full" />
          <div className="h-2 w-2/3 bg-primary/5 rounded-full" />
        </div>
      </motion.div>
      <motion.div 
        className="absolute right-4 top-1/2 -translate-y-1/2 w-24 h-24 bg-primary/5 rounded-full blur-xl"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
    </div>
  );
}

export function StepPickCourseIllustration() {
  return (
    <div className="relative w-full h-full flex items-center justify-end pr-8 overflow-hidden group">
      <div className="relative z-10 flex flex-col gap-2 w-32">
        <motion.div 
          className="w-full h-8 bg-white rounded-lg shadow-sm border border-primary/10 flex items-center px-2 gap-2"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Search size={14} className="text-primary/40" />
          <div className="h-1.5 w-1/2 bg-primary/10 rounded-full" />
        </motion.div>
        
        <div className="flex gap-2">
          <motion.div 
            className="w-full h-12 bg-white rounded-lg shadow-sm border border-primary/10 p-1.5 flex flex-col gap-1"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="w-full h-4 bg-primary-soft rounded-md" />
            <div className="h-1.5 w-full bg-primary/10 rounded-full mt-auto" />
          </motion.div>
          <motion.div 
            className="w-full h-12 bg-white rounded-lg shadow-sm border border-primary-soft p-1.5 flex flex-col gap-1 ring-2 ring-primary/20"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="w-full h-4 bg-primary/20 rounded-md" />
            <div className="h-1.5 w-full bg-primary/20 rounded-full mt-auto" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export function StepLearnTestIllustration() {
  return (
    <div className="relative w-full h-full flex items-center justify-end pr-8 overflow-hidden group">
      <motion.div 
        className="relative z-10 w-32 h-24 bg-white rounded-xl shadow-sm border border-primary/10 p-2 flex flex-col"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring" }}
      >
        <div className="w-full flex-1 bg-primary-soft rounded-lg flex items-center justify-center group-hover:bg-primary/10 transition-colors">
          <PlayCircle size={24} className="text-primary" />
        </div>
        <div className="flex justify-between items-center mt-2 px-1">
          <div className="h-1.5 w-1/3 bg-primary/20 rounded-full" />
          <div className="h-1.5 w-1/4 bg-primary/10 rounded-full" />
        </div>
      </motion.div>
      <motion.div 
        className="absolute right-0 top-1/2 -translate-y-1/2 w-32 h-32 bg-primary/5 rounded-full blur-2xl"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </div>
  );
}
