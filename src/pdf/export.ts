/**
 * AstroTherapy Pro — Motor de Exportación PDF v3.0 (Iteración Final)
 *
 * Partes implementadas:
 *   1) Portada premium con logo (sin círculos decorativos)
 *   2) Rueda natal al 82 % del ancho útil
 *   3) Tabla de aspectos con etiquetas ASCII (CONJ/SEXT/CUAD/TRIG/OPOS)
 *   4) Interpretación terapéutica completa (7 secciones)
 *   5) Descargo de responsabilidad profesional
 *   6) Branding AstroTherapy Pro en todo el documento
 *   7) TypeScript limpio — putTotalPages('[TP]') para páginas dinámicas
 *
 * MÓDULOS CONGELADOS: engine.ts · ChartWheel.tsx · BirthDataForm.tsx
 * No modifica ningún cálculo astrológico ni fórmula matemática.
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { NatalChart, TherapistConfig } from '../astronomy/types';
import type { FullInterpretation } from '../interpretation-engine/interpreter';
import { ASPECT_CONFIG } from '../astronomy/types';
import { LOGO_B64, LOGO_ASPECT } from './logo-data';

// ─── Tipos públicos ───────────────────────────────────────────────────────────

export type ExportQuality = 'NORMAL' | 'HIGH';

// ─── Paleta de color (RGB tuples) ─────────────────────────────────────────────

type RGB = [number, number, number];

const C = {
  brandDark:   [12,  5, 28]   as RGB,
  brand:       [26, 10, 46]   as RGB,
  brandMid:    [38, 20, 70]   as RGB,
  accent:      [155,135,245]  as RGB,
  accentLight: [200,168,248]  as RGB,
  textDark:    [ 22, 22, 35]  as RGB,
  textMid:     [ 80, 80,105]  as RGB,
  textLight:   [148,148,170]  as RGB,
  divider:     [218,213,240]  as RGB,
  rowAlt:      [248,246,255]  as RGB,
  tblHdr:      [ 52, 34, 96]  as RGB,
  tblHdrTxt:   [228,218,255]  as RGB,
  angularBg:   [240,236,255]  as RGB,
  gold:        [212,175, 55]  as RGB,
  green:       [ 78,160, 84]  as RGB,
  red:         [210, 65, 50]  as RGB,
  blue:        [ 65,120,200]  as RGB,
  orange:      [215,105, 65]  as RGB,
} as const;

const ASPECT_COLOR: Record<string, RGB> = {
  conjunction: C.gold,
  sextile:     C.green,
  square:      C.red,
  trine:       C.blue,
  opposition:  C.orange,
};

// Etiquetas ASCII — seguras en Windows y Mac con Helvetica
const ASPECT_LABEL: Record<string, string> = {
  conjunction: 'CONJ',
  sextile:     'SEXT',
  square:      'CUAD',
  trine:       'TRIG',
  opposition:  'OPOS',
};

// ─── Constantes de layout A4 (mm) ────────────────────────────────────────────

const W   = 210;
const H   = 297;
const MX  = 18;
const HDR = 13;
const FTR = 12;
const CT  = HDR + 5;
const CB  = H - FTR - 4;

const SIGNS_ES = [
  'Aries','Tauro','Géminis','Cáncer','Leo','Virgo',
  'Libra','Escorpio','Sagitario','Capricornio','Acuario','Piscis',
];

// ─── Helpers de formato ───────────────────────────────────────────────────────

function fmtDate(dateStr: string): string {
  const M = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const p = dateStr.split('-');
  if (p.length !== 3) return dateStr;
  return `${parseInt(p[2], 10)} ${M[parseInt(p[1], 10) - 1]} ${p[0]}`;
}

function fmtLonFull(lon: number): string {
  const n   = ((lon % 360) + 360) % 360;
  const idx = Math.floor(n / 30) % 12;
  const deg = Math.floor(n - idx * 30);
  const min = Math.round((n - idx * 30 - deg) * 60);
  return `${deg}° ${String(min).padStart(2, '0')}' ${SIGNS_ES[idx]}`;
}

function fmtCusp(lon: number): string {
  const n   = ((lon % 360) + 360) % 360;
  const idx = Math.floor(n / 30) % 12;
  const deg = Math.floor(n - idx * 30);
  const min = Math.round((n - idx * 30 - deg) * 60);
  return `${deg}° ${SIGNS_ES[idx]} ${String(min).padStart(2, '0')}'`;
}

function todayStr(): string {
  return new Date().toLocaleDateString('es-MX', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

/** Elimina marcadores de negrita Markdown (**texto**) */
function stripBold(text: string): string {
  return text.replace(/\*\*/g, '');
}

// ─── Clase constructora del PDF ───────────────────────────────────────────────

class AstroTherapyPDF {
  // jspdf se declara como módulo ambiguo (any) en declarations.d.ts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private doc: any;

  constructor() {
    this.doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  }

  // ── Helpers de color ──────────────────────────────────────────────────────

  private tc(c: RGB): void { this.doc.setTextColor(c[0], c[1], c[2]); }
  private fc(c: RGB): void { this.doc.setFillColor(c[0], c[1], c[2]); }
  private dc(c: RGB): void { this.doc.setDrawColor(c[0], c[1], c[2]); }

  private font(style: 'normal' | 'bold' | 'italic', size: number): void {
    this.doc.setFont('helvetica', style);
    this.doc.setFontSize(size);
  }

  private divider(y: number, color: RGB = C.divider, lw = 0.25): void {
    this.dc(color);
    this.doc.setLineWidth(lw);
    this.doc.line(MX, y, W - MX, y);
  }

  // ── Encabezado y pie de página
  // Usa '[TP]' como placeholder; putTotalPages('[TP]') lo sustituye antes de guardar.

  private decorate(title: string, page: number): void {
    const d = this.doc;

    // Banda de encabezado
    this.fc(C.brand);
    d.rect(0, 0, W, HDR, 'F');

    // Franja accent inferior del encabezado
    this.fc(C.accent);
    d.rect(0, HDR - 0.6, W, 0.6, 'F');

    this.font('bold', 8);
    this.tc(C.accentLight);
    d.text('ASTROTHERAPY PRO', MX, 8.8);

    this.font('normal', 7.5);
    this.tc([155, 145, 200] as RGB);
    d.text(title, W / 2, 8.8, { align: 'center' });
    d.text(`${page} / @TP@`, W - MX, 8.8, { align: 'right' });

    // Línea de pie de página
    this.divider(H - FTR + 1, C.divider, 0.2);

    this.font('normal', 6.5);
    this.tc(C.textLight);
    d.text('AstroTherapy Pro  ·  Astrología Psicológica Arquetípica', MX, H - 4.5);
    d.text(todayStr(), W - MX, H - 4.5, { align: 'right' });

    // Reset
    this.tc(C.textDark);
    this.dc([0, 0, 0] as RGB);
    d.setLineWidth(0.2);
  }

  // ── Fondos de filas de tabla ───────────────────────────────────────────────

  private tableRow(y: number, rowH: number, alt: boolean, highlight = false): void {
    if (highlight) {
      this.fc(C.angularBg);
      this.doc.rect(MX, y - rowH + 1, W - MX * 2, rowH, 'F');
    } else if (alt) {
      this.fc(C.rowAlt);
      this.doc.rect(MX, y - rowH + 1, W - MX * 2, rowH, 'F');
    }
  }

  // ─── PARTE 1: Portada premium con logo ───────────────────────────────────

  buildCover(chart: NatalChart, therapistConfig: TherapistConfig): void {
    const d = this.doc;
    this.decorate('Informe Astrológico Terapéutico', 1);

    // ── Banda hero ─────────────────────────────────────────────────────────
    const heroH = 76;
    const heroY = HDR;

    this.fc(C.brandDark);
    d.rect(0, heroY, W, heroH, 'F');

    // Línea accent superior de la banda
    this.fc(C.accent);
    d.rect(0, heroY, W, 0.4, 'F');

    // ── Logo centrado ──────────────────────────────────────────────────────
    // Logo 290×432 px, ratio 0.671 (portrait). LOGO_ASPECT = width/height.
    const logoW = 26;
    const logoH = logoW / LOGO_ASPECT;   // ≈ 38.7 mm
    const logoX = (W - logoW) / 2;
    const logoY = heroY + 7;

    try {
      d.addImage(`data:image/jpeg;base64,${LOGO_B64}`, 'JPEG', logoX, logoY, logoW, logoH);
    } catch (_e) { /* logo render failed — continue */ }

    // ── Título y subtítulo bajo el logo ────────────────────────────────────
    const titleY = logoY + logoH + 5;

    this.font('bold', 17);
    this.tc(C.accentLight);
    d.text('ASTROTHERAPY PRO', W / 2, titleY, { align: 'center' });

    this.font('normal', 8.5);
    this.tc([160, 145, 215] as RGB);
    d.text('Informe Astrológico Terapéutico', W / 2, titleY + 6.5, { align: 'center' });

    // Línea accent inferior de la banda
    this.fc(C.accent);
    d.rect(0, heroY + heroH - 0.4, W, 0.4, 'F');

    // ── Nombre del consultante ─────────────────────────────────────────────
    let y = heroY + heroH + 13;

    this.font('bold', 21);
    this.tc(C.textDark);
    d.text(chart.birthData.name, W / 2, y, { align: 'center' });
    y += 5;

    this.font('normal', 8);
    this.tc(C.textMid);
    d.text('Consultante', W / 2, y, { align: 'center' });
    y += 10;

    this.divider(y, C.divider, 0.3);
    y += 10;

    // ── Cuadrícula de datos ────────────────────────────────────────────────
    const COL_L   = MX + 8;
    const COL_R   = W / 2 + 8;
    const LBL_SZ  = 7;
    const VAL_SZ  = 10;
    const ROW_GAP = 11;

    const rawCity = chart.birthData.city ?? '';
    const cityVal = rawCity.length > 28 ? rawCity.slice(0, 28) + '…' : rawCity;

    // Fila 1: Fecha + Hora
    this.font('bold', LBL_SZ);
    this.tc(C.textLight);
    d.text('FECHA DE NACIMIENTO', COL_L, y);
    d.text('HORA LOCAL', COL_R, y);
    y += 4;
    this.font('normal', VAL_SZ);
    this.tc(C.textDark);
    d.text(fmtDate(chart.birthData.date), COL_L, y);
    d.text(chart.birthData.time, COL_R, y);
    y += ROW_GAP;

    // Fila 2: Lugar + Coordenadas
    this.font('bold', LBL_SZ);
    this.tc(C.textLight);
    d.text('LUGAR DE NACIMIENTO', COL_L, y);
    d.text('COORDENADAS', COL_R, y);
    y += 4;
    this.font('normal', VAL_SZ);
    this.tc(C.textDark);
    d.text(cityVal, COL_L, y);
    d.text(
      `${chart.birthData.latitude.toFixed(3)}°, ${chart.birthData.longitude.toFixed(3)}°`,
      COL_R, y,
    );
    y += ROW_GAP;

    // Fila 3: ASC + MC (con color accent)
    this.font('bold', LBL_SZ);
    this.tc(C.textLight);
    d.text('ASCENDENTE', COL_L, y);
    d.text('MEDIO CIELO', COL_R, y);
    y += 4;
    this.font('bold', VAL_SZ);
    this.tc(C.accent);
    d.text(fmtLonFull(chart.houses.ascendant), COL_L, y);
    d.text(fmtLonFull(chart.houses.midheaven), COL_R, y);
    y += ROW_GAP + 2;

    this.divider(y, C.divider, 0.3);
    y += 10;

    // ── Datos de emisión ───────────────────────────────────────────────────
    this.font('normal', 8.5);
    this.tc(C.textMid);
    d.text(`Fecha de emisión: ${todayStr()}`, W / 2, y, { align: 'center' });
    y += 7;

    if (therapistConfig.name) {
      const reg = therapistConfig.registration
        ? `  ·  Reg. ${therapistConfig.registration}` : '';
      d.text(
        `Elaborado por: ${therapistConfig.name}${reg}`,
        W / 2, y, { align: 'center' },
      );
      y += 7;
    }

    // Metodología
    this.font('normal', 7.5);
    this.tc(C.textLight);
    d.text('Sistema Placidus  ·  Aspectos Mayores', W / 2, y, { align: 'center' });
  }

  // ─── PARTE 2a: Tablas de datos natales ────────────────────────────────────

  buildDataTables(chart: NatalChart): void {
    const d = this.doc;
    d.addPage();
    this.decorate('Datos Natales  ·  Posiciones y Casas', 2);

    let y = CT + 2;
    const rowH = 5.8;

    // ════ Tabla planetaria ════
    this.font('bold', 11);
    this.tc(C.accent);
    d.text('Posiciones Planetarias', MX, y);
    y += 4;
    this.divider(y, C.accent, 0.4);
    y += 5;

    const PC = { name: MX + 1, sign: MX + 27, pos: MX + 66, house: MX + 108, retro: MX + 128 };

    // Encabezado de tabla
    this.fc(C.tblHdr);
    d.rect(MX, y - rowH + 1, W - MX * 2, rowH, 'F');

    this.font('bold', 7.5);
    this.tc(C.tblHdrTxt);
    d.text('PLANETA',  PC.name,  y);
    d.text('SIGNO',    PC.sign,  y);
    d.text('POSICIÓN', PC.pos,   y);
    d.text('CASA',     PC.house, y);
    d.text('R',        PC.retro, y);
    y += rowH;

    chart.planets.forEach((p, i) => {
      this.tableRow(y, rowH, i % 2 === 0);

      this.font('bold', 8);
      this.tc(C.textDark);
      d.text(p.name, PC.name, y);

      this.font('normal', 8);
      this.tc(C.textMid);
      d.text(p.sign, PC.sign, y);

      this.tc(C.textDark);
      d.text(`${p.degree}° ${String(p.minute).padStart(2, '0')}'`, PC.pos, y);
      d.text(`${p.house}`, PC.house, y);

      if (p.retrograde) {
        this.font('bold', 8);
        this.tc(C.red);
        d.text('R', PC.retro, y);
      }

      y += rowH;
    });

    // Filas ASC / MC
    [
      { label: 'Ascendente (ASC)', lon: chart.houses.ascendant },
      { label: 'Medio Cielo (MC)', lon: chart.houses.midheaven },
    ].forEach((ang) => {
      this.tableRow(y, rowH, false, true);
      this.font('bold', 8);
      this.tc(C.brand);
      d.text(ang.label, PC.name, y);
      this.tc(C.accent);
      d.text(fmtCusp(ang.lon), PC.sign, y);
      y += rowH;
    });

    this.divider(y, C.divider);
    y += 10;

    // ════ Cúspides de casas ════
    this.font('bold', 11);
    this.tc(C.accent);
    d.text('Cúspides de Casas — Sistema Placidus', MX, y);
    y += 4;
    this.divider(y, C.accent, 0.4);
    y += 5;

    const half = (W - MX * 2) / 2 - 3;
    const CC_L = { num: MX + 1, pos: MX + 12 };
    const CC_R = { num: MX + half + 7, pos: MX + half + 18 };

    this.fc(C.tblHdr);
    d.rect(MX,            y - rowH + 1, half, rowH, 'F');
    d.rect(MX + half + 6, y - rowH + 1, half, rowH, 'F');

    this.font('bold', 7.5);
    this.tc(C.tblHdrTxt);
    d.text('CASA', CC_L.num, y);
    d.text('POSICIÓN', CC_L.pos, y);
    d.text('CASA', CC_R.num, y);
    d.text('POSICIÓN', CC_R.pos, y);
    y += rowH;

    const ANGULAR = new Set([0, 3, 6, 9]);

    for (let i = 0; i < 6; i++) {
      const isAngL = ANGULAR.has(i);
      const isAngR = ANGULAR.has(i + 6);

      if (isAngL) {
        this.fc(C.angularBg);
        d.rect(MX, y - rowH + 1, half, rowH, 'F');
      } else if (i % 2 === 0) {
        this.fc(C.rowAlt);
        d.rect(MX, y - rowH + 1, half, rowH, 'F');
      }

      if (isAngR) {
        this.fc(C.angularBg);
        d.rect(MX + half + 6, y - rowH + 1, half, rowH, 'F');
      } else if (i % 2 === 0) {
        this.fc(C.rowAlt);
        d.rect(MX + half + 6, y - rowH + 1, half, rowH, 'F');
      }

      this.font(isAngL ? 'bold' : 'normal', 8);
      this.tc(isAngL ? C.accent : C.textDark);
      d.text(`${i + 1}`, CC_L.num, y);
      this.tc(C.textDark);
      d.text(fmtCusp(chart.houses.cusps[i]), CC_L.pos, y);

      this.font(isAngR ? 'bold' : 'normal', 8);
      this.tc(isAngR ? C.accent : C.textDark);
      d.text(`${i + 7}`, CC_R.num, y);
      this.tc(C.textDark);
      d.text(fmtCusp(chart.houses.cusps[i + 6]), CC_R.pos, y);

      y += rowH;
    }

    this.divider(y, C.divider);
  }

  // ─── PARTE 2b: Carta natal — 82 % del ancho útil ─────────────────────────

  async buildChartWheel(scale: number, page: number): Promise<void> {
    const d = this.doc;
    d.addPage();
    this.decorate('Carta Natal', page);

    const element = document.getElementById('chart-wheel');
    if (!element) {
      this.font('italic', 10);
      this.tc(C.textMid);
      d.text(
        'Carta natal no disponible — genere la carta antes de exportar.',
        W / 2, CT + 20, { align: 'center' },
      );
      return;
    }

    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      backgroundColor: '#0d1117',
      logging: false,
      onclone: (_cloneDoc: Document, el: HTMLElement) => {
        el.style.background   = '#0d1117';
        el.style.padding      = '0';
        el.style.border       = 'none';
        el.style.borderRadius = '0';
      },
    });

    const fmt     = scale >= 3 ? 'PNG' : 'JPEG';
    const imgData = scale >= 3
      ? canvas.toDataURL('image/png')
      : canvas.toDataURL('image/jpeg', 0.93);

    const availW = W - MX * 2;
    // Parte 2: 82 % del ancho útil (no limitado por alto)
    const side   = availW * 0.82;
    const imgX   = (W - side) / 2;
    const imgY   = CT + 4;

    this.dc(C.divider);
    d.setLineWidth(0.3);
    d.roundedRect(imgX - 2, imgY - 2, side + 4, side + 4, 2, 2, 'S');

    d.addImage(imgData, fmt, imgX, imgY, side, side);

    this.font('italic', 7.5);
    this.tc(C.textLight);
    d.text(
      'Carta Natal  ·  Sistema Placidus  ·  ' +
      'Aspectos Mayores (conjunción, sextil, cuadratura, trígono, oposición)',
      W / 2, imgY + side + 7, { align: 'center' },
    );
  }

  // ─── PARTE 3: Tabla de aspectos con etiquetas ASCII ──────────────────────

  buildAspects(chart: NatalChart, page: number): number {
    const d = this.doc;
    d.addPage();
    this.decorate('Tabla de Aspectos', page);

    let y = CT + 2;
    const rowH = 5.8;

    this.font('bold', 11);
    this.tc(C.accent);
    d.text('Aspectos Planetarios', MX, y);
    y += 4;
    this.divider(y, C.accent, 0.4);
    y += 5;

    if (chart.aspects.length === 0) {
      this.font('italic', 9);
      this.tc(C.textMid);
      d.text('No se encontraron aspectos significativos.', MX, y);
      return page;
    }

    // Columnas: PLANETA 1 | ASPECTO | TIPO | PLANETA 2 | ORBE
    const AC = { p1: MX + 1, asp: MX + 40, label: MX + 80, p2: MX + 98, orb: MX + 144 };

    this.fc(C.tblHdr);
    d.rect(MX, y - rowH + 1, W - MX * 2, rowH, 'F');

    this.font('bold', 7.5);
    this.tc(C.tblHdrTxt);
    d.text('PLANETA 1', AC.p1,    y);
    d.text('ASPECTO',   AC.asp,   y);
    d.text('TIPO',      AC.label, y);
    d.text('PLANETA 2', AC.p2,    y);
    d.text('ORBE',      AC.orb,   y);
    y += rowH;

    chart.aspects.forEach((asp, i) => {
      if (y > CB - 8) {
        d.addPage();
        page++;
        this.decorate('Aspectos (cont.)', page);
        y = CT + 2;
      }

      this.tableRow(y, rowH, i % 2 === 0);

      const cfg      = ASPECT_CONFIG[asp.type as keyof typeof ASPECT_CONFIG];
      const aspColor = ASPECT_COLOR[asp.type] ?? C.textMid;
      // Etiqueta ASCII — segura en todas las plataformas
      const aspLabel = ASPECT_LABEL[asp.type] ?? asp.type.toUpperCase().slice(0, 4);

      this.font('bold', 8);
      this.tc(C.textDark);
      d.text(asp.planet1, AC.p1, y);

      this.font('normal', 8);
      this.tc(aspColor);
      d.text(cfg?.name ?? asp.type, AC.asp, y);

      this.font('bold', 7.5);
      this.tc(aspColor);
      d.text(aspLabel, AC.label, y);

      this.font('bold', 8);
      this.tc(C.textDark);
      d.text(asp.planet2, AC.p2, y);

      this.font('normal', 8);
      this.tc(C.textMid);
      d.text(`${asp.orb}°`, AC.orb, y);

      y += rowH;
    });

    this.divider(y, C.divider);
    y += 9;

    // Leyenda con etiquetas ASCII
    this.font('bold', 7.5);
    this.tc(C.textMid);
    d.text('Leyenda:', MX, y);
    y += 5;

    const legend: Array<{ name: string; abbr: string; angle: string; color: RGB }> = [
      { name: 'Conjunción',  abbr: 'CONJ', angle: '0°',   color: C.gold   },
      { name: 'Sextil',      abbr: 'SEXT', angle: '60°',  color: C.green  },
      { name: 'Cuadratura',  abbr: 'CUAD', angle: '90°',  color: C.red    },
      { name: 'Trígono',     abbr: 'TRIG', angle: '120°', color: C.blue   },
      { name: 'Oposición',   abbr: 'OPOS', angle: '180°', color: C.orange },
    ];

    const itemW = (W - MX * 2) / legend.length;
    legend.forEach((item, i) => {
      const lx = MX + i * itemW;
      this.fc(item.color);
      d.rect(lx, y - 2.5, 3, 3, 'F');
      this.font('bold', 6.5);
      this.tc(item.color);
      d.text(item.abbr, lx + 4.5, y);
      this.font('normal', 6);
      this.tc(C.textMid);
      d.text(`${item.name} (${item.angle})`, lx + 4.5, y + 3.5);
    });

    return page;
  }

  // ─── PARTE 4: Interpretación terapéutica (7 secciones) ───────────────────

  buildInterpretation(interpretation: FullInterpretation, startPage: number): number {
    const d = this.doc;

    const sections = [
      interpretation.mainTraits,
      interpretation.emotionalNeeds,
      interpretation.emotionalWounds,
      interpretation.unconsciousFears,
      interpretation.relationalDynamics,
      interpretation.repetitivePatterns,
      interpretation.strengths,
    ];

    let page = startPage;
    d.addPage();
    this.decorate('Interpretación Terapéutica', page);
    let y = CT + 2;

    // Encabezado de la sección
    this.font('bold', 13);
    this.tc(C.accent);
    d.text('Interpretación Terapéutica', MX, y);
    y += 4;
    this.divider(y, C.accent, 0.4);
    y += 5;

    this.font('italic', 8.5);
    this.tc(C.textMid);
    const intro =
      'El siguiente análisis integra los elementos de la carta natal desde una perspectiva ' +
      'psicológica arquetípica, orientada al autoconocimiento y el crecimiento personal.';
    const introLines = d.splitTextToSize(intro, W - MX * 2) as string[];
    d.text(introLines, MX, y);
    y += introLines.length * 4.5 + 8;

    for (const section of sections) {
      // Si no queda espacio para el encabezado + al menos una línea, nueva página
      if (y > CB - 32) {
        d.addPage();
        page++;
        this.decorate('Interpretación (cont.)', page);
        y = CT + 4;
      }

      // ── Banda de encabezado de sección ──────────────────────────────────
      this.fc(C.brand);
      d.rect(MX, y - 4.5, W - MX * 2, 9, 'F');

      // Línea accent inferior
      this.fc(C.accent);
      d.rect(MX, y + 4.5, W - MX * 2, 0.35, 'F');

      this.font('bold', 10);
      this.tc(C.accentLight);
      d.text(section.title, MX + 4, y + 0.5);

      // Indicador de intensidad (puntos: rellenos hasta section.intensity)
      const dotsX   = W - MX - 4 - 9 * 3.5;
      const intensity = Math.min(10, Math.max(1, section.intensity));
      for (let k = 0; k < 10; k++) {
        this.fc(k < intensity ? C.accent : C.brandMid);
        d.circle(dotsX + k * 3.5, y - 0.8, 1, 'F');
      }

      y += 12;

      // ── Párrafos de contenido ────────────────────────────────────────────
      for (const paragraph of section.content) {
        const clean = stripBold(paragraph);
        const lines = d.splitTextToSize(clean, W - MX * 2) as string[];

        for (const line of lines) {
          if (y > CB - 6) {
            d.addPage();
            page++;
            this.decorate('Interpretación (cont.)', page);
            y = CT + 4;
          }
          this.font('normal', 8.5);
          this.tc(C.textDark);
          d.text(line, MX, y);
          y += 4.5;
        }

        y += 2.5; // espacio entre párrafos
      }

      y += 9; // espacio entre secciones
    }

    return page;
  }

  // ─── PARTE 5: Descargo de responsabilidad ────────────────────────────────

  buildDisclaimer(therapistConfig: TherapistConfig, page: number): void {
    const d = this.doc;
    d.addPage();
    this.decorate('Aviso Legal y Ético', page);

    let y = CT + 10;

    // Título
    this.font('bold', 15);
    this.tc(C.accent);
    d.text('Aviso y Descargo de Responsabilidad', W / 2, y, { align: 'center' });
    y += 7;
    this.divider(y, C.accent, 0.4);
    y += 12;

    const paragraphs: Array<{ title: string; body: string }> = [
      {
        title: 'Naturaleza del Informe',
        body:
          'Este informe astrológico ha sido elaborado con fines exclusivamente terapéuticos, ' +
          'reflexivos y de autoconocimiento. La astrología psicológica arquetípica es una herramienta ' +
          'simbólica que facilita la comprensión de patrones emocionales, relacionales y existenciales ' +
          'desde una perspectiva integradora y humanista.',
      },
      {
        title: 'Limitaciones y Alcance',
        body:
          'El contenido de este informe no constituye, bajo ninguna circunstancia, un diagnóstico ' +
          'médico, psiquiátrico, psicológico ni pronóstico de ningún tipo. Los elementos presentados ' +
          'deben interpretarse como invitaciones a la reflexión y no como afirmaciones absolutas sobre ' +
          'la personalidad, el comportamiento o el destino del consultante.',
      },
      {
        title: 'Responsabilidad Profesional',
        body:
          'El profesional que emite este informe actúa en el marco de un acompañamiento holístico y ' +
          'simbólico. Se recomienda complementar este trabajo con la atención de profesionales de la ' +
          'salud mental debidamente certificados cuando se identifiquen situaciones que requieran ' +
          'intervención clínica especializada.',
      },
      {
        title: 'Confidencialidad',
        body:
          'La información contenida en este informe es de carácter estrictamente confidencial y ha ' +
          'sido elaborada exclusivamente para el consultante al que se dirige. Queda prohibida su ' +
          'reproducción, distribución o uso sin el consentimiento expreso del profesional emisor y ' +
          'del consultante.',
      },
      {
        title: 'Consentimiento Informado',
        body:
          'La recepción de este informe implica la aceptación de las condiciones aquí descritas. ' +
          'El consultante reconoce haber sido informado del carácter simbólico e interpretativo de ' +
          'la astrología psicológica y de las limitaciones del presente documento.',
      },
    ];

    for (const para of paragraphs) {
      if (y > CB - 32) break; // guardia de seguridad

      this.font('bold', 9.5);
      this.tc(C.accent);
      d.text(para.title, MX, y);
      y += 5;

      const lines = d.splitTextToSize(para.body, W - MX * 2) as string[];
      this.font('normal', 8.5);
      this.tc(C.textDark);
      d.text(lines, MX, y);
      y += lines.length * 4.5 + 9;
    }

    // Bloque de firma (cerca del final de la página)
    const sigY = Math.max(y + 8, CB - 38);

    this.divider(sigY, C.divider, 0.2);
    let sy = sigY + 9;

    this.font('normal', 8);
    this.tc(C.textMid);
    d.text(`Fecha de emisión: ${todayStr()}`, MX, sy);
    sy += 6;

    if (therapistConfig.name) {
      const reg = therapistConfig.registration
        ? `  ·  Reg. ${therapistConfig.registration}` : '';
      d.text(
        `Profesional: ${therapistConfig.name}${reg}`,
        MX, sy,
      );
    }

    // Atribución final
    this.font('italic', 7);
    this.tc(C.textLight);
    d.text(
      'Informe generado con AstroTherapy Pro  ·  Astrología Psicológica Arquetípica',
      W / 2, CB - 4, { align: 'center' },
    );
  }

  // ─── Guardar: sustituye '[TP]' por el total real de páginas ──────────────

  save(filename: string): void {
    this.doc.putTotalPages('@TP@');
    this.doc.save(filename);
  }
}

// ─── Función pública ──────────────────────────────────────────────────────────

/**
 * Genera y descarga el PDF profesional AstroTherapy Pro.
 *
 * @param chart            Carta natal calculada
 * @param interpretation   Interpretación terapéutica completa (7 secciones)
 * @param therapistConfig  Configuración del terapeuta
 * @param quality          NORMAL (scale 2) · HIGH (scale 3, default)
 */
export async function generatePDF(
  chart: NatalChart,
  interpretation: FullInterpretation,
  therapistConfig: TherapistConfig,
  quality: ExportQuality = 'HIGH',
): Promise<void> {
  const scale   = quality === 'HIGH' ? 3 : 2;
  const builder = new AstroTherapyPDF();

  // Página 1: Portada premium con logo
  builder.buildCover(chart, therapistConfig);

  // Página 2: Tablas de datos natales
  builder.buildDataTables(chart);

  // Página 3: Carta natal al 82 % del ancho
  await builder.buildChartWheel(scale, 3);

  // Página 4+: Tabla de aspectos (retorna última página usada)
  let page = builder.buildAspects(chart, 4);

  // Siguientes páginas: Interpretación terapéutica (7 secciones)
  page = builder.buildInterpretation(interpretation, page + 1);

  // Última página: Descargo de responsabilidad
  builder.buildDisclaimer(therapistConfig, page + 1);

  const safe     = chart.birthData.name
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9_\-]/g, '');
  const datePart = new Date().toISOString().split('T')[0];
  builder.save(`AstroTherapy_${safe}_${datePart}.pdf`);
}
