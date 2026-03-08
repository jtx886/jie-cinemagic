import { useEffect, useState } from 'react';
import { fetchVodList, type VodItem } from '@/lib/videoApi';
import VideoCard from './VideoCard';
import { ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  title: string;
  icon: string;
  categoryId: number;
}

export default function CategorySection({ title, icon, categoryId }: Props) {
  const [items, setItems] = useState<VodItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVodList({ t: categoryId, pg: 1 })
      .then((res) => setItems(res.list?.slice(0, 12) || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [categoryId]);

  return (
    <section className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <span>{icon}</span>
          <span>{title}</span>
        </h2>
        <Link
          to={`/category/${categoryId}`}
          className="text-xs text-primary flex items-center gap-0.5 hover:underline"
        >
          更多 <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
          {items.map((item) => (
            <VideoCard key={item.vod_id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
