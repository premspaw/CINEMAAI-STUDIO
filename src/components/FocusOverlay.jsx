import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, Camera, Scissors, Wand2, Download, Layers } from 'lucide-react';
import { useAppStore } from '../store';

export const FocusOverlay = () => {
    const { viewMode, focusedNodeId, nodes, setOrbitMode } = useAppStore();
    const focusedNode = nodes.find(n => n.id === focusedNodeId);

    const [isSurgeryMode, setIsSurgeryMode] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [brushSize, setBrushSize] = useState(20);

    if (viewMode !== 'FOCUS' || !focusedNode) return null;

    const mediaUrl = focusedNode.data?.image || focusedNode.data?.videoUrl;
    const isVideo = !!focusedNode.data?.videoUrl;

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) videoRef.current.pause();
            else videoRef.current.play();
            setIsPlaying(!isPlaying);
        }
    };

    // --- Neural Surgery (Masking Logic) ---
    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing || !isSurgeryMode) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearMask = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-3xl"
        >
            {/* Background Close Trigger */}
            <div className="absolute inset-0" onClick={setOrbitMode} />

            {/* Close Button */}
            <button
                onClick={setOrbitMode}
                className="absolute top-8 right-8 p-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white/40 hover:text-white rounded-full transition-all z-[210] group"
            >
                <X size={24} className="group-hover:rotate-90 transition-transform" />
            </button>

            {/* Main Cinematic Content */}
            <div className="relative w-full h-full flex items-center justify-center p-20 pointer-events-none">
                <div className="relative max-w-full max-h-full pointer-events-auto shadow-[0_50px_100px_rgba(0,0,0,0.8)] rounded-3xl overflow-hidden border border-white/10 bg-zinc-900">
                    {isVideo ? (
                        <motion.video
                            ref={videoRef}
                            layoutId={`media-${focusedNodeId}`}
                            src={mediaUrl}
                            className="max-w-full max-h-[80vh] object-contain cursor-pointer"
                            autoPlay
                            loop
                            muted
                            onClick={togglePlay}
                        />
                    ) : (
                        <div className="relative">
                            <motion.img
                                layoutId={`media-${focusedNodeId}`}
                                src={mediaUrl}
                                className="max-w-full max-h-[85vh] object-contain"
                            />

                            {/* Neural Surgery Tool (Canvas Overlay) */}
                            {isSurgeryMode && (
                                <canvas
                                    ref={canvasRef}
                                    width={1200} // Dynamic sizing would be better, but fixed for now
                                    height={1200}
                                    className="absolute inset-0 w-full h-full cursor-crosshair z-30"
                                    onMouseDown={startDrawing}
                                    onMouseMove={draw}
                                    onMouseUp={stopDrawing}
                                    onMouseLeave={stopDrawing}
                                />
                            )}
                        </div>
                    )}

                    {/* Video Controls Overlay */}
                    {isVideo && (
                        <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between opacity-0 hover:opacity-100 transition-opacity">
                            <button onClick={togglePlay} className="p-3 bg-[#bef264] text-black rounded-lg">
                                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                            </button>
                            <div className="flex-1 mx-6 h-1 bg-white/20 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-[#bef264]"
                                    initial={{ width: 0 }}
                                    animate={{ width: '60%' }} // Mock progress
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Cinematic Toolbar (Right Side) */}
            <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-[210]">
                <div className="p-2 bg-black/60 border border-white/10 backdrop-blur-2xl rounded-3xl flex flex-col gap-2">
                    <ToolbarButton
                        icon={<Download size={18} />}
                        label="EXPORT"
                        onClick={() => { }}
                    />
                    <div className="w-full h-px bg-white/5 my-1" />

                    {!isVideo && (
                        <ToolbarButton
                            icon={<Scissors size={18} />}
                            label="SURGERY"
                            active={isSurgeryMode}
                            onClick={() => setIsSurgeryMode(!isSurgeryMode)}
                        />
                    )}

                    <ToolbarButton
                        icon={<Wand2 size={18} />}
                        label="ENHANCE"
                        onClick={() => { }}
                    />

                    <ToolbarButton
                        icon={<Layers size={18} />}
                        label="REMAP"
                        onClick={() => { }}
                    />
                </div>

                {isSurgeryMode && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-6 bg-[#bef264] text-black rounded-3xl flex flex-col gap-4 w-64 shadow-2xl"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Camera size={16} />
                            <span className="text-[10px] font-black uppercase tracking-wider">Neural_Mask_v1</span>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-[9px] font-bold">
                                <span>BRUSH_SIZE</span>
                                <span>{brushSize}px</span>
                            </div>
                            <input
                                type="range"
                                min="5"
                                max="100"
                                value={brushSize}
                                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                                className="w-full accent-black"
                            />
                        </div>

                        <textarea
                            placeholder="REPAIR_PROMPT: (e.g. fix eye details, remove reflections)"
                            className="w-full h-24 bg-black/10 border border-black/10 rounded-xl p-3 text-[10px] font-mono placeholder:text-black/30 resize-none focus:outline-none"
                        />

                        <button
                            className="w-full py-3 bg-black text-[#bef264] text-[9px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-xl"
                            onClick={() => {
                                alert("SURGERY COMMAND QUEUED TO CLOUD RUN...");
                                setIsSurgeryMode(false);
                            }}
                        >
                            EXECUTE_REPAIR
                        </button>

                        <button
                            onClick={clearMask}
                            className="w-full py-2 border border-black/20 text-black/60 text-[8px] font-bold uppercase tracking-widest rounded-xl"
                        >
                            CLEAR_MASK
                        </button>
                    </motion.div>
                )}
            </div>

            {/* Metadata Label (Bottom Left) */}
            <div className="absolute bottom-8 left-8 flex flex-col gap-1 z-[210]">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#bef264]" />
                    <span className="text-[11px] font-black text-white uppercase tracking-[0.3em]">FOCUS_ACTIVE</span>
                </div>
                <span className="text-[9px] text-white/40 font-mono italic">NODE_UID: {focusedNodeId}</span>
            </div>
        </motion.div>
    );
};

const ToolbarButton = ({ icon, label, onClick, active = false }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center gap-1.5 p-4 rounded-2xl transition-all ${active
                ? 'bg-[#bef264] text-black shadow-[0_0_20px_rgba(190,242,100,0.3)]'
                : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
    >
        {icon}
        <span className="text-[7px] font-black tracking-widest uppercase">{label}</span>
    </button>
);
