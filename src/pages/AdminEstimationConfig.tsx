import { useEffect, useReducer, useRef, useState } from 'react'
import { getConfig } from '../configs/registry'
import {
  loadEstimationConfig,
  saveEstimationConfig,
  clearEstimationConfig,
} from '../app/estimationConfigApi'
import type { AgencyConfig, EstimationConfigOverride, FactorEntry, AccessoryEntry, PropertyType, ZoneRate } from '../configs/types'

interface Props {
  configId: string
}

interface ZoneRow {
  zoneId: string
  labelIt: string
  labelEn: string
  zoneMultiplier: string
  /** True for zones added in the current session — zoneId is editable */
  isNew?: boolean
}

interface FormState {
  spreadFactor: string
  zones: ZoneRow[]
  privacyIt: string
  privacyEn: string
  sqmBucketPrices?: Record<string, string>
  /** Open-list entries (Epic P) */
  conditionEntries?: FactorEntry[]
  floorEntries?: FactorEntry[]
  eraEntries?: FactorEntry[]
  accessoryEntries?: AccessoryEntry[]
  /** Flat factor tables (derived from entries — kept for legacy save payload) */
  conditionFactors?: Record<string, string>
  floorFactors?: Record<string, string>
  eraFactors?: Record<string, string>
  accessoriesBonuses?: Record<string, string>
  propertyTypes: string[]
  propertyTypeFactors: Record<string, string>
}

/** Parse a string-valued Record back to numbers, skipping NaN entries */
function parseFactorTable(table: Record<string, string> | undefined): Record<string, number> {
  if (!table) return {}
  const result: Record<string, number> = {}
  for (const [k, v] of Object.entries(table)) {
    const n = parseFloat(v)
    if (!isNaN(n)) result[k] = n
  }
  return result
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

  // Helper: merge a factor/bonus table from override over base, stringify values
  const buildTable = (
    baseTable: Record<string, number> | undefined,
    overrideTable: Record<string, number> | undefined,
  ): Record<string, string> => {
    if (!baseTable) return {}
    return Object.fromEntries(
      Object.entries(baseTable).map(([k, v]) => [k, String(overrideTable?.[k] ?? v)])
    )
  }

  const sqmBucketPrices = buildTable(
    base.sqmBucketPrices as Record<string, number> | undefined,
    override?.sqmBucketPrices as Record<string, number> | undefined,
  )

  // Build open-list entries: start from base entries, apply coefficient/bonus overrides from saved override
  const buildEntries = <T extends FactorEntry>(
    baseEntries: T[] | undefined,
    overrideFactors: Record<string, number> | undefined,
    overrideEntries: T[] | undefined,
  ): T[] | undefined => {
    // If override has a full entries list (new-style), use it
    if (overrideEntries && overrideEntries.length > 0) return overrideEntries
    if (!baseEntries) return undefined
    // Apply old-style coefficient overrides to base entries
    return baseEntries.map((e) => {
      const ov = overrideFactors?.[e.value]
      if (ov !== undefined) return { ...e, coefficient: ov } as T
      return e
    })
  }

  const buildAccessoryEntries = (
    baseEntries: AccessoryEntry[] | undefined,
    overrideBonuses: Record<string, number> | undefined,
    overrideEntries: AccessoryEntry[] | undefined,
  ): AccessoryEntry[] | undefined => {
    if (overrideEntries && overrideEntries.length > 0) return overrideEntries
    if (!baseEntries) return undefined
    return baseEntries.map((e) => {
      const ov = overrideBonuses?.[e.value]
      if (ov !== undefined) return { ...e, bonus: ov }
      return e
    })
  }

  const conditionEntries = buildEntries(
    base.conditionEntries,
    override?.conditionFactors as Record<string, number> | undefined,
    override?.conditionEntries,
  )
  const floorEntries = buildEntries(
    base.floorEntries,
    override?.floorFactors as Record<string, number> | undefined,
    override?.floorEntries,
  )
  const eraEntries = buildEntries(
    base.eraEntries,
    override?.eraFactors as Record<string, number> | undefined,
    override?.eraEntries,
  )
  const accessoryEntries = buildAccessoryEntries(
    base.accessoryEntries,
    override?.accessoriesBonuses as Record<string, number> | undefined,
    override?.accessoryEntries,
  )

  // Derive flat factor/bonus tables from entries (for legacy save payload + unit tests)
  const entriesToFactorTable = (entries: FactorEntry[] | undefined): Record<string, string> | undefined => {
    if (!entries) return undefined
    return Object.fromEntries(entries.map((e) => [e.value, String(e.coefficient)]))
  }
  const entriesToBonusTable = (entries: AccessoryEntry[] | undefined): Record<string, string> | undefined => {
    if (!entries) return undefined
    return Object.fromEntries(entries.map((e) => [e.value, String(e.bonus)]))
  }

  const conditionFactors = entriesToFactorTable(conditionEntries)
  const floorFactors = entriesToFactorTable(floorEntries)
  const eraFactors = entriesToFactorTable(eraEntries)
  const accessoriesBonuses = entriesToBonusTable(accessoryEntries)

  // Property types: use override if present, else base
  const effectivePropertyTypes: string[] = (override?.propertyTypes ?? base.propertyTypes) as string[]

  // PropertyTypeFactors: merge override over base; include all effective types (default 1)
  const basePropertyTypeFactors: Record<string, number> = Object.fromEntries(
    effectivePropertyTypes.map((pt) => [
      pt,
      (base.propertyTypeFactors as Record<string, number> | undefined)?.[pt] ?? 1,
    ])
  )
  const propertyTypeFactors = buildTable(
    basePropertyTypeFactors,
    override?.propertyTypeFactors as Record<string, number> | undefined,
  )

  return { spreadFactor, zones, sqmBucketPrices, conditionEntries, floorEntries, eraEntries, accessoryEntries, conditionFactors, floorFactors, eraFactors, accessoriesBonuses, propertyTypes: effectivePropertyTypes, propertyTypeFactors, privacyIt, privacyEn }
}

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

export const AdminEstimationConfig = ({ configId }: Props) => {
  const [state, dispatch] = useReducer(editorReducer, {
    loading: true,
    formState: null,
    saveStatus: 'idle',
    spreadError: null,
  })
  const { loading, formState, saveStatus, spreadError } = state
  const baseConfigRef = useRef<AgencyConfig | null>(null)
  const [addPropertyTypeValue, setAddPropertyTypeValue] = useState('')

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

  const handlePrivacyItChange = (value: string) => {
    if (!formState) return
    dispatch({ type: 'SET_FORM', formState: { ...formState, privacyIt: value } })
  }

  const handlePrivacyEnChange = (value: string) => {
    if (!formState) return
    dispatch({ type: 'SET_FORM', formState: { ...formState, privacyEn: value } })
  }

  /** Generic handler for any factor/bonus table field */
  const handleFactorChange = (
    field: 'sqmBucketPrices' | 'conditionFactors' | 'floorFactors' | 'eraFactors' | 'accessoriesBonuses' | 'propertyTypeFactors',
    key: string,
    value: string,
  ) => {
    if (!formState) return
    const updatedFlat = { ...formState[field], [key]: value }
    const newState: FormState = { ...formState, [field]: updatedFlat }
    // Keep open-list entries in sync with flat tables so the engine picks up changes
    if (field === 'conditionFactors' && newState.conditionEntries) {
      newState.conditionEntries = newState.conditionEntries.map((e) =>
        e.value === key ? { ...e, coefficient: parseFloat(value) || e.coefficient } : e
      )
    } else if (field === 'floorFactors' && newState.floorEntries) {
      newState.floorEntries = newState.floorEntries.map((e) =>
        e.value === key ? { ...e, coefficient: parseFloat(value) || e.coefficient } : e
      )
    } else if (field === 'eraFactors' && newState.eraEntries) {
      newState.eraEntries = newState.eraEntries.map((e) =>
        e.value === key ? { ...e, coefficient: parseFloat(value) || e.coefficient } : e
      )
    } else if (field === 'accessoriesBonuses' && newState.accessoryEntries) {
      newState.accessoryEntries = newState.accessoryEntries.map((e) =>
        e.value === key ? { ...e, bonus: parseFloat(value) || 0 } : e
      )
    }
    dispatch({ type: 'SET_FORM', formState: newState })
  }

  // ── Open-list entry handlers ─────────────────────────────────────────────

  type EntriesField = 'conditionEntries' | 'floorEntries' | 'eraEntries'

  const handleEntryChange = (
    field: EntriesField,
    index: number,
    patch: Partial<FactorEntry>,
  ) => {
    if (!formState) return
    const entries = (formState[field] ?? []) as FactorEntry[]
    const updated = entries.map((e, i) => (i === index ? { ...e, ...patch } : e))
    // Recompute flat factor table
    const flatField = field.replace('Entries', 'Factors') as 'conditionFactors' | 'floorFactors' | 'eraFactors'
    const flat = Object.fromEntries(updated.map((e) => [e.value, String(e.coefficient)]))
    dispatch({ type: 'SET_FORM', formState: { ...formState, [field]: updated, [flatField]: flat } })
  }

  const handleAccessoryEntryChange = (index: number, patch: Partial<AccessoryEntry>) => {
    if (!formState) return
    const entries = (formState.accessoryEntries ?? []) as AccessoryEntry[]
    const updated = entries.map((e, i) => (i === index ? { ...e, ...patch } : e))
    const flat = Object.fromEntries(updated.map((e) => [e.value, String(e.bonus)]))
    dispatch({ type: 'SET_FORM', formState: { ...formState, accessoryEntries: updated, accessoriesBonuses: flat } })
  }

  const handleEntryRemove = (field: EntriesField, index: number) => {
    if (!formState) return
    const entries = (formState[field] ?? []) as FactorEntry[]
    const updated = entries.filter((_, i) => i !== index)
    const flatField = field.replace('Entries', 'Factors') as 'conditionFactors' | 'floorFactors' | 'eraFactors'
    const flat = Object.fromEntries(updated.map((e) => [e.value, String(e.coefficient)]))
    dispatch({ type: 'SET_FORM', formState: { ...formState, [field]: updated, [flatField]: flat } })
  }

  const handleEntryMoveUp = (field: EntriesField, index: number) => {
    if (!formState || index === 0) return
    const entries = [...((formState[field] ?? []) as FactorEntry[])]
    ;[entries[index - 1], entries[index]] = [entries[index], entries[index - 1]]
    const flatField = field.replace('Entries', 'Factors') as 'conditionFactors' | 'floorFactors' | 'eraFactors'
    const flat = Object.fromEntries(entries.map((e) => [e.value, String(e.coefficient)]))
    dispatch({ type: 'SET_FORM', formState: { ...formState, [field]: entries, [flatField]: flat } })
  }

  const handleEntryAdd = (field: EntriesField) => {
    if (!formState) return
    const entries = [...((formState[field] ?? []) as FactorEntry[])]
    entries.push({ value: '', label: { it: '', en: '' }, coefficient: 1 })
    const flatField = field.replace('Entries', 'Factors') as 'conditionFactors' | 'floorFactors' | 'eraFactors'
    const flat = Object.fromEntries(entries.map((e) => [e.value, String(e.coefficient)]))
    dispatch({ type: 'SET_FORM', formState: { ...formState, [field]: entries, [flatField]: flat } })
  }

  const handleAccessoryEntryAdd = () => {
    if (!formState) return
    const entries = [...(formState.accessoryEntries ?? [])]
    entries.push({ value: '', label: { it: '', en: '' }, bonus: 0 })
    const flat = Object.fromEntries(entries.map((e) => [e.value, String(e.bonus)]))
    dispatch({ type: 'SET_FORM', formState: { ...formState, accessoryEntries: entries, accessoriesBonuses: flat } })
  }

  const handleAccessoryEntryRemove = (index: number) => {
    if (!formState) return
    const entries = (formState.accessoryEntries ?? []).filter((_, i) => i !== index)
    const flat = Object.fromEntries(entries.map((e) => [e.value, String(e.bonus)]))
    dispatch({ type: 'SET_FORM', formState: { ...formState, accessoryEntries: entries, accessoriesBonuses: flat } })
  }

  const handleAccessoryEntryMoveUp = (index: number) => {
    if (!formState || index === 0) return
    const entries = [...(formState.accessoryEntries ?? [])]
    ;[entries[index - 1], entries[index]] = [entries[index], entries[index - 1]]
    const flat = Object.fromEntries(entries.map((e) => [e.value, String(e.bonus)]))
    dispatch({ type: 'SET_FORM', formState: { ...formState, accessoryEntries: entries, accessoriesBonuses: flat } })
  }

  /** Add a new property type to the list and initialize its factor to 1 */
  const handleAddPropertyType = (pt: string) => {
    if (!formState || !pt || formState.propertyTypes.includes(pt)) return
    dispatch({
      type: 'SET_FORM',
      formState: {
        ...formState,
        propertyTypes: [...formState.propertyTypes, pt],
        propertyTypeFactors: { ...formState.propertyTypeFactors, [pt]: '1' },
      },
    })
  }

  /** Remove a property type from the list (keep at least one) */
  const handleRemovePropertyType = (pt: string) => {
    if (!formState || formState.propertyTypes.length <= 1) return
    const propertyTypes = formState.propertyTypes.filter((t) => t !== pt)
    const propertyTypeFactors = { ...formState.propertyTypeFactors }
    delete propertyTypeFactors[pt]
    dispatch({ type: 'SET_FORM', formState: { ...formState, propertyTypes, propertyTypeFactors } })
  }

  const handleZoneFieldChange = (index: number, field: keyof ZoneRow, value: string) => {
    if (!formState) return
    const zones = formState.zones.map((z, i) => i === index ? { ...z, [field]: value } : z)
    dispatch({ type: 'SET_FORM', formState: { ...formState, zones } })
  }

  const handleAddZone = () => {
    if (!formState) return
    const newRow: ZoneRow = {
      zoneId: '',
      labelIt: '',
      labelEn: '',
      zoneMultiplier: '1',
      isNew: true,
    }
    dispatch({ type: 'SET_FORM', formState: { ...formState, zones: [...formState.zones, newRow] } })
  }

  const handleZoneMoveUp = (index: number) => {
    if (!formState || index === 0) return
    const zones = [...formState.zones]
    ;[zones[index - 1], zones[index]] = [zones[index], zones[index - 1]]
    dispatch({ type: 'SET_FORM', formState: { ...formState, zones } })
  }

  const handleZoneRemove = (index: number) => {
    if (!formState || formState.zones.length <= 1) return
    const zones = formState.zones.filter((_, i) => i !== index)
    dispatch({ type: 'SET_FORM', formState: { ...formState, zones } })
  }

  const handleMovePropertyTypeUp = (index: number) => {
    if (!formState || index === 0) return
    const propertyTypes = [...formState.propertyTypes]
    ;[propertyTypes[index - 1], propertyTypes[index]] = [propertyTypes[index], propertyTypes[index - 1]]
    dispatch({ type: 'SET_FORM', formState: { ...formState, propertyTypes } })
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

    // Build zones — for new zones, derive zoneId from labelIt if left blank
    const zones: ZoneRate[] = formState.zones.map((row, i) => {
      const baseZone = base.zones[i]
      const multiplierValue = parseFloat(row.zoneMultiplier)
      const zoneId = row.isNew && !row.zoneId.trim()
        ? row.labelIt.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') || `zone_${i}`
        : row.zoneId
      return {
        zoneId,
        label: { it: row.labelIt, en: row.labelEn || row.labelIt },
        pricePerSqm: baseZone?.pricePerSqm ?? {},
        zoneMultiplier: isNaN(multiplierValue) ? (baseZone?.zoneMultiplier ?? 1) : multiplierValue,
      }
    })

    const override: EstimationConfigOverride = {
      spreadFactor: spreadValue,
      zones,
      propertyTypes: formState.propertyTypes as PropertyType[],
      propertyTypeFactors: parseFactorTable(formState.propertyTypeFactors),
      sqmBucketPrices: parseFactorTable(formState.sqmBucketPrices),
      conditionEntries: formState.conditionEntries,
      floorEntries: formState.floorEntries,
      eraEntries: formState.eraEntries,
      accessoryEntries: formState.accessoryEntries,
      conditionFactors: parseFactorTable(formState.conditionFactors),
      floorFactors: parseFactorTable(formState.floorFactors),
      eraFactors: parseFactorTable(formState.eraFactors),
      accessoriesBonuses: parseFactorTable(formState.accessoriesBonuses),
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

          {/* Property types and factors — mirrors form field order (first field when multiple types) */}
          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Property Types & Factors</h3>
            <div className="space-y-2">
              {formState.propertyTypes.map((pt, index) => (
                <div key={pt} data-testid={`property-type-row-${index}`} className="flex items-center gap-3 rounded-lg border border-slate-200 p-2 dark:border-slate-700">
                  <span className="w-28 text-sm text-slate-700 dark:text-slate-300" data-testid={'property-type-id-' + pt}>{pt}</span>
                  <div className="flex items-center gap-1">
                    <label className="text-xs text-slate-500" htmlFor={'property-type-factor-' + pt}>Factor</label>
                    <input
                      id={'property-type-factor-' + pt}
                      data-testid={'property-type-factor-' + pt}
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-24 rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                      value={formState.propertyTypeFactors[pt] ?? '1'}
                      onChange={(e) => handleFactorChange('propertyTypeFactors', pt, e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    data-testid={`property-type-move-up-${index}`}
                    disabled={index === 0}
                    className="text-xs text-slate-400 hover:text-slate-700 disabled:opacity-30"
                    onClick={() => handleMovePropertyTypeUp(index)}
                  >↑</button>
                  {formState.propertyTypes.length > 1 && (
                    <button
                      type="button"
                      data-testid={`property-type-remove-${index}`}
                      className="ml-auto text-xs text-red-500 hover:text-red-700"
                      onClick={() => handleRemovePropertyType(pt)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <input
                data-testid="property-type-add-input"
                type="text"
                placeholder="New property type…"
                className="rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                value={addPropertyTypeValue}
                onChange={(e) => setAddPropertyTypeValue(e.target.value)}
              />
              <button
                type="button"
                data-testid="property-type-add-btn"
                className="rounded-md border border-dashed border-slate-300 px-3 py-1 text-xs text-slate-500 hover:border-blue-400 hover:text-blue-500 dark:border-slate-600 dark:text-slate-400"
                onClick={() => {
                  if (addPropertyTypeValue) {
                    handleAddPropertyType(addPropertyTypeValue)
                    setAddPropertyTypeValue('')
                  }
                }}
              >
                + Add
              </button>
            </div>
          </div>

          {/* Zones */}
          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Zones</h3>
            <div className="space-y-3">
              {formState.zones.map((zone, i) => {
                const zoneKey = zone.isNew ? 'new-' + i : zone.zoneId
                const multiplierTestId = zone.isNew ? 'zone-multiplier-new-' + i : 'zone-multiplier-' + zone.zoneId
                const labelItTestId = zone.isNew ? 'zone-label-it-new-' + i : 'zone-label-it-' + zone.zoneId
                const labelEnTestId = zone.isNew ? 'zone-label-en-new-' + i : 'zone-label-en-' + zone.zoneId
                const multiplierHtmlId = 'zone-multiplier-' + (zone.isNew ? String(i) : zone.zoneId)
                return (
                  <div key={zoneKey} data-testid={`zone-id-row-${i}`} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700 space-y-2">
                    {/* Header row: zone id (read-only) or editable id for new zones */}
                    <div className="flex flex-wrap items-center gap-2">
                      {zone.isNew ? (
                        <div className="flex items-center gap-1 flex-1 min-w-0">
                          <label className="text-xs text-slate-500 shrink-0" htmlFor={'zone-id-input-' + i}>ID</label>
                          <input
                            id={'zone-id-input-' + i}
                            data-testid={'zone-id-input-' + i}
                            type="text"
                            placeholder="es. semicentro"
                            className="flex-1 min-w-0 rounded-md border border-slate-300 px-2 py-1 text-sm font-mono dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                            value={zone.zoneId}
                            onChange={(e) => handleZoneFieldChange(i, 'zoneId', e.target.value)}
                          />
                        </div>
                      ) : (
                        <span
                          className="text-xs font-mono text-slate-400 dark:text-slate-500"
                          data-testid={'zone-id-' + zone.zoneId}
                        >
                          {zone.zoneId}
                        </span>
                      )}
                      <div className="flex items-center gap-1 ml-auto">
                        <label className="text-xs text-slate-500" htmlFor={multiplierHtmlId}>Multiplier</label>
                        <input
                          id={multiplierHtmlId}
                          data-testid={multiplierTestId}
                          type="number"
                          step="0.01"
                          min="0"
                          className="w-24 rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                          value={zone.zoneMultiplier}
                          onChange={(e) => handleZoneFieldChange(i, 'zoneMultiplier', e.target.value)}
                        />
                      </div>
                      <button
                        type="button"
                        data-testid={`zone-move-up-${i}`}
                        disabled={i === 0}
                        className="text-xs text-slate-400 hover:text-slate-700 disabled:opacity-30"
                        onClick={() => handleZoneMoveUp(i)}
                      >↑</button>
                      {formState.zones.length > 1 && (
                        <button
                          type="button"
                          data-testid={`zone-remove-${i}`}
                          className="text-xs text-red-500 hover:text-red-700"
                          onClick={() => handleZoneRemove(i)}
                        >✕</button>
                      )}
                    </div>
                    {/* Label row: IT + EN */}
                    <div className="flex flex-wrap gap-2">
                      <div className="flex items-center gap-1 flex-1 min-w-0">
                        <label className="text-xs text-slate-500 shrink-0" htmlFor={'zone-label-it-' + i}>IT</label>
                        <input
                          id={'zone-label-it-' + i}
                          data-testid={labelItTestId}
                          type="text"
                          placeholder="Nome zona (IT)"
                          className="flex-1 min-w-0 rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                          value={zone.labelIt}
                          onChange={(e) => handleZoneFieldChange(i, 'labelIt', e.target.value)}
                        />
                      </div>
                      <div className="flex items-center gap-1 flex-1 min-w-0">
                        <label className="text-xs text-slate-500 shrink-0" htmlFor={'zone-label-en-' + i}>EN</label>
                        <input
                          id={'zone-label-en-' + i}
                          data-testid={labelEnTestId}
                          type="text"
                          placeholder="Zone name (EN)"
                          className="flex-1 min-w-0 rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                          value={zone.labelEn}
                          onChange={(e) => handleZoneFieldChange(i, 'labelEn', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
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

          {/* Factor table sections — legacy flat inputs (still used by unit tests T54) */}
          {(
            [
              { field: 'sqmBucketPrices', label: 'Sqm Bucket Prices (€)', testPrefix: 'sqm-bucket' },
              { field: 'conditionFactors', label: 'Condition Factors', testPrefix: 'condition-factor' },
              { field: 'floorFactors', label: 'Floor Factors', testPrefix: 'floor-factor' },
              { field: 'eraFactors', label: 'Era Factors', testPrefix: 'era-factor' },
              { field: 'accessoriesBonuses', label: 'Accessories Bonuses (€)', testPrefix: 'accessories-bonus' },
            ] as const
          ).map(({ field, label, testPrefix }) => {
            const table = formState[field]
            if (!table || Object.keys(table).length === 0) return null
            return (
              <div key={field}>
                <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</h3>
                <div className="space-y-1">
                  {Object.entries(table).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-3">
                      <span className="w-36 text-xs text-slate-600 dark:text-slate-400">{key}</span>
                      <input
                        id={`${testPrefix}-${key}`}
                        data-testid={`${testPrefix}-${key}`}
                        type="number"
                        step="any"
                        className="w-32 rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                        value={value}
                        onChange={(e) => handleFactorChange(field, key, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          {/* Open-list entries editor (Epic P / US-16) */}
          {(
            [
              { field: 'conditionEntries' as EntriesField, listTestId: 'condition-entries-list', addTestId: 'condition-entries-add-btn', label: 'Condition Entries' },
              { field: 'floorEntries' as EntriesField, listTestId: 'floor-entries-list', addTestId: 'floor-entries-add-btn', label: 'Floor Entries' },
              { field: 'eraEntries' as EntriesField, listTestId: 'era-entries-list', addTestId: 'era-entries-add-btn', label: 'Era Entries' },
            ]
          ).map(({ field, listTestId, addTestId, label }) => {
            const entries = (formState[field] ?? []) as FactorEntry[]
            if (entries.length === 0 && !formState[field]) return null
            return (
              <div key={field}>
                <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</h3>
                <div className="space-y-2" data-testid={listTestId}>
                  {entries.map((entry, i) => {
                    // Each row is wrapped with the specific testid (factor-entry-row-{value}) when it has a value,
                    // OR just factor-entry-row when empty. The inner div always has factor-entry-row so that
                    // getByTestId('factor-entry-row').last() and getByTestId('factor-entry-row-ottimo') both work.
                    const innerContent = (
                      <div
                        data-testid="factor-entry-row"
                        className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 p-2 dark:border-slate-700"
                      >
                        <input
                          data-testid="factor-entry-value"
                          type="text"
                          placeholder="value"
                          className="w-28 rounded-md border border-slate-300 px-2 py-1 text-xs font-mono dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                          value={entry.value}
                          onChange={(e) => handleEntryChange(field, i, { value: e.target.value })}
                        />
                        <input
                          data-testid="factor-entry-label-it"
                          type="text"
                          placeholder="Label IT"
                          className="flex-1 min-w-0 rounded-md border border-slate-300 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                          value={entry.label.it}
                          onChange={(e) => handleEntryChange(field, i, { label: { ...entry.label, it: e.target.value } })}
                        />
                        <input
                          data-testid="factor-entry-label-en"
                          type="text"
                          placeholder="Label EN"
                          className="flex-1 min-w-0 rounded-md border border-slate-300 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                          value={entry.label.en}
                          onChange={(e) => handleEntryChange(field, i, { label: { ...entry.label, en: e.target.value } })}
                        />
                        <input
                          data-testid="factor-entry-coefficient"
                          type="number"
                          step="0.01"
                          placeholder="coeff"
                          className="w-20 rounded-md border border-slate-300 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                          value={entry.coefficient}
                          onChange={(e) => handleEntryChange(field, i, { coefficient: parseFloat(e.target.value) })}
                        />
                        <button
                          type="button"
                          data-testid="factor-entry-move-up"
                          disabled={i === 0}
                          className="text-xs text-slate-400 hover:text-slate-700 disabled:opacity-30"
                          onClick={() => handleEntryMoveUp(field, i)}
                        >↑</button>
                        <button
                          type="button"
                          data-testid="factor-entry-remove-btn"
                          className="text-xs text-red-500 hover:text-red-700"
                          onClick={() => handleEntryRemove(field, i)}
                        >✕</button>
                      </div>
                    )
                    // When entry has a value, wrap with specific testid; otherwise the inner div itself is the row
                    return entry.value
                      ? <div key={entry.value} data-testid={`factor-entry-row-${entry.value}`}>{innerContent}</div>
                      : <div key={`new-${i}`}>{innerContent}</div>
                  })}
                </div>
                <button
                  type="button"
                  data-testid={addTestId}
                  className="mt-2 rounded-md border border-dashed border-slate-300 px-3 py-1 text-xs text-slate-500 hover:border-blue-400 hover:text-blue-500 dark:border-slate-600 dark:text-slate-400"
                  onClick={() => handleEntryAdd(field)}
                >+ Add</button>
              </div>
            )
          })}

          {/* Accessory entries open-list editor */}
          {formState.accessoryEntries !== undefined && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Accessory Entries</h3>
              <div className="space-y-2" data-testid="accessory-entries-list">
                {(formState.accessoryEntries ?? []).map((entry, i) => (
                  <div
                    key={entry.value || `new-${i}`}
                    data-testid={entry.value ? `accessory-entry-row-${entry.value}` : 'accessory-entry-row'}
                    className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 p-2 dark:border-slate-700"
                  >
                    <input
                      data-testid="accessory-entry-value"
                      type="text"
                      placeholder="value"
                      className="w-28 rounded-md border border-slate-300 px-2 py-1 text-xs font-mono dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                      value={entry.value}
                      onChange={(e) => handleAccessoryEntryChange(i, { value: e.target.value })}
                    />
                    <input
                      data-testid="accessory-entry-label-it"
                      type="text"
                      placeholder="Label IT"
                      className="flex-1 min-w-0 rounded-md border border-slate-300 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                      value={entry.label.it}
                      onChange={(e) => handleAccessoryEntryChange(i, { label: { ...entry.label, it: e.target.value } })}
                    />
                    <input
                      data-testid="accessory-entry-label-en"
                      type="text"
                      placeholder="Label EN"
                      className="flex-1 min-w-0 rounded-md border border-slate-300 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                      value={entry.label.en}
                      onChange={(e) => handleAccessoryEntryChange(i, { label: { ...entry.label, en: e.target.value } })}
                    />
                    <input
                      data-testid="accessory-entry-bonus"
                      type="number"
                      step="1"
                      placeholder="bonus €"
                      className="w-24 rounded-md border border-slate-300 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                      value={entry.bonus}
                      onChange={(e) => handleAccessoryEntryChange(i, { bonus: parseFloat(e.target.value) })}
                    />
                    <button
                      type="button"
                      data-testid="accessory-entry-move-up"
                      disabled={i === 0}
                      className="text-xs text-slate-400 hover:text-slate-700 disabled:opacity-30"
                      onClick={() => handleAccessoryEntryMoveUp(i)}
                    >↑</button>
                    <button
                      type="button"
                      data-testid="accessory-entry-remove-btn"
                      className="text-xs text-red-500 hover:text-red-700"
                      onClick={() => handleAccessoryEntryRemove(i)}
                    >✕</button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                data-testid="accessory-entries-add-btn"
                className="mt-2 rounded-md border border-dashed border-slate-300 px-3 py-1 text-xs text-slate-500 hover:border-blue-400 hover:text-blue-500 dark:border-slate-600 dark:text-slate-400"
                onClick={handleAccessoryEntryAdd}
              >+ Add</button>
            </div>
          )}

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
            <span data-testid="estimation-config-saved-msg">Saved ✓</span>
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










