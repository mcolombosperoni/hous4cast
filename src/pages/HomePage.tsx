import { Link } from 'react-router-dom'

export const HomePage = () => {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 p-4 sm:p-8">
      <header className="rounded-xl border border-slate-300 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">hous4cast</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Config-driven estimation pages delivered through QR codes.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <Link
          to="/estimate/gabetti-busto-arsizio"
          className="rounded-xl border border-slate-300 bg-white p-4 text-slate-800 shadow-sm transition hover:border-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          Open estimate page
        </Link>
        <Link
          to="/admin"
          className="rounded-xl border border-slate-300 bg-white p-4 text-slate-800 shadow-sm transition hover:border-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          Open admin page
        </Link>
      </section>
    </main>
  )
}

