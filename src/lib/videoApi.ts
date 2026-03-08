const API_SITES = [
  'https://api.ffzyapi.com/api.php/provide/vod/',
];

export interface VodItem {
  vod_id: number;
  vod_name: string;
  vod_pic: string;
  vod_remarks: string;
  vod_year: string;
  vod_area: string;
  vod_content: string;
  vod_play_url: string;
  vod_play_from: string;
  type_name: string;
  vod_director: string;
  vod_actor: string;
  vod_blurb: string;
  vod_score: string;
}

export interface ApiResponse {
  code: number;
  msg: string;
  page: number;
  pagecount: number;
  limit: string;
  total: number;
  list: VodItem[];
}

export interface PlaySource {
  name: string;
  urls: { label: string; url: string }[];
}

const BASE_URL = API_SITES[0];

export async function fetchVodList(params: {
  ac?: string;
  t?: number;
  pg?: number;
  wd?: string;
  ids?: string;
}): Promise<ApiResponse> {
  const searchParams = new URLSearchParams();
  searchParams.set('ac', params.ac || 'detail');
  if (params.t) searchParams.set('t', String(params.t));
  if (params.pg) searchParams.set('pg', String(params.pg));
  if (params.wd) searchParams.set('wd', params.wd);
  if (params.ids) searchParams.set('ids', params.ids);

  const res = await fetch(`${BASE_URL}?${searchParams.toString()}`);
  if (!res.ok) throw new Error('API请求失败');
  return res.json();
}

export function parsePlayUrls(playUrl: string, playFrom: string): PlaySource[] {
  const sources = playFrom.split('$$$');
  const urlGroups = playUrl.split('$$$');

  return sources.map((sourceName, i) => {
    const urlStr = urlGroups[i] || '';
    const episodes = urlStr.split('#').filter(Boolean).map((ep) => {
      const [label, url] = ep.split('$');
      return { label: label || '播放', url: url || '' };
    });
    return { name: sourceName, urls: episodes };
  });
}

// Category IDs for the API
export const CATEGORIES = {
  movie: { id: 1, label: '电影', icon: '🎬' },
  tv: { id: 2, label: '电视剧', icon: '📺' },
  variety: { id: 3, label: '综艺', icon: '🎤' },
  anime: { id: 4, label: '动漫', icon: '🎌' },
} as const;
