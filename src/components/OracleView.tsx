import { useState } from 'react';
import { Sparkles, Send } from 'lucide-react';
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-accent flex items-center gap-2 mb-2">
          <Sparkles size={20} />
          Oráculo Simbólico
        </h2>
        <p className="text-sm text-text-muted">
          Escribe una pregunta sobre un tema emocional y el oráculo buscará correspondencias
          en la carta natal del consultante. Este sistema funciona completamente local,
          sin inteligencia artificial externa.
        </p>
      </div>

      {/* Question input */}
      <div className="bg-surface-card border border-border rounded-xl p-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleQuery(question)}
            placeholder="Escribe tu pregunta..."
            className="flex-1 bg-surface border border-border rounded-lg px-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
          />
          <button
            onClick={() => handleQuery(question)}
            disabled={!question.trim()}
            className="px-4 py-3 bg-primary-600 hover:bg-primary-500 disabled:bg-surface-lighter disabled:text-text-muted text-white rounded-lg transition flex items-center gap-2"
          >
            <Send size={16} />
            <span className="hidden sm:inline">Consultar</span>
          </button>
        </div>

        {/* Suggested questions */}
        <div className="mt-4">
          <p className="text-xs text-text-muted mb-2">Preguntas sugeridas:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuestion(q);
                  handleQuery(q);
                }}
                className="text-xs bg-surface hover:bg-surface-lighter text-text-secondary hover:text-text-primary border border-border rounded-full px-3 py-1.5 transition"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Response */}
      {response && (
        <div className="bg-surface-card border border-primary-700/30 rounded-xl p-6 space-y-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">✦</span>
            <div>
              <p className="text-sm text-text-muted italic mb-1">Pregunta: "{response.query}"</p>
              {response.matchedThemes.length > 0 && (
                <div className="flex gap-2 mb-4">
                  {response.matchedThemes.map(theme => (
                    <span key={theme} className="text-xs bg-primary-900/50 text-primary-300 px-2 py-1 rounded-full">
                      {theme}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {response.interpretation.map((text, i) => (
              <div key={i} className="text-sm text-text-secondary leading-relaxed">
                {renderOracleText(text)}
              </div>
            ))}
          </div>

          {response.suggestions.length > 0 && (
            <div className="border-t border-border pt-4 mt-4">
              <p className="text-xs font-semibold text-text-muted mb-2">💡 Sugerencias para el proceso:</p>
              <ul className="space-y-1">
                {response.suggestions.map((s, i) => (
                  <li key={i} className="text-xs text-text-secondary flex items-start gap-2">
                    <span className="text-primary-400 mt-0.5">•</span>
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
        <div className="bg-surface-card border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-text-muted mb-3">Consultas anteriores</h3>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {history.slice(1).map((h, i) => (
              <button
                key={i}
                onClick={() => setResponse(h)}
                className="w-full text-left p-3 bg-surface hover:bg-surface-lighter rounded-lg transition"
              >
                <p className="text-xs text-text-muted">"{h.query}"</p>
                <p className="text-xs text-primary-400">{h.matchedThemes.join(', ') || 'consulta general'}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-[10px] text-text-muted text-center italic">
        El oráculo funciona mediante asociaciones simbólicas locales. No utiliza inteligencia artificial externa.
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
