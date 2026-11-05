import { describe, it, expect } from 'vitest';
import { UploadController } from '../src/controllers/upload.controller';

describe('Cloud Object Storage Presigned Uploads Pipeline (S3 / Cloudflare R2)', () => {
  const tenant = { id: 'tenant_cuet_01', slug: 'cuet' };

  it('rejects upload request without active tenant context', async () => {
    const req: any = { body: { filename: 'notes.pdf', contentType: 'application/pdf', sizeBytes: 1024, purpose: 'notes' } };
    let statusCode = 0;
    let jsonBody: any = null;
    const res: any = {
      status: (code: number) => {
        statusCode = code;
        return { json: (b: any) => { jsonBody = b; } };
      },
    };

    await UploadController.getPresignedUploadUrl(req, res);
    expect(statusCode).toBe(404);
    expect(jsonBody.error).toBe('Tenant context required.');
  });

  it('rejects non-PDF files when purpose is "notes"', async () => {
    const req: any = {
      tenant,
      body: {
        filename: 'malicious_script.exe',
        contentType: 'application/x-msdownload',
        sizeBytes: 50000,
        purpose: 'notes',
      },
    };
    let statusCode = 0;
    let jsonBody: any = null;
    const res: any = {
      status: (code: number) => {
        statusCode = code;
        return { json: (b: any) => { jsonBody = b; } };
      },
    };

    await UploadController.getPresignedUploadUrl(req, res);
    expect(statusCode).toBe(400);
    expect(jsonBody.error).toContain('Only PDF files (application/pdf) are accepted');
  });

  it('rejects notes PDFs exceeding the 50MB maximum size limit', async () => {
    const oversizedBytes = 55 * 1024 * 1024; // 55MB
    const req: any = {
      tenant,
      body: {
        filename: 'huge_notes_book.pdf',
        contentType: 'application/pdf',
        sizeBytes: oversizedBytes,
        purpose: 'notes',
      },
    };
    let statusCode = 0;
    let jsonBody: any = null;
    const res: any = {
      status: (code: number) => {
        statusCode = code;
        return { json: (b: any) => { jsonBody = b; } };
      },
    };

    await UploadController.getPresignedUploadUrl(req, res);
    expect(statusCode).toBe(400);
    expect(jsonBody.error).toContain('exceeds the 50MB limit');
  });

  it('rejects branding images exceeding the 5MB maximum limit', async () => {
    const oversizedImgBytes = 8 * 1024 * 1024; // 8MB
    const req: any = {
      tenant,
      body: {
        filename: 'massive_banner.png',
        contentType: 'image/png',
        sizeBytes: oversizedImgBytes,
        purpose: 'branding',
      },
    };
    let statusCode = 0;
    let jsonBody: any = null;
    const res: any = {
      status: (code: number) => {
        statusCode = code;
        return { json: (b: any) => { jsonBody = b; } };
      },
    };

    await UploadController.getPresignedUploadUrl(req, res);
    expect(statusCode).toBe(400);
    expect(jsonBody.error).toContain('exceeds the 5MB limit');
  });

  it('successfully generates scoped presigned upload URL and public URL for valid notes PDF', async () => {
    const req: any = {
      tenant,
      body: {
        filename: 'Unit_1_Modern_Indian_History.pdf',
        contentType: 'application/pdf',
        sizeBytes: 12 * 1024 * 1024, // 12MB
        purpose: 'notes',
      },
    };
    let jsonBody: any = null;
    const res: any = {
      json: (b: any) => { jsonBody = b; },
    };

    await UploadController.getPresignedUploadUrl(req, res);

    expect(jsonBody.success).toBe(true);
    expect(jsonBody.uploadUrl).toBeDefined();
    expect(jsonBody.fileKey).toContain(`tenants/${tenant.id}/notes/`);
    expect(jsonBody.fileKey).toContain('Unit_1_Modern_Indian_History.pdf');
    expect(jsonBody.uploadUrl).toContain('X-Amz-Signature=');
    expect(jsonBody.uploadUrl).toContain('X-Amz-Expires=900');
    expect(jsonBody.publicUrl).toContain(jsonBody.fileKey);
    expect(jsonBody.headers['Content-Type']).toBe('application/pdf');
  });
});

