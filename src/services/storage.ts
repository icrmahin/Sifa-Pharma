import { supabase } from '../lib/supabase'

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

export async function uploadProductImage(localUri: string, productId?: string): Promise<string> {
  const ext = extFromUri(localUri);
  const name = `${productId || 'new'}-${Date.now()}.${ext}`;
  const path = `products/${name}`;

  const res = await fetch(localUri);
  if (!res.ok) throw new Error('Could not read selected image');
  const blob = await res.blob();

  const { error } = await supabase.storage.from('product-images').upload(path, blob, {
    contentType: ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg',
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from('product-images').getPublicUrl(path);
  return data.publicUrl;
}

export async function resolveProductImageUri(uri?: string | null, productId?: string): Promise<string | null> {
  if (!uri || !uri.trim()) return null;
  const trimmed = uri.trim();
  if (isRemoteUrl(trimmed)) return trimmed;
  if (isLocalUri(trimmed)) {
    return uploadProductImage(trimmed, productId);
  }
  return trimmed;
}
