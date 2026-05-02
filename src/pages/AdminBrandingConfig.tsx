import React, { useState, useEffect } from 'react'
import { useAppPreferences } from '../app/providers/AppPreferencesProvider'
import { getBrandingConfig, setBrandingConfig } from '../app/brandingApi'

const defaultBrandingLight = {
  primary: '#1d4ed8',
  secondary: '#f59e42',
  text: '#222',
  background: '#fff',
}
const defaultBrandingDark = {
  primary: '#60a5fa',
  secondary: '#fbbf24',
  text: '#f3f4f6',
  background: '#18181b',
}

export const AdminBrandingConfig: React.FC<{ configId?: string }> = ({ configId }) => {
  const { theme } = useAppPreferences()
  const [openSection, setOpenSection] = useState<'palette' | 'logo' | 'image'>('palette')
  const [paletteLight, setPaletteLight] = useState(defaultBrandingLight)
  const [paletteDark, setPaletteDark] = useState(defaultBrandingDark)
  const [editingMode, setEditingMode] = useState<'light' | 'dark'>('light')
  const [previewMode, setPreviewMode] = useState<'auto' | 'light' | 'dark'>('auto')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    if (!configId) return
    ;(async () => {
      setLoading(true)
      try {
        const data = await getBrandingConfig(configId)
        if (data) {
          setPaletteLight(data.paletteLight)
          setPaletteDark(data.paletteDark)
        } else {
          setPaletteLight(defaultBrandingLight)
          setPaletteDark(defaultBrandingDark)
        }
      } catch {
        setPaletteLight(defaultBrandingLight)
        setPaletteDark(defaultBrandingDark)
      } finally {
        setLoading(false)
      }
    })()
  }, [configId])

  const palette = editingMode === 'light' ? paletteLight : paletteDark
  const setPalette = editingMode === 'light' ? setPaletteLight : setPaletteDark

  const previewPalette =
    previewMode === 'dark'
      ? paletteDark
      : previewMode === 'light'
      ? paletteLight
      : theme === 'dark'
      ? paletteDark
      : paletteLight

  const handleReset = () => {
    setPaletteLight(defaultBrandingLight)
    setPaletteDark(defaultBrandingDark)
  }

  const handleSave = async () => {
    if (!configId) return
    setSaving(true)
    setSaveStatus('idle')
    try {
      await setBrandingConfig(configId, {
        paletteLight,
        paletteDark,
      })
      setSaveStatus('success')
    } catch {
      setSaveStatus('error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 p-4">
      {/* Accordion */}
      <div className="w-full md:w-1/3">
        <button className="w-full text-left py-2 font-bold border-b" onClick={() => setOpenSection('palette')}>
          {openSection === 'palette' ? '\u25bc' : '\u25ba'} Palette colori
        </button>
        {openSection === 'palette' && (
          <div className="flex flex-col gap-4 py-4">
            <div className="flex gap-2 mb-2">
              <button
                aria-pressed={editingMode === 'light'}
                type="button"
                className={`px-3 py-1 rounded font-semibold border ${editingMode === 'light' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100'}`}
                onClick={() => setEditingMode('light')}
              >
                Light
              </button>
              <button
                aria-pressed={editingMode === 'dark'}
                type="button"
                className={`px-3 py-1 rounded font-semibold border ${editingMode === 'dark' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100'}`}
                onClick={() => setEditingMode('dark')}
              >
                Dark
              </button>
            </div>
            <div className="flex gap-2 mb-4">
              <span className="text-xs font-semibold mt-2">Preview:</span>
              <button
                aria-pressed={previewMode === 'auto'}
                type="button"
                className={`px-2 py-1 rounded border text-xs font-semibold ${previewMode === 'auto' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100'}`}
                onClick={() => setPreviewMode('auto')}
              >
                Auto
              </button>
              <button
                aria-pressed={previewMode === 'light'}
                type="button"
                className={`px-2 py-1 rounded border text-xs font-semibold ${previewMode === 'light' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100'}`}
                onClick={() => setPreviewMode('light')}
              >
                Light
              </button>
              <button
                aria-pressed={previewMode === 'dark'}
                type="button"
                className={`px-2 py-1 rounded border text-xs font-semibold ${previewMode === 'dark' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100'}`}
                onClick={() => setPreviewMode('dark')}
              >
                Dark
              </button>
            </div>
            {(['primary', 'secondary', 'text', 'background'] as const).map((key) => (
              <div key={key} className="flex items-center gap-4">
                <label className="w-24 capitalize">{key}</label>
                <input
                  type="color"
                  value={palette[key]}
                  onChange={(e) => setPalette((p) => ({ ...p, [key]: e.target.value }))}
                  className="w-10 h-10 border-none bg-transparent cursor-pointer"
                  aria-label={`Scegli colore ${key}`}
                />
                <input
                  type="text"
                  value={palette[key]}
                  onChange={(e) => setPalette((p) => ({ ...p, [key]: e.target.value }))}
                  className="w-24 border rounded px-2 py-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
            ))}
            <button
              type="button"
              className="mt-4 px-4 py-2 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-semibold"
              onClick={handleReset}
            >
              Reset palette
            </button>
            <button
              type="button"
              className="mt-4 px-4 py-2 rounded bg-blue-600 text-white font-semibold disabled:opacity-60"
              onClick={handleSave}
              disabled={saving || loading || !configId}
            >
              {saving ? 'Salvataggio...' : 'Salva'}
            </button>
            {saveStatus === 'success' && <span className="ml-2 text-emerald-600">Salvato!</span>}
            {saveStatus === 'error' && <span className="ml-2 text-red-600">Errore salvataggio</span>}
            {loading && <span className="ml-2 text-slate-500">Caricamento...</span>}
          </div>
        )}
        <button className="w-full text-left py-2 font-bold border-b" onClick={() => setOpenSection('logo')}>
          {openSection === 'logo' ? '\u25bc' : '\u25ba'} Logo
        </button>
        {openSection === 'logo' && <div className="py-4 text-gray-500">(Upload logo: coming soon)</div>}
        <button className="w-full text-left py-2 font-bold border-b" onClick={() => setOpenSection('image')}>
          {openSection === 'image' ? '\u25bc' : '\u25ba'} Immagine
        </button>
        {openSection === 'image' && <div className="py-4 text-gray-500">(Upload immagine: coming soon)</div>}
      </div>
      {/* Preview: sempre renderizzata, con stato diverso a seconda di configId/loading */}
      <div
        className="w-full md:w-2/3 flex flex-col items-center justify-center bg-gray-50 rounded-lg p-8"
        style={{ background: configId && !loading ? previewPalette.background : undefined }}
        data-testid="palette-preview"
      >
        {!configId && (
          <div className="text-slate-400 text-center text-lg">Seleziona un&apos;agenzia per vedere la preview</div>
        )}
        {configId && loading && (
          <div className="text-slate-400 text-center text-lg">Caricamento...</div>
        )}
        {configId && !loading && (
          <>
            <div className="text-2xl font-bold mb-4" style={{ color: previewPalette.primary }}>
              Preview Agenzia
            </div>
            <div className="w-32 h-32 rounded-full mb-4" style={{ background: previewPalette.secondary }} />
            <div
              className="w-full max-w-md rounded-lg border p-6 shadow bg-white dark:bg-slate-900 mb-4"
              style={{ borderColor: previewPalette.primary }}
            >
              <h3 className="text-lg font-semibold mb-2" style={{ color: previewPalette.primary }}>
                Titolo di esempio
              </h3>
              <p className="mb-4 text-slate-700 dark:text-slate-200" style={{ color: previewPalette.text }}>
                Questo è un paragrafo di esempio. Cambia i colori per vedere l&apos;effetto sulla UI.
              </p>
              <label className="block mb-1 text-sm font-medium" style={{ color: previewPalette.text }}>
                Campo di esempio
              </label>
              <input
                type="text"
                className="w-full rounded border px-3 py-2 mb-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2"
                style={{ borderColor: previewPalette.secondary, color: previewPalette.text }}
                placeholder="Testo di esempio"
              />
              <span className="text-xs" style={{ color: previewPalette.secondary }}>
                Messaggio di esempio
              </span>
            </div>
            <div className="text-lg" style={{ color: previewPalette.text }}>
              Testo di esempio
            </div>
          </>
        )}
      </div>
    </div>
  )
}
