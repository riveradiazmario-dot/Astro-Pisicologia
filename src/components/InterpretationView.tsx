import type { FullInterpretation } from '../interpretation-engine/interpreter';

interface InterpretationViewProps {
  interpretation: FullInterpretation;
}

export default function InterpretationView({ interpretation }: InterpretationViewProps) {
  const sections = [
    interpretation.mainTraits,
    interpretation.emotionalNeeds,
    interpretation.emotionalWounds,
    interpretation.unconsciousFears,
    interpretation.relationalDynamics,
    interpretation.repetitivePatterns,
    interpretation.strengths,
  ];

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <div key={section.title} className="bg-surface-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-accent flex items-center gap-2">
              <span>{section.icon}</span>
              {section.title}
            </h3>
            <span className="text-xs text-text-muted">
              Intensidad: {section.intensity}/10
            </span>
          </div>
          <div className="space-y-2">
            {section.content.map((line, i) => (
              <p key={i} className="text-sm text-text-secondary leading-relaxed">
                {line.replace(/\*\*/g, '')}
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
