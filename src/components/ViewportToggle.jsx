import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Target } from 'lucide-react';
import { useAppStore } from '../store';

export const ViewportToggle = () => {
    const { viewMode, setOrbitMode, setFocusMode, activeNodeId } = useAppStore();

    const handleFocusClick = () => {
        if (!activeNodeId) {
            // Optional: Add a subtle toast or visual feedback
            alert("SELECT A NODE FIRST TO FOCUS");
            return;
        }
        setFocusMode(activeNodeId);
    };

    return (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center p-1 bg-black/60 border border-white/10 backdrop-blur-2xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <button
                onClick={setOrbitMode}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'ORBIT'
                        ? 'bg-[#bef264] text-black shadow-[0_0_20px_rgba(190,242,100,0.4)]'
                        : 'text-white/40 hover:text-white/80'
                    }`}
            >
                <Globe size={14} className={viewMode === 'ORBIT' ? 'animate-spin-slow' : ''} />
                Orbit
            </button>

            <div className="w-px h-6 bg-white/10 mx-1" />

            <button
                onClick={handleFocusClick}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'FOCUS'
                        ? 'bg-[#bef264] text-black shadow-[0_0_20px_rgba(190,242,100,0.4)]'
                        : 'text-white/40 hover:text-white/80'
                    }`}
            >
                <Target size={14} className={viewMode === 'FOCUS' ? 'animate-pulse' : ''} />
                Focus
            </button>
        </div>
    );
};
