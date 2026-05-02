/**
 * Cloudinary unsigned upload utility.
 *
 * Uses the Cloudinary REST API with an unsigned upload preset — no SDK, no secret.
 * Only VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET are required
 * (both are public, non-secret values).
 *
 * ADR: docs/decisions/0012-image-storage-cloudinary.md
 */

export type CloudinaryUploadResult = {
  secure_url: string
  public_id: string
}

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined

export const isCloudinaryConfigured = Boolean(cloudName && uploadPreset)

/**
 * Uploads a file to Cloudinary via unsigned upload preset.
 * Returns the secure CDN URL.
 * Throws if Cloudinary is not configured or if the upload fails.
 */
export async function uploadToCloudinary(
  file: File,
  folder = 'branding',
): Promise<CloudinaryUploadResult> {
  if (!cloudName || !uploadPreset) {
    throw new Error('[cloudinaryApi] Cloudinary is not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)
  formData.append('folder', folder)

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: formData },
  )

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`[cloudinaryApi] Upload failed (${response.status}): ${err}`)
  }

  return response.json() as Promise<CloudinaryUploadResult>
}

