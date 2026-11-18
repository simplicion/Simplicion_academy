import { redirect } from 'next/navigation';

export const runtime = 'edge';

/**
 * Local dev fallback for `/t` on Student Portal (port 3001).
 * In production on learnings.simplicion.com, Cloudflare Worker routes `/t*`
 * directly to the Teacher Portal (learnings-teacher-portal.pages.dev/t*).
 */
export default function TeacherPortalRedirectPage() {
  const target = process.env.NEXT_PUBLIC_TEACHER_PORTAL_URL || 'http://localhost:3002';
  redirect(target);
}
