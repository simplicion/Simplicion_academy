'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@simplicion/ui';
import { CurriculumTree } from '../../../../components/batches/CurriculumTree';

export default function BatchCurriculumPage() {
  const params = useParams();
  const batchId = params?.id as string;

  return (
    <div className="space-y-6">
      {/* Back Button & Header */}
      <div className="flex items-center space-x-3">
        <Link href="/batches">
          <Button variant="outline" size="sm" className="gap-1 text-xs">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Batches</span>
          </Button>
        </Link>
        <div>
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
            Curriculum Builder • {batchId}
          </span>
        </div>
      </div>

      {/* Interactive Curriculum Tree */}
      <CurriculumTree
        batchTitle="CUET 2027: Humanities Foundation Batch"
        onSave={(data) => {
          console.log('Saved curriculum tree:', data);
        }}
      />
    </div>
  );
}

