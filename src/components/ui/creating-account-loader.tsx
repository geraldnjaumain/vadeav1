"use client";

import { motion } from "framer-motion";
import { Cloud } from "lucide-react";

export function CreatingAccountLoader() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative bg-white/90 rounded-3xl p-12 shadow-2xl flex flex-col items-center justify-center max-w-sm w-full mx-4 overflow-hidden border border-white/50"
            >
                {/* Blue Circle Background */}
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-blue-500/5 z-0" />

                {/* Central Animation Container */}
                <div className="relative z-10 w-48 h-48 mb-6 flex items-center justify-center">
                    {/* Pulsing Blue Circles */}
                    <motion.div
                        animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl"
                    />
                    <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.2 }}
                        className="absolute inset-4 rounded-full bg-blue-500 shadow-lg flex items-center justify-center overflow-hidden"
                    >
                        {/* Cloud Decoration inside circle */}
                        <div className="absolute bottom-0 w-full h-1/3 bg-white/20 blur-md rounded-t-[100%]" />
                        <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                        >
                            <Cloud className="text-white w-16 h-16 opacity-90 fill-white" />
                        </motion.div>
                    </motion.div>
                </div>

                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="relative z-10 text-2xl font-bold text-center text-zinc-800"
                >
                    Creating your<br />account
                </motion.h2>

                {/* Simulated Loading Bar/Clouds at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-2 bg-blue-100">
                    <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 3, ease: "easeInOut" }}
                        className="h-full bg-blue-500"
                    />
                </div>
            </motion.div>
        </div>
    );
}
