-- Simplicion Academy — Live Classes Metadata, Attendance, Realtime & Storage Policies
-- Idempotent migration safe for repeated execution on Supabase PostgreSQL

ALTER TABLE "LiveSession" ADD COLUMN IF NOT EXISTS "subjectTitle" TEXT;
ALTER TABLE "LiveSession" ADD COLUMN IF NOT EXISTS "topicId" TEXT;
ALTER TABLE "LiveSession" ADD COLUMN IF NOT EXISTS "topicTitle" TEXT;

CREATE TABLE IF NOT EXISTS "LiveSessionAttendance" (
  "id" TEXT PRIMARY KEY,
  "sessionId" TEXT NOT NULL REFERENCES "LiveSession"("id") ON DELETE CASCADE,
  "courseId" TEXT NOT NULL,
  "tenantSlug" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "studentName" TEXT NOT NULL,
  "studentEmail" TEXT,
  "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LiveSessionAttendance_sessionId_studentId_key" UNIQUE ("sessionId", "studentId")
);

CREATE INDEX IF NOT EXISTS "LiveSessionAttendance_sessionId_idx" ON "LiveSessionAttendance"("sessionId");
CREATE INDEX IF NOT EXISTS "LiveSessionAttendance_tenantSlug_idx" ON "LiveSessionAttendance"("tenantSlug");

DO $$
DECLARE
  tbl text;
  pol text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'Tenant',
    'TenantSettings',
    'StudioCourse',
    'CourseEnrollment',
    'LiveSession',
    'LiveSessionAttendance',
    'CourseChatMessage',
    'CourseDoubt',
    'StudentNotification',
    'CourseTest',
    'CourseTestQuestion'
  ]
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = tbl
    ) THEN
      IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
         AND NOT EXISTS (
           SELECT 1 FROM pg_publication_tables
           WHERE pubname = 'supabase_realtime' AND tablename = tbl
         ) THEN
        EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I', tbl);
      END IF;

      EXECUTE format('GRANT SELECT ON TABLE public.%I TO anon, authenticated', tbl);
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
      EXECUTE format('ALTER TABLE public.%I REPLICA IDENTITY FULL', tbl);

      pol := 'simplicion_realtime_read_' || lower(tbl);
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = tbl AND policyname = pol
      ) THEN
        EXECUTE format(
          'CREATE POLICY %I ON public.%I FOR SELECT TO anon, authenticated USING (true)',
          pol,
          tbl
        );
      END IF;
    END IF;
  END LOOP;
END $$;
