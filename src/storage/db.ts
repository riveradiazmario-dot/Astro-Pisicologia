/**
 * Capa de Persistencia Local
 * Usa IndexedDB a través de Dexie.js para almacenamiento local seguro.
 * No se envían datos a servicios externos.
 */

import Dexie, { type EntityTable } from 'dexie';
import type { Consultant, TherapistConfig, NatalChart, BirthData } from '../astronomy/types';

// ============================================
// DEFINICIÓN DE BASE DE DATOS
// ============================================

interface ConsultantRecord {
  id?: number;
  name: string;
  birthData: BirthData;
  chart?: NatalChart;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ConfigRecord {
  id: string;
  value: string;
}

const db = new Dexie('AstroAnimaDB') as Dexie & {
  consultants: EntityTable<ConsultantRecord, 'id'>;
  config: EntityTable<ConfigRecord, 'id'>;
};

db.version(1).stores({
  consultants: '++id, name, createdAt, updatedAt',
  config: 'id'
});

// ============================================
// OPERACIONES CON CONSULTANTES
// ============================================

export async function saveConsultant(consultant: Consultant): Promise<number> {
  const now = new Date();
  if (consultant.id) {
    await db.consultants.update(consultant.id, {
      ...consultant,
      updatedAt: now
    });
    return consultant.id!;
  } else {
    const id = await db.consultants.add({
      name: consultant.name,
      birthData: consultant.birthData,
      chart: consultant.chart,
      notes: consultant.notes,
      createdAt: now,
      updatedAt: now
    });
    return id as number;
  }
}

export async function getConsultant(id: number): Promise<Consultant | undefined> {
  return await db.consultants.get(id) as Consultant | undefined;
}

export async function getAllConsultants(): Promise<Consultant[]> {
  return await db.consultants.orderBy('updatedAt').reverse().toArray() as Consultant[];
}

export async function deleteConsultant(id: number): Promise<void> {
  await db.consultants.delete(id);
}

export async function searchConsultants(query: string): Promise<Consultant[]> {
  const all = await getAllConsultants();
  const q = query.toLowerCase();
  return all.filter(c => c.name.toLowerCase().includes(q));
}

// ============================================
// CONFIGURACIÓN DEL TERAPEUTA
// ============================================

const DEFAULT_CONFIG: TherapistConfig = {
  name: '',
  registration: '',
  signature: '',
  disclaimer: 'Esta herramienta ofrece interpretaciones simbólicas basadas en astrología psicológica y no sustituye procesos terapéuticos, médicos ni diagnósticos clínicos.',
  orbDefault: 5
};

export async function getTherapistConfig(): Promise<TherapistConfig> {
  const record = await db.config.get('therapist');
  if (record) {
    try {
      return { ...DEFAULT_CONFIG, ...JSON.parse(record.value) };
    } catch {
      return DEFAULT_CONFIG;
    }
  }
  return DEFAULT_CONFIG;
}

export async function saveTherapistConfig(config: TherapistConfig): Promise<void> {
  await db.config.put({
    id: 'therapist',
    value: JSON.stringify(config)
  });
}

export { db };
