import React, { useState, useEffect, useRef } from 'react'
import { useAppPreferences } from '../app/providers/AppPreferencesProvider'
import { getBrandingConfig, setBrandingConfig, uploadBrandingImage, deleteBrandingImage } from '../app/brandingApi'

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

  // Image state: pendingFile for local preview, url for persisted remote URL
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null)
  const [logoPendingFile, setLogoPendingFile] = useState<File | null>(null)
  const [coverPendingFile, setCoverPendingFile] = useState<File | null>(null)
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null)
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null)
  const [logoUploading, setLogoUploading] = useState(false)
  const [coverUploading, setCoverUploading] = useState(false)
  const [logoError, setLogoError] = useState<string | null>(null)
  const [coverError, setCoverError] = useState<string | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const logoPendingRef = useRef<File | null>(null)
  const coverPendingRef = useRef<File | null>(null)

  useEffect(() => {
    if (!configId) return
    let cancelled = false
    ;(async () => {
      // Reset pending files and previews when agency changes
      logoPendingRef.current = null
      coverPendingRef.current = null
      setLogoPendingFile(null)
      setCoverPendingFile(null)
      setLogoPreviewUrl(null)
      setCoverPreviewUrl(null)
      setLogoUrl(null)
      setCoverImageUrl(null)
      setLoading(true)
      try {
        const data = await getBrandingConfig(configId)
        if (cancelled) return
        if (data) {
          setPaletteLight(data.paletteLight)
          setPaletteDark(data.paletteDark)
          setLogoUrl(data.logoUrl ?? null)
          if (!logoPendingRef.current) setLogoPreviewUrl(data.logoUrl ?? null)
          setCoverImageUrl(data.coverImageUrl ?? null)
          if (!coverPendingRef.current) setCoverPreviewUrl(data.coverImageUrl ?? null)
        } else {
          setPaletteLight(defaultBrandingLight)
          setPaletteDark(defaultBrandingDark)
        }
      } catch {
        if (cancelled) return
        setPaletteLight(defaultBrandingLight)
        setPaletteDark(defaultBrandingDark)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
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
      // Upload pending image files to Storage first
      let finalLogoUrl = logoUrl
      let finalCoverUrl = coverImageUrl
      if (logoPendingFile) {
        setLogoUploading(true)
        finalLogoUrl = await uploadBrandingImage(configId, 'logo', logoPendingFile)
        setLogoUrl(finalLogoUrl)
        setLogoPendingFile(null)
        setLogoUploading(false)
      }
      if (coverPendingFile) {
        setCoverUploading(true)
        finalCoverUrl = await uploadBrandingImage(configId, 'coverImage', coverPendingFile)
        setCoverImageUrl(finalCoverUrl)
        setCoverPendingFile(null)
        setCoverUploading(false)
      }
      await setBrandingConfig(configId, {
        paletteLight,
        paletteDark,
        logoUrl: finalLogoUrl ?? undefined,
        coverImageUrl: finalCoverUrl ?? undefined,
      })
      setSaveStatus('success')
    } catch {
      setSaveStatus('error')
      setLogoUploading(false)
      setCoverUploading(false)
    } finally {
      setSaving(false)
    }
  }

  const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !configId) return
    if (file.size > MAX_FILE_SIZE) {
      setLogoError('File troppo grande (max 2MB)')
      return
    }
    setLogoError(null)
    if (logoPreviewUrl && logoPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(logoPreviewUrl)
    }
    const previewUrl = URL.createObjectURL(file)
    setLogoPreviewUrl(previewUrl)
    setLogoPendingFile(file)
    logoPendingRef.current = file
  }

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !configId) return
    if (file.size > MAX_FILE_SIZE) {
      setCoverError('File troppo grande (max 2MB)')
      return
    }
    setCoverError(null)
    if (coverPreviewUrl && coverPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(coverPreviewUrl)
    }
    const previewUrl = URL.createObjectURL(file)
    setCoverPreviewUrl(previewUrl)
    setCoverPendingFile(file)
    coverPendingRef.current = file
  }

  const handleDeleteLogo = async () => {
    if (!configId) return
    if (logoPreviewUrl?.startsWith('blob:')) URL.revokeObjectURL(logoPreviewUrl)
    setLogoPreviewUrl(null)
    setLogoPendingFile(null)
    logoPendingRef.current = null
    setLogoUrl(null)
    if (logoInputRef.current) logoInputRef.current.value = ''
    if (logoUrl) {
      try {
        await deleteBrandingImage(configId, 'logo')
      } catch { /* ignore */ }
    }
  }

  const handleDeleteCover = async () => {
    if (!configId) return
    if (coverPreviewUrl?.startsWith('blob:')) URL.revokeObjectURL(coverPreviewUrl)
    setCoverPreviewUrl(null)
    setCoverPendingFile(null)
    coverPendingRef.current = null
    setCoverImageUrl(null)
    if (coverInputRef.current) coverInputRef.current.value = ''
    if (coverImageUrl) {
      try {
        await deleteBrandingImage(configId, 'coverImage')
      } catch { /* ignore */ }
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
        {openSection === 'logo' && (
          <div className="flex flex-col gap-4 py-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Carica il logo dell&apos;agenzia (PNG, SVG, JPG — max 2MB).
            </p>
            {logoPreviewUrl && (
              <div className="flex flex-col items-start gap-2">
                <img
                  src={logoPreviewUrl}
                  alt="Logo anteprima"
                  className="max-h-24 max-w-full rounded border border-slate-300 dark:border-slate-600 object-contain bg-white p-1"
                  data-testid="logo-preview"
                />
              </div>
            )}
            <div className="flex items-center gap-3 flex-wrap">
              <label className={`cursor-pointer px-4 py-2 rounded font-semibold text-sm border ${configId ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' : 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed'}`}>
                {logoUploading ? 'Caricamento...' : 'Carica logo'}
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/svg+xml,image/jpeg,image/webp"
                  className="hidden"
                  disabled={!configId || logoUploading}
                  onChange={handleLogoUpload}
                  data-testid="logo-upload-input"
                />
              </label>
              {logoPreviewUrl && (
                <button
                  type="button"
                  className="px-3 py-2 rounded text-sm font-semibold border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                  onClick={handleDeleteLogo}
                  disabled={logoUploading}
                  data-testid="logo-delete-btn"
                >
                  Rimuovi
                </button>
              )}
            </div>
            {logoError && <p className="text-xs text-red-500">{logoError}</p>}
          </div>
        )}
        <button className="w-full text-left py-2 font-bold border-b" onClick={() => setOpenSection('image')}>
          {openSection === 'image' ? '\u25bc' : '\u25ba'} Immagine
        </button>
        {openSection === 'image' && (
          <div className="flex flex-col gap-4 py-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Carica la cover image dell&apos;agenzia (PNG, JPG, WebP — max 2MB).
            </p>
            {coverPreviewUrl && (
              <div className="flex flex-col items-start gap-2">
                <img
                  src={coverPreviewUrl}
                  alt="Cover image anteprima"
                  className="max-h-40 max-w-full rounded border border-slate-300 dark:border-slate-600 object-cover"
                  data-testid="cover-preview"
                />
              </div>
            )}
            <div className="flex items-center gap-3 flex-wrap">
              <label className={`cursor-pointer px-4 py-2 rounded font-semibold text-sm border ${configId ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' : 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed'}`}>
                {coverUploading ? 'Caricamento...' : 'Carica immagine'}
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  disabled={!configId || coverUploading}
                  onChange={handleCoverUpload}
                  data-testid="cover-upload-input"
                />
              </label>
              {coverPreviewUrl && (
                <button
                  type="button"
                  className="px-3 py-2 rounded text-sm font-semibold border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                  onClick={handleDeleteCover}
                  disabled={coverUploading}
                  data-testid="cover-delete-btn"
                >
                  Rimuovi
                </button>
              )}
            </div>
            {coverError && <p className="text-xs text-red-500">{coverError}</p>}
          </div>
        )}
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
            {logoPreviewUrl && (
              <img
                src={logoPreviewUrl}
                alt="Logo"
                className="max-h-16 max-w-full object-contain mb-4"
                data-testid="preview-logo"
              />
            )}
            {coverPreviewUrl && (
              <img
                src={coverPreviewUrl}
                alt="Cover"
                className="w-full max-w-md rounded-lg object-cover mb-4 max-h-32"
                data-testid="preview-cover"
              />
            )}
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

