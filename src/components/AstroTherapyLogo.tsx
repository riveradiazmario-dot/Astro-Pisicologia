import logoUrl from '../assets/logo.png';

interface LogoProps {
  /** Height in pixels — width scales automatically keeping aspect ratio */
  size?: number;
  className?: string;
}

/**
 * Logo oficial de AstroTherapy Pro
 * Imagen: src/assets/logo.png (290×432 px, RGBA)
 */
export default function AstroTherapyLogo({ size = 44, className = '' }: LogoProps) {
  return (
    <img
      src={logoUrl}
      alt="AstroTherapy Pro"
      style={{ height: size, width: 'auto' }}
      className={`object-contain flex-shrink-0 ${className}`}
      draggable={false}
    />
  );
}
