interface Props {
  agencyName: string
  logoUrl?: string
}

/**
 * Page header for the estimate page.
 * Shows the agency logo when configured, otherwise falls back to the agency name text.
 */
export const BrandingHeader = ({ agencyName, logoUrl }: Props) => {
  if (logoUrl) {
    return (
      <div className="mb-4 flex items-center">
        <img
          data-testid="estimate-logo"
          src={logoUrl}
          alt={agencyName}
          className="max-h-12 w-auto object-contain"
        />
      </div>
    )
  }

  return (
    <h1 className="mb-1 text-xl font-semibold text-slate-900 dark:text-slate-100">
      {agencyName}
    </h1>
  )
}

