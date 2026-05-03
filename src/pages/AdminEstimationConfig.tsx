import { useEffect, useReducer, useRef } from 'react'
import { getConfig } from '../configs/registry'
import {
  loadEstimationConfig,
  saveEstimationConfig,
  clearEstimationConfig,
} from '../app/estimationConfigApi'
import type { AgencyConfig, EstimationConfigOverride, ZoneRate } from '../configs/types'

interface Props {
  configId: string
}

interface ZoneRow {
  zoneId: string
  labelIt: string
  labelEn: string
  zoneMultiplier: string
}

interface FormState {
  spreadFactor: string
  zones: ZoneRow[]
  privacyIt: string
  privacyEn: string
}

function buildFormState(base: AgencyConfig, override: EstimationConfigOverride | null): FormState {
  const spreadFactor = override?.spreadFactor !== undefined
    ? String(override.spreadFactor)
    : String(base.spreadFactor ?? 0.1)

  // Merge override zones over base zones
  const effectiveZones: ZoneRate[] = override?.zones
    ? base.zones.map((bz) => {
        const oz = override.zones!.find((z) => z.zoneId === bz.zoneId)
        return oz ? { ...bz, ...oz } : bz
      })
    : base.zones

  const zones: ZoneRow[] = effectiveZones.map((z) => ({
    zoneId: z.zoneId,
    labelIt: z.label?.it ?? z.zoneId,
    labelEn: z.label?.en ?? z.zoneId,
    zoneMultiplier: String(z.zoneMultiplier ?? 1),
  }))

  const privacyIt = override?.privacy?.text?.it ?? base.privacy?.text?.it ?? ''
  const privacyEn = override?.privacy?.text?.en ?? base.privacy?.text?.en ?? ''

  return { spreadFactor, zones, privacyIt, privacyEn }
}

export const AdminEstimationConfig = ({ configId }: Props) => {
  interface EditorState {
    loading: boolean
    formState: FormState | null
    saveStatus: 'idle' | 'saving' | 'saved' | 'error'
    spreadError: string | null
  }

  type EditorAction =
    | { type: 'INIT' }
    | { type: 'LOADED'; formState: FormState }
    | { type: 'SET_FORM'; formState: FormState }
    | { type: 'SPREAD_ERROR'; message: string }
    | { type: 'CLEAR_SPREAD_ERROR' }
    | { type: 'SAVE_STATUS'; status: 'idle' | 'saving' | 'saved' | 'error' }

  function editorReducer(state: EditorState, action: EditorAction): EditorState {
    switch (action.type) {
      case 'INIT': return { loading: true, formState: null, saveStatus: 'idle', spreadError: null }
      case 'LOADED': return { ...state, loading: false, formState: action.formState }
      case 'SET_FORM': return { ...state, formState: action.formState }
      case 'SPREAD_ERROR': return { ...state, spreadError: action.message }
      case 'CLEAR_SPREAD_ERROR': return { ...state, spreadError: null }
      case 'SAVE_STATUS': return { ...state, saveStatus: action.status }
    }
  }

  const [state, dispatch] = useReducer(editorReducer, {
    loading: true,
    formState: null,
    saveStatus: 'idle',
    spreadError: null,
  })
  const { loading, formState, saveStatus, spreadError } = state
  const baseConfigRef = useRef<AgencyConfig | null>(null)

  useEffect(() => {
    let cancelled = false
    dispatch({ type: 'INIT' })

    const base = getConfig(configId)
    if (!base) return
    baseConfigRef.current = base

    const init = async () => {
      const override = await loadEstimationConfig(configId)
      if (cancelled) return
      dispatch({ type: 'LOADED', formState: buildFormState(base, override) })
    }

    void init()

    return () => { cancelled = true }
  }, [configId])

  const handleSpreadChange = (value: string) => {
    if (!formState) return
    dispatch({ type: 'SET_FORM', formState: { ...formState, spreadFactor: value } })
    dispatch({ type: 'CLEAR_SPREAD_ERROR' })
  }

  const handleZoneMultiplierChange = (index: number, value: string) => {
    if (!formState) return
    const zones = formState.zones.map((z, i) => i === index ? { ...z, zoneMultiplier: value } : z)
    dispatch({ type: 'SET_FORM', formState: { ...formState, zones } })
  }

  const handlePrivacyItChange = (value: string) => {
    if (!formState) return
    dispatch({ type: 'SET_FORM', formState: { ...formState, privacyIt: value } })
  }

  const handlePrivacyEnChange = (value: string) => {
    if (!formState) return
    dispatch({ type: 'SET_FORM', formState: { ...formState, privacyEn: value } })
  }

  const handleAddZone = () => {
    if (!formState) return
    const newRow: ZoneRow = {
      zoneId: `zone_${Date.now()}`,
      labelIt: '',
      labelEn: '',
      zoneMultiplier: '1',
    }
    dispatch({ type: 'SET_FORM', formState: { ...formState, zones: [...formState.zones, newRow] } })
  }

  const handleSave = async () => {
    if (!formState || !baseConfigRef.current) return

    const spreadValue = parseFloat(formState.spreadFactor)
    if (isNaN(spreadValue) || spreadValue < 0 || spreadValue > 1) {
      dispatch({ type: 'SPREAD_ERROR', message: 'Spread factor must be a number between 0 and 1' })
      return
    }

    dispatch({ type: 'CLEAR_SPREAD_ERROR' })
    dispatch({ type: 'SAVE_STATUS', status: 'saving' })

    const base = baseConfigRef.current

    // Build zones with all data from form — ensure zoneMultiplier is always a valid number
    const zones: ZoneRate[] = formState.zones.map((row, i) => {
      const baseZone = base.zones[i]
      const multiplierValue = parseFloat(row.zoneMultiplier)
      return {
        zoneId: row.zoneId,
        label: { it: row.labelIt, en: row.labelEn },
        pricePerSqm: baseZone?.pricePerSqm ?? {},
        zoneMultiplier: isNaN(multiplierValue) ? (baseZone?.zoneMultiplier ?? 1) : multiplierValue,
      }
    })

    const override: EstimationConfigOverride = {
      spreadFactor: spreadValue,
      zones,
      sqmBucketPrices: base.sqmBucketPrices,
      conditionFactors: base.conditionFactors,
      floorFactors: base.floorFactors,
      eraFactors: base.eraFactors,
      accessoriesBonuses: base.accessoriesBonuses,
      privacy: {
        text: {
          it: formState.privacyIt,
          en: formState.privacyEn,
        },
        link: base.privacy?.link,
      },
    }

    try {
      await saveEstimationConfig(configId, override)
      dispatch({ type: 'SAVE_STATUS', status: 'saved' })
    } catch {
      dispatch({ type: 'SAVE_STATUS', status: 'error' })
    }
  }

  const handleReset = async () => {
    const base = baseConfigRef.current
    if (!base) return
    await clearEstimationConfig(configId)
    dispatch({ type: 'LOADED', formState: buildFormState(base, null) })
    dispatch({ type: 'SAVE_STATUS', status: 'idle' })
    dispatch({ type: 'CLEAR_SPREAD_ERROR' })
  }

  return (
    <div className="space-y-6">
      {loading && (
        <p className="text-sm text-slate-500" data-testid="estimation-config-loading">
          Loading…
        </p>
      )}

      {!loading && formState && (
        <div data-testid="estimation-config-loaded" className="space-y-6">

          {/* Spread factor */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="spread-factor-input">
              Spread Factor (0–1)
            </label>
            <input
              id="spread-factor-input"
              data-testid="spread-factor-input"
              type="text"
              inputMode="decimal"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              value={formState.spreadFactor}
              onChange={(e) => handleSpreadChange(e.target.value)}
            />
            {spreadError && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400" data-testid="estimation-config-spread-error">
                {spreadError}
              </p>
            )}
          </div>

          {/* Zones */}
          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Zones</h3>
            <div className="space-y-2">
              {formState.zones.map((zone, i) => (
                <div key={zone.zoneId} className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                  <span className="w-32 text-sm text-slate-700 dark:text-slate-300" data-testid={`zone-id-${zone.zoneId}`}>
                    {zone.labelIt || zone.zoneId}
                  </span>
                  <div className="flex items-center gap-1">
                    <label className="text-xs text-slate-500" htmlFor={`zone-multiplier-${zone.zoneId}`}>
                      Multiplier
                    </label>
                    <input
                      id={`zone-multiplier-${zone.zoneId}`}
                      data-testid={`zone-multiplier-${zone.zoneId}`}
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-24 rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                      value={zone.zoneMultiplier}
                      onChange={(e) => handleZoneMultiplierChange(i, e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              data-testid="zone-add-btn"
              className="mt-2 rounded-md border border-dashed border-slate-300 px-3 py-1 text-xs text-slate-500 hover:border-blue-400 hover:text-blue-500 dark:border-slate-600 dark:text-slate-400"
              onClick={handleAddZone}
            >
              + Add Zone
            </button>
          </div>

          {/* Privacy text */}
          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Privacy Text</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-500" htmlFor="privacy-text-it">IT</label>
                <textarea
                  id="privacy-text-it"
                  data-testid="privacy-text-it"
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  value={formState.privacyIt}
                  onChange={(e) => handlePrivacyItChange(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500" htmlFor="privacy-text-en">EN</label>
                <textarea
                  id="privacy-text-en"
                  data-testid="privacy-text-en"
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  value={formState.privacyEn}
                  onChange={(e) => handlePrivacyEnChange(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions — always rendered so Save/Reset are findable by tests */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          data-testid="estimation-config-save"
          disabled={loading || !formState}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
          onClick={handleSave}
        >
          Save
        </button>
        <button
          type="button"
          data-testid="estimation-config-reset"
          disabled={loading || !formState}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
          onClick={handleReset}
        >
          Reset to defaults
        </button>
        {saveStatus === 'saved' && (
          <p className="text-sm text-emerald-600 dark:text-emerald-400" data-testid="estimation-config-save-status">
            Saved ✓
          </p>
        )}
        {saveStatus === 'error' && (
          <p className="text-sm text-red-600" data-testid="estimation-config-save-status">
            Error saving
          </p>
        )}
      </div>
    </div>
  )
}










