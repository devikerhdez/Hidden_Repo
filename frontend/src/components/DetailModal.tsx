import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import YoutubePlayer from 'react-native-youtube-iframe';
import { colors } from '../theme/colors';
import type { ContentItem } from '../types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const DISMISS_THRESHOLD = 120; // px de arrastre hacia abajo para cerrar

interface Props {
  item: ContentItem | null;
  onClose: () => void;
}

const typeLabels: Record<string, string> = {
  movie: 'Película',
  series: 'Serie',
  anime: 'Anime',
  manhwa: 'Manhwa',
  manga: 'Manga',
  videogame: 'Videojuego',
};

const typeColor: Record<string, string> = {
  movie: '#6B48FF',
  series: '#2196F3',
  anime: '#E91E63',
  manhwa: '#FF5722',
  manga: '#795548',
  videogame: '#4CAF50',
};

function extractYoutubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
  );
  if (match) return match[1];
  if (/^[\w-]{11}$/.test(url.trim())) return url.trim();
  return null;
}

function renderTypeIcon(type: string, color: string) {
  switch (type) {
    case 'movie':
      return <Ionicons name="film-outline" size={13} color={color} />;
    case 'series':
      return <Ionicons name="tv-outline" size={13} color={color} />;
    case 'anime':
      return <Ionicons name="sparkles-outline" size={13} color={color} />;
    case 'manhwa':
      return <Ionicons name="book-outline" size={13} color={color} />;
    case 'manga':
      return <Ionicons name="library-outline" size={13} color={color} />;
    case 'videogame':
      return <Ionicons name="game-controller-outline" size={13} color={color} />;
    default:
      return <Ionicons name="layers-outline" size={13} color={color} />;
  }
}

export default function DetailModal({ item, onClose }: Props) {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  // Abrir/cerrar con animación al cambiar el item
  useEffect(() => {
    if (item) {
      translateY.setValue(SCREEN_HEIGHT);
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 60,
        friction: 12,
      }).start();
    }
  }, [item]);

  const closeWithAnimation = () => {
    Animated.timing(translateY, {
      toValue: SCREEN_HEIGHT,
      duration: 280,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  // PanResponder para detectar swipe hacia abajo
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Solo activar si el deslizamiento es principalmente vertical hacia abajo
        return gestureState.dy > 10 && Math.abs(gestureState.dx) < Math.abs(gestureState.dy);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > DISMISS_THRESHOLD || gestureState.vy > 0.8) {
          // Animar hacia abajo y cerrar
          Animated.timing(translateY, {
            toValue: SCREEN_HEIGHT,
            duration: 250,
            useNativeDriver: true,
          }).start(() => onClose());
        } else {
          // Volver a la posición original
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 60,
            friction: 12,
          }).start();
        }
      },
    })
  ).current;

  if (!item) return null;

  const videoUrl = item.trailer_url || item.gameplay_url;
  const youtubeId = extractYoutubeId(videoUrl);
  const badgeColor = typeColor[item.type] ?? colors.purple[500];

  return (
    <Modal
      visible={!!item}
      animationType="none"
      transparent
      onRequestClose={closeWithAnimation}
      statusBarTranslucent
    >
      {/* Fondo oscuro al pulsar */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={closeWithAnimation}
      />

      <Animated.View
        style={[styles.sheet, { transform: [{ translateY }] }]}
        {...panResponder.panHandlers}
      >
        {/* Handle de arrastre */}
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
          scrollEventThrottle={16}
        >
          {/* Portada */}
          {item.cover_url ? (
            <Image
              source={{ uri: item.cover_url }}
              style={styles.coverImage}
              contentFit="cover"
              transition={300}
            />
          ) : (
            <View style={styles.coverPlaceholder}>
              <Text style={styles.coverPlaceholderText}>{item.title.charAt(0)}</Text>
            </View>
          )}

          <View style={styles.content}>
            {/* Badge de tipo */}
            <View style={[styles.typeBadge, { backgroundColor: badgeColor + '18', borderColor: badgeColor + '40' }]}>
              {renderTypeIcon(item.type, badgeColor)}
              <Text style={[styles.typeText, { color: badgeColor }]}>
                {typeLabels[item.type] ?? item.type}
              </Text>
            </View>

            <Text style={styles.title}>{item.title}</Text>

            {/* Ratings */}
            <View style={styles.ratingsRow}>
              {item.critic_rating != null && (
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text style={styles.ratingLabel}>Crítica</Text>
                  <Text style={styles.ratingValue}>
                    {item.critic_rating.toFixed(1)}
                  </Text>
                </View>
              )}
              {item.community_rating != null && (
                <View style={[styles.ratingBadge, styles.communityBadge]}>
                  <Ionicons name="people" size={14} color={colors.purple[400]} />
                  <Text style={styles.ratingLabel}>Comunidad</Text>
                  <Text style={styles.ratingValue}>
                    {item.community_rating.toFixed(1)}
                  </Text>
                </View>
              )}
              <View style={[styles.ratingBadge, styles.statBadge]}>
                <Ionicons name="bookmark-outline" size={13} color={colors.text.muted} />
                <Text style={styles.statText}>{item.saves_count}</Text>
              </View>
              <View style={[styles.ratingBadge, styles.statBadge]}>
                <Ionicons name="checkmark-circle-outline" size={13} color={colors.text.muted} />
                <Text style={styles.statText}>{item.seen_count}</Text>
              </View>
            </View>

            <Text style={styles.synopsis}>
              {item.synopsis || 'Sin sinopsis disponible.'}
            </Text>

            {/* Reproductor de vídeo */}
            {videoUrl && (
              <View style={styles.mediaSection}>
                <View style={styles.sectionHeader}>
                  <Ionicons
                    name={item.type === 'videogame' ? 'game-controller' : 'play-circle'}
                    size={18}
                    color={colors.text.primary}
                  />
                  <Text style={styles.sectionTitle}>
                    {item.type === 'videogame' ? 'Gameplay' : 'Tráiler oficial'}
                  </Text>
                </View>
                {youtubeId ? (
                  <View style={styles.videoContainer}>
                    <YoutubePlayer
                      height={210}
                      play={false}
                      videoId={youtubeId}
                    />
                  </View>
                ) : (
                  <View style={styles.videoPlaceholder}>
                    <Ionicons name="play-circle-outline" size={40} color={colors.purple[200]} />
                    <Text style={styles.videoPlaceholderText}>
                      {item.type === 'videogame' ? 'Gameplay' : 'Tráiler'} disponible
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Géneros */}
            {item.genres && item.genres.length > 0 && (
              <View style={styles.genresSection}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="pricetags-outline" size={16} color={colors.text.secondary} />
                  <Text style={styles.sectionTitle}>Géneros</Text>
                </View>
                <View style={styles.genresRow}>
                  {item.genres.map((cg) => (
                    <View key={cg.genre.id} style={styles.genreTag}>
                      <Text style={styles.genreText}>{cg.genre.name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Botón cerrar fijo abajo */}
        <TouchableOpacity style={styles.closeButton} onPress={closeWithAnimation}>
          <Ionicons name="chevron-down" size={20} color={colors.purple[500]} />
          <Text style={styles.closeText}>Cerrar</Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '92%',
    // Sombra superior
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 20,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E0E0E0',
  },
  coverImage: {
    width: '100%',
    height: 280,
    backgroundColor: colors.purple[50],
  },
  coverPlaceholder: {
    width: '100%',
    height: 240,
    backgroundColor: colors.purple[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverPlaceholderText: {
    fontSize: 64,
    fontWeight: '800',
    color: colors.purple[200],
  },
  content: {
    padding: 20,
    paddingBottom: 8,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 10,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.text.primary,
    marginBottom: 14,
    letterSpacing: -0.4,
  },
  ratingsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 5,
  },
  communityBadge: {
    backgroundColor: colors.purple[50],
  },
  statBadge: {
    backgroundColor: colors.background,
  },
  ratingLabel: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text.primary,
  },
  statText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  synopsis: {
    fontSize: 15,
    color: colors.text.secondary,
    lineHeight: 24,
    marginBottom: 20,
  },
  mediaSection: {
    marginBottom: 20,
  },
  genresSection: {
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text.primary,
  },
  videoContainer: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  videoPlaceholder: {
    backgroundColor: colors.purple[50],
    height: 160,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  videoPlaceholderText: {
    fontSize: 14,
    color: colors.purple[300],
    fontWeight: '600',
  },
  genresRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  genreTag: {
    backgroundColor: colors.purple[50],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  genreText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.purple[500],
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    margin: 16,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: colors.purple[50],
  },
  closeText: {
    color: colors.purple[500],
    fontWeight: '700',
    fontSize: 15,
  },
});
