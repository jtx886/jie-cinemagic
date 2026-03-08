import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchVodList, CATEGORIES, type VodItem } from '@/lib/videoApi';
import Header from '@/components/Header';
import NavBar from '@/components/NavBar';
import VideoCard from '@/components/VideoCard';
import { Loader2 } from 'lucide-react';

export default function CategoryPage() {
  const { id } = useParams();
  const catId = Number(id);
  const [items, setItems] = useState<VodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const catInfo = Object.values(CATEGORIES).find((c) => c.id === catId);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    fetchVodList({ t: catId, pg: 1 })
      .then((res) => {
        setItems(res.list || []);
        setTotalPages(res.pagecount || 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [catId]);

  const loadMore = () => {
    const next = page + 1;
    if (next > totalPages) return;
    setLoading(true);
    fetchVodList({ t: catId, pg: next })
      .then((res) => {
        setItems((prev) => [...prev, ...(res.list || [])]);
        setPage(next);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pb-20">
        <NavBar />
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          {catInfo && <span>{catInfo.icon}</span>}
          <span>{catInfo?.label || '分类'}</span>
        </h2>

        {loading && items.length === 0 ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
              {items.map((item) => (
                <VideoCard key={item.vod_id} item={item} />
              ))}
            </div>
            {page < totalPages && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="glass px-8 py-2.5 rounded-xl text-sm font-medium text-primary hover:glow transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '加载更多'}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
