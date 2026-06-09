/**
 * Motor Interpretativo Psicológico-Arquetípico
 * Combina reglas, asociaciones y pesos simbólicos para generar interpretaciones.
 * NO depende de frases fijas por planeta: usa combinaciones contextuales.
 */

import { NatalChart, AspectData, PlanetPosition, ASPECT_CONFIG } from '../astronomy/types';
import {
  PLANET_PSYCHOLOGICAL,
  SIGN_PSYCHOLOGICAL,
  HOUSE_MEANINGS,
  EMOTIONAL_THEMES,
  ASPECT_RULES,
  EmotionalTheme
} from './symbolic-data';

// ============================================
// HELPER: readable aspect labels for PDF compatibility
// (Unicode astrological glyphs like ☌ □ △ don't render in Helvetica)
// ============================================
const ASPECT_ABBREV: Record<string, string> = {
  conjunction: 'conj.',
  sextile:     'sext.',
  square:      'cuad.',
  trine:       'tríg.',
  opposition:  'opos.',
};
function aspLabel(a: { type: string }): string {
  return ASPECT_ABBREV[a.type] ?? a.type.slice(0, 4) + '.';
}

// ============================================
// TIPOS DE INTERPRETACIÓN
// ============================================

export interface InterpretationSection {
  title: string;
  icon: string;
  content: string[];
  intensity: number; // 1-10
}

export interface FullInterpretation {
  mainTraits: InterpretationSection;
  emotionalNeeds: InterpretationSection;
  emotionalWounds: InterpretationSection;
  unconsciousFears: InterpretationSection;
  relationalDynamics: InterpretationSection;
  repetitivePatterns: InterpretationSection;
  strengths: InterpretationSection;
}

export interface OracleResponse {
  query: string;
  matchedThemes: string[];
  interpretation: string[];
  suggestions: string[];
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

function findPlanet(chart: NatalChart, name: string): PlanetPosition | undefined {
  return chart.planets.find(p => p.name === name);
}

function findAspectsBetween(chart: NatalChart, planet1: string, planet2: string): AspectData[] {
  return chart.aspects.filter(a =>
    (a.planet1 === planet1 && a.planet2 === planet2) ||
    (a.planet1 === planet2 && a.planet2 === planet1)
  );
}

function findAspectsOf(chart: NatalChart, planetName: string): AspectData[] {
  return chart.aspects.filter(a => a.planet1 === planetName || a.planet2 === planetName);
}

function getAspectTypeName(type: string): string {
  const config = ASPECT_CONFIG[type as keyof typeof ASPECT_CONFIG];
  return config ? config.name : type;
}

function isTenseAspect(type: string): boolean {
  return type === 'square' || type === 'opposition';
}

function isFlowingAspect(type: string): boolean {
  return type === 'trine' || type === 'sextile';
}

// ============================================
// GENERADOR DE RASGOS PRINCIPALES
// ============================================

function interpretMainTraits(chart: NatalChart): InterpretationSection {
  const content: string[] = [];
  const sun = findPlanet(chart, 'Sol');
  const moon = findPlanet(chart, 'Luna');
  const ascSign = chart.ascendantSign;

  if (sun) {
    const sunPsy = PLANET_PSYCHOLOGICAL['Sol'];
    const signPsy = SIGN_PSYCHOLOGICAL[sun.sign];
    const houseMeaning = HOUSE_MEANINGS[sun.house];

    content.push(
      `**Sol en ${sun.sign} (Casa ${sun.house})** — ${sunPsy.archetype}\n` +
      `La identidad esencial se expresa a través del arquetipo de ${signPsy.archetype}. ` +
      `${signPsy.emotionalStyle}. ` +
      `En la Casa ${sun.house} (${houseMeaning.domain}), el propósito vital se manifiesta en el ámbito de ${houseMeaning.psychologicalTheme.toLowerCase()}.`
    );
  }

  if (moon) {
    const moonPsy = PLANET_PSYCHOLOGICAL['Luna'];
    const signPsy = SIGN_PSYCHOLOGICAL[moon.sign];
    const houseMeaning = HOUSE_MEANINGS[moon.house];

    content.push(
      `**Luna en ${moon.sign} (Casa ${moon.house})** — ${moonPsy.archetype}\n` +
      `Las necesidades emocionales profundas se expresan a través de ${signPsy.archetype.toLowerCase()}. ` +
      `${signPsy.emotionalStyle}. ` +
      `En la Casa ${moon.house} (${houseMeaning.domain}), el mundo emocional busca ${houseMeaning.keywords.join(', ')}.`
    );
  }

  if (ascSign) {
    const ascPsy = SIGN_PSYCHOLOGICAL[ascSign];
    if (ascPsy) {
      content.push(
        `**Ascendente en ${ascSign}** — La máscara social\n` +
        `La primera impresión y la forma de iniciar contacto con el mundo tiene la cualidad de ${ascPsy.archetype.toLowerCase()}. ` +
        `Palabras clave: ${ascPsy.keywords.join(', ')}. ` +
        `Sombra del Ascendente: ${ascPsy.shadow.join(', ')}.`
      );
    }
  }

  // Combinación Sol-Luna
  if (sun && moon) {
    const sunSign = SIGN_PSYCHOLOGICAL[sun.sign];
    const moonSign = SIGN_PSYCHOLOGICAL[moon.sign];
    if (sunSign.element !== moonSign.element) {
      content.push(
        `**Dinámica Sol-Luna**: La identidad (${sun.sign}, elemento ${sunSign.element}) y las emociones ` +
        `(${moon.sign}, elemento ${moonSign.element}) operan desde elementos diferentes, ` +
        `lo que puede generar una rica tensión interna entre lo que se quiere ser y lo que se necesita sentir.`
      );
    } else {
      content.push(
        `**Dinámica Sol-Luna**: La identidad (${sun.sign}) y las emociones (${moon.sign}) comparten ` +
        `el elemento ${sunSign.element}, lo que indica coherencia entre lo que se quiere ser y lo que se necesita sentir.`
      );
    }
  }

  return {
    title: 'Rasgos Principales',
    icon: '☉',
    content,
    intensity: 8
  };
}

// ============================================
// NECESIDADES EMOCIONALES
// ============================================

function interpretEmotionalNeeds(chart: NatalChart): InterpretationSection {
  const content: string[] = [];
  const moon = findPlanet(chart, 'Luna');
  const venus = findPlanet(chart, 'Venus');

  if (moon) {
    const moonPsy = PLANET_PSYCHOLOGICAL['Luna'];
    const signPsy = SIGN_PSYCHOLOGICAL[moon.sign];
    const houseMeaning = HOUSE_MEANINGS[moon.house];
    content.push(
      `**Luna en ${moon.sign} (Casa ${moon.house})** — ${moonPsy.archetype}\n` +
      `La necesidad emocional central es la de ${signPsy.keywords.slice(0, 2).join(' y ')}. ` +
      `El ámbito de vida donde esto se busca es ${houseMeaning.domain.toLowerCase()} (Casa ${moon.house}). ` +
      `Estilo emocional: ${signPsy.emotionalStyle}.`
    );
    if (moon.retrograde) {
      content.push(
        `La Luna retrógrada sugiere que el mundo emocional tiende a ser más reflexivo e interior, ` +
        `procesando las experiencias afectivas de forma profunda antes de expresarlas.`
      );
    }
  }

  if (venus) {
    const signPsy = SIGN_PSYCHOLOGICAL[venus.sign];
    const houseMeaning = HOUSE_MEANINGS[venus.house];
    content.push(
      `**Venus en ${venus.sign} (Casa ${venus.house})** — El Afecto\n` +
      `Los valores afectivos y la forma de relacionarse con el placer tienen la cualidad de ${signPsy.archetype.toLowerCase()}. ` +
      `En la Casa ${venus.house} (${houseMeaning.domain}), el afecto busca expresarse en el área de ${houseMeaning.psychologicalTheme}.`
    );
  }

  const moonAspects = findAspectsOf(chart, 'Luna');
  if (moonAspects.length > 0) {
    const tense = moonAspects.filter(a => isTenseAspect(a.type));
    const flowing = moonAspects.filter(a => isFlowingAspect(a.type));
    if (tense.length > 0) {
      content.push(
        `Aspectos de tensión de la Luna (${tense.map(a => `${aspLabel(a)} ${a.planet1 === 'Luna' ? a.planet2 : a.planet1}`).join(', ')}): ` +
        `las necesidades emocionales pueden entrar en conflicto con otras áreas de la personalidad.`
      );
    }
    if (flowing.length > 0) {
      content.push(
        `Aspectos fluidos de la Luna (${flowing.map(a => `${aspLabel(a)} ${a.planet1 === 'Luna' ? a.planet2 : a.planet1}`).join(', ')}): ` +
        `hay recursos naturales para satisfacer las necesidades emocionales con relativa facilidad.`
      );
    }
  }

  return { title: 'Necesidades Emocionales', icon: '☽', content, intensity: 7 };
}

// ============================================
// HERIDAS EMOCIONALES
// ============================================

function interpretEmotionalWounds(chart: NatalChart): InterpretationSection {
  const content: string[] = [];
  const chiron = findPlanet(chart, 'Quirón');
  const saturn = findPlanet(chart, 'Saturno');

  if (chiron) {
    const signPsy = SIGN_PSYCHOLOGICAL[chiron.sign];
    const houseMeaning = HOUSE_MEANINGS[chiron.house];
    content.push(
      `**Quirón en ${chiron.sign} (Casa ${chiron.house})** — La Herida Sanadora\n` +
      `La herida arquetípica central se relaciona con temas de ${signPsy.keywords.slice(0, 3).join(', ')}. ` +
      `En la Casa ${chiron.house} (${houseMeaning.domain}), la herida se manifiesta en el área de ${houseMeaning.psychologicalTheme}. ` +
      `Esta herida, al ser reconocida y trabajada, se convierte en fuente de profunda sabiduría y capacidad de acompañar a otros.`
    );
    if (chiron.retrograde) {
      content.push(
        `Quirón retrógrado sugiere que el proceso de sanación es profundamente interno, ` +
        `requiriendo revisitar capas antiguas de dolor antes de integrarlos.`
      );
    }
  }

  if (saturn) {
    const signPsy = SIGN_PSYCHOLOGICAL[saturn.sign];
    const houseMeaning = HOUSE_MEANINGS[saturn.house];
    content.push(
      `**Saturno en ${saturn.sign} (Casa ${saturn.house})** — El Maestro\n` +
      `Saturno indica las áreas de mayor desafío y aprendizaje. En ${saturn.sign} (${signPsy.emotionalStyle}), ` +
      `las estructuras y límites en el área de ${houseMeaning.domain.toLowerCase()} requieren trabajo consciente.`
    );
    const saturnAspects = findAspectsOf(chart, 'Saturno').filter(a => isTenseAspect(a.type));
    if (saturnAspects.length > 0) {
      content.push(
        `Saturno recibe aspectos de tensión de: ${saturnAspects.map(a => a.planet1 === 'Saturno' ? a.planet2 : a.planet1).join(', ')}. ` +
        `Esto intensifica la necesidad de trabajar conscientemente con sus temas.`
      );
    }
  }

  if (!chiron && !saturn) {
    content.push(
      `El mapa de heridas emocionales requiere un análisis más detallado de la carta natal en conjunto ` +
      `con el proceso terapéutico del consultante.`
    );
  }

  return { title: 'Heridas Emocionales', icon: '⚷', content, intensity: 8 };
}

// ============================================
// MIEDOS INCONSCIENTES
// ============================================

function interpretUnconsciousFears(chart: NatalChart): InterpretationSection {
  const content: string[] = [];
  const pluto = findPlanet(chart, 'Plutón');
  const saturn = findPlanet(chart, 'Saturno');
  const neptune = findPlanet(chart, 'Neptuno');

  const casa12Planets = chart.planets.filter(p => p.house === 12);
  if (casa12Planets.length > 0) {
    content.push(
      `**Planetas en Casa 12 (El Inconsciente)**: ${casa12Planets.map(p => p.name).join(', ')}\n` +
      `Estos planetas operan desde el trasfondo inconsciente, influyendo de manera no siempre visible. ` +
      `Su energía tiende a proyectarse o a manifestarse en sueños, intuiciones y situaciones repetitivas.`
    );
  }

  if (pluto) {
    const signPsy = SIGN_PSYCHOLOGICAL[pluto.sign];
    const houseMeaning = HOUSE_MEANINGS[pluto.house];
    content.push(
      `**Plutón en ${pluto.sign} (Casa ${pluto.house})** — El Transformador\n` +
      `Temas de poder, control y transformación son especialmente significativos. ` +
      `En la Casa ${pluto.house} (${houseMeaning.domain}), los miedos más profundos se relacionan con ${houseMeaning.psychologicalTheme}. ` +
      `La palabra clave del proceso es: ${signPsy.keywords[0] ?? 'transformación'}.`
    );
    const plutoAspects = findAspectsOf(chart, 'Plutón').filter(a => isTenseAspect(a.type));
    if (plutoAspects.length > 0) {
      content.push(
        `Plutón en tensión con ${plutoAspects.map(a => a.planet1 === 'Plutón' ? a.planet2 : a.planet1).join(', ')} ` +
        `amplifica las dinámicas de poder y la necesidad de transformación profunda.`
      );
    }
  }

  if (saturn) {
    const houseMeaning = HOUSE_MEANINGS[saturn.house];
    content.push(
      `**Saturno y los miedos estructurales**: El miedo al fracaso, al rechazo o a la pérdida de control ` +
      `se manifiesta especialmente en el área de ${houseMeaning.domain.toLowerCase()}.`
    );
  }

  if (neptune) {
    const houseMeaning = HOUSE_MEANINGS[neptune.house];
    content.push(
      `**Neptuno en ${neptune.sign} (Casa ${neptune.house})**: El miedo a la disolución de límites y ` +
      `la pérdida de identidad pueden manifestarse en ${houseMeaning.domain.toLowerCase()}.`
    );
  }

  if (content.length === 0) {
    content.push(
      `Los miedos inconscientes se revelan mejor a través del trabajo terapéutico directo, ` +
      `observando los patrones de vida que se repiten sin elección consciente.`
    );
  }

  return { title: 'Miedos Inconscientes', icon: '♇', content, intensity: 7 };
}

// ============================================
// DINÁMICAS RELACIONALES
// ============================================

function interpretRelationalDynamics(chart: NatalChart): InterpretationSection {
  const content: string[] = [];
  const venus = findPlanet(chart, 'Venus');
  const mars = findPlanet(chart, 'Marte');
  const descSign = chart.planets.find(p => p.name === 'Quirón'); // placeholder

  const casa7Planets = chart.planets.filter(p => p.house === 7);
  if (casa7Planets.length > 0) {
    content.push(
      `**Planetas en Casa 7 (Relaciones)**: ${casa7Planets.map(p => p.name).join(', ')}\n` +
      `Estos planetas colorean la forma en que se busca y experimenta la pareja. ` +
      `La persona tiende a proyectar estas energías en el otro o a atraer personas que las encarnan.`
    );
  }

  if (venus) {
    const signPsy = SIGN_PSYCHOLOGICAL[venus.sign];
    const houseMeaning = HOUSE_MEANINGS[venus.house];
    content.push(
      `**Venus en ${venus.sign} (Casa ${venus.house})** — El Afecto\n` +
      `El estilo de amor y los valores en la relación: ${signPsy.emotionalStyle}. ` +
      `En ${houseMeaning.domain}, se busca la conexión a través de ${signPsy.keywords.slice(0, 2).join(' y ')}. ` +
      `Sombra relacional: tendencia hacia ${signPsy.shadow.join(', ')}.`
    );
  }

  if (mars) {
    const signPsy = SIGN_PSYCHOLOGICAL[mars.sign];
    const houseMeaning = HOUSE_MEANINGS[mars.house];
    content.push(
      `**Marte en ${mars.sign} (Casa ${mars.house})** — La Energía\n` +
      `La forma de expresar el deseo y la asertividad es ${signPsy.emotionalStyle}. ` +
      `En ${houseMeaning.domain}, la energía y el impulso se dirigen hacia ${houseMeaning.psychologicalTheme}.`
    );
  }

  const venusMarsAspects = venus && mars ? findAspectsBetween(chart, 'Venus', 'Marte') : [];
  if (venusMarsAspects.length > 0) {
    const asp = venusMarsAspects[0];
    content.push(
      `**Venus ${aspLabel(asp)} Marte (orbe ${asp.orb}°)**: La tensión entre el afecto y el deseo ` +
      `${isTenseAspect(asp.type) ? 'genera fricción, pero también intensidad creativa en las relaciones.' : 'fluye con relativa armonía, integrando amor y deseo.'}`
    );
  }

  // Suppress unused warning
  void descSign;

  if (content.length === 0) {
    content.push(
      `Las dinámicas relacionales se comprenden mejor al explorar el Ascendente, Descendente y Casa 7 en detalle.`
    );
  }

  return { title: 'Dinámicas Relacionales', icon: '♀', content, intensity: 7 };
}

// ============================================
// PATRONES REPETITIVOS
// ============================================

function interpretRepetitivePatterns(chart: NatalChart): InterpretationSection {
  const content: string[] = [];
  const saturn = findPlanet(chart, 'Saturno');
  const pluto = findPlanet(chart, 'Plutón');
  const moon = findPlanet(chart, 'Luna');

  if (saturn) {
    const signPsy = SIGN_PSYCHOLOGICAL[saturn.sign];
    const houseMeaning = HOUSE_MEANINGS[saturn.house];
    content.push(
      `**Saturno en ${saturn.sign} (Casa ${saturn.house})** — El patrón estructural\n` +
      `Saturno indica los patrones más persistentes y las áreas donde la persona puede sentir restricción repetida. ` +
      `En ${saturn.sign} (${signPsy.emotionalStyle}), el patrón gira en torno a ${signPsy.keywords.slice(0, 2).join(' y ')}. ` +
      `El desafío recurrente se manifiesta en ${houseMeaning.domain.toLowerCase()} (${houseMeaning.psychologicalTheme}).`
    );
  }

  const tenseAspects = chart.aspects.filter(a => isTenseAspect(a.type));
  if (tenseAspects.length > 0) {
    const key = tenseAspects.slice(0, 3).map(a => `${a.planet1} ${aspLabel(a)} ${a.planet2}`).join('; ');
    content.push(
      `**Aspectos de tensión principales**: ${key}\n` +
      `Estas configuraciones representan tensiones internas que el consultante tiende a re-escenificar en distintas áreas de vida. ` +
      `Cada repetición es una oportunidad de integración.`
    );
  }

  if (moon && saturn) {
    const moonSaturnAspects = findAspectsBetween(chart, 'Luna', 'Saturno');
    if (moonSaturnAspects.length > 0) {
      content.push(
        `**Luna ${aspLabel(moonSaturnAspects[0])} Saturno**: El patrón de restricción emocional puede llevar ` +
        `a repetir situaciones donde las necesidades afectivas no se satisfacen, ` +
        `reforzando una creencia de indignidad afectiva que merece ser cuestionada.`
      );
    }
  }

  if (pluto) {
    const plutoPlanetsAspects = chart.aspects.filter(a =>
      (a.planet1 === 'Plutón' || a.planet2 === 'Plutón') && isTenseAspect(a.type)
    );
    if (plutoPlanetsAspects.length > 0) {
      content.push(
        `**Patrones plutonianos**: La compulsión de Plutón impulsa patrones relacionados con el poder y control, ` +
        `que se repiten hasta que se integran conscientemente.`
      );
    }
  }

  if (content.length === 0) {
    content.push(
      `Los patrones repetitivos emergen con mayor claridad al explorar el historial de vida del consultante ` +
      `en diálogo con la carta natal. El trabajo terapéutico es el espacio idóneo para este proceso.`
    );
  }

  return { title: 'Patrones Repetitivos', icon: '♄', content, intensity: 6 };
}

// ============================================
// FORTALEZAS
// ============================================

function interpretStrengths(chart: NatalChart): InterpretationSection {
  const content: string[] = [];
  const jupiter = findPlanet(chart, 'Júpiter');
  const sun = findPlanet(chart, 'Sol');

  const flowingAspects = chart.aspects.filter(a => isFlowingAspect(a.type));
  if (flowingAspects.length > 0) {
    content.push(
      `**Aspectos fluidos (recursos naturales)**: ${flowingAspects.slice(0, 4).map(a => `${a.planet1} ${aspLabel(a)} ${a.planet2}`).join('; ')}\n` +
      `Estas configuraciones representan talentos naturales y flujos de energía que el consultante puede activar ` +
      `con relativa facilidad como recursos en su proceso de crecimiento.`
    );
  }

  if (jupiter) {
    const signPsy = SIGN_PSYCHOLOGICAL[jupiter.sign];
    const houseMeaning = HOUSE_MEANINGS[jupiter.house];
    content.push(
      `**Júpiter en ${jupiter.sign} (Casa ${jupiter.house})** — El Protector\n` +
      `El área de mayor expansión y abundancia natural es ${houseMeaning.domain.toLowerCase()}. ` +
      `El estilo de crecimiento: ${signPsy.emotionalStyle}. ` +
      `Esta posición indica donde el consultante tiene más facilidad para crecer, aprender y sentirse afortunado.`
    );
  }

  if (sun) {
    const sunPsy = PLANET_PSYCHOLOGICAL['Sol'];
    const signPsy = SIGN_PSYCHOLOGICAL[sun.sign];
    content.push(
      `**Fortaleza solar**: El arquetipo de ${sunPsy.archetype} en ${sun.sign} proporciona ` +
      `${signPsy.keywords.slice(0, 3).join(', ')} como cualidades nucleares de expresión creativa y vital.`
    );
  }

  if (content.length === 0) {
    content.push(
      `Toda carta natal contiene fortalezas únicas. El proceso terapéutico ayuda a identificarlas ` +
      `y utilizarlas como recursos en los momentos de desafío.`
    );
  }

  return { title: 'Fortalezas', icon: '♃', content, intensity: 6 };
}

export function generateFullInterpretation(chart: NatalChart): FullInterpretation {
  return {
    mainTraits: interpretMainTraits(chart),
    emotionalNeeds: interpretEmotionalNeeds(chart),
    emotionalWounds: interpretEmotionalWounds(chart),
    unconsciousFears: interpretUnconsciousFears(chart),
    relationalDynamics: interpretRelationalDynamics(chart),
    repetitivePatterns: interpretRepetitivePatterns(chart),
    strengths: interpretStrengths(chart)
  };
}

export function queryOracle(chart: NatalChart, question: string): OracleResponse {
  const normalizedQuestion = question.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  // Buscar temas emocionales que coincidan con la pregunta
  const matchedThemes: EmotionalTheme[] = [];
  
  for (const theme of EMOTIONAL_THEMES) {
    const keywordNormalized = theme.keyword.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (normalizedQuestion.includes(keywordNormalized)) {
      matchedThemes.push(theme);
    }
  }
  
  // Si no hay coincidencia directa, buscar por palabras clave secundarias
  if (matchedThemes.length === 0) {
    const questionWords = normalizedQuestion.split(/\s+/);
    for (const theme of EMOTIONAL_THEMES) {
      const descNormalized = theme.description.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      for (const word of questionWords) {
        if (word.length > 3 && descNormalized.includes(word)) {
          if (!matchedThemes.includes(theme)) {
            matchedThemes.push(theme);
          }
        }
      }
    }
  }

  // También buscar por temas de las reglas de aspecto
  const additionalKeywords = ['sanar', 'herida', 'dolor', 'patron', 'relacion', 'miedo', 'emocion', 'amor', 'poder', 'control', 'confianza', 'soledad'];
  for (const kw of additionalKeywords) {
    if (normalizedQuestion.includes(kw)) {
      const related = EMOTIONAL_THEMES.filter(t => {
        const td = t.description.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return td.includes(kw) && !matchedThemes.includes(t);
      });
      matchedThemes.push(...related);
    }
  }

  // Limitar a los 3 temas más relevantes
  const topThemes = matchedThemes.slice(0, 3);
  
  const interpretation: string[] = [];
  const suggestions: string[] = [];
  
  if (topThemes.length === 0) {
    // Respuesta genérica basada en la carta
    const moon = findPlanet(chart, 'Luna');
    const chiron = findPlanet(chart, 'Quirón');
    
    interpretation.push(
      `Tu pregunta toca áreas profundas del ser. Aunque no se encuentra una correspondencia directa ` +
      `con las configuraciones registradas, la carta natal ofrece pistas generales:`
    );
    
    if (moon) {
      interpretation.push(
        `Tu Luna en ${moon.sign} (Casa ${moon.house}) indica que tus necesidades emocionales fundamentales ` +
        `se relacionan con ${SIGN_PSYCHOLOGICAL[moon.sign].keywords.slice(0, 3).join(', ')}. ` +
        `Explorar cómo estas necesidades se satisfacen o frustran puede iluminar tu pregunta.`
      );
    }
    
    if (chiron) {
      interpretation.push(
        `Quirón en ${chiron.sign} (Casa ${chiron.house}) señala tu herida sanadora, ` +
        `que posiblemente esté conectada con el tema que te preocupa.`
      );
    }
    
    suggestions.push('Explora la conexión entre tu pregunta y la posición de tu Luna natal.');
    suggestions.push('Considera cómo la herida de Quirón puede estar influyendo en tu experiencia actual.');
  } else {
    // Buscar coincidencias en la carta
    for (const theme of topThemes) {
      const relevantPlanets = theme.planetaryIndicators
        .map(pName => findPlanet(chart, pName))
        .filter((p): p is PlanetPosition => p !== undefined);
      
      const planetaryInds = theme.planetaryIndicators as readonly string[];
      const aspectInds = theme.aspectIndicators as readonly string[];
      const houseInds = theme.houseIndicators as readonly number[];
      const signInds = theme.signIndicators as readonly string[];

      const relevantAspects = chart.aspects.filter(a =>
        planetaryInds.includes(a.planet1) &&
        planetaryInds.includes(a.planet2) &&
        aspectInds.includes(a.type)
      );

      const planetsInRelevantHouses = relevantPlanets.filter(p =>
        houseInds.includes(p.house)
      );

      const planetsInRelevantSigns = relevantPlanets.filter(p =>
        signInds.includes(p.sign)
      );
      
      // Puntaje de relevancia
      const score = relevantAspects.length * 3 + planetsInRelevantHouses.length * 2 + planetsInRelevantSigns.length;
      
      if (score > 0 || relevantPlanets.length > 0) {
        let interp = `**Tema: ${theme.keyword.charAt(0).toUpperCase() + theme.keyword.slice(1)}** — ${theme.description}\n\n`;
        
        if (relevantAspects.length > 0) {
          const aspectDescs = relevantAspects.map(a =>
            `${a.planet1} ${getAspectTypeName(a.type)} ${a.planet2} (orbe ${a.orb}°)`
          ).join('; ');
          
          // Buscar regla específica
          for (const asp of relevantAspects) {
            const rule = ASPECT_RULES.find(r =>
              ((r.planet1 === asp.planet1 && r.planet2 === asp.planet2) ||
              (r.planet1 === asp.planet2 && r.planet2 === asp.planet1)) &&
              r.aspectType === asp.type
            );
            if (rule) {
              interp += rule.interpretation + '\n\n';
            }
          }
          
          interp += `Configuraciones relevantes en tu carta: ${aspectDescs}.\n`;
        }
        
        if (planetsInRelevantHouses.length > 0) {
          const houseDescs = planetsInRelevantHouses.map(p =>
            `${p.name} en Casa ${p.house} (${HOUSE_MEANINGS[p.house].domain})`
          ).join('; ');
          interp += `Áreas de vida involucradas: ${houseDescs}.\n`;
        }
        
        if (planetsInRelevantSigns.length > 0) {
          const signDescs = planetsInRelevantSigns.map(p =>
            `${p.name} en ${p.sign}`
          ).join('; ');
          interp += `Cualidades emocionales: ${signDescs}.\n`;
        }
        
        interpretation.push(interp);
      }
    }
    
    // Sugerencias
    suggestions.push('Observa cómo los temas identificados se manifiestan en tu vida cotidiana.');
    suggestions.push('En el espacio terapéutico, explora los sentimientos que surgen al leer estas interpretaciones.');
    suggestions.push('Recuerda que cada tensión es también una invitación al crecimiento.');
    
    if (topThemes.some(t => t.keyword === 'abandono')) {
      suggestions.push('Trabaja con el niño interior: ¿qué necesitaba escuchar que nunca le fue dicho?');
    }
    if (topThemes.some(t => t.keyword === 'control' || t.keyword === 'poder')) {
      suggestions.push('Practica soltar el control en áreas pequeñas y observa qué surge.');
    }
  }
  
  return {
    query: question,
    matchedThemes: topThemes.map(t => t.keyword),
    interpretation,
    suggestions
  };
}
