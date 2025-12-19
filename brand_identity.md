# Banano Shop - Identidad de Marca y Sistema de Diseño

Este documento define la paleta de colores oficial y su aplicación en el sistema de diseño.

## 🎨 Paleta de Colores

### 1. Colores Primarios (Identidad)

| Nombre | Hex | HSL (Tailwind) | Uso Principal |
| :--- | :--- | :--- | :--- |
| **Banano Pink** | `#FF4F9A` | `334 100% 65%` | Acciones principales, botones CTA, identidad fuerte. Sensación: Energía, placer. |
| **Intense Purple** | `#7B2CBF` | `272 63% 46%` | Fondos secundarios, tarjetas, estados activos. Sensación: Misterio, sofisticación. |
| **Vibrant Yellow** | `#FFD60A` | `48 100% 52%` | Acentos, alertas suaves, destacados. Sensación: Picardía, énfasis. |

### 2. Colores Neutros y Fondos

| Nombre | Hex | HSL (Tailwind) | Uso Principal |
| :--- | :--- | :--- | :--- |
| **Warm White** | `#FFF5F7` | `348 100% 98%` | Fondo en Modo Claro, textos en Modo Oscuro. |
| **Dark Purple** | `#1A0F24` | `272 40% 10%` | Fondo principal en Modo Oscuro. |
| **Deep Card** | `#261633` | `272 40% 15%` | Fondo de tarjetas y paneles en Modo Oscuro. |

---

## 🛠 Variables CSS (Tailwind)

El sistema utiliza variables CSS semánticas para adaptarse a modos Claro/Oscuro automáticamente.

```css
:root {
  /* Identidad */
  --primary: 334 100% 65%;   /* Banano Pink */
  --secondary: 272 63% 46%;  /* Intense Purple */
  --accent: 48 100% 52%;     /* Vibrant Yellow */
  
  /* Fondos Semánticos */
  --background: 348 100% 98%; /* Warm White */
  --foreground: 272 63% 10%;  /* Dark Purple Text */
}

.dark {
  /* Fondos Semánticos */
  --background: 272 40% 10%; /* Dark Purple */
  --foreground: 348 20% 98%; /* Warm White Text */
  
  /* Los colores de identidad se mantienen o ajustan ligeramente */
}
```

## 📐 Guía de Uso

1.  **Botones Principales**: Usar `bg-primary` (Rosa) con texto blanco.
2.  **Botones Secundarios**: Usar `bg-secondary` (Morado) o bordes.
3.  **Alertas / Badges**: Usar `text-accent` (Amarillo) o bordes amarillos.
4.  **Fondos**: Evitar el negro puro (`#000`). Usar siempre las variables `bg-background` o `bg-card` para mantener el tinte morado/cálido.
