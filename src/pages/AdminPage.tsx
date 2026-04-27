import { useAppPreferences } from '../app/providers/AppPreferencesProvider'
import { getAllConfigs } from '../configs/registry'

export const AdminPage = () => {
  const { locale } = useAppPreferences()
  const configs = getAllConfigs().toSorted((a, b) => a.agencyName.localeCompare(b.agencyName))

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 p-4 sm:p-8">
      <section className="rounded-xl border border-slate-300 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          {locale === 'it' ? 'Amministrazione' : 'Admin'}
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {locale === 'it'
            ? 'Seleziona una configurazione agenzia per preparare la pagina stima e il QR.'
            : 'Select an agency configuration to prepare estimate page and QR flow.'}
        </p>

        <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-300">
          {locale === 'it' ? 'Configurazioni disponibili' : 'Available agency configurations'}
        </h2>

        {configs.length === 0 ? (
          <p className="mt-3 rounded-lg border border-dashed border-slate-300 p-3 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            {locale === 'it'
              ? 'Nessuna configurazione disponibile.'
              : 'No agency configuration is available.'}
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {configs.map((config) => (
              <li
                className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/40"
                key={config.id}
              >
                <p className="font-medium text-slate-900 dark:text-slate-100">{config.agencyName}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">ID: {config.id}</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  {locale === 'it'
                    ? `Zone: ${config.zones.length} - Tipologie: ${config.propertyTypes.length}`
                    : `Zones: ${config.zones.length} - Property types: ${config.propertyTypes.length}`}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}

