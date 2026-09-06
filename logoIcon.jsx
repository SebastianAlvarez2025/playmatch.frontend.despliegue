import React from "react";

export default function LogoIcon({ width = 40, height = 40, className = "" }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Degradado morado a neón único */}
        <linearGradient id="playmatch-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8A2BE2" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
      </defs>

      {/* Fondo circular suave / opcional */}
      <rect width="100" height="100" rx="24" fill="url(#playmatch-grad)" />

      {/* Silueta de la P entrelazada (Vector limpia de derechos) */}
      <path
        d="M32 25 H54 C66 25 74 33 74 44 C74 55 66 63 54 63 H46 V75 C46 78 43 80 40 80 H36 C33 80 32 78 32 75 V25 Z"
        fill="#FFFFFF"
      />
      {/* Detalle interno que forma el balón/movimiento */}
      <circle cx="53" cy="44" r="8" fill="url(#playmatch-grad)" />
    </svg>
  );
}