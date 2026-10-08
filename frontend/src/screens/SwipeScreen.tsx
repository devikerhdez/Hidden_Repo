import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { useSwipeStore } from '../store/swipeStore';
import { colors } from '../theme/colors';
import type { ContentItem } from '../types';
import SwipeCard from '../components/SwipeCard';
import FilterPanel from '../components/FilterPanel';
import RatingModal from '../components/RatingModal';
import DetailModal from '../components/DetailModal';

export default function SwipeScreen() {
  const { feed, isLoading, fetchFeed, swipeAction, filters, setFilters } =
    useSwipeStore();
  const swiperRef = useRef<Swiper<any>>(null);

  const [showFilter, setShowFilter] = useState(false);
  const [showRating, setShowRating] = useState<ContentItem | null>(null);
  const [showDetail, setShowDetail] = useState<ContentItem | null>(null);

  useEffect(() => {
    fetchFeed().catch(() => {});
  }, [filters]);

  const safeSwipe = useCallback(
    async (contentId: string, action: 'skip' | 'seen' | 'saved') => {
      try {
        await swipeAction(contentId, action);
      } catch {
        fetchFeed().catch(() => {});
      }
    },
    [swipeAction, fetchFeed]
  );

  const onSwipedLeft = useCallback(
    (index: number) => {
      const item = feed[index];
      if (item) safeSwipe(item.id, 'skip');
    },
    [feed, safeSwipe]
  );

  const onSwipedRight = useCallback(
    (index: number) => {
      const item = feed[index];
      if (item) {
        safeSwipe(item.id, 'seen');
        setShowRating(item);
      }
    },
    [feed, safeSwipe]
  );

  const onSwipedTop = useCallback(
    (index: number) => {
      const item = feed[index];
      if (item) safeSwipe(item.id, 'saved');
    },
    [feed, safeSwipe]
  );

  const onTapCard = useCallback(
    (index: number) => {
      const item = feed[index];
      if (item) setShowDetail(item);
    },
    [feed]
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>Hidden</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilter(true)}
        >
          <Text style={styles.filterText}>Filtros</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.swiperContainer}>
        {isLoading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Cargando...</Text>
          </View>
        ) : feed.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Sin contenido</Text>
            <Text style={styles.emptyText}>
              No hay más recomendaciones con los filtros actuales.
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => fetchFeed().catch(() => {})}
            >
              <Text style={styles.retryText}>Recargar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Swiper
            ref={swiperRef}
            cards={feed}
            renderCard={(item: ContentItem) =>
              item ? <SwipeCard item={item} /> : <View />
            }
            onSwipedLeft={onSwipedLeft}
            onSwipedRight={onSwipedRight}
            onSwipedTop={onSwipedTop}
            onTapCard={onTapCard}
            stackSize={3}
            backgroundColor={colors.background}
            cardVerticalMargin={0}
            cardHorizontalMargin={16}
            verticalSwipe
            infinite={false}
            animateCardOpacity
            showSecondCard
            keyExtractor={(item: ContentItem | null) =>
              item?.id ?? String(Math.random())
            }
          />
        )}
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionSkip}
          onPress={() => swiperRef.current?.swipeLeft()}
        >
          <Text style={styles.actionIcon}>✕</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionSeen}
          onPress={() => swiperRef.current?.swipeRight()}
        >
          <Text style={styles.actionIcon}>✓</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionSaved}
          onPress={() => swiperRef.current?.swipeTop()}
        >
          <Text style={styles.actionIcon}>↑</Text>
        </TouchableOpacity>
      </View>

      <FilterPanel
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        filters={filters}
        onApply={setFilters}
      />

      <RatingModal
        item={showRating}
        onClose={() => setShowRating(null)}
      />

      <DetailModal
        item={showDetail}
        onClose={() => setShowDetail(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: colors.white,
  },
  logo: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.purple[500],
  },
  filterButton: {
    backgroundColor: colors.purple[50],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterText: {
    color: colors.purple[500],
    fontWeight: '600',
    fontSize: 14,
  },
  swiperContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colors.purple[500],
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: colors.white,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 32,
    paddingTop: 8,
    gap: 24,
  },
  actionSkip: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionSeen: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.visto,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionSaved: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.guardado,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
  },
});
