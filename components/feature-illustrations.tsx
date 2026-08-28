"use client";

import { motion } from "framer-motion";
import { BookOpen, CheckCircle2, TrendingUp, LayoutList, Trophy } from "lucide-react";

export function StructuredCoursesIllustration() {
  return (
    <div className="relative w-full h-full flex items-center justify-center bg-surface overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-soft/50 to-transparent" />
      <div className="relative flex items-center justify-center w-full h-full p-6">
        
        {/* Timeline Path */}
        <div className="relative w-full max-w-[200px] h-32">
          {/* Connection line */}
          <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-primary/10 rounded-full" />
          
          <div className="absolute inset-0 flex flex-col justify-between">
            {[
              { opacity: 1, width: "w-32", active: true },
              { opacity: 0.7, width: "w-28", active: false },
              { opacity: 0.4, width: "w-20", active: false },
            ].map((item, i) => (
              <motion.div 
                key={i}
                className="flex items-center gap-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (2 - i) * 0.2 + 0.2 }}
              >
                <div className="relative">
                  <div className={`w-3 h-3 rounded-full ${item.active ? 'bg-primary ring-4 ring-primary-soft' : 'bg-primary/20'} ml-[11px]`} />
                </div>
                <div className={`h-8 rounded-lg ${item.active ? 'bg-primary shadow-sm' : 'bg-primary/5 border border-primary/10'} ${item.width} flex items-center px-3`}>
                   {item.active ? (
                      <div className="h-1.5 w-10 bg-white/50 rounded-full" />
                   ) : (
                      <div className="h-1.5 w-1/2 bg-primary/20 rounded-full" />
                   )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        <motion.div 
          className="absolute right-6 top-6 text-primary bg-primary-soft p-3 rounded-2xl border border-white/50 shadow-sm"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <LayoutList size={24} />
        </motion.div>

      </div>
    </div>
  );
}

export function ProgressTrackingIllustration() {
  return (
    <div className="relative w-full h-full flex items-center justify-center bg-surface overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-tr from-primary-soft/50 to-transparent" />
      
      <div className="relative w-full max-w-[200px] h-32 flex items-end justify-between gap-1.5 pb-2 px-2 mt-4">
        {/* Grid lines */}
        <div className="absolute inset-x-0 bottom-2 top-0 border-b border-l border-primary/10" />
        <div className="absolute inset-x-0 bottom-[33%] border-b border-primary/5 border-dashed" />
        <div className="absolute inset-x-0 bottom-[66%] border-b border-primary/5 border-dashed" />
        
        {/* Bars */}
        {[35, 50, 30, 65, 45, 85].map((height, i) => (
          <div key={i} className="relative w-full flex justify-center group-hover:opacity-100 h-full items-end z-10">
            <motion.div 
              className={`w-full max-w-[20px] rounded-t-sm ${i === 5 ? 'bg-primary shadow-sm' : 'bg-primary/20 hover:bg-primary/30 transition-colors'}`}
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ delay: i * 0.1 + 0.2, type: "spring", stiffness: 50 }}
            />
          </div>
        ))}
      </div>
      
      <motion.div 
        className="absolute top-6 left-6 text-primary bg-white p-2.5 rounded-xl shadow-sm border border-border/50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.8, type: "spring" }}
        whileHover={{ scale: 1.1, rotate: -5 }}
      >
        <TrendingUp size={20} />
      </motion.div>
    </div>
  );
}

export function QuizzesIllustration() {
  return (
    <div className="relative w-full h-full flex items-center justify-center bg-surface overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-tl from-primary-soft/50 to-transparent" />
      
      <div className="relative flex items-center justify-center w-full h-full p-4">
        
        <div className="relative w-full max-w-[200px]">
          {/* Checklist */}
          <motion.div 
            className="w-full bg-white border border-border/60 rounded-xl shadow-sm p-4 flex flex-col gap-3 z-10 relative"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {[1, 2, 3].map((item, i) => (
              <div key={item} className="flex items-center gap-3">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.3 + 0.5, type: "spring" }}
                >
                  <CheckCircle2 className={i === 2 ? "text-primary/20" : "text-primary"} size={20} />
                </motion.div>
                <div className="flex-1 space-y-1.5">
                  <div className={`h-2 rounded-full w-full ${i === 2 ? 'bg-primary/5' : 'bg-primary/10'}`} />
                  {i !== 2 && <div className="h-2 bg-primary/5 rounded-full w-2/3" />}
                </div>
              </div>
            ))}
          </motion.div>
          
          {/* Score Badge */}
          <motion.div 
            className="absolute -right-4 -top-4 bg-primary text-white font-bold px-3 py-1.5 rounded-full shadow-md text-sm border-4 border-surface z-20 flex items-center"
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 12 }}
            transition={{ delay: 1.4, type: "spring" }}
          >
            100%
          </motion.div>
        </div>
        
        <motion.div 
          className="absolute left-6 bottom-6 text-primary bg-primary-soft p-2.5 rounded-xl border border-white/50 shadow-sm"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Trophy size={20} />
        </motion.div>

      </div>
    </div>
  );
}
