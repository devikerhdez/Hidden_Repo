import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { Ionicons } from '@expo/vector-icons';
import { useSwipeStore } from '../store/swipeStore';
import { colors } from '../theme/colors';
import type { ContentItem } from '../types';
import SwipeCard from '../components/SwipeCard';
import FilterPanel from '../components/FilterPanel';
import RatingModal from '../components/RatingModal';
import DetailModal from '../components/DetailModal';
import InfoModal from '../components/InfoModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_MARGIN = 16;

// ─────────────────────────────────────────────
// Overlay de acción a pantalla completa sobre la carta
// ─────────────────────────────────────────────
interface OverlayProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  backgroundColor: string;
}

function ActionOverlay({ label, icon, backgroundColor }: OverlayProps) {
  return (
    <View style={[styles.overlayContainer, { backgroundColor }]}>
      <View style={styles.overlayBadge}>
        <Ionicons name={icon} size={36} color="#FFFFFF" style={{ marginBottom: 6 }} />
        <Text style={styles.overlayText}>{label}</Text>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────
// SwipeScreen Principal
// ─────────────────────────────────────────────
export default function SwipeScreen() {
  const { feed, isLoading, fetchFeed, swipeAction, filters, setFilters } =
    useSwipeStore();
  const swiperRef = useRef<Swiper<any>>(null);

  const [showFilter, setShowFilter] = useState(false);
  const [showRating, setShowRating] = useState<ContentItem | null>(null);
  const [showDetail, setShowDetail] = useState<ContentItem | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Cargar feed cuando cambian los filtros
  useEffect(() => {
    setCurrentIndex(0);
    fetchFeed().catch(() => {});
  }, [filters]);

  const safeSwipe = useCallback(
    async (contentId: string, action: 'skip' | 'seen' | 'saved') => {
      try {
        await swipeAction(contentId, action);
      } catch {
        // En caso de error de red, intentar recargar
        fetchFeed().catch(() => {});
      }
    },
    [swipeAction, fetchFeed]
  );

  const onSwipedLeft = useCallback(
    (index: number) => {
      const item = feed[index];
      if (item) safeSwipe(item.id, 'skip');
      setCurrentIndex(index + 1);
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
      setCurrentIndex(index + 1);
    },
    [feed, safeSwipe]
  );

  const onSwipedTop = useCallback(
    (index: number) => {
      const item = feed[index];
      if (item) safeSwipe(item.id, 'saved');
      setCurrentIndex(index + 1);
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

  const onSwipedAll = useCallback(() => {
    // Al agotar el mazo actual, cargar nuevos
    setCurrentIndex(0);
    fetchFeed().catch(() => {});
  }, [fetchFeed]);

  // ─── Botones de acción ───────────────────────────────
  const handleSkip = () => swiperRef.current?.swipeLeft();
  const handleSeen = () => swiperRef.current?.swipeRight();
  const handleSaved = () => swiperRef.current?.swipeTop();

  // Elemento actualmente activo en el mazo
  const currentItem = feed[currentIndex] ?? null;

  const handleOpenDetail = () => {
    if (currentItem) {
      setShowDetail(currentItem);
    }
  };

  return (
    <View style={styles.container}>
      {/* ─── Header ─────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.logo}>Hidden</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilter(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="options-outline" size={18} color={colors.purple[500]} />
          <Text style={styles.filterText}>Filtros</Text>
        </TouchableOpacity>
      </View>

      {/* ─── Zona de Swipe (Centrada con margen simétrico) ─ */}
      <View style={styles.swiperWrapper}>
        {isLoading ? (
          <View style={styles.emptyState}>
            <Ionicons name="hourglass-outline" size={48} color={colors.purple[200]} />
            <Text style={styles.emptyText}>Buscando joyas para ti...</Text>
          </View>
        ) : feed.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="planet-outline" size={64} color={colors.purple[200]} />
            <Text style={styles.emptyTitle}>Sin contenido</Text>
            <Text style={styles.emptyText}>
              No hay más recomendaciones con los filtros actuales.
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setCurrentIndex(0);
                fetchFeed().catch(() => {});
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh" size={18} color={colors.white} />
              <Text style={styles.retryText}>Recargar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Swiper
            ref={swiperRef}
            cards={feed}
            cardIndex={currentIndex}
            renderCard={(item: ContentItem) =>
              item ? <SwipeCard item={item} /> : <View />
            }
            onSwipedLeft={onSwipedLeft}
            onSwipedRight={onSwipedRight}
            onSwipedTop={onSwipedTop}
            onTapCard={onTapCard}
            onSwipedAll={onSwipedAll}
            stackSize={3}
            backgroundColor="transparent"
            cardVerticalMargin={6}
            cardHorizontalMargin={HORIZONTAL_MARGIN}
            verticalSwipe
            infinite={false}
            animateCardOpacity
            animateOverlayLabelsOpacity
            showSecondCard
            overlayLabels={{
              left: {
                element: (
                  <ActionOverlay
                    label="pasar"
                    icon="close-circle-outline"
                    backgroundColor="rgba(239, 68, 68, 0.88)"
                  />
                ),
                style: {
                  wrapper: styles.overlayWrapper,
                },
              },
              right: {
                element: (
                  <ActionOverlay
                    label="Valorar"
                    icon="star"
                    backgroundColor="rgba(245, 158, 11, 0.88)"
                  />
                ),
                style: {
                  wrapper: styles.overlayWrapper,
                },
              },
              top: {
                element: (
                  <ActionOverlay
                    label="guardar en mi lista"
                    icon="bookmark"
                    backgroundColor="rgba(16, 185, 129, 0.88)"
                  />
                ),
                style: {
                  wrapper: styles.overlayWrapper,
                },
              },
            }}
            keyExtractor={(item: ContentItem | null) =>
              item?.id ?? String(Math.random())
            }
          />
        )}
      </View>

      {/* ─── Pistas de gestos (asociadas por color) ──── */}
      <View style={styles.gestureHints}>
        <View style={styles.hintItem}>
          <Ionicons name="arrow-up-outline" size={13} color={colors.guardado} />
          <Text style={[styles.hintText, { color: colors.guardado }]}>Guardar</Text>
        </View>
        <View style={styles.hintItem}>
          <Ionicons name="arrow-back-outline" size={13} color={colors.skip} />
          <Text style={[styles.hintText, { color: colors.skip }]}>Skip</Text>
        </View>
        <View style={styles.hintItem}>
          <Ionicons name="arrow-forward-outline" size={13} color={colors.valorar} />
          <Text style={[styles.hintText, { color: colors.valorar }]}>Valorar</Text>
        </View>
      </View>

      {/* ─── Botones de Acción ───────────────────────── */}
      <View style={styles.actionsRow}>
        {/* Skip (Rojo) */}
        <TouchableOpacity
          style={styles.actionSkip}
          onPress={handleSkip}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={28} color={colors.skip} />
        </TouchableOpacity>

        {/* Info auxiliar (Abre explicación de la app) */}
        <TouchableOpacity
          style={styles.actionAux}
          onPress={() => setShowInfo(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="information-circle-outline" size={24} color={colors.purple[400]} />
        </TouchableOpacity>

        {/* Valorar (Botón principal central DORADO con ESTRELLA) */}
        <TouchableOpacity
          style={styles.actionRate}
          onPress={handleSeen}
          activeOpacity={0.7}
        >
          <Ionicons name="star" size={32} color={colors.white} />
        </TouchableOpacity>

        {/* Ver auxiliar (Abre el panel actual) */}
        <TouchableOpacity
          style={styles.actionAux}
          onPress={handleOpenDetail}
          activeOpacity={0.7}
        >
          <Ionicons name="eye-outline" size={24} color={colors.purple[400]} />
        </TouchableOpacity>

        {/* Guardar (Verde con bookmark) */}
        <TouchableOpacity
          style={styles.actionSaved}
          onPress={handleSaved}
          activeOpacity={0.7}
        >
          <Ionicons name="bookmark" size={26} color={colors.guardado} />
        </TouchableOpacity>
      </View>

      {/* ─── Modales ─────────────────────────────────── */}
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

      <InfoModal
        visible={showInfo}
        onClose={() => setShowInfo(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // ── Header ──
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.purple[50],
  },
  logo: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.purple[500],
    letterSpacing: -0.5,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.purple[50],
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterText: {
    color: colors.purple[500],
    fontWeight: '700',
    fontSize: 13,
  },

  // ── Swiper Wrapper ──
  swiperWrapper: {
    flex: 1,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },

  // ── Overlays al arrastrar ──
  overlayWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFill,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  overlayBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  overlayText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text.primary,
  },
  emptyText: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.purple[500],
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 8,
  },
  retryText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 15,
  },

  // ── Pistas de gestos ──
  gestureHints: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingVertical: 6,
    marginBottom: 2,
  },
  hintItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hintText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // ── Botones de acción ──
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 34,
    paddingTop: 6,
    gap: 12,
  },
  actionSkip: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.white,
    borderWidth: 2.5,
    borderColor: colors.skip,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.skip,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  actionAux: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.purple[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Botón Valorar: central, dorado, con estrella
  actionRate: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.valorar,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.valorar,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  // Botón Guardar: verde con marcador
  actionSaved: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.white,
    borderWidth: 2.5,
    borderColor: colors.guardado,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.guardado,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
});
