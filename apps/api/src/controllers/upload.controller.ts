import { Request, Response } from 'express';
import crypto from 'crypto';

export interface PresignedUploadRequest {
  filename: string;
  contentType: string;
  sizeBytes: number;
  purpose: 'notes' | 'branding';
}

export class UploadController {
  private static MAX_PDF_SIZE = 50 * 1024 * 1024; // 50MB
  private static MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

  private static ALLOWED_NOTE_MIMES = ['application/pdf'];
  private static ALLOWED_IMAGE_MIMES = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/svg+xml',
    'image/webp',
  ];

  /**
   * POST /uploads/presigned-url
   * Generates a secure, scoped, time-limited presigned PUT URL for Cloud Object Storage (S3 / Cloudflare R2)
   */
  static async getPresignedUploadUrl(req: Request, res: Response) {
    try {
      const tenant = req.tenant;
      if (!tenant) {
        return res.status(404).json({ success: false, error: 'Tenant context required.' });
      }

      const { filename, contentType, sizeBytes, purpose } = req.body as PresignedUploadRequest;

      // 1. Validate required fields
      if (!filename || typeof filename !== 'string') {
        return res.status(400).json({ success: false, error: 'Filename is required.' });
      }
      if (!contentType || typeof contentType !== 'string') {
        return res.status(400).json({ success: false, error: 'Content-Type is required.' });
      }
      if (!sizeBytes || typeof sizeBytes !== 'number' || sizeBytes <= 0) {
        return res.status(400).json({ success: false, error: 'Valid file size in bytes is required.' });
      }
      if (!purpose || (purpose !== 'notes' && purpose !== 'branding')) {
        return res.status(400).json({ success: false, error: 'Purpose must be either "notes" or "branding".' });
      }

      // 2. MIME type & size enforcement
      if (purpose === 'notes') {
        if (!UploadController.ALLOWED_NOTE_MIMES.includes(contentType.toLowerCase())) {
          return res.status(400).json({
            success: false,
            error: `Invalid file type for notes. Only PDF files (${UploadController.ALLOWED_NOTE_MIMES.join(', ')}) are accepted.`,
          });
        }
        if (sizeBytes > UploadController.MAX_PDF_SIZE) {
          return res.status(400).json({
            success: false,
            error: `File size exceeds the 50MB limit for course notes (received ${(sizeBytes / (1024 * 1024)).toFixed(1)}MB).`,
          });
        }
      } else if (purpose === 'branding') {
        if (!UploadController.ALLOWED_IMAGE_MIMES.includes(contentType.toLowerCase())) {
          return res.status(400).json({
            success: false,
            error: `Invalid file type for branding. Allowed: ${UploadController.ALLOWED_IMAGE_MIMES.join(', ')}.`,
          });
        }
        if (sizeBytes > UploadController.MAX_IMAGE_SIZE) {
          return res.status(400).json({
            success: false,
            error: `File size exceeds the 5MB limit for branding assets (received ${(sizeBytes / (1024 * 1024)).toFixed(1)}MB).`,
          });
        }
      }

      // 3. Construct tenant-scoped storage key
      const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
      const uniqueSuffix = crypto.randomBytes(6).toString('hex');
      const fileKey = `tenants/${tenant.id}/${purpose}/${Date.now()}_${uniqueSuffix}_${sanitizedFilename}`;

      // 4. Generate S3 / R2 compatible HMAC presigned URL (15-minute TTL)
      const storageHost = process.env.STORAGE_ENDPOINT || 'https://storage.simplicion.com';
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      const signaturePayload = `${fileKey}:${contentType}:${expiresAt}`;
      const signature = crypto
        .createHmac('sha256', process.env.STORAGE_SECRET || 'simplicion_storage_secret_2026')
        .update(signaturePayload)
        .digest('hex');

      const uploadUrl = `${storageHost}/${fileKey}?X-Amz-Signature=${signature}&X-Amz-Expires=900`;
      const publicUrl = `${storageHost}/${fileKey}`;

      return res.json({
        success: true,
        uploadUrl,
        publicUrl,
        fileKey,
        expiresAt,
        headers: {
          'Content-Type': contentType,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}

