'use client';

import { useRef } from 'react';
import { Upload, Type, Trash2, ChevronUp, ChevronDown, Bold, Italic, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { DesignElement } from './DesignCanvas';

const FONT_FAMILIES = ['Arial', 'Georgia', 'Courier New', 'Impact', 'Verdana', 'Times New Roman', 'Trebuchet MS'];
const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 64, 80];
const PRESET_COLORS = ['#000000', '#ffffff', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280'];

type Props = {
  elements: DesignElement[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUploadImage: (file: File) => void;
  onAddText: () => void;
  onChange: (id: string, attrs: Partial<DesignElement>) => void;
  onDelete: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
};

export default function ToolsPanel({
  elements, selectedId, onSelect, onUploadImage, onAddText, onChange, onDelete, onMoveUp, onMoveDown,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const selected = elements.find(e => e.id === selectedId);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUploadImage(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Actions */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Add Elements</p>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2.5 px-4 py-2.5 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 transition-colors text-sm font-semibold"
          >
            <Upload className="w-4 h-4" />
            Upload Image / Logo
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <button
            onClick={onAddText}
            className="flex items-center gap-2.5 px-4 py-2.5 bg-violet-50 text-violet-700 rounded-xl hover:bg-violet-100 transition-colors text-sm font-semibold"
          >
            <Type className="w-4 h-4" />
            Add Text
          </button>
        </div>
      </div>

      {/* Layers */}
      {elements.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Layers</p>
          <div className="flex flex-col gap-1.5">
            {[...elements].reverse().map((el) => (
              <div
                key={el.id}
                onClick={() => onSelect(el.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-colors ${
                  selectedId === el.id ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <span className="text-base">{el.type === 'image' ? '🖼️' : '📝'}</span>
                <span className="text-sm font-medium text-gray-700 flex-1 truncate">
                  {el.type === 'text' ? (el.text || 'Text') : 'Image'}
                </span>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                  <button onClick={() => onMoveUp(el.id)} className="w-6 h-6 flex items-center justify-center hover:bg-gray-200 rounded">
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button onClick={() => onMoveDown(el.id)} className="w-6 h-6 flex items-center justify-center hover:bg-gray-200 rounded">
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  <button onClick={() => onDelete(el.id)} className="w-6 h-6 flex items-center justify-center hover:bg-red-100 text-red-500 rounded">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Text Properties (shown when text element selected) */}
      {selected?.type === 'text' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Text Properties</p>

          {/* Text content */}
          <textarea
            value={selected.text ?? ''}
            onChange={e => onChange(selected.id, { text: e.target.value })}
            rows={2}
            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:border-indigo-400"
            placeholder="Enter text..."
          />

          {/* Font family */}
          <select
            value={selected.fontFamily ?? 'Arial'}
            onChange={e => onChange(selected.id, { fontFamily: e.target.value })}
            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-400"
          >
            {FONT_FAMILIES.map(f => <option key={f} value={f}>{f}</option>)}
          </select>

          {/* Font size */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-14 flex-shrink-0">Size</span>
            <select
              value={selected.fontSize ?? 24}
              onChange={e => onChange(selected.id, { fontSize: Number(e.target.value) })}
              className="flex-1 text-sm border border-gray-200 rounded-xl px-2 py-1.5 focus:outline-none focus:border-indigo-400"
            >
              {FONT_SIZES.map(s => <option key={s} value={s}>{s}px</option>)}
            </select>
          </div>

          {/* Style + Align */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onChange(selected.id, { fontStyle: selected.fontStyle?.includes('bold') ? selected.fontStyle.replace('bold', '').trim() || 'normal' : `bold ${selected.fontStyle ?? 'normal'}`.trim() })}
              className={`flex-1 flex items-center justify-center py-1.5 rounded-lg border text-sm transition-colors ${(selected.fontStyle ?? '').includes('bold') ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 hover:bg-gray-50'}`}
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onChange(selected.id, { fontStyle: selected.fontStyle?.includes('italic') ? selected.fontStyle.replace('italic', '').trim() || 'normal' : `${selected.fontStyle ?? 'normal'} italic`.trim() })}
              className={`flex-1 flex items-center justify-center py-1.5 rounded-lg border text-sm transition-colors ${(selected.fontStyle ?? '').includes('italic') ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 hover:bg-gray-50'}`}
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            {(['left', 'center', 'right'] as const).map((a) => (
              <button
                key={a}
                onClick={() => onChange(selected.id, { align: a })}
                className={`flex-1 flex items-center justify-center py-1.5 rounded-lg border text-sm transition-colors ${(selected.align ?? 'left') === a ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 hover:bg-gray-50'}`}
              >
                {a === 'left' ? <AlignLeft className="w-3.5 h-3.5" /> : a === 'center' ? <AlignCenter className="w-3.5 h-3.5" /> : <AlignRight className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>

          {/* Color */}
          <div>
            <p className="text-xs text-gray-500 mb-2">Color</p>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => onChange(selected.id, { fill: c })}
                  style={{ backgroundColor: c }}
                  className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${(selected.fill ?? '#000000') === c ? 'border-indigo-500 scale-110' : 'border-gray-200'}`}
                />
              ))}
            </div>
            <input
              type="color"
              value={selected.fill ?? '#000000'}
              onChange={e => onChange(selected.id, { fill: e.target.value })}
              className="w-full h-8 rounded-lg border border-gray-200 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Delete selected */}
      {selectedId && (
        <button
          onClick={() => onDelete(selectedId)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors text-sm font-semibold"
        >
          <Trash2 className="w-4 h-4" />
          Delete Selected
        </button>
      )}
    </div>
  );
}
