import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchVodList, type VodItem } from '@/lib/videoApi';
import Header from '@/components/Header';
import NavBar from '@/components/NavBar';
import VideoCard from '@/components/VideoCard';
import { Loader2, SearchX } from 'lucide-react';

export default function SearchPage() {
  const [params] = useSearchParams();
  const query = params.get('q') || '';
  const [items, setItems] = useState<VodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    setPage(1);
    fetchVodList({ wd: query, pg: 1 })
      .then((res) => {
        setItems(res.list || []);
        setTotalPages(res.pagecount || 1);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [query]);

  const loadMore = () => {
    const next = page + 1;
    if (next > totalPages) return;
    setLoading(true);
    fetchVodList({ wd: query, pg: next })
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
        <h2 className="text-lg font-bold mb-4">
          搜索结果：<span className="text-primary">{query}</span>
        </h2>

        {loading && items.length === 0 ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-muted-foreground">
            <SearchX className="w-16 h-16 mb-4 opacity-40" />
            <p>未找到相关内容</p>
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
