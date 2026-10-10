import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import type { ContentItem } from '../types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_IMAGE_HEIGHT = Math.min(430, Math.round(SCREEN_HEIGHT * 0.47));

interface Props {
  item: ContentItem;
}

const typeLabels: Record<string, string> = {
  movie: 'Película',
  series: 'Serie',
  anime: 'Anime',
  manhwa: 'Manhwa',
  manga: 'Manga',
  videogame: 'Videojuego',
};

function renderTypeIcon(type: string) {
  switch (type) {
    case 'movie':
      return <Ionicons name="film-outline" size={13} color="#FFFFFF" />;
    case 'series':
      return <Ionicons name="tv-outline" size={13} color="#FFFFFF" />;
    case 'anime':
      return <Ionicons name="sparkles-outline" size={13} color="#FFFFFF" />;
    case 'manhwa':
      return <Ionicons name="book-outline" size={13} color="#FFFFFF" />;
    case 'manga':
      return <Ionicons name="library-outline" size={13} color="#FFFFFF" />;
    case 'videogame':
      return <Ionicons name="game-controller-outline" size={13} color="#FFFFFF" />;
    default:
      return <Ionicons name="layers-outline" size={13} color="#FFFFFF" />;
  }
}

export default function SwipeCard({ item }: Props) {
  return (
    <View style={styles.card}>
      {/* Portada */}
      {item.cover_url ? (
        <Image
          source={{ uri: item.cover_url }}
          style={styles.cardImage}
          contentFit="cover"
          transition={300}
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Ionicons name="image-outline" size={44} color={colors.purple[300]} />
          <Text style={styles.placeholderLetter}>{item.title.charAt(0)}</Text>
        </View>
      )}

      {/* Gradiente inferior sobre la imagen */}
      <View style={styles.imageGradient} />

      {/* Badge de tipo sobre la imagen (con icono vectorial estilizado, sin emojis) */}
      <View style={styles.typeBadgeOverlay}>
        {renderTypeIcon(item.type)}
        <Text style={styles.typeBadgeOverlayText}>
          {typeLabels[item.type] ?? item.type}
        </Text>
      </View>

      {/* Contenido inferior */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>

        <Text style={styles.synopsis} numberOfLines={2}>
          {item.synopsis || 'Sin sinopsis disponible.'}
        </Text>

        <View style={styles.bottomRow}>
          {/* Ratings con iconos de Ionicons estilizados */}
          <View style={styles.ratingsRow}>
            {item.critic_rating != null && (
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={12} color="#D97706" />
                <Text style={styles.ratingText}>
                  {item.critic_rating.toFixed(1)}
                </Text>
              </View>
            )}
            {item.community_rating != null && (
              <View style={[styles.ratingBadge, styles.communityBadge]}>
                <Ionicons name="people" size={12} color={colors.purple[500]} />
                <Text style={[styles.ratingText, styles.communityText]}>
                  {item.community_rating.toFixed(1)}
                </Text>
              </View>
            )}
          </View>

          {/* Géneros */}
          {item.genres && item.genres.length > 0 && (
            <View style={styles.genresRow}>
              {item.genres.slice(0, 2).map((cg) => (
                <View key={cg.genre.id} style={styles.genreTag}>
                  <Text style={styles.genreText}>{cg.genre.name}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 22,
    elevation: 12,
  },
  cardImage: {
    width: '100%',
    height: CARD_IMAGE_HEIGHT,
    backgroundColor: colors.purple[50],
  },
  imagePlaceholder: {
    width: '100%',
    height: CARD_IMAGE_HEIGHT,
    backgroundColor: colors.purple[50],
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  placeholderLetter: {
    fontSize: 48,
    color: colors.purple[400],
    fontWeight: '800',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 90,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'transparent',
  },
  typeBadgeOverlay: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(15, 15, 26, 0.65)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  typeBadgeOverlayText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 16,
    backgroundColor: colors.white,
  },
  title: {
    fontSize: 21,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  synopsis: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  communityBadge: {
    backgroundColor: colors.purple[50],
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
  },
  communityText: {
    color: colors.purple[700],
  },
  genresRow: {
    flexDirection: 'row',
    gap: 5,
  },
  genreTag: {
    backgroundColor: colors.purple[50],
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  genreText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.purple[500],
    letterSpacing: 0.2,
  },
});
