import { UserPlus, Users, FileText, Settings, Sparkles } from 'lucide-react';
import AstroTherapyLogo from './AstroTherapyLogo';

export type View = 'new' | 'consultants' | 'report' | 'oracle' | 'config';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  consultantName?: string;
}

const navItems: { id: View; label: string; icon: React.ReactNode }[] = [
  { id: 'new',          label: 'Nuevo Consultante', icon: <UserPlus  size={18} /> },
  { id: 'consultants',  label: 'Consultantes',       icon: <Users     size={18} /> },
  { id: 'report',       label: 'Informe',             icon: <FileText  size={18} /> },
  { id: 'oracle',       label: 'Oráculo',             icon: <Sparkles  size={18} /> },
  { id: 'config',       label: 'Configuración',       icon: <Settings  size={18} /> },
];

export default function Sidebar({ currentView, onViewChange, consultantName }: SidebarProps) {
  return (
    <aside className="w-60 bg-surface-light flex flex-col min-h-screen border-r border-border/60">

      {/* Brand header */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-3 mb-1">
          <AstroTherapyLogo size={46} />
          <div className="min-w-0">
            <p className="text-[11px] font-bold tracking-[0.15em] text-accent uppercase leading-none">
              AstroTherapy
            </p>
            <p className="text-[13px] font-semibold text-text-primary leading-tight mt-0.5 tracking-tight">
              PRO
            </p>
          </div>
        </div>
        <p className="text-[10px] text-text-muted mt-2 leading-snug tracking-wide">
          Astrología Psicológica Terapéutica
        </p>
      </div>

      {/* Separator */}
      <div className="mx-5 h-px bg-border/40" />

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2">
        {navItems.map(item => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 mb-0.5
                ${isActive
                  ? 'bg-primary-900/60 text-accent font-medium'
                  : 'text-text-secondary hover:bg-surface-lighter hover:text-text-primary'
                }
              `}
            >
              <span className={`flex-shrink-0 transition-colors ${isActive ? 'text-accent' : 'text-text-muted'}`}>
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
              {isActive && (
                <span className="ml-auto w-1 h-4 bg-accent rounded-full flex-shrink-0" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Active consultant chip */}
      {consultantName && (
        <>
          <div className="mx-5 h-px bg-border/40" />
          <div className="px-5 py-3">
            <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider mb-1">
              Consultante activo
            </p>
            <p className="text-sm text-accent font-medium truncate">{consultantName}</p>
          </div>
        </>
      )}

      {/* Footer disclaimer */}
      <div className="mx-5 h-px bg-border/40" />
      <div className="px-5 py-4">
        <p className="text-[10px] text-text-muted leading-relaxed">
          Herramienta simbólica de apoyo interpretativo. No sustituye terapia ni diagnóstico clínico.
        </p>
      </div>
    </aside>
  );
}
