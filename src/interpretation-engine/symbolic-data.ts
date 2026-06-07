// Archivo con datos simbólicos: planetas, signos, casas, reglas y temas emocionales.

export const PLANET_PSYCHOLOGICAL: Record<string, any> = {
  'Sol': { archetype: 'El Héroe', needs: ['expresión', 'reconocimiento'], keywords: ['voluntad', 'propósito'], archetypeShort: 'Identidad' },
  'Luna': { archetype: 'La Nutricia', needs: ['seguridad', 'vínculo'], keywords: ['emociones', 'cuidado'], archetypeShort: 'Necesidades' },
  'Mercurio': { archetype: 'El Comunicador', needs: [], keywords: ['pensamiento', 'comunicación'] },
  'Venus': { archetype: 'El Afecto', needs: [], keywords: ['amor', 'placer'] },
  'Marte': { archetype: 'La Energía', needs: [], keywords: ['acción', 'deseo'] },
  'Júpiter': { archetype: 'El Protector', needs: [], keywords: ['expansión', 'crecimiento'] },
  'Saturno': { archetype: 'El Maestro', needs: [], keywords: ['estructura', 'límites'] },
  'Urano': { archetype: 'El Rebelde', needs: [], keywords: ['ruptura', 'originalidad'] },
  'Neptuno': { archetype: 'El Soñador', needs: [], keywords: ['ideal', 'disolución'] },
  'Plutón': { archetype: 'El Transformador', needs: [], keywords: ['poder', 'renovación'] },
  'Quirón': { archetype: 'La Herida Sanadora', needs: [], keywords: ['dolor', 'sanación'] }
};

export const SIGN_PSYCHOLOGICAL: Record<string, any> = {
  'Aries': { archetype: 'El Iniciador', emotionalStyle: 'directo, valiente', element: 'Fuego', keywords: ['iniciativa', 'coraje'], shadow: ['impulsividad'] },
  'Tauro': { archetype: 'El Sustentador', emotionalStyle: 'estable, sensual', element: 'Tierra', keywords: ['seguridad', 'placer'], shadow: ['posesividad'] },
  'Géminis': { archetype: 'El Mensajero', emotionalStyle: 'curioso, comunicativo', element: 'Aire', keywords: ['ideas', 'adaptabilidad'], shadow: ['superficialidad'] },
  'Cáncer': { archetype: 'El Cuidador', emotionalStyle: 'nutritivo, protector', element: 'Agua', keywords: ['hogar', 'memoria'], shadow: ['hipersensibilidad'] },
  'Leo': { archetype: 'El Artista', emotionalStyle: 'expresivo, cálido', element: 'Fuego', keywords: ['creatividad', 'orgullo'], shadow: ['egocentrismo'] },
  'Virgo': { archetype: 'El Sanador', emotionalStyle: 'analítico, servicial', element: 'Tierra', keywords: ['detalle', 'servicio'], shadow: ['crítica'] },
  'Libra': { archetype: 'El Mediador', emotionalStyle: 'relacional, estético', element: 'Aire', keywords: ['armonía', 'justicia'], shadow: ['indecisión'] },
  'Escorpio': { archetype: 'El Intenso', emotionalStyle: 'profundo, transformador', element: 'Agua', keywords: ['intensidad', 'poder'], shadow: ['posesividad'] },
  'Sagitario': { archetype: 'El Explorador', emotionalStyle: 'optimista, filosófico', element: 'Fuego', keywords: ['búsqueda', 'libertad'], shadow: ['fanatismo'] },
  'Capricornio': { archetype: 'El Constructor', emotionalStyle: 'disciplinado, ambicioso', element: 'Tierra', keywords: ['logro', 'responsabilidad'], shadow: ['rigidez'] },
  'Acuario': { archetype: 'El Visionario', emotionalStyle: 'distante, innovador', element: 'Aire', keywords: ['progreso', 'colectivo'], shadow: ['alienación'] },
  'Piscis': { archetype: 'El Soñador', emotionalStyle: 'compasivo, receptivo', element: 'Agua', keywords: ['intución', 'empatía'], shadow: ['evasión'] }
};

export const HOUSE_MEANINGS: Record<number, any> = {
  1: { domain: 'Identidad y cuerpo', psychologicalTheme: 'autopresentación', keywords: ['yo', 'apariencia'] },
  2: { domain: 'Valores y recursos', psychologicalTheme: 'seguridad material', keywords: ['posesiones', 'autoestima'] },
  3: { domain: 'Comunicación', psychologicalTheme: 'pensamiento cotidiano', keywords: ['hermanos', 'aprendizaje'] },
  4: { domain: 'Hogar y raíces', psychologicalTheme: 'seguridad emocional', keywords: ['familia', 'memoria'] },
  5: { domain: 'Creatividad y placer', psychologicalTheme: 'autoexpresión', keywords: ['amor', 'placer'] },
  6: { domain: 'Trabajo y salud', psychologicalTheme: 'rutina y servicio', keywords: ['salud', 'trabajo'] },
  7: { domain: 'Relaciones', psychologicalTheme: 'proyección en el otro', keywords: ['pareja', 'alianzas'] },
  8: { domain: 'Transformación', psychologicalTheme: 'límites y fusión', keywords: ['sexo', 'dinero compartido'] },
  9: { domain: 'Búsqueda de sentido', psychologicalTheme: 'ideologías', keywords: ['viajes', 'filosofía'] },
  10: { domain: 'Carrera y estatus', psychologicalTheme: 'vocación', keywords: ['profesión', 'reputación'] },
  11: { domain: 'Grupo y futuro', psychologicalTheme: 'proyectos colectivos', keywords: ['amistades', 'sueños'] },
  12: { domain: 'Inconsciente', psychologicalTheme: 'lo reprimido', keywords: ['sombra', 'misticismo'] }
};

export const EMOTIONAL_THEMES = [
  { keyword: 'abandono', description: 'Sentimientos de abandono y soledad', planetaryIndicators: ['Luna', 'Quirón'], aspectIndicators: ['opposition', 'square'], houseIndicators: [4,12], signIndicators: ['Cáncer', 'Piscis'] },
  { keyword: 'control', description: 'Necesidad de controlar situaciones y relaciones', planetaryIndicators: ['Saturno', 'Plutón'], aspectIndicators: ['square', 'opposition'], houseIndicators: [7,8], signIndicators: ['Capricornio', 'Escorpio'] },
  { keyword: 'poder', description: 'Dinámicas de poder y transformación', planetaryIndicators: ['Plutón', 'Marte'], aspectIndicators: ['conjunction', 'square'], houseIndicators: [8,10], signIndicators: ['Escorpio', 'Aries'] },
  { keyword: 'amor', description: 'Estilos afectivos y patrones de apego', planetaryIndicators: ['Venus', 'Luna'], aspectIndicators: ['trine', 'sextile'], houseIndicators: [5,7], signIndicators: ['Tauro', 'Libra'] }
] as const;

export const ASPECT_RULES = [
  { planet1: 'Luna', planet2: 'Saturno', aspectType: 'square', interpretation: 'Tensión entre necesidades emocionales y estructuras; sensación de inadmisión emocional.', intensity: 8 },
  { planet1: 'Sol', planet2: 'Plutón', aspectType: 'conjunction', interpretation: 'Identidad intensamente transformadora; búsqueda de poder interior.', intensity: 9 },
  { planet1: 'Venus', planet2: 'Marte', aspectType: 'opposition', interpretation: 'Tensión entre afecto y deseo; conflictos en la expresión sexual y afectiva.', intensity: 7 }
];

export type EmotionalTheme = typeof EMOTIONAL_THEMES[number];

