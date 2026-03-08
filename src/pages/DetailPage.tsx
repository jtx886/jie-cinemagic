import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  tmdb,
  getImageUrl,
  getBackdropUrl,
  searchVod,
  parsePlayUrls,
  type TMDBMovieDetail,
  type TMDBTVDetail,
  type TMDBEpisode,
  type TMDBItem,
  type PlaySource,
} from '@/lib/tmdb';
import Header from '@/components/Header';
import VideoCard from '@/components/VideoCard';
import HlsPlayer from '@/components/HlsPlayer';
import { Loader2, Calendar, MapPin, Star, Clapperboard, Play, Search } from 'lucide-react';

export default function DetailPage() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const mediaType = type as 'movie' | 'tv';
  const mediaId = Number(id);

  const [movie, setMovie] = useState<TMDBMovieDetail | null>(null);
  const [tv, setTv] = useState<TMDBTVDetail | null>(null);
  const [episodes, setEpisodes] = useState<TMDBEpisode[]>([]);
  const [similar, setSimilar] = useState<TMDBItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Video playback state
  const [playing, setPlaying] = useState(false);
  const [playUrl, setPlayUrl] = useState('');
  const [vodSources, setVodSources] = useState<PlaySource[]>([]);
  const [activeSource, setActiveSource] = useState(0);
  const [activeEp, setActiveEp] = useState(0);
  const [vodLoading, setVodLoading] = useState(false);
  const [vodError, setVodError] = useState('');

  // TV season
  const [selectedSeason, setSelectedSeason] = useState(1);

  useEffect(() => {
    setLoading(true);
    setPlaying(false);
    setPlayUrl('');
    setVodSources([]);
    setVodError('');
    setSelectedSeason(1);

    if (mediaType === 'movie') {
      Promise.all([tmdb.movieDetail(mediaId), tmdb.movieSimilar(mediaId)])
        .then(([detail, sim]) => {
          setMovie(detail);
          setTv(null);
          setSimilar(sim.results?.slice(0, 6) || []);
        })
        .finally(() => setLoading(false));
    } else {
      Promise.all([tmdb.tvDetail(mediaId), tmdb.tvSimilar(mediaId)])
        .then(([detail, sim]) => {
          setTv(detail);
          setMovie(null);
          setSimilar(sim.results?.slice(0, 6) || []);
          if (detail.seasons?.length > 0) {
            const first = detail.seasons.find((s) => s.season_number > 0) || detail.seasons[0];
            setSelectedSeason(first.season_number);
            tmdb.tvSeasonDetail(mediaId, first.season_number).then((s) => setEpisodes(s.episodes || []));
          }
        })
        .finally(() => setLoading(false));
    }
  }, [mediaType, mediaId]);

  // Search for video sources when user clicks play
  const handlePlay = async () => {
    const title = movie?.title || tv?.name || '';
    if (!title) return;

    setVodLoading(true);
    setVodError('');
    setPlaying(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const results = await searchVod(title);
      if (results.length === 0) {
        setVodError('未找到播放资源，请尝试其他影视');
        setVodLoading(false);
        return;
      }

      // Find best match
      const match = results.find((r) => r.vod_name === title) || results[0];
      const sources = parsePlayUrls(match.vod_play_url, match.vod_play_from);

      if (sources.length === 0 || sources.every((s) => s.urls.length === 0)) {
        setVodError('未找到可用的m3u8播放源');
        setVodLoading(false);
        return;
      }

      setVodSources(sources);
      setActiveSource(0);
      setActiveEp(0);
      setPlayUrl(sources[0].urls[0].url);
    } catch {
      setVodError('资源搜索失败，请稍后重试');
    } finally {
      setVodLoading(false);
    }
  };

  const selectEpisode = (sourceIdx: number, epIdx: number) => {
    setActiveSource(sourceIdx);
    setActiveEp(epIdx);
    setPlayUrl(vodSources[sourceIdx]?.urls[epIdx]?.url || '');
  };

  const handleSeasonChange = (seasonNum: number) => {
    setSelectedSeason(seasonNum);
    tmdb.tvSeasonDetail(mediaId, seasonNum).then((s) => setEpisodes(s.episodes || []));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex justify-center py-32">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  const detail = movie || tv;
  if (!detail) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex justify-center py-32 text-muted-foreground">未找到该影视</div>
      </div>
    );
  }

  const title = movie?.title || tv?.name || '';
  const year = (movie?.release_date || tv?.first_air_date || '').slice(0, 4);
  const genres = detail.genres?.map((g) => g.name).join(' / ') || '';
  const backdrop = getBackdropUrl(detail.backdrop_path);

  return (
    <div className="min-h-screen bg-background">
      {backdrop && (
        <div
          className="fixed inset-0 pointer-events-none opacity-20"
          style={{ backgroundImage: `url(${backdrop})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(40px)' }}
        />
      )}
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'var(--gradient-hero)' }} />

      <div className="relative z-10">
        <Header />
        <main className="container mx-auto px-4 pb-20">
          {/* Player area */}
          {playing && (
            <div className="mt-4 space-y-3">
              {vodLoading ? (
                <div className="aspect-video glass rounded-2xl flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground">
                    <Search className="w-4 h-4 inline mr-1" />
                    正在搜索播放资源...
                  </p>
                </div>
              ) : vodError ? (
                <div className="aspect-video glass rounded-2xl flex flex-col items-center justify-center gap-3">
                  <p className="text-sm text-muted-foreground">{vodError}</p>
                  <button
                    onClick={handlePlay}
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium"
                  >
                    重新搜索
                  </button>
                </div>
              ) : playUrl ? (
                <div className="glass rounded-2xl overflow-hidden">
                  {/* Source & episode selector */}
                  {vodSources.length > 0 && (
                    <div className="p-3 border-b border-border/50">
                      {/* Source tabs */}
                      {vodSources.length > 1 && (
                        <div className="flex gap-1.5 mb-2 overflow-x-auto scrollbar-hide">
                          <span className="text-xs text-muted-foreground shrink-0 py-1">线路：</span>
                          {vodSources.map((src, i) => (
                            <button
                              key={i}
                              onClick={() => selectEpisode(i, 0)}
                              className={`shrink-0 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                                i === activeSource
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-secondary/50 text-secondary-foreground hover:bg-secondary'
                              }`}
                            >
                              {src.name || `线路${i + 1}`}
                            </button>
                          ))}
                        </div>
                      )}
                      {/* Episode buttons */}
                      {vodSources[activeSource]?.urls.length > 1 && (
                        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto scrollbar-hide">
                          {vodSources[activeSource].urls.map((ep, i) => (
                            <button
                              key={i}
                              onClick={() => selectEpisode(activeSource, i)}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                                i === activeEp
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-secondary/50 text-secondary-foreground hover:bg-secondary'
                              }`}
                            >
                              {ep.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <HlsPlayer url={playUrl} />
                  <div className="px-3 py-2 text-[10px] text-muted-foreground/60 text-center">
                    无广告直连播放 · 如加载失败请切换线路
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Info */}
          <div className="mt-6 flex flex-col md:flex-row gap-6">
            <div className="shrink-0 self-start">
              <img
                src={getImageUrl(detail.poster_path, 'w342')}
                alt={title}
                className="w-36 md:w-48 aspect-[2/3] object-cover rounded-xl glass"
                onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
              />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">{title}</h1>
              <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
                {genres && (
                  <span className="flex items-center gap-1"><Clapperboard className="w-3.5 h-3.5" /> {genres}</span>
                )}
                {year && (
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {year}</span>
                )}
                {detail.vote_average > 0 && (
                  <span className="flex items-center gap-1 text-yellow-400">
                    <Star className="w-3.5 h-3.5 fill-yellow-400" /> {detail.vote_average.toFixed(1)}
                  </span>
                )}
                {movie?.production_countries?.[0] && (
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {movie.production_countries[0].name}</span>
                )}
                {tv?.origin_country?.[0] && (
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {tv.origin_country[0]}</span>
                )}
              </div>
              {detail.overview && (
                <p className="text-sm text-secondary-foreground/80 mt-4 leading-relaxed line-clamp-4">{detail.overview}</p>
              )}

              <button
                onClick={handlePlay}
                className="mt-5 flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm glow hover:opacity-90 transition-all"
              >
                <Play className="w-5 h-5" /> {playing ? '重新搜索资源' : '搜索并播放'}
              </button>

              {tv && (
                <div className="mt-3 text-xs text-muted-foreground">
                  共 {tv.number_of_seasons} 季 · {tv.number_of_episodes} 集
                </div>
              )}
            </div>
          </div>

          {/* TV Season info from TMDB */}
          {mediaType === 'tv' && tv && (
            <div className="mt-8 space-y-4">
              {tv.seasons.filter((s) => s.season_number > 0).length > 1 && (
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {tv.seasons.filter((s) => s.season_number > 0).map((season) => (
                    <button
                      key={season.season_number}
                      onClick={() => handleSeasonChange(season.season_number)}
                      className={`shrink-0 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                        season.season_number === selectedSeason
                          ? 'bg-primary text-primary-foreground glow'
                          : 'glass text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {season.name}
                    </button>
                  ))}
                </div>
              )}
              {episodes.length > 0 && (
                <div className="glass rounded-2xl p-4">
                  <h3 className="text-sm font-medium mb-3 text-foreground">剧集信息</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-hide">
                    {episodes.map((ep) => (
                      <div key={ep.episode_number} className="flex gap-3 p-2 rounded-lg bg-secondary/30">
                        <span className="shrink-0 w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-xs font-medium text-foreground">
                          {ep.episode_number}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{ep.name}</p>
                          {ep.air_date && <p className="text-[10px] text-muted-foreground">{ep.air_date}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Similar */}
          {similar.length > 0 && (
            <div className="mt-12">
              <h3 className="text-lg font-bold mb-4">🎯 相关推荐</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {similar.map((item) => (
                  <VideoCard key={item.id} item={{ ...item, media_type: mediaType }} />
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
