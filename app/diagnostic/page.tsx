import type { Metadata } from 'next';
import { PageTransition } from '@/components/PageTransition';
import { DiagnosticExperience } from '@/components/DiagnosticExperience';

export const metadata: Metadata = {
  title: '實力診斷 · 規劃 AK 學習路線',
  description: '18 題快速自評，估算週賽實力分數、找出瓶頸難度槽，並生成通往 LeetCode 週賽 AK 的專屬學習路線。'
};

export default function DiagnosticPage() {
  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <p className="text-sm font-medium text-primary">診斷與規劃</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">實力診斷</h1>
          <p className="mt-3 leading-7 text-muted-foreground">
            以週賽 AK（四題全解）為終點，先做一次快速自評，讓系統替你找出瓶頸並排出最短學習路線。
          </p>
        </div>
        <DiagnosticExperience />
      </div>
    </PageTransition>
  );
}
