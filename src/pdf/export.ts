/**
 * AstroTherapy Pro — Motor de Exportación PDF v2.0
 * Etapas 1–3: Portada · Tablas de datos · Carta natal
 *
 * MÓDULOS CONGELADOS: engine.ts · ChartWheel.tsx · BirthDataForm.tsx
 * No modifica ningún cálculo astrológico.
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { NatalChart, TherapistConfig } from '../astronomy/types';
import type { FullInterpretation } from '../interpretation-engine/interpreter';
import { ASPECT_CONFIG } from '../astronomy/types';

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

// ─── Clase constructora del PDF ───────────────────────────────────────────────

class AstroTherapyPDF {
  // jspdf is declared as ambient module (any) in declarations.d.ts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private doc: any;

  constructor() {
    this.doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  }

  // ── Color helpers ─────────────────────────────────────────────────────────

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

  // ── Header + footer ───────────────────────────────────────────────────────

  private decorate(title: string, page: number, total: number): void {
    const d = this.doc;

    // Header band
    this.fc(C.brand);
    d.rect(0, 0, W, HDR, 'F');

    // Accent strip
    this.fc(C.accent);
    d.rect(0, HDR - 0.6, W, 0.6, 'F');

    this.font('bold', 8);
    this.tc(C.accentLight);
    d.text('ASTROTHERAPY PRO', MX, 8.8);

    this.font('normal', 7.5);
    this.tc([155, 145, 200] as RGB);
    d.text(title, W / 2, 8.8, { align: 'center' });
    d.text(`${page} / ${total}`, W - MX, 8.8, { align: 'right' });

    // Footer line
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

  // ── Table row backgrounds ─────────────────────────────────────────────────

  private tableRow(y: number, rowH: number, alt: boolean, highlight = false): void {
    if (highlight) {
      this.fc(C.angularBg);
      this.doc.rect(MX, y - rowH + 1, W - MX * 2, rowH, 'F');
    } else if (alt) {
      this.fc(C.rowAlt);
      this.doc.rect(MX, y - rowH + 1, W - MX * 2, rowH, 'F');
    }
  }

  // ─── PÁGINA 1: Portada ────────────────────────────────────────────────────

  buildCover(chart: NatalChart, therapistConfig: TherapistConfig, total: number): void {
    const d = this.doc;
    this.decorate('Informe de Carta Natal', 1, total);

    // Hero band
    const heroH = 72;
    const heroY = HDR;
    this.fc(C.brandDark);
    d.rect(0, heroY, W, heroH, 'F');

    // Decorative concentric circles
    this.dc(C.accent);
    d.setLineWidth(0.25);
    d.circle(W / 2, heroY + heroH / 2, 26, 'S');
    this.dc(C.brandMid);
    d.setLineWidth(0.15);
    d.circle(W / 2, heroY + heroH / 2, 20, 'S');
    d.circle(W / 2, heroY + heroH / 2, 14, 'S');

    // Cross lines
    d.setLineWidth(0.1);
    const cx = W / 2;
    const cy = heroY + heroH / 2;
    d.line(cx - 26, cy, cx + 26, cy);
    d.line(cx, cy - 26, cx, cy + 26);

    // Title
    this.font('bold', 24);
    this.tc(C.accentLight);
    d.text('AstroTherapy Pro', W / 2, heroY + 16, { align: 'center' });

    this.font('normal', 9.5);
    this.tc([160, 145, 215] as RGB);
    d.text('Astrología Psicológica Arquetípica', W / 2, heroY + 24, { align: 'center' });

    this.font('bold', 14);
    this.tc([232, 224, 255] as RGB);
    d.text('Informe de Carta Natal', W / 2, heroY + 50, { align: 'center' });

    this.font('normal', 8.5);
    this.tc([148, 135, 200] as RGB);
    d.text('Sistema Placidus  ·  Aspectos Mayores', W / 2, heroY + 58, { align: 'center' });

    // Consultant name
    let y = heroY + heroH + 16;

    this.font('bold', 20);
    this.tc(C.textDark);
    d.text(chart.birthData.name, W / 2, y, { align: 'center' });
    y += 9;

    this.divider(y, C.divider, 0.3);
    y += 8;

    // Data grid — 2 columns
    const COL_L = MX + 8;
    const COL_R = W / 2 + 6;
    const LBL_SZ = 7.5;
    const VAL_SZ = 11;
    const ROW_GAP = 10;

    const rawCity = chart.birthData.city ?? '';
    const cityVal = rawCity.length > 26 ? rawCity.slice(0, 26) + '…' : rawCity;

    const grid: Array<[string, string, string, string]> = [
      ['FECHA DE NACIMIENTO', fmtDate(chart.birthData.date),
       'HORA LOCAL', chart.birthData.time],
      ['LUGAR DE NACIMIENTO', cityVal,
       'COORDENADAS',
       `${chart.birthData.latitude.toFixed(3)}°, ${chart.birthData.longitude.toFixed(3)}°`],
    ];

    for (const [lbl1, val1, lbl2, val2] of grid) {
      this.font('bold', LBL_SZ);
      this.tc(C.textLight);
      d.text(lbl1, COL_L, y);
      d.text(lbl2, COL_R, y);
      y += 4.5;
      this.font('normal', VAL_SZ);
      this.tc(C.textDark);
      d.text(val1, COL_L, y);
      d.text(val2, COL_R, y);
      y += ROW_GAP;
    }

    // ASC / MC
    this.font('bold', LBL_SZ);
    this.tc(C.textLight);
    d.text('ASCENDENTE', COL_L, y);
    d.text('MEDIO CIELO', COL_R, y);
    y += 4.5;

    this.font('bold', VAL_SZ);
    this.tc(C.accent);
    d.text(fmtLonFull(chart.houses.ascendant), COL_L, y);
    d.text(fmtLonFull(chart.houses.midheaven), COL_R, y);
    y += ROW_GAP + 2;

    this.divider(y, C.divider, 0.3);
    y += 9;

    // Emission date
    this.font('normal', 8.5);
    this.tc(C.textMid);
    d.text(`Fecha de emisión: ${todayStr()}`, W / 2, y, { align: 'center' });
    y += 6;

    if (therapistConfig.name) {
      const reg = therapistConfig.registration
        ? `  ·  Reg. ${therapistConfig.registration}` : '';
      d.text(
        `Elaborado por: ${therapistConfig.name}${reg}`,
        W / 2, y, { align: 'center' },
      );
    }

    // Ethical disclaimer near footer
    const discY = H - FTR - 22;
    this.divider(discY - 2, [210, 205, 230] as RGB, 0.2);
    this.font('italic', 7);
    this.tc(C.textLight);
    const disc =
      'Este informe tiene fines terapéuticos y de autoconocimiento. ' +
      'No constituye diagnóstico médico, psicológico ni pronóstico de ningún tipo.';
    const discLines = d.splitTextToSize(disc, W - MX * 2 - 10) as string[];
    d.text(discLines, W / 2, discY + 4, { align: 'center' });
  }

  // ─── PÁGINA 2: Tablas de datos ────────────────────────────────────────────

  buildDataTables(chart: NatalChart, total: number): void {
    const d = this.doc;
    d.addPage();
    this.decorate('Datos Natales  ·  Posiciones y Casas', 2, total);

    let y = CT + 2;
    const rowH = 5.8;

    // ════ Tabla planetaria ════
    this.font('bold', 11);
    this.tc(C.accent);
    d.text('Posiciones Planetarias', MX, y);
    y += 4;
    this.divider(y, C.accent, 0.4);
    y += 5;

    // Column positions
    const PC = { name: MX + 1, sign: MX + 27, pos: MX + 66, house: MX + 108, retro: MX + 128 };

    // Header row
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

    // ASC / MC rows
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

    // Two-column layout
    const half = (W - MX * 2) / 2 - 3;
    const CC_L = { num: MX + 1, pos: MX + 12 };
    const CC_R = { num: MX + half + 7, pos: MX + half + 18 };

    // Headers
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

  // ─── PÁGINA 3: Carta natal (html2canvas) ─────────────────────────────────

  async buildChartWheel(scale: number, total: number): Promise<void> {
    const d = this.doc;
    d.addPage();
    this.decorate('Carta Natal', 3, total);

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
    const availH = CB - CT - 14;
    const side   = Math.min(availW, availH);
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

  // ─── PÁGINA 4: Tabla de aspectos ─────────────────────────────────────────

  buildAspects(chart: NatalChart, pageStart: number, total: number): void {
    const d = this.doc;
    d.addPage();
    let page = pageStart;
    this.decorate('Tabla de Aspectos', page, total);

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
      return;
    }

    const AC = { p1: MX + 1, asp: MX + 38, sym: MX + 74, p2: MX + 84, orb: MX + 124 };

    this.fc(C.tblHdr);
    d.rect(MX, y - rowH + 1, W - MX * 2, rowH, 'F');

    this.font('bold', 7.5);
    this.tc(C.tblHdrTxt);
    d.text('PLANETA 1', AC.p1,  y);
    d.text('ASPECTO',   AC.asp, y);
    d.text('SÍM',       AC.sym, y);
    d.text('PLANETA 2', AC.p2,  y);
    d.text('ORBE',      AC.orb, y);
    y += rowH;

    chart.aspects.forEach((asp, i) => {
      if (y > CB - 8) {
        d.addPage();
        page++;
        this.decorate('Aspectos (cont.)', page, total);
        y = CT + 2;
      }

      this.tableRow(y, rowH, i % 2 === 0);

      const cfg      = ASPECT_CONFIG[asp.type as keyof typeof ASPECT_CONFIG];
      const aspColor = ASPECT_COLOR[asp.type] ?? C.textMid;

      this.font('bold', 8);
      this.tc(C.textDark);
      d.text(asp.planet1, AC.p1, y);

      this.font('normal', 8);
      this.tc(aspColor);
      d.text(cfg?.name ?? asp.type, AC.asp, y);
      d.text(cfg?.symbol ?? '', AC.sym, y);

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

    // Leyenda
    this.font('bold', 7.5);
    this.tc(C.textMid);
    d.text('Leyenda:', MX, y);
    y += 5;

    const legend: Array<{ label: string; color: RGB }> = [
      { label: 'Conjunción (0°)',  color: C.gold   },
      { label: 'Sextil (60°)',     color: C.green  },
      { label: 'Cuadratura (90°)', color: C.red    },
      { label: 'Trígono (120°)',   color: C.blue   },
      { label: 'Oposición (180°)', color: C.orange },
    ];

    const itemW = (W - MX * 2) / legend.length;
    legend.forEach((item, i) => {
      this.fc(item.color);
      d.rect(MX + i * itemW, y - 2.5, 3, 3, 'F');
      this.font('normal', 7);
      this.tc(C.textMid);
      d.text(item.label, MX + i * itemW + 5, y);
    });
  }

  // ─── Guardar ──────────────────────────────────────────────────────────────

  save(filename: string): void {
    this.doc.save(filename);
  }
}

// ─── Función pública ──────────────────────────────────────────────────────────

/**
 * Genera y descarga el PDF profesional AstroTherapy Pro.
 * Etapas 1–3 implementadas; interpretación (Etapa 4) pendiente de autorización.
 *
 * @param chart            Carta natal calculada
 * @param _interpretation  Reservado para Etapa 4 (no usado aún)
 * @param therapistConfig  Configuración del terapeuta
 * @param quality          NORMAL (scale 2) · HIGH (scale 3, default)
 */
export async function generatePDF(
  chart: NatalChart,
  _interpretation: FullInterpretation,
  therapistConfig: TherapistConfig,
  quality: ExportQuality = 'HIGH',
): Promise<void> {
  const scale   = quality === 'HIGH' ? 3 : 2;
  const TOTAL   = 4;
  const builder = new AstroTherapyPDF();

  builder.buildCover(chart, therapistConfig, TOTAL);
  builder.buildDataTables(chart, TOTAL);
  await builder.buildChartWheel(scale, TOTAL);
  builder.buildAspects(chart, 4, TOTAL);

  const safe     = chart.birthData.name
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9_\-]/g, '');
  const datePart = new Date().toISOString().split('T')[0];
  builder.save(`AstroTherapy_${safe}_${datePart}.pdf`);
}
