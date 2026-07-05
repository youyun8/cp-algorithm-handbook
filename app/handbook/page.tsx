import { PageTransition } from '@/components/PageTransition';
import { TopicHandbook } from '@/components/TopicHandbook';
import { getProblemsByTopic, kSubtopics, kTopics } from '@/lib/data';

export default function HandbookPage() {
  const topic = kTopics[0];
  const topic_problems = getProblemsByTopic(topic.id);

  return (
    <PageTransition>
      <TopicHandbook topic={topic} topics={kTopics} subtopics={kSubtopics} problems={topic_problems} />
    </PageTransition>
  );
}
