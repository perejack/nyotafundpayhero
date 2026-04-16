import { supabase } from './supabase';

const BUCKET_NAME = 'loan-documents';

export interface UploadResult {
  url: string;
  path: string;
}

export async function uploadFile(
  file: File,
  folder: string,
  fileName: string
): Promise<UploadResult> {
  // Validate file is a proper File object
  if (!file || !(file instanceof File)) {
    throw new Error('Invalid file: File is required');
  }
  
  if (!file.name) {
    throw new Error('Invalid file: File name is missing');
  }

  // Extract extension safely - default to 'bin' if no extension found
  const fileExt = file.name.includes('.') 
    ? file.name.split('.').pop() || 'bin'
    : 'bin';
  
  const safeFileName = fileName.replace(/[^a-zA-Z0-9-_]/g, '_');
  const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
  const filePath = `${folder}/${safeFileName}/${uniqueFileName}`;

  // Upload file to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return {
    url: urlData.publicUrl,
    path: filePath,
  };
}

export async function downloadFile(path: string): Promise<Blob> {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .download(path);

  if (error) {
    throw new Error(`Download failed: ${error.message}`);
  }

  return data;
}

export async function deleteFile(path: string): Promise<void> {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([path]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}

export function getFileUrl(path: string): string {
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path);
  
  return data.publicUrl;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function isValidFileType(file: File, allowedTypes?: string[]): boolean {
  if (!allowedTypes) return true;
  
  const fileType = file.type;
  const fileExt = file.name.split('.').pop()?.toLowerCase();
  
  // Check MIME type or extension
  return allowedTypes.some(type => 
    fileType.includes(type) || fileExt === type.replace('.', '')
  );
}

export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
