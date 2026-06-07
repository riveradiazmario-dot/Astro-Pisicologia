import { UserPlus, Users, FileText, Settings, Sparkles } from 'lucide-react';

export type View = 'new' | 'consultants' | 'report' | 'oracle' | 'config';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  consultantName?: string;
}

const navItems: { id: View; label: string; icon: React.ReactNode }[] = [
  { id: 'new', label: 'Nuevo Consultante', icon: <UserPlus size={20} /> },
  { id: 'consultants', label: 'Consultantes', icon: <Users size={20} /> },
  { id: 'report', label: 'Informe', icon: <FileText size={20} /> },
  { id: 'oracle', label: 'Oráculo', icon: <Sparkles size={20} /> },
  { id: 'config', label: 'Configuración', icon: <Settings size={20} /> },
];

export default function Sidebar({ currentView, onViewChange, consultantName }: SidebarProps) {
  return (
    <aside className="w-64 bg-surface-light border-r border-border flex flex-col min-h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-accent flex items-center gap-2">
          <span className="text-3xl">✦</span>
          <span>AstroAnima</span>
        </h1>
        <p className="text-xs text-text-muted mt-1">Astrología Psicológica</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
              currentView === item.id
                ? 'bg-primary-900/50 text-accent border-r-2 border-accent'
                : 'text-text-secondary hover:bg-surface-lighter hover:text-text-primary'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Active consultant */}
      {consultantName && (
        <div className="p-4 border-t border-border">
          <p className="text-xs text-text-muted">Consultante activo</p>
          <p className="text-sm text-accent font-medium truncate">{consultantName}</p>
        </div>
      )}

      {/* Ethical disclaimer */}
      <div className="p-4 border-t border-border">
        <p className="text-[10px] text-text-muted leading-tight">
          Herramienta simbólica de apoyo interpretativo.
          No sustituye terapia ni diagnóstico clínico.
        </p>
      </div>
    </aside>
  );
}
