'use client';

export const runtime = 'edge';

import React from 'react';
import { useParams } from 'next/navigation';
import { LiveClassesView } from '../../../../components/course/LiveClassesView';

export default function CourseLiveClassesPage() {
  const params = useParams();
  const courseId = params?.id as string;

  return <LiveClassesView courseId={courseId} />;
}
