import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  tmdb,
  getImageUrl,
  getBackdropUrl,
  getPlayerUrl,
  type TMDBMovieDetail,
  type TMDBTVDetail,
  type TMDBEpisode,
  type TMDBItem,
} from '@/lib/tmdb';
import Header from '@/components/Header';
import VideoCard from '@/components/VideoCard';
import { Loader2, Calendar, MapPin, Star, Clapperboard, Play } from 'lucide-react';

export default function DetailPage() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const mediaType = type as 'movie' | 'tv';
  const mediaId = Number(id);

  const [movie, setMovie] = useState<TMDBMovieDetail | null>(null);
  const [tv, setTv] = useState<TMDBTVDetail | null>(null);
  const [episodes, setEpisodes] = useState<TMDBEpisode[]>([]);
  const [similar, setSimilar] = useState<TMDBItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEp, setSelectedEp] = useState(1);
  const [playerUrl, setPlayerUrl] = useState('');

  useEffect(() => {
    setLoading(true);
    setPlaying(false);
    setPlayerUrl('');
    setSelectedSeason(1);
    setSelectedEp(1);

    if (mediaType === 'movie') {
      Promise.all([
        tmdb.movieDetail(mediaId),
        tmdb.movieSimilar(mediaId),
      ])
        .then(([detail, sim]) => {
          setMovie(detail);
          setTv(null);
          setSimilar(sim.results?.slice(0, 6) || []);
        })
        .finally(() => setLoading(false));
    } else {
      Promise.all([
        tmdb.tvDetail(mediaId),
        tmdb.tvSimilar(mediaId),
      ])
        .then(([detail, sim]) => {
          setTv(detail);
          setMovie(null);
          setSimilar(sim.results?.slice(0, 6) || []);
          // Load first season episodes
          if (detail.seasons?.length > 0) {
            const firstSeason = detail.seasons.find((s) => s.season_number > 0) || detail.seasons[0];
            setSelectedSeason(firstSeason.season_number);
            tmdb.tvSeasonDetail(mediaId, firstSeason.season_number).then((s) => {
              setEpisodes(s.episodes || []);
            });
          }
        })
        .finally(() => setLoading(false));
    }
  }, [mediaType, mediaId]);

  const handlePlay = (season?: number, episode?: number) => {
    const url = getPlayerUrl(mediaId, mediaType, season, episode);
    setPlayerUrl(url);
    setPlaying(true);
    if (episode) setSelectedEp(episode);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSeasonChange = (seasonNum: number) => {
    setSelectedSeason(seasonNum);
    tmdb.tvSeasonDetail(mediaId, seasonNum).then((s) => {
      setEpisodes(s.episodes || []);
    });
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
      {/* Backdrop */}
      {backdrop && (
        <div
          className="fixed inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `url(${backdrop})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(40px)',
          }}
        />
      )}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: 'var(--gradient-hero)' }}
      />

      <div className="relative z-10">
        <Header />
        <main className="container mx-auto px-4 pb-20">
          {/* Player */}
          {playing && playerUrl && (
            <div className="mt-4 rounded-2xl overflow-hidden glass aspect-video">
              <iframe
                src={playerUrl}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; fullscreen; encrypted-media"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                title={title}
              />
            </div>
          )}

          {/* Info Section */}
          <div className="mt-6 flex flex-col md:flex-row gap-6">
            <div className="shrink-0 self-start">
              <img
                src={getImageUrl(detail.poster_path, 'w342')}
                alt={title}
                className="w-36 md:w-48 aspect-[2/3] object-cover rounded-xl glass"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">{title}</h1>

              <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
                {genres && (
                  <span className="flex items-center gap-1">
                    <Clapperboard className="w-3.5 h-3.5" /> {genres}
                  </span>
                )}
                {year && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {year}
                  </span>
                )}
                {detail.vote_average > 0 && (
                  <span className="flex items-center gap-1 text-yellow-400">
                    <Star className="w-3.5 h-3.5 fill-yellow-400" /> {detail.vote_average.toFixed(1)}
                  </span>
                )}
                {movie?.production_countries?.[0] && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {movie.production_countries[0].name}
                  </span>
                )}
                {tv?.origin_country?.[0] && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {tv.origin_country[0]}
                  </span>
                )}
              </div>

              {detail.overview && (
                <p className="text-sm text-secondary-foreground/80 mt-4 leading-relaxed line-clamp-4">
                  {detail.overview}
                </p>
              )}

              {/* Play button for movies */}
              {mediaType === 'movie' && !playing && (
                <button
                  onClick={() => handlePlay()}
                  className="mt-5 flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm glow hover:opacity-90 transition-all"
                >
                  <Play className="w-5 h-5" /> 立即播放
                </button>
              )}

              {/* TV info */}
              {tv && (
                <div className="mt-3 text-xs text-muted-foreground">
                  共 {tv.number_of_seasons} 季 · {tv.number_of_episodes} 集
                </div>
              )}
            </div>
          </div>

          {/* TV Season & Episode selector */}
          {mediaType === 'tv' && tv && (
            <div className="mt-8 space-y-4">
              {/* Season tabs */}
              {tv.seasons.filter((s) => s.season_number > 0).length > 1 && (
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {tv.seasons
                    .filter((s) => s.season_number > 0)
                    .map((season) => (
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

              {/* Episodes */}
              <div className="glass rounded-2xl p-4">
                <h3 className="text-sm font-medium mb-3 text-foreground">选集 - 点击播放</h3>
                <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto scrollbar-hide">
                  {episodes.map((ep) => (
                    <button
                      key={ep.episode_number}
                      onClick={() => handlePlay(selectedSeason, ep.episode_number)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        playing && ep.episode_number === selectedEp
                          ? 'bg-primary text-primary-foreground glow'
                          : 'bg-secondary/50 text-secondary-foreground hover:bg-secondary'
                      }`}
                      title={ep.name}
                    >
                      第{ep.episode_number}集
                    </button>
                  ))}
                  {episodes.length === 0 && (
                    <p className="text-xs text-muted-foreground">暂无剧集信息</p>
                  )}
                </div>
              </div>

              {/* Play button if not playing yet */}
              {!playing && episodes.length > 0 && (
                <button
                  onClick={() => handlePlay(selectedSeason, 1)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm glow hover:opacity-90 transition-all"
                >
                  <Play className="w-5 h-5" /> 开始播放第1集
                </button>
              )}
            </div>
          )}

          {/* Similar */}
          {similar.length > 0 && (
            <div className="mt-12">
              <h3 className="text-lg font-bold mb-4">🎯 相关推荐</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {similar.map((item) => (
                  <VideoCard
                    key={item.id}
                    item={{ ...item, media_type: mediaType }}
                  />
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
