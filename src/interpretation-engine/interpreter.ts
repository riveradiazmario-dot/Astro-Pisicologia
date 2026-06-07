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

// (rest of interpreter continues...)

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
      
      const relevantAspects = chart.aspects.filter(a =>
        theme.planetaryIndicators.includes(a.planet1) &&
        theme.planetaryIndicators.includes(a.planet2) &&
        theme.aspectIndicators.includes(a.type)
      );
      
      const planetsInRelevantHouses = relevantPlanets.filter(p =>
        theme.houseIndicators.includes(p.house)
      );
      
      const planetsInRelevantSigns = relevantPlanets.filter(p =>
        theme.signIndicators.includes(p.sign)
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
    
    if (topThemes.some(t => t.keyword === 'abandono' || t.keyword === 'soledad')) {
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
