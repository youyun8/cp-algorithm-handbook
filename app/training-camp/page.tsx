import type { Metadata } from 'next';
import { PageTransition } from '@/components/PageTransition';
import { TrainingCampOverview } from '@/components/TrainingCampOverview';
import { getTrainingCampStats, kTrainingCampPhases } from '@/lib/trainingCamp';

export const metadata: Metadata = {
  title: '訓練營 | 競程策略手冊',
  description: '三大區域、二十八個關卡的競程訓練路線，循序整理每個知識節點的概念、實作與複雜度。'
};

export default function TrainingCampPage() {
  return (
    <PageTransition>
      <TrainingCampOverview phases={kTrainingCampPhases} stats={getTrainingCampStats()} />
    </PageTransition>
  );
}
