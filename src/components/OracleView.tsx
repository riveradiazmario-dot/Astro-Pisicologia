import { useState } from 'react';
import { Sparkles, Send, RotateCcw } from 'lucide-react';
import type { NatalChart } from '../astronomy/types';
import { queryOracle, type OracleResponse } from '../interpretation-engine/interpreter';

interface OracleViewProps {
  chart: NatalChart;
}

const SUGGESTED_QUESTIONS = [
  '¿Cómo puedo sanar mi herida de abandono?',
  '¿Qué patrones de miedo limitan mi crecimiento?',
  '¿Cómo me relaciono con el control en mis vínculos?',
  '¿Qué necesito para sentirme emocionalmente seguro?',
  '¿Cómo puedo mejorar mi autoestima?',
  '¿Qué me impide confiar en los demás?',
  '¿Cómo puedo trabajar con mi ira de forma constructiva?',
  '¿Qué bloquea mi creatividad y expresión personal?',
];

export default function OracleView({ chart }: OracleViewProps) {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<OracleResponse | null>(null);
  const [history, setHistory] = useState<OracleResponse[]>([]);

  const handleQuery = (q: string) => {
    const queryText = q || question;
    if (!queryText.trim()) return;
    const result = queryOracle(chart, queryText);
    setResponse(result);
    setHistory(prev => [result, ...prev]);
    setQuestion('');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Header */}
      <div className="bg-surface-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles size={16} className="text-accent" />
          <h2 className="text-sm font-semibold text-text-primary">Oráculo Simbólico</h2>
        </div>
        <p className="text-xs text-text-muted leading-relaxed">
          Escribe una pregunta sobre un tema emocional y el oráculo buscará correspondencias
          en la carta natal. Sistema local, sin IA externa.
        </p>
      </div>

      {/* Input */}
      <div className="bg-surface-card border border-border rounded-2xl p-5">
        <div className="flex gap-2.5">
          <input
            type="text"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleQuery(question)}
            placeholder="Escribe tu pregunta…"
            className="flex-1 bg-surface border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50 transition"
          />
          <button
            onClick={() => handleQuery(question)}
            disabled={!question.trim()}
            className="px-4 py-2.5 bg-accent hover:bg-primary-400 disabled:opacity-40 text-surface rounded-lg transition flex items-center gap-2 text-sm font-medium"
          >
            <Send size={14} />
            <span className="hidden sm:inline">Consultar</span>
          </button>
        </div>

        {/* Suggested questions */}
        <div className="mt-4">
          <p className="text-[11px] text-text-muted mb-2 uppercase tracking-wide">Sugerencias</p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => { setQuestion(q); handleQuery(q); }}
                className="text-[11px] bg-surface hover:bg-surface-lighter text-text-muted hover:text-text-secondary border border-border/60 rounded-full px-3 py-1 transition"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Response */}
      {response && (
        <div className="bg-surface-card border border-accent/20 rounded-2xl p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] text-text-muted italic truncate">"{response.query}"</p>
              {response.matchedThemes.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {response.matchedThemes.map(theme => (
                    <span key={theme} className="text-[11px] bg-accent/10 text-accent border border-accent/20 px-2 py-0.5 rounded-full">
                      {theme}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setResponse(null)}
              className="text-text-muted hover:text-text-secondary transition flex-shrink-0 mt-0.5"
            >
              <RotateCcw size={13} />
            </button>
          </div>

          <div className="space-y-3">
            {response.interpretation.map((text, i) => (
              <div key={i} className="text-sm text-text-secondary leading-relaxed">
                {renderOracleText(text)}
              </div>
            ))}
          </div>

          {response.suggestions.length > 0 && (
            <div className="border-t border-border/40 pt-4">
              <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-2">
                Sugerencias para el proceso
              </p>
              <ul className="space-y-1.5">
                {response.suggestions.map((s, i) => (
                  <li key={i} className="text-xs text-text-secondary flex items-start gap-2">
                    <span className="text-accent mt-0.5 flex-shrink-0">·</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* History */}
      {history.length > 1 && (
        <div className="bg-surface-card border border-border rounded-2xl p-5">
          <h3 className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-3">
            Consultas anteriores
          </h3>
          <div className="space-y-2 max-h-52 overflow-y-auto">
            {history.slice(1).map((h, i) => (
              <button
                key={i}
                onClick={() => setResponse(h)}
                className="w-full text-left p-3 bg-surface hover:bg-surface-lighter rounded-xl transition"
              >
                <p className="text-xs text-text-secondary truncate">"{h.query}"</p>
                <p className="text-[11px] text-accent/70 mt-0.5">
                  {h.matchedThemes.join(', ') || 'consulta general'}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="text-[10px] text-text-muted text-center italic pb-2">
        El oráculo funciona mediante asociaciones simbólicas locales. No utiliza IA externa.
      </p>
    </div>
  );
}

function renderOracleText(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-accent font-semibold">{part.slice(2, -2)}</strong>;
    }
    const lines = part.split('\n');
    if (lines.length > 1) {
      return lines.map((line, j) => (
        <span key={`${i}-${j}`}>
          {j > 0 && <br />}
          {line}
        </span>
      ));
    }
    return <span key={i}>{part}</span>;
  });
}
