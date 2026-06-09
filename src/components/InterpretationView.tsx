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
      {sections.map((section) => {
        const intensity = section.intensity ?? 0;
        const bars = Math.round(intensity);
        return (
          <div key={section.title} className="bg-surface-card border border-border rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4 mb-3">
              <h3 className="font-semibold text-text-primary flex items-center gap-2 text-sm">
                <span className="text-base leading-none">{section.icon}</span>
                {section.title}
              </h3>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <div className="flex gap-0.5">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-3 rounded-sm ${
                        i < bars
                          ? intensity >= 8
                            ? 'bg-red-400/80'
                            : intensity >= 5
                              ? 'bg-accent/80'
                              : 'bg-emerald-400/70'
                          : 'bg-border/60'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-text-muted font-mono">{intensity}/10</span>
              </div>
            </div>

            <div className="space-y-2">
              {section.content.map((line, i) => (
                <p key={i} className="text-sm text-text-secondary leading-relaxed">
                  {line.replace(/\*\*/g, '')}
                </p>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
