import { useParams } from 'react-router-dom'

export const EstimatePage = () => {
  const { configId } = useParams<{ configId: string }>()

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 p-4 sm:p-8">
      <section className="rounded-xl border border-slate-300 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Estimate page</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Config selected: <strong>{configId ?? 'missing'}</strong>
        </p>
      </section>
    </main>
  )
}

