import { useEffect, useState } from 'react';
import { type TMDBItem } from '@/lib/tmdb';
import VideoCard from './VideoCard';
import { ChevronRight, Loader2 } from 'lucide-react';

interface Props {
  title: string;
  icon: string;
  fetcher: () => Promise<{ results: TMDBItem[] }>;
  moreLink?: string;
}

export default function CategorySection({ title, icon, fetcher, moreLink }: Props) {
  const [items, setItems] = useState<TMDBItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetcher()
      .then((res) => setItems(res.results?.slice(0, 12) || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <span>{icon}</span>
          <span>{title}</span>
        </h2>
        {moreLink && (
          <a href={moreLink} className="text-xs text-primary flex items-center gap-0.5 hover:underline">
            更多 <ChevronRight className="w-3 h-3" />
          </a>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
          {items.map((item) => (
            <VideoCard key={`${item.id}-${item.media_type}`} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
