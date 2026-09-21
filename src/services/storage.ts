import { supabase } from '../lib/supabase'

const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/jpg'])

function isRemoteUrl(uri?: string | null): boolean {
  if (!uri) return false
  return /^https?:\/\//i.test(uri);
}

function isLocalUri(uri?: string | null): boolean {
  if (!uri) return false
  if (isRemoteUrl(uri)) return false
  return /^(file:\/\/|content:\/\/|blob:|data:|ph:\/\/)/i.test(uri);
}

function extFromUri(uri: string): string {
  const clean = uri.split('?')[0].split('#')[0];
  const match = clean.match(/\.([a-zA-Z0-9]{2,5})$/);
  const ext = (match?.[1] || 'jpg').toLowerCase();
  if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) return ext === 'jpeg' ? 'jpg' : ext;
  return 'jpg';
}

async function compressImage(uri: string, opts?: { width?: number; quality?: number }): Promise<{ uri: string; mime: string }> {
  const width = opts?.width ?? 1024
  const compress = opts?.quality ?? 0.75
  try {
    // dynamic require so build doesn't fail if not yet installed (package.json lists it)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ImageManipulator = require('expo-image-manipulator') as any
    const manip = ImageManipulator?.manipulateAsync
      ? await ImageManipulator.manipulateAsync(
          uri,
          [{ resize: { width } }],
          { compress, format: ImageManipulator.SaveFormat.WEBP, base64: false }
        )
      : null
    if (manip?.uri) return { uri: manip.uri, mime: 'image/webp' }
  } catch {
    // fallback to original if manipulator unavailable (e.g. web)
  }
  return { uri, mime: 'image/jpeg' }
}

function mimeFromExt(ext: string): string {
  if (ext === 'png') return 'image/png'
  if (ext === 'webp') return 'image/webp'
  return 'image/jpeg'
}

export async function uploadProductImage(localUri: string, productId?: string, opts?: { thumb?: boolean }): Promise<string> {
  const targetWidth = opts?.thumb ? 320 : 1024
  const quality = opts?.thumb ? 0.7 : 0.75
  const compressed = await compressImage(localUri, { width: targetWidth, quality })
  const uriToUpload = compressed.uri
  const ext = compressed.mime === 'image/webp' ? 'webp' : extFromUri(localUri)
  const mime = compressed.mime !== 'image/jpeg' ? compressed.mime : mimeFromExt(ext)
  if (!ALLOWED_MIME.has(mime)) throw new Error('Unsupported image type. Use jpg, png, or webp.')

  const name = `${productId || 'new'}-${Date.now()}${opts?.thumb ? '-thumb' : ''}.${ext}`
  const path = `products/${name}`

  const res = await fetch(uriToUpload)
  if (!res.ok) throw new Error('Could not read selected image')
  const blob = await res.blob()
  if (blob.size > MAX_BYTES) throw new Error('Image too large — max 5MB after compression. Try a smaller image.')

  const { error } = await supabase.storage.from('product-images').upload(path, blob, {
    contentType: mime,
    upsert: false,
  })
  if (error) throw error

  const { data } = supabase.storage.from('product-images').getPublicUrl(path)
  // For thumb, Supabase transform can also be used: ?width=320&quality=60, but we already resized
  return data.publicUrl
}

export async function resolveProductImageUri(uri?: string | null, productId?: string): Promise<string | null> {
  if (!uri || !uri.trim()) return null
  const trimmed = uri.trim()
  if (isRemoteUrl(trimmed)) return trimmed
  if (isLocalUri(trimmed)) {
    return uploadProductImage(trimmed, productId)
  }
  return trimmed
}

export async function resolveProductImageUriWithThumb(
  uri?: string | null,
  productId?: string
): Promise<{ primary: string | null; thumb: string | null }> {
  if (!uri || !uri.trim()) return { primary: null, thumb: null }
  const trimmed = uri.trim()
  if (isRemoteUrl(trimmed)) return { primary: trimmed, thumb: null }
  if (isLocalUri(trimmed)) {
    const primary = await uploadProductImage(trimmed, productId, { thumb: false })
    // Reuse same source for thumb 320 — highly optimized
    const thumb = await uploadProductImage(trimmed, productId, { thumb: true })
    return { primary, thumb }
  }
  return { primary: trimmed, thumb: null }
}
