import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

export default function LoadingSpinner({ message = 'Generating with AI...' }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Animated rings */}
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-2 border-brand-500/20 animate-ping" />
        <div className="absolute inset-2 rounded-full border-2 border-brand-500/40 animate-pulse" />
        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-brand-500 to-accent-purple flex items-center justify-center shadow-glow-md">
          <Sparkles className="w-5 h-5 text-white animate-pulse" />
        </div>
      </div>

      <div className="text-center">
        <p className="text-white font-semibold text-lg">{message}</p>
        <p className="text-slate-500 text-sm mt-1">This may take a few seconds</p>
      </div>

      {/* Animated dots */}
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-brand-500"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </motion.div>
  )
}
