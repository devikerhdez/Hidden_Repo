import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Switch,
  ScrollView,
} from 'react-native';
import { colors } from '../theme/colors';
import api from '../services/api';
import type { Genre, FeedFilters, ContentType } from '../types';

const CONTENT_TYPES: { value: ContentType; label: string }[] = [
  { value: 'movie', label: 'Películas' },
  { value: 'series', label: 'Series' },
  { value: 'anime', label: 'Anime' },
  { value: 'manhwa', label: 'Manhwa' },
  { value: 'manga', label: 'Manga' },
  { value: 'videogame', label: 'Videojuegos' },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  filters: FeedFilters;
  onApply: (filters: Partial<FeedFilters>) => void;
}

export default function FilterPanel({
  visible,
  onClose,
  filters,
  onApply,
}: Props) {
  const [selectedTypes, setSelectedTypes] = useState<ContentType[]>(
    filters.types || []
  );
  const [excludeMainstream, setExcludeMainstream] = useState(
    filters.exclude_mainstream ?? false
  );
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    filters.genres || []
  );

  useEffect(() => {
    if (visible && selectedTypes.length > 0) {
      api
        .get(`/filters/genres?type=${selectedTypes[selectedTypes.length - 1]}`)
        .then(({ data }) => setGenres(data));
    }
  }, [visible, selectedTypes]);

  const toggleType = (type: ContentType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleGenre = (id: string) => {
    setSelectedGenres((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const handleApply = () => {
    onApply({
      types: selectedTypes.length > 0 ? selectedTypes : undefined,
      exclude_mainstream: excludeMainstream,
      genres: selectedGenres.length > 0 ? selectedGenres : undefined,
    });
    onClose();
  };

  const handleReset = () => {
    setSelectedTypes([]);
    setExcludeMainstream(false);
    setSelectedGenres([]);
    onApply({
      types: undefined,
      exclude_mainstream: false,
      genres: undefined,
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.panel}>
          <View style={styles.handle} />

          <Text style={styles.title}>Filtros</Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Tipo de contenido</Text>
            <View style={styles.chipGroup}>
              {CONTENT_TYPES.map((ct) => (
                <TouchableOpacity
                  key={ct.value}
                  style={[
                    styles.chip,
                    selectedTypes.includes(ct.value) && styles.chipActive,
                  ]}
                  onPress={() => toggleType(ct.value)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedTypes.includes(ct.value) && styles.chipTextActive,
                    ]}
                  >
                    {ct.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.switchRow}>
              <View>
                <Text style={styles.switchLabel}>Excluir mainstream</Text>
                <Text style={styles.switchHint}>
                  Oculta el contenido más popular
                </Text>
              </View>
              <Switch
                value={excludeMainstream}
                onValueChange={setExcludeMainstream}
                trackColor={{
                  false: colors.purple[100],
                  true: colors.purple[300],
                }}
                thumbColor={
                  excludeMainstream ? colors.purple[500] : colors.text.muted
                }
              />
            </View>

            {genres.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Géneros</Text>
                <View style={styles.chipGroup}>
                  {genres.map((g) => (
                    <TouchableOpacity
                      key={g.id}
                      style={[
                        styles.chip,
                        selectedGenres.includes(g.id) && styles.chipActive,
                      ]}
                      onPress={() => toggleGenre(g.id)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selectedGenres.includes(g.id) &&
                            styles.chipTextActive,
                        ]}
                      >
                        {g.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </ScrollView>

          <View style={styles.buttonsRow}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyText}>Aplicar</Text>
            </TouchableOpacity>
          </View>
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
  panel: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.purple[100],
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 12,
    marginTop: 8,
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.purple[50],
  },
  chipActive: {
    backgroundColor: colors.purple[500],
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.purple[500],
  },
  chipTextActive: {
    color: colors.white,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.purple[50],
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  switchHint: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.purple[200],
    alignItems: 'center',
  },
  resetText: {
    color: colors.purple[500],
    fontWeight: '600',
  },
  applyButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.purple[500],
    alignItems: 'center',
  },
  applyText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
});
