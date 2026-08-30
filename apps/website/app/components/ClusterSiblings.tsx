import Link from 'next/link';
import { clusterOfSlug } from '@/lib/clusters';
import { getArticle } from '@/app/articles/articles-data';

// Hub-and-spoke §2 enforcement, isolated in its own module so the cluster lookup
// is not pulled directly into the /articles/[slug] route chunk. Renders the pillar
// + sibling spokes of the given article's cluster (auto, from lib/clusters).
export default function ClusterSiblings({ slug }: { slug: string }) {
  const cluster = clusterOfSlug(slug);
  if (!cluster) return null;
  const links = [cluster.pillarSlug, ...cluster.spokeSlugs]
    .filter((s) => s !== slug)
    .map((s) => getArticle(s))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));
  if (links.length === 0) return null;
  return (
    <div className="article-related">
      <h2>עוד באשכול: {cluster.title}</h2>
      <ul>
        {links.map((a) => (
          <li key={a.slug}>
            <Link href={`/articles/${a.slug}`}>{a.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
