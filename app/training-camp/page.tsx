import type { Metadata } from 'next';
import { PageTransition } from '@/components/PageTransition';
import { TrainingCampOverview } from '@/components/TrainingCampOverview';
import { getTrainingCampStats, kTrainingCampPhases } from '@/lib/trainingCamp';

export const metadata: Metadata = {
  title: '訓練營 | 競程策略手冊',
  description: '三階段、二十五講的競程訓練營路線。'
};

export default function TrainingCampPage() {
  return (
    <PageTransition>
      <TrainingCampOverview phases={kTrainingCampPhases} stats={getTrainingCampStats()} />
    </PageTransition>
  );
}
