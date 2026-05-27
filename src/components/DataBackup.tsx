/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  Download, 
  UploadCloud, 
  FileSpreadsheet, 
  FileCode, 
  Check, 
  AlertTriangle, 
  Info 
} from 'lucide-react';
import { Transaction, AppState } from '../types';
import { formatCurrency } from '../initialData';

interface DataBackupProps {
  appState: AppState;
  onRestoreState: (restoreState: AppState) => void;
  onAppendTransactions: (txs: Transaction[]) => void;
}

export const DataBackup: React.FC<DataBackupProps> = ({
  appState,
  onRestoreState,
  onAppendTransactions
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [importStatus, setImportStatus] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Download generic helper
  const downloadFile = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 1. Export JSON Backup
  const handleExportJSON = () => {
    const raw = JSON.stringify(appState, null, 2);
    downloadFile(raw, `Savia_Respaldo_Completo_${appState.currentMonth}.json`, 'application/json');
  };

  // 2. Export CSV Movements
  const handleExportCSV = () => {
    const headers = 'Fecha,Tipo,Categoria,Descripcion,Monto,Nota';
    const rows = appState.transactions.map(t => {
      // Escape strings in quotes
      const escDesc = `"${t.desc.replace(/"/g, '""')}"`;
      const escNote = t.note ? `"${t.note.replace(/"/g, '""')}"` : '""';
      return [t.date, t.type, t.cat, escDesc, t.amount, escNote].join(',');
    });

    const csvContent = [headers, ...rows].join('\n');
    downloadFile(csvContent, `Savia_Movimientos_${appState.currentMonth}.csv`, 'text/csv;charset=utf-8;');
  };

  // Generic File Parser
  const parseAndApplyFile = (file: File) => {
    const reader = new FileReader();
    
    if (file.name.endsWith('.json')) {
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target?.result as string);
          if (parsed && typeof parsed === 'object' && Array.isArray(parsed.transactions)) {
            if (confirm('¿Deseas restaurar todo el respaldo del sistema? Esto sustituirá la configuración, categorías, metas y presupuestos actuales.')) {
              onRestoreState(parsed as AppState);
              setImportStatus({ type: 'ok', text: 'Respaldo JSON completo restaurado exitosamente en el sistema.' });
            }
          } else {
            setImportStatus({ type: 'err', text: 'Error: El formato de archivo JSON no parece ser un respaldo compatible de Savia.' });
          }
        } catch (err) {
          setImportStatus({ type: 'err', text: 'Error al interpretar el código JSON. Verifica que no esté corrupto.' });
        }
      };
      reader.readAsText(file);
    } 
    
    else if (file.name.endsWith('.csv')) {
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
          if (lines.length < 2) {
            setImportStatus({ type: 'err', text: 'Error: El archivo CSV está vacío o carece de registros fijos.' });
            return;
          }

          // Headers checks
          const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
          const dateIdx = headers.indexOf('fecha');
          const typeIdx = headers.indexOf('tipo');
          const catIdx = headers.indexOf('categoria');
          const descIdx = headers.indexOf('descripcion');
          const amtIdx = headers.indexOf('monto');
          const noteIdx = headers.indexOf('nota');

          if (dateIdx === -1 || typeIdx === -1 || catIdx === -1 || descIdx === -1 || amtIdx === -1) {
            setImportStatus({ 
              type: 'err', 
              text: 'Formato de columnas no compatible. Se esperan: fecha, tipo, categoria, descripcion, monto, nota' 
            });
            return;
          }

          const parsedList: Transaction[] = [];
          
          for (let i = 1; i < lines.length; i++) {
            // Match comma values while respecting inner quote strings
            const matches = lines[i].match(/(".*?"|[^,]+)(?=,|$)/g) || lines[i].split(',');
            const clean = (val: string) => (val || '').replace(/^"|"$/g, '').trim();

            const date = clean(matches[dateIdx]);
            const type = clean(matches[typeIdx]) as 'income' | 'expense';
            const cat = clean(matches[catIdx]);
            const desc = clean(matches[descIdx]);
            const amtParsed = parseFloat(clean(matches[amtIdx]));
            const note = noteIdx !== -1 ? clean(matches[noteIdx]) : undefined;

            if (!date || !['income', 'expense'].includes(type) || !cat || !desc || isNaN(amtParsed)) {
              continue; // skip corrupt row
            }

            parsedList.push({
              id: `csv-${Date.now()}-${i}-${Math.floor(Math.random() * 1000)}`,
              type,
              cat,
              desc,
              amount: amtParsed,
              date,
              note: note || undefined
            });
          }

          if (parsedList.length === 0) {
            setImportStatus({ type: 'err', text: 'No se encontraron movimientos válidos para incorporar.' });
          } else {
            if (confirm(`Se encontraron ${parsedList.length} movimientos válidos en el CSV. ¿Deseas incorporarlos a tu historial vigente?`)) {
              onAppendTransactions(parsedList);
              setImportStatus({ type: 'ok', text: `¡Éxito! Inyectados ${parsedList.length} registros contables a tu bitácora.` });
            }
          }
        } catch (err) {
          setImportStatus({ type: 'err', text: 'Error al interpretar el archivo CSV. Verifica las comas y comillas.' });
        }
      };
      reader.readAsText(file);
    } 
    
    else {
      setImportStatus({ type: 'err', text: 'Tipo de archivo no soportado. Sube archivos .json o .csv' });
    }
  };

  // Drag listeners
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      parseAndApplyFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      parseAndApplyFile(e.target.files[0]);
    }
  };

  return (
    <div id="data-backup-panel" className="animate-fade-in space-y-6">
      
      {/* HEADER ROW */}
      <div>
        <h2 id="backup-title" className="font-display text-2xl md:text-3xl font-semibold text-brand-charcoal leading-tight">
          Importar y Exportar Datos
        </h2>
        <p id="backup-subtitle" className="text-xs md:text-sm text-brand-gray mt-1">
          Protege tus progresos con respaldos periódicos locales, o migra desde hojas de cálculo externas.
        </p>
      </div>

      <div id="backup-grid-dual" className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* EXPORT SIDE CARD */}
        <div id="export-card" className="bg-white border border-[#EBE7DF] rounded-2.5xl p-5 md:p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div>
            <h3 className="font-sans text-xs underline decoration-brand-amber text-brand-charcoal font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
              <Download className="w-4.5 h-4.5 text-brand-green" />
              Respaldar y Descargar
            </h3>
            <p className="text-xs text-brand-gray leading-relaxed">
              Conserva una copia de tus configuraciones, sueños activos, metas mensuales y registros en tu computadora personal para resguardo absoluto.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleExportJSON}
              className="flex-1 bg-brand-charcoal hover:bg-neutral-800 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileCode className="w-4 h-4 text-brand-amber" />
              Respaldar Base JSON
            </button>
            <button
              onClick={handleExportCSV}
              className="flex-1 border border-[#EBE7DF] hover:bg-[#FAF9F6] text-brand-charcoal font-semibold text-xs px-4 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-brand-green" />
              Exportar Transacciones CSV
            </button>
          </div>
        </div>

        {/* IMPORT SIDE CARD */}
        <div id="import-card" className="bg-white border border-[#EBE7DF] rounded-2.5xl p-5 md:p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div>
            <h3 className="font-sans text-xs underline decoration-brand-amber text-brand-charcoal font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
              <UploadCloud className="w-4.5 h-4.5 text-brand-green" />
              Restaurar / Importar Archivos
            </h3>
            <p className="text-xs text-brand-gray leading-relaxed mb-4">
              Carga tu base JSON previa para reanudar tus metas o incorpora transacciones desde un libro de Excel en formato CSV.
            </p>
            
            {/* Drag Zone */}
            <div
              id="drop-zone-container"
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                dragActive 
                  ? 'border-brand-charcoal bg-[#F2EDE4]/60' 
                  : 'border-[#EBE7DF] bg-[#FAF9F6] hover:bg-[#F2EDE4]/30'
              }`}
            >
              <UploadCloud className="w-8 h-8 text-brand-light-gray mx-auto mb-1.5" />
              <p className="text-[11px] font-bold text-brand-charcoal">Arrastra tu archivo aquí o haz clic para buscar</p>
              <span className="text-[9px] text-brand-light-gray uppercase font-mono tracking-wider">Soporta: .csv · .json</span>
              <input 
                ref={fileInputRef}
                type="file"
                accept=".csv,.json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Parse result messages */}
            {importStatus && (
              <div id="import-log-message" className={`mt-3 p-3 text-[10px] leading-relaxed rounded-lg flex items-start gap-2 font-semibold ${
                importStatus.type === 'ok' 
                  ? 'bg-brand-green-light border border-brand-green/30 text-brand-green' 
                  : 'bg-brand-red-light border border-brand-red/35 text-brand-red'
              }`}>
                {importStatus.type === 'ok' ? (
                  <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                )}
                <p>{importStatus.text}</p>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* CSV FORMAT COMPLIANCE CARD */}
      <div id="csv-instructions-card" className="bg-white border border-[#EBE7DF] rounded-2xl p-5 shadow-xs font-sans">
        <h4 className="text-xs font-bold text-brand-charcoal uppercase tracking-widest mb-3">
          Estándar CSV Soportado para Reemplazos:
        </h4>
        <p className="text-[11px] text-brand-gray leading-relaxed mb-3">
          Si vas a importar tus movimientos contables desde una plantilla de Excel o Google Sheets, asegúrate de guardarla en codificación UTF-8 con las siguientes cabeceras textuales en minúsculas en la primera fila:
        </p>
        <code className="block p-3.5 bg-[#FAF9F6] border border-[#EBE7DF] rounded-lg text-[10px] text-brand-charcoal font-mono leading-relaxed overflow-x-auto">
          Fecha,Tipo,Categoria,Descripcion,Monto,Nota<br />
          2026-05-10,income,Sueldo,Pago quincenal,15000,Depósito bancario regular<br />
          2026-05-12,expense,Alimentación,Súper de la semana,1750,Compra en el supermercado
        </code>
      </div>

    </div>
  );
};
