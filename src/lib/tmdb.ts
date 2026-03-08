const TMDB_API_KEY = 'cb44223c5dee5676ed3a839f42ed27e3';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p';

// CORS proxy for Chinese video APIs
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
const VOD_API = 'https://api.ffzyapi.com/api.php/provide/vod/';

export const getImageUrl = (path: string | null, size = 'w500') => {
  if (!path) return '/placeholder.svg';
  return `${IMG_BASE}/${size}${path}`;
};

export const getBackdropUrl = (path: string | null) => {
  if (!path) return '';
  return `${IMG_BASE}/w1280${path}`;
};

// ---- TMDB types ----
export interface TMDBItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: string;
  genre_ids?: number[];
  original_language?: string;
}

export interface TMDBMovieDetail {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  release_date: string;
  runtime: number;
  genres: { id: number; name: string }[];
  production_countries: { name: string }[];
  tagline: string;
  status: string;
}

export interface TMDBTVDetail {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  first_air_date: string;
  number_of_seasons: number;
  number_of_episodes: number;
  genres: { id: number; name: string }[];
  seasons: TMDBSeason[];
  status: string;
  origin_country: string[];
}

export interface TMDBSeason {
  id: number;
  season_number: number;
  name: string;
  episode_count: number;
  poster_path: string | null;
  air_date: string;
}

export interface TMDBEpisode {
  id: number;
  episode_number: number;
  season_number: number;
  name: string;
  overview: string;
  still_path: string | null;
  air_date: string;
}

interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

async function tmdbFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const searchParams = new URLSearchParams({
    api_key: TMDB_API_KEY,
    language: 'zh-CN',
    ...params,
  });
  const res = await fetch(`${TMDB_BASE}${endpoint}?${searchParams}`);
  if (!res.ok) throw new Error('TMDB API error');
  return res.json();
}

// ---- VOD API (for actual video streams) ----
export interface VodItem {
  vod_id: number;
  vod_name: string;
  vod_pic: string;
  vod_remarks: string;
  vod_play_url: string;
  vod_play_from: string;
  vod_content: string;
  type_name: string;
}

export interface PlaySource {
  name: string;
  urls: { label: string; url: string }[];
}

interface VodResponse {
  code: number;
  list: VodItem[];
  total: number;
  pagecount: number;
}

export async function searchVod(keyword: string): Promise<VodItem[]> {
  try {
    const url = `${VOD_API}?ac=detail&wd=${encodeURIComponent(keyword)}`;
    const res = await fetch(`${CORS_PROXY}${encodeURIComponent(url)}`);
    if (!res.ok) throw new Error('VOD API error');
    const data: VodResponse = await res.json();
    return data.list || [];
  } catch (e) {
    console.error('VOD search error:', e);
    return [];
  }
}

export function parsePlayUrls(playUrl: string, playFrom: string): PlaySource[] {
  const sources = playFrom.split('$$$');
  const urlGroups = playUrl.split('$$$');

  return sources.map((sourceName, i) => {
    const urlStr = urlGroups[i] || '';
    const episodes = urlStr.split('#').filter(Boolean).map((ep) => {
      const parts = ep.split('$');
      return { label: parts[0] || '播放', url: parts[1] || '' };
    });
    return { name: sourceName, urls: episodes };
  }).filter(s => s.urls.length > 0 && s.urls.some(u => u.url.includes('.m3u8')));
}

// ---- TMDB public API ----
export const tmdb = {
  trending: (page = 1) =>
    tmdbFetch<TMDBResponse<TMDBItem>>('/trending/all/week', { page: String(page) }),
  moviesPopular: (page = 1) =>
    tmdbFetch<TMDBResponse<TMDBItem>>('/movie/popular', { page: String(page) }),
  moviesTopRated: (page = 1) =>
    tmdbFetch<TMDBResponse<TMDBItem>>('/movie/top_rated', { page: String(page) }),
  moviesNowPlaying: (page = 1) =>
    tmdbFetch<TMDBResponse<TMDBItem>>('/movie/now_playing', { page: String(page) }),
  tvPopular: (page = 1) =>
    tmdbFetch<TMDBResponse<TMDBItem>>('/tv/popular', { page: String(page) }),
  tvTopRated: (page = 1) =>
    tmdbFetch<TMDBResponse<TMDBItem>>('/tv/top_rated', { page: String(page) }),
  anime: (page = 1) =>
    tmdbFetch<TMDBResponse<TMDBItem>>('/discover/tv', {
      page: String(page),
      with_genres: '16',
      with_original_language: 'ja',
      sort_by: 'popularity.desc',
    }),
  dongman: (page = 1) =>
    tmdbFetch<TMDBResponse<TMDBItem>>('/discover/tv', {
      page: String(page),
      with_genres: '16',
      sort_by: 'popularity.desc',
    }),
  search: (query: string, page = 1) =>
    tmdbFetch<TMDBResponse<TMDBItem>>('/search/multi', { query, page: String(page) }),
  movieDetail: (id: number) =>
    tmdbFetch<TMDBMovieDetail>(`/movie/${id}`),
  tvDetail: (id: number) =>
    tmdbFetch<TMDBTVDetail>(`/tv/${id}`),
  tvSeasonDetail: (tvId: number, seasonNumber: number) =>
    tmdbFetch<{ episodes: TMDBEpisode[] }>(`/tv/${tvId}/season/${seasonNumber}`),
  movieSimilar: (id: number) =>
    tmdbFetch<TMDBResponse<TMDBItem>>(`/movie/${id}/similar`),
  tvSimilar: (id: number) =>
    tmdbFetch<TMDBResponse<TMDBItem>>(`/tv/${id}/similar`),
};

export const getTitle = (item: TMDBItem) => item.title || item.name || '未知';
export const getYear = (item: TMDBItem) => (item.release_date || item.first_air_date || '').slice(0, 4);
export const getMediaType = (item: TMDBItem): 'movie' | 'tv' => {
  if (item.media_type === 'movie') return 'movie';
  if (item.media_type === 'tv') return 'tv';
  return item.title ? 'movie' : 'tv';
};
