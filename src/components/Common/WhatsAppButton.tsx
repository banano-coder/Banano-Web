import React from 'react';
import { useSettings } from '@/hooks/useSettings';

export const WhatsAppButton = () => {
    const { settings, loading } = useSettings();

    // Fallback al .env o un número por defecto si los settings aún cargan o fallan
    const phoneNumber = settings?.whatsapp?.numero || import.meta.env.PUBLIC_WHATSAPP_NUMBER || "573215555555";
    const welcomeMessage = settings?.whatsapp?.mensaje_bienvenida || "¡Hola! Banano Shop 🍌. Me gustaría obtener más información.";

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(welcomeMessage)}`;

    if (loading) return null; // No mostrar nada mientras carga para evitar parpadeos con números viejos

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-[30px] right-[30px] z-[9999] no-underline transition-all duration-300 hover:scale-110 hover:rotate-[5deg] group"
            aria-label="Chat de WhatsApp"
        >
            <div className="relative bg-gradient-to-br from-[#25d366] to-[#128c7e] w-[60px] h-[60px] rounded-full flex items-center justify-center text-white shadow-[0_10px_25px_rgba(37,211,102,0.4)] before:content-[''] before:absolute before:w-full before:height-full before:rounded-full before:bg-[#25d366] before:opacity-50 before:z-[-1] before:animate-[pulse_2s_infinite]">
                
                {/* Tooltip */}
                <span className="absolute right-[80px] bg-slate-900/90 backdrop-blur-md color-white px-4 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap opacity-0 pointer-events-none transition-all duration-300 translate-x-3 border border-white/10 shadow-lg group-hover:opacity-100 group-hover:translate-x-0">
                    ¿Necesitas ayuda?
                </span>

                <svg viewBox="0 0 448 512" className="w-[32px] h-[32px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]" xmlns="http://www.w3.org/2000/svg">
                    <path fill="currentColor" d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.1-16.4-14.6-27.4-32.7-30.6-38.2-3.2-5.6-.3-8.6 2.5-11.3 2.5-2.5 5.6-6.5 8.3-9.7 2.8-3.3 3.7-5.6 5.5-9.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.7 23.5 9.2 31.6 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
                </svg>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 0.5; }
                    70% { transform: scale(1.5); opacity: 0; }
                    100% { transform: scale(1); opacity: 0; }
                }
            `}} />
        </a>
    );
};
