import logoUrl from '../assets/logo-icon.png';

interface LogoProps {
  /** Height in pixels — width scales automatically (square image, 1:1 ratio) */
  size?: number;
  className?: string;
}

/**
 * Logo oficial de AstroTherapy Pro
 * Fuente: src/assets/logo-icon.png (290×290 px, circular, fondo transparente)
 */
export default function AstroTherapyLogo({ size = 44, className = '' }: LogoProps) {
  return (
    <img
      src={logoUrl}
      alt="AstroTherapy Pro"
      width={size}
      height={size}
      className={`object-contain flex-shrink-0 ${className}`}
      draggable={false}
    />
  );
}
