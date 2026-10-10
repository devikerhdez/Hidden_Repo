import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
  TextInput,
} from 'react-native';
import { Image } from 'expo-image';
import { colors } from '../theme/colors';
import api from '../services/api';
import DetailModal from '../components/DetailModal';
import type { CustomList, ListItemWithContent, ContentItem } from '../types';

const typeLabels: Record<string, string> = {
  movie: 'Película',
  series: 'Serie',
  anime: 'Anime',
  manhwa: 'Manhwa',
  manga: 'Manga',
  videogame: 'Juego',
};

export default function ListsScreen() {
  const [lists, setLists] = useState<CustomList[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedList, setSelectedList] = useState<CustomList | null>(null);
  const [listDetails, setListDetails] = useState<CustomList | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailItem, setDetailItem] = useState<ContentItem | null>(null);

  // Modal para crear nueva lista
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [creatingList, setCreatingList] = useState(false);

  const loadLists = useCallback(async () => {
    try {
      const { data } = await api.get('/lists');
      setLists(data);
    } catch {
      // error handled by interceptor
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLists();
  }, [loadLists]);

  const openListDetails = async (list: CustomList) => {
    setSelectedList(list);
    setLoadingDetails(true);
    try {
      const { data } = await api.get(`/lists/${list.id}`);
      setListDetails(data);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los elementos de la lista');
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeListDetails = () => {
    setSelectedList(null);
    setListDetails(null);
    loadLists();
  };

  const handleRemoveItem = async (contentId: string, contentTitle: string) => {
    if (!selectedList) return;
    Alert.alert(
      'Eliminar',
      `¿Deseas quitar "${contentTitle}" de esta lista?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Quitar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/lists/${selectedList.id}/items/${contentId}`);
              setListDetails((prev) =>
                prev
                  ? {
                      ...prev,
                      items: prev.items?.filter((it) => it.content_id !== contentId),
                    }
                  : null
              );
            } catch {
              Alert.alert('Error', 'No se pudo eliminar el elemento');
            }
          },
        },
      ]
    );
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    setCreatingList(true);
    try {
      await api.post('/lists', { name: newListName.trim() });
      setNewListName('');
      setShowCreateModal(false);
      loadLists();
    } catch {
      Alert.alert('Error', 'No se pudo crear la lista');
    } finally {
      setCreatingList(false);
    }
  };

  const renderListItem = ({ item }: { item: ListItemWithContent }) => {
    const content = item.content;
    if (!content) return null;

    return (
      <TouchableOpacity
        style={styles.itemCard}
        activeOpacity={0.7}
        onPress={() => setDetailItem(content)}
      >
        {content.cover_url ? (
          <Image
            source={{ uri: content.cover_url }}
            style={styles.itemImage}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={styles.itemImagePlaceholder}>
            <Text style={styles.placeholderLetter}>{content.title.charAt(0)}</Text>
          </View>
        )}

        <View style={styles.itemInfo}>
          <View style={styles.badgeRow}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>
                {typeLabels[content.type] ?? content.type}
              </Text>
            </View>
            {content.critic_rating != null && (
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>⭐ {content.critic_rating.toFixed(1)}</Text>
              </View>
            )}
          </View>

          <Text style={styles.itemTitle} numberOfLines={1}>
            {content.title}
          </Text>

          <Text style={styles.itemSynopsis} numberOfLines={2}>
            {content.synopsis || 'Sin sinopsis disponible'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.removeBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() => handleRemoveItem(content.id, content.title)}
        >
          <Text style={styles.removeBtnText}>✕</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderListCard = ({ item }: { item: CustomList }) => (
    <TouchableOpacity
      style={styles.listCard}
      activeOpacity={0.8}
      onPress={() => openListDetails(item)}
    >
      <View style={styles.listCardHeader}>
        <View style={styles.listIconBox}>
          <Text style={styles.listIconText}>
            {item.name.toLowerCase().includes('pendiente')
              ? '🔖'
              : item.name.toLowerCase().includes('visto')
              ? '✓'
              : '📁'}
          </Text>
        </View>
        <View style={styles.listCardContent}>
          <Text style={styles.listName}>{item.name}</Text>
          <Text style={styles.listCount}>
            {item._count?.items ?? 0} {item._count?.items === 1 ? 'título' : 'títulos'}
          </Text>
        </View>
        <Text style={styles.arrowText}>›</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.purple[500]} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Mis Listas</Text>
          <TouchableOpacity
            style={styles.addListButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Text style={styles.addListButtonText}>+ Nueva</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={lists}
        renderItem={renderListCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No tienes listas aún.</Text>
            <Text style={styles.emptySub}>
              Haz swipe arriba para guardar en Pendientes, o swipe derecha para Visto.
            </Text>
          </View>
        }
      />

      {/* Modal de Detalle de Lista */}
      <Modal
        visible={!!selectedList}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeListDetails}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeListDetails} style={styles.modalCloseBtn}>
              <Text style={styles.modalCloseText}>← Volver</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle} numberOfLines={1}>
              {selectedList?.name}
            </Text>
            <View style={{ width: 60 }} />
          </View>

          {loadingDetails ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={colors.purple[500]} />
            </View>
          ) : (
            <FlatList
              data={listDetails?.items ?? []}
              renderItem={renderListItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.itemsListContent}
              ListEmptyComponent={
                <View style={styles.empty}>
                  <Text style={styles.emptyText}>Esta lista está vacía.</Text>
                  <Text style={styles.emptySub}>
                    Desliza contenido en el Feed para agregarlo aquí.
                  </Text>
                </View>
              }
            />
          )}
        </View>
      </Modal>

      {/* Modal para Crear Lista */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.createOverlay}>
          <View style={styles.createBox}>
            <Text style={styles.createTitle}>Crear Nueva Lista</Text>
            <TextInput
              style={styles.createInput}
              placeholder="Nombre de la lista (ej. Favoritos 2026)"
              placeholderTextColor={colors.text.muted}
              value={newListName}
              onChangeText={setNewListName}
              autoFocus
            />
            <View style={styles.createActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  !newListName.trim() && { opacity: 0.5 },
                ]}
                disabled={!newListName.trim() || creatingList}
                onPress={handleCreateList}
              >
                <Text style={styles.submitBtnText}>
                  {creatingList ? 'Creando...' : 'Crear'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* DetailModal para ver tarjeta completa */}
      <DetailModal item={detailItem} onClose={() => setDetailItem(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.purple[50],
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.purple[500],
  },
  addListButton: {
    backgroundColor: colors.purple[50],
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addListButtonText: {
    color: colors.purple[500],
    fontWeight: '700',
    fontSize: 14,
  },
  listContent: { padding: 16 },
  listCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.purple[50],
    shadowColor: colors.purple[200],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  listCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.purple[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  listIconText: {
    fontSize: 20,
  },
  listCardContent: {
    flex: 1,
  },
  listName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  listCount: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 2,
  },
  arrowText: {
    fontSize: 26,
    color: colors.purple[300],
    fontWeight: '300',
  },
  empty: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  emptySub: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.purple[50],
  },
  modalCloseBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  modalCloseText: {
    color: colors.purple[500],
    fontSize: 16,
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text.primary,
    maxWidth: '60%',
  },
  itemsListContent: {
    padding: 16,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: colors.purple[100],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  itemImage: {
    width: 65,
    height: 90,
    borderRadius: 8,
    backgroundColor: colors.purple[50],
  },
  itemImagePlaceholder: {
    width: 65,
    height: 90,
    borderRadius: 8,
    backgroundColor: colors.purple[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderLetter: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.purple[300],
  },
  itemInfo: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  typeBadge: {
    backgroundColor: colors.purple[50],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.purple[500],
  },
  ratingBadge: {
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text.primary,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  itemSynopsis: {
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 16,
  },
  removeBtn: {
    padding: 8,
  },
  removeBtnText: {
    color: colors.text.muted,
    fontSize: 16,
    fontWeight: '700',
  },
  createOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  createBox: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
  },
  createTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 16,
  },
  createInput: {
    borderWidth: 1,
    borderColor: colors.purple[100],
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text.primary,
    backgroundColor: colors.purple[50],
    marginBottom: 20,
  },
  createActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  cancelBtnText: {
    color: colors.text.secondary,
    fontWeight: '600',
    fontSize: 15,
  },
  submitBtn: {
    backgroundColor: colors.purple[500],
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  submitBtnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
});
