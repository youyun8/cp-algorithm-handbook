import { notFound } from 'next/navigation';
import { PageTransition } from '@/components/PageTransition';
import { TopicHandbook } from '@/components/TopicHandbook';
import { getProblemsByTopic, getTopicBySlug, kSubtopics, kTopics } from '@/lib/data';

export function generateStaticParams() {
  return kTopics.map((topic) => ({ slug: topic.slug }));
}

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);

  if (!topic) {
    notFound();
  }

  return (
    <PageTransition>
      <TopicHandbook
        topic={topic}
        topics={kTopics}
        subtopics={kSubtopics}
        problems={getProblemsByTopic(topic.id)}
      />
    </PageTransition>
  );
}
