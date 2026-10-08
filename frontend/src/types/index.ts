export type ContentType = 'movie' | 'series' | 'anime' | 'manhwa' | 'manga' | 'videogame';

export type SwipeAction = 'skip' | 'seen' | 'saved';

export type ExternalSource = 'tmdb' | 'anilist' | 'rawg' | 'igdb';

export type CoinReason = 'rating_reward' | 'future_spend';

export interface User {
  id: string;
  email: string;
  username: string;
  avatar_url?: string | null;
  coins: number;
  created_at: string;
}

export interface Genre {
  id: string;
  name: string;
  applies_to: ContentType;
}

export interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  synopsis?: string | null;
  cover_url?: string | null;
  release_date?: string | null;
  critic_rating?: number | null;
  community_rating?: number | null;
  community_rating_count: number;
  saves_count: number;
  seen_count: number;
  trailer_url?: string | null;
  gameplay_url?: string | null;
  popularity_score?: number | null;
  is_mainstream: boolean;
  external_source: ExternalSource;
  external_id: string;
  genres?: ContentGenre[];
}

export interface ContentGenre {
  content_id: string;
  genre_id: string;
  genre: Genre;
}

export interface UserSwipe {
  id: string;
  user_id: string;
  content_id: string;
  action: SwipeAction;
  created_at: string;
}

export interface CustomList {
  id: string;
  user_id: string;
  name: string;
  is_default: boolean;
  created_at: string;
  _count?: { items: number };
  items?: ListItemWithContent[];
}

export interface ListItem {
  id: string;
  list_id: string;
  content_id: string;
  added_at: string;
}

export interface ListItemWithContent extends ListItem {
  content: ContentItem;
}

export interface Rating {
  id: string;
  user_id: string;
  content_id: string;
  score: number;
  review_text?: string | null;
  created_at: string;
}

export interface CoinTransaction {
  id: string;
  user_id: string;
  amount: number;
  reason: CoinReason;
  created_at: string;
}

export interface FeedFilters {
  types?: ContentType[];
  exclude_mainstream?: boolean;
  genres?: string[];
  exclude_ids?: string[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: Pick<User, 'id' | 'email' | 'username'>;
}
