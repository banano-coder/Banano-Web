import React, { useState, useEffect } from 'react';
import { Home } from 'lucide-react';

export const FloatingHomeButton: React.FC = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setVisible(true);
            } else {
                setVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    if (!visible) return null;

    return (
        <button
            onClick={scrollToTop}
            className="fixed bottom-[30px] left-[30px] z-[9999] p-0 border-none bg-transparent transition-all duration-300 hover:scale-110 hover:rotate-[-5deg] group cursor-pointer"
            aria-label="Volver al Inicio"
            type="button"
        >
            <div className="relative bg-gradient-to-br from-[#df0067] to-[#b3004e] w-[60px] h-[60px] rounded-full flex items-center justify-center text-white shadow-[0_10px_25px_rgba(223,0,103,0.4)] before:content-[''] before:absolute before:w-full before:h-full before:rounded-full before:bg-[#df0067] before:opacity-50 before:z-[-1] before:animate-[pulse_2s_infinite]">
                
                {/* Tooltip */}
                <span className="absolute left-[80px] bg-slate-900/90 backdrop-blur-md text-white px-4 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap opacity-0 pointer-events-none transition-all duration-300 -translate-x-3 border border-white/10 shadow-lg group-hover:opacity-100 group-hover:translate-x-0">
                    Volver al Inicio
                </span>

                <Home className="w-[28px] h-[28px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]" />
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 0.5; }
                    70% { transform: scale(1.5); opacity: 0; }
                    100% { transform: scale(1); opacity: 0; }
                }
            `}} />
        </button>
    );
};
