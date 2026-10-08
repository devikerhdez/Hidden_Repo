import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { colors } from '../theme/colors';
import type { ContentItem } from '../types';

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

export default function DetailModal({ item, onClose }: Props) {
  if (!item) return null;

  return (
    <Modal visible={!!item} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.handle} />

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imageText}>{item.title.charAt(0)}</Text>
            </View>

            <View style={styles.content}>
              <View style={styles.typeBadge}>
                <Text style={styles.typeText}>
                  {typeLabels[item.type] ?? item.type}
                </Text>
              </View>

              <Text style={styles.title}>{item.title}</Text>

              <View style={styles.ratingsRow}>
                {item.critic_rating != null && (
                  <View style={styles.ratingBadge}>
                    <Text style={styles.ratingIcon}>⭐</Text>
                    <Text style={styles.ratingLabel}>Crítica</Text>
                    <Text style={styles.ratingValue}>
                      {item.critic_rating.toFixed(1)}
                    </Text>
                  </View>
                )}
                {item.community_rating != null && (
                  <View style={[styles.ratingBadge, styles.communityBadge]}>
                    <Text style={styles.ratingIcon}>👥</Text>
                    <Text style={styles.ratingLabel}>Comunidad</Text>
                    <Text style={styles.ratingValue}>
                      {item.community_rating.toFixed(1)}
                    </Text>
                  </View>
                )}
              </View>

              <Text style={styles.synopsis}>
                {item.synopsis || 'Sin sinopsis disponible.'}
              </Text>

              {(item.trailer_url || item.gameplay_url) && (
                <View style={styles.mediaSection}>
                  <Text style={styles.sectionTitle}>
                    {item.type === 'videogame' ? 'Gameplay' : 'Tráiler'}
                  </Text>
                  <View style={styles.videoPlaceholder}>
                    <Text style={styles.videoText}>
                      ▶ {item.type === 'videogame' ? 'Gameplay' : 'Tráiler'} disponible
                    </Text>
                  </View>
                </View>
              )}

              {item.genres && item.genres.length > 0 && (
                <View style={styles.genresRow}>
                  {item.genres.map((cg) => (
                    <View key={cg.genre.id} style={styles.genreTag}>
                      <Text style={styles.genreText}>{cg.genre.name}</Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.statsRow}>
                <Text style={styles.stat}>🔖 {item.saves_count} guardados</Text>
                <Text style={styles.stat}>✓ {item.seen_count} vistos</Text>
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.purple[100],
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  imagePlaceholder: {
    width: '100%',
    height: 240,
    backgroundColor: colors.purple[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageText: {
    fontSize: 56,
    color: colors.purple[200],
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
    fontSize: 28,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 12,
  },
  ratingsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  communityBadge: {
    backgroundColor: colors.purple[50],
  },
  ratingIcon: {
    fontSize: 14,
  },
  ratingLabel: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
  },
  synopsis: {
    fontSize: 16,
    color: colors.text.secondary,
    lineHeight: 24,
    marginBottom: 16,
  },
  mediaSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
  },
  videoPlaceholder: {
    backgroundColor: colors.purple[50],
    height: 180,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoText: {
    fontSize: 18,
    color: colors.purple[300],
    fontWeight: '600',
  },
  genresRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  genreTag: {
    backgroundColor: colors.purple[50],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  genreText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.purple[500],
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  stat: {
    fontSize: 14,
    color: colors.text.muted,
  },
  closeButton: {
    margin: 16,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.purple[50],
    alignItems: 'center',
  },
  closeText: {
    color: colors.purple[500],
    fontWeight: '600',
    fontSize: 16,
  },
});
