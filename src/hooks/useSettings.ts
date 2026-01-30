import { useState, useEffect } from 'react';

interface PublicSettings {
    tienda?: {
        nombre: string;
        email_contacto: string;
        abierto: boolean;
    };
    catalogo?: {
        ocultar_sin_stock: boolean;
        modo_etiqueta_stock: 'exacto' | 'generico';
        simbolo_moneda: string;
        mostrar_decimales: boolean;
    };
    whatsapp?: {
        numero: string;
        mensaje_bienvenida: string;
    };
}

export const useSettings = () => {
    const [settings, setSettings] = useState<PublicSettings | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const response = await fetch('/api/public/settings');
            if (response.ok) {
                const data = await response.json();
                setSettings(data);
            }
        } catch (error) {
            console.error("Error fetching public settings:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    return { settings, loading, refreshSettings: fetchSettings };
};
