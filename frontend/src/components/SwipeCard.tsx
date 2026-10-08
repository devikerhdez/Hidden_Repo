import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { colors } from '../theme/colors';
import type { ContentItem } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 64;

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

export default function SwipeCard({ item }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.imagePlaceholder}>
        <Text style={styles.imageText}>{item.title.charAt(0)}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>
            {typeLabels[item.type] ?? item.type}
          </Text>
        </View>

        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>

        <Text style={styles.synopsis} numberOfLines={3}>
          {item.synopsis || 'Sin sinopsis disponible.'}
        </Text>

        <View style={styles.ratingsRow}>
          {item.critic_rating != null && (
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingIcon}>⭐</Text>
              <Text style={styles.ratingText}>
                {item.critic_rating.toFixed(1)}
              </Text>
            </View>
          )}
          {item.community_rating != null && (
            <View style={[styles.ratingBadge, styles.communityBadge]}>
              <Text style={styles.ratingIcon}>👥</Text>
              <Text style={styles.ratingText}>
                {item.community_rating.toFixed(1)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.statsRow}>
          <Text style={styles.stat}>
            🔖 {item.saves_count} guardados
          </Text>
          <Text style={styles.stat}>
            ✓ {item.seen_count} vistos
          </Text>
        </View>

        {item.genres && item.genres.length > 0 && (
          <View style={styles.genresRow}>
            {item.genres.slice(0, 3).map((cg) => (
              <View key={cg.genre.id} style={styles.genreTag}>
                <Text style={styles.genreText}>{cg.genre.name}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.white,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: colors.purple[300],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  imagePlaceholder: {
    width: '100%',
    height: 280,
    backgroundColor: colors.purple[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageText: {
    fontSize: 64,
    color: colors.purple[300],
    fontWeight: '700',
  },
  content: {
    padding: 20,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.purple[50],
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.purple[500],
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 8,
  },
  synopsis: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  ratingsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  communityBadge: {
    backgroundColor: colors.purple[50],
  },
  ratingIcon: {
    fontSize: 12,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  stat: {
    fontSize: 12,
    color: colors.text.muted,
  },
  genresRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  genreTag: {
    backgroundColor: colors.purple[50],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  genreText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.purple[500],
  },
});
