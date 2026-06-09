import { UserPlus, Users, Settings, Star, Activity, Shield } from 'lucide-react';
import AstroTherapyLogo from './AstroTherapyLogo';

interface WelcomeScreenProps {
  onNewChart: () => void;
  onOpenConsultants: () => void;
  onConfig: () => void;
  therapistName?: string;
}

export default function WelcomeScreen({ onNewChart, onOpenConsultants, onConfig, therapistName }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] py-12">
      {/* Hero */}
      <div className="flex flex-col items-center mb-10">
        <AstroTherapyLogo size={90} className="mb-4" />
        <h1 className="text-2xl font-bold text-text-primary tracking-tight mb-1">
          ASTROTHERAPY <span className="text-accent">PRO</span>
        </h1>
        <p className="text-sm text-text-muted tracking-wide mb-3">
          Astrología Psicológica Terapéutica
        </p>
        {/* Saludo personalizado */}
        <p className="text-base text-text-secondary font-medium">
          {therapistName ? `Bienvenido, ${therapistName}` : 'Bienvenido'}
        </p>
      </div>

      {/* Action cards */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xl mb-12">
        <button
          onClick={onNewChart}
          className="flex-1 group flex flex-col items-center gap-3 bg-surface-card border border-border hover:border-accent/50 rounded-2xl p-6 transition-all duration-200 hover:bg-surface-lighter hover:shadow-lg hover:shadow-accent/5"
        >
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
            <UserPlus size={22} className="text-accent" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-text-primary">Nueva Carta</p>
            <p className="text-xs text-text-muted mt-0.5">Calcular carta natal</p>
          </div>
        </button>

        <button
          onClick={onOpenConsultants}
          className="flex-1 group flex flex-col items-center gap-3 bg-surface-card border border-border hover:border-accent/50 rounded-2xl p-6 transition-all duration-200 hover:bg-surface-lighter hover:shadow-lg hover:shadow-accent/5"
        >
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
            <Users size={22} className="text-accent" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-text-primary">Abrir Consultante</p>
            <p className="text-xs text-text-muted mt-0.5">Ver cartas guardadas</p>
          </div>
        </button>

        <button
          onClick={onConfig}
          className="flex-1 group flex flex-col items-center gap-3 bg-surface-card border border-border hover:border-slate-500 rounded-2xl p-6 transition-all duration-200 hover:bg-surface-lighter"
        >
          <div className="w-12 h-12 rounded-xl bg-surface-lighter flex items-center justify-center group-hover:bg-border/30 transition-colors">
            <Settings size={22} className="text-text-muted group-hover:text-text-secondary transition-colors" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-text-primary">Configuración</p>
            <p className="text-xs text-text-muted mt-0.5">Datos del profesional</p>
          </div>
        </button>
      </div>

      {/* Feature pills */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
        <div className="flex items-center gap-2 bg-surface-card border border-border/60 rounded-full px-4 py-2">
          <Star size={13} className="text-accent-warm" />
          <span className="text-xs text-text-muted">Cálculos astronómicos precisos</span>
        </div>
        <div className="flex items-center gap-2 bg-surface-card border border-border/60 rounded-full px-4 py-2">
          <Activity size={13} className="text-accent" />
          <span className="text-xs text-text-muted">Astrología psicológica arquetípica</span>
        </div>
        <div className="flex items-center gap-2 bg-surface-card border border-border/60 rounded-full px-4 py-2">
          <Shield size={13} className="text-text-muted" />
          <span className="text-xs text-text-muted">100% local · sin conexión requerida</span>
        </div>
      </div>

      {/* Ethical note */}
      <p className="text-[11px] text-text-muted text-center max-w-sm leading-relaxed">
        Herramienta simbólica de apoyo interpretativo para terapeutas y facilitadores.
        No sustituye terapia, diagnóstico clínico ni atención médica.
      </p>
    </div>
  );
}
