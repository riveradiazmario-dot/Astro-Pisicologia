/**
 * AstroTherapy Pro — Astrología Psicológica Arquetípica
 * Aplicación principal
 *
 * Herramienta simbólica de apoyo interpretativo para terapeutas,
 * facilitadores y profesionales del acompañamiento emocional.
 *
 * NO es una herramienta médica, psiquiátrica ni de diagnóstico clínico.
 */

import { useState, useEffect, useCallback } from 'react';
import Sidebar, { type View } from './components/Sidebar';
import BirthDataForm from './components/BirthDataForm';
import ReportView from './components/ReportView';
import ConsultantsList from './components/ConsultantsList';
import OracleView from './components/OracleView';
import ConfigView from './components/ConfigView';
import WelcomeScreen from './components/WelcomeScreen';
import { calculateNatalChart } from './astronomy/engine';
import { generateFullInterpretation, type FullInterpretation } from './interpretation-engine/interpreter';
import { saveConsultant, getTherapistConfig } from './storage/db';
import type { BirthData, NatalChart, Consultant, TherapistConfig } from './astronomy/types';

export default function App() {
  const [view, setView] = useState<View>('new');
  const [showNewForm, setShowNewForm] = useState(false);
  const [chart, setChart] = useState<NatalChart | null>(null);
  const [interpretation, setInterpretation] = useState<FullInterpretation | null>(null);
  const [currentConsultant, setCurrentConsultant] = useState<Consultant | null>(null);
  const [therapistConfig, setTherapistConfig] = useState<TherapistConfig>({
    name: '',
    registration: '',
    signature: '',
    disclaimer: 'Esta herramienta ofrece interpretaciones simbólicas basadas en astrología psicológica y no sustituye procesos terapéuticos, médicos ni diagnósticos clínicos.',
    orbDefault: 5
  });
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load therapist config on mount
  useEffect(() => {
    getTherapistConfig().then(setTherapistConfig);
  }, []);

  // Reload config when navigating to config view
  useEffect(() => {
    if (view === 'config') {
      getTherapistConfig().then(setTherapistConfig);
    }
  }, [view]);

  const handleCalculate = useCallback(async (birthData: BirthData) => {
    setCalculating(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 50));

      const natalChart = calculateNatalChart(birthData, therapistConfig.orbDefault);
      const fullInterp = generateFullInterpretation(natalChart);

      setChart(natalChart);
      setInterpretation(fullInterp);

      const consultant: Consultant = {
        id: currentConsultant?.id,
        name: birthData.name,
        birthData,
        chart: natalChart,
        notes: '',
        createdAt: currentConsultant?.createdAt || new Date(),
        updatedAt: new Date()
      };

      const savedId = await saveConsultant(consultant);
      setCurrentConsultant({ ...consultant, id: savedId });
      setRefreshTrigger(prev => prev + 1);
      setView('report');
    } catch (err) {
      console.error('Error calculating chart:', err);
      setError(`Error al calcular la carta: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setCalculating(false);
    }
  }, [therapistConfig.orbDefault, currentConsultant]);

  const handleSelectConsultant = useCallback((consultant: Consultant) => {
    setCurrentConsultant(consultant);

    if (consultant.chart) {
      setChart(consultant.chart);
      setInterpretation(generateFullInterpretation(consultant.chart));
      setView('report');
    } else {
      setShowNewForm(true);
      setView('new');
    }
  }, []);

  const handleViewChange = useCallback((newView: View) => {
    setError(null);
    setView(newView);

    if (newView === 'new') {
      setCurrentConsultant(null);
      setChart(null);
      setInterpretation(null);
      setShowNewForm(false); // Reset to welcome screen
    }
  }, []);

  const renderContent = () => {
    switch (view) {
      case 'new':
        if (!showNewForm) {
          return (
            <WelcomeScreen
              onNewChart={() => setShowNewForm(true)}
              onOpenConsultants={() => setView('consultants')}
              onConfig={() => setView('config')}
              therapistName={therapistConfig.name || undefined}
            />
          );
        }
        return (
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <button
                onClick={() => setShowNewForm(false)}
                className="text-xs text-text-muted hover:text-text-secondary transition mb-3 flex items-center gap-1.5"
              >
                ← Inicio
              </button>
              <h1 className="text-xl font-semibold text-text-primary">Nueva Carta Natal</h1>
              <p className="text-sm text-text-muted mt-1">
                Datos de nacimiento del consultante para calcular su carta natal.
              </p>
            </div>
            <BirthDataForm
              onCalculate={handleCalculate}
              initialData={currentConsultant?.birthData}
              loading={calculating}
            />
            {error && (
              <div className="mt-4 p-4 bg-red-900/20 border border-red-700/30 rounded-xl text-red-300 text-sm">
                {error}
              </div>
            )}
          </div>
        );

      case 'consultants':
        return (
          <div className="max-w-2xl mx-auto">
            <ConsultantsList
              onSelect={handleSelectConsultant}
              refreshTrigger={refreshTrigger}
            />
          </div>
        );

      case 'report':
        if (!chart || !interpretation) {
          return (
            <div className="text-center py-20">
              <p className="text-text-muted text-lg mb-4">No hay carta natal calculada</p>
              <button
                onClick={() => { setShowNewForm(true); setView('new'); }}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition text-sm"
              >
                Crear nueva carta
              </button>
            </div>
          );
        }
        return (
          <ReportView
            chart={chart}
            interpretation={interpretation}
            therapistConfig={therapistConfig}
          />
        );

      case 'oracle':
        if (!chart) {
          return (
            <div className="text-center py-20">
              <p className="text-text-muted text-lg mb-4">Primero necesitas calcular una carta natal</p>
              <button
                onClick={() => { setShowNewForm(true); setView('new'); }}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition text-sm"
              >
                Crear nueva carta
              </button>
            </div>
          );
        }
        return <OracleView chart={chart} />;

      case 'config':
        return (
          <div className="max-w-2xl mx-auto">
            <ConfigView />
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        currentView={view}
        onViewChange={handleViewChange}
        consultantName={currentConsultant?.name}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
