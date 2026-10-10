import { create } from 'zustand';
import type { ContentItem, FeedFilters } from '../types';
import api from '../services/api';

interface SwipeState {
  feed: ContentItem[];
  isLoading: boolean;
  filters: FeedFilters;

  fetchFeed: () => Promise<void>;
  swipeAction: (contentId: string, action: 'skip' | 'seen' | 'saved') => Promise<void>;
  setFilters: (filters: Partial<FeedFilters>) => void;
}

export const useSwipeStore = create<SwipeState>((set, get) => ({
  feed: [],
  isLoading: false,
  filters: {},

  fetchFeed: async () => {
    set({ isLoading: true });
    try {
      const { filters } = get();
      const params = new URLSearchParams();
      if (filters.types?.length) params.set('types', filters.types.join(','));
      if (filters.exclude_mainstream) params.set('exclude_mainstream', 'true');
      if (filters.genres?.length) params.set('genres', filters.genres.join(','));
      if (filters.exclude_ids?.length) params.set('exclude_ids', filters.exclude_ids.join(','));

      const { data } = await api.get(`/feed?${params.toString()}`);
      set({ feed: data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  swipeAction: async (contentId, action) => {
    // Registramos el swipe en la base de datos sin mutar el array local del mazo
    // para no desincronizar los índices del Swiper de React Native
    await api.post('/swipes', { content_id: contentId, action });
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },
}));
