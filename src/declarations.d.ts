// Módulos con tipos propios pero no detectados por moduleResolution: bundler
declare module 'lucide-react';
declare module 'jspdf';
declare module 'html2canvas';

// Asset imports (Vite handles these at build time)
declare module '*.png' { const url: string; export default url; }
declare module '*.jpg' { const url: string; export default url; }
declare module '*.jpeg' { const url: string; export default url; }
declare module '*.svg' { const url: string; export default url; }
declare module '*.webp' { const url: string; export default url; }
