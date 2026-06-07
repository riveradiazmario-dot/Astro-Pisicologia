/**
 * Motor de Exportación PDF
 * Genera informes profesionales usando jsPDF.
 * Incluye datos del consultante, carta astral, interpretación y descargo ético.
 */

import jsPDF from 'jspdf';
import type { NatalChart } from '../astronomy/types';
import type { FullInterpretation } from '../interpretation-engine/interpreter';
import type { TherapistConfig } from '../astronomy/types';
import { formatDegree } from '../astronomy/engine';
import { ASPECT_CONFIG } from '../astronomy/types';

function getAspectName(type: string): string {
  const config = ASPECT_CONFIG[type as keyof typeof ASPECT_CONFIG];
  return config ? config.name : type;
}

/**
 * Genera un PDF con el informe completo de la carta natal
 */
export function generatePDF(
  chart: NatalChart,
  interpretation: FullInterpretation,
  therapistConfig: TherapistConfig
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let y = margin;

  // Helpers
  function addTitle(text: string, size: number = 18) {
    doc.setFontSize(size);
    doc.setFont('helvetica', 'bold');
    doc.text(text, pageWidth / 2, y, { align: 'center' });
    y += size * 0.5;
  }

  function addSubtitle(text: string) {
    checkPageBreak(12);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 50, 120);
    doc.text(text, margin, y);
    y += 7;
    doc.setTextColor(0, 0, 0);
  }

  function addText(text: string, fontSize: number = 10) {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', 'normal');
    // Strip markdown bold markers
    const cleanText = text.replace(/\*\*/g, '');
    const lines = doc.splitTextToSize(cleanText, contentWidth);
    for (const line of lines) {
      checkPageBreak(6);
      doc.text(line, margin, y);
      y += 5;
    }
    y += 2;
  }

  function addLine() {
    checkPageBreak(5);
    doc.setDrawColor(180, 150, 220);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;
  }

  function checkPageBreak(needed: number) {
    if (y + needed > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      y = margin;
    }
  }

  // ========== PORTADA ==========
  y = 40;
  addTitle('AstroAnima', 24);
  y += 5;
  addTitle('Informe de Carta Natal', 16);
  y += 5;
  addTitle('Astrología Psicológica Arquetípica', 12);
  y += 15;

  // Datos del consultante
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  const birthInfo = [
    `Consultante: ${chart.birthData.name}`,
    `Fecha: ${chart.birthData.date}`,
    `Hora: ${chart.birthData.time}`,
    `Lugar: ${chart.birthData.city}`,
    `Coordenadas: ${chart.birthData.latitude.toFixed(4)}°, ${chart.birthData.longitude.toFixed(4)}°`,
    `Ascendente: ${chart.ascendantSign}`,
    `Medio Cielo: ${chart.midheavenSign}`
  ];

  for (const line of birthInfo) {
    doc.text(line, pageWidth / 2, y, { align: 'center' });
    y += 7;
  }

  y += 10;
  if (therapistConfig.name) {
    doc.setFontSize(10);
    doc.text(`Profesional: ${therapistConfig.name}`, pageWidth / 2, y, { align: 'center' });
    y += 5;
  }
  if (therapistConfig.registration) {
    doc.text(`Registro: ${therapistConfig.registration}`, pageWidth / 2, y, { align: 'center' });
    y += 5;
  }
  doc.text(`Fecha del informe: ${new Date().toLocaleDateString('es')}`, pageWidth / 2, y, { align: 'center' });

  // ========== POSICIONES PLANETARIAS ==========
  doc.addPage();
  y = margin;
  addSubtitle('☉ Posiciones Planetarias');
  addLine();

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Planeta', margin, y);
  doc.text('Posición', margin + 35, y);
  doc.text('Casa', margin + 90, y);
  doc.text('Retro', margin + 110, y);
  y += 6;
  doc.setFont('helvetica', 'normal');

  for (const planet of chart.planets) {
    checkPageBreak(6);
    doc.text(planet.name, margin, y);
    doc.text(`${planet.degree}° ${planet.sign} ${planet.minute}'`, margin + 35, y);
    doc.text(`Casa ${planet.house}`, margin + 90, y);
    doc.text(planet.retrograde ? 'R' : '', margin + 110, y);
    y += 5;
  }

  // Ascendente y MC
  y += 3;
  doc.text(`Ascendente: ${formatDegree(chart.houses.ascendant)}`, margin, y);
  y += 5;
  doc.text(`Medio Cielo: ${formatDegree(chart.houses.midheaven)}`, margin, y);
  y += 10;

  // ========== CASAS ==========
  addSubtitle('⌂ Cúspides de Casas (Placidus)');
  addLine();

  doc.setFontSize(9);
  for (let i = 0; i < 12; i++) {
    checkPageBreak(5);
    doc.text(`Casa ${i + 1}: ${formatDegree(chart.houses.cusps[i])}`, margin + (i < 6 ? 0 : 80), i < 6 ? y + i * 5 : y + (i - 6) * 5);
  }
  y += 35;

  // ========== ASPECTOS ==========
  addSubtitle('☌ Aspectos Principales');
  addLine();

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Planeta 1', margin, y);
  doc.text('Aspecto', margin + 35, y);
  doc.text('Planeta 2', margin + 75, y);
  doc.text('Orbe', margin + 110, y);
  y += 6;
  doc.setFont('helvetica', 'normal');

  for (const aspect of chart.aspects) {
    checkPageBreak(6);
    doc.text(aspect.planet1, margin, y);
    doc.text(`${aspect.symbol} ${getAspectName(aspect.type)}`, margin + 35, y);
    doc.text(aspect.planet2, margin + 75, y);
    doc.text(`${aspect.orb}°`, margin + 110, y);
    y += 5;
  }
  y += 10;

  // ========== INTERPRETACIÓN ==========
  const sections = [
    interpretation.mainTraits,
    interpretation.emotionalNeeds,
    interpretation.emotionalWounds,
    interpretation.unconsciousFears,
    interpretation.relationalDynamics,
    interpretation.repetitivePatterns,
    interpretation.strengths
  ];

  for (const section of sections) {
    doc.addPage();
    y = margin;
    addSubtitle(`${section.icon} ${section.title}`);
    addLine();

    for (const paragraph of section.content) {
      addText(paragraph);
      y += 3;
    }
  }

  // ========== DESCARGO ÉTICO ==========
  doc.addPage();
  y = margin;
  addSubtitle('⚖ Nota Ética');
  addLine();
  addText(therapistConfig.disclaimer, 10);
  y += 10;

  if (therapistConfig.signature) {
    addText(`Firma: ${therapistConfig.signature}`);
  }
  if (therapistConfig.name) {
    addText(`${therapistConfig.name}`);
  }
  if (therapistConfig.registration) {
    addText(`Registro: ${therapistConfig.registration}`);
  }

  // Guardar
  const filename = `AstroAnima_${chart.birthData.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}
