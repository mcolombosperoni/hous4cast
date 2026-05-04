interface Props {
  coverImageUrl?: string
  agencyName: string
}

/**
 * Full-width hero/banner image above the estimate form.
 * Renders nothing when no cover image is configured.
 */
export const CoverHero = ({ coverImageUrl, agencyName }: Props) => {
  if (!coverImageUrl) return null

  return (
    <div className="mb-6 overflow-hidden rounded-xl">
      <img
        data-testid="estimate-cover"
        src={coverImageUrl}
        alt={agencyName}
        className="h-48 w-full object-cover"
        loading="lazy"
      />
    </div>
  )
}

