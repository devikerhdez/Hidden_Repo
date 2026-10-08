import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../theme/colors';
import api from '../services/api';
import type { CustomList } from '../types';

export default function ListsScreen() {
  const [lists, setLists] = useState<CustomList[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = async () => {
    try {
      const { data } = await api.get('/lists');
      setLists(data);
    } catch {
      // error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  const renderList = ({ item }: { item: CustomList }) => (
    <TouchableOpacity style={styles.listCard}>
      <Text style={styles.listName}>{item.name}</Text>
      <Text style={styles.listCount}>{item._count?.items ?? 0} items</Text>
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
        <Text style={styles.title}>Mis Listas</Text>
      </View>

      <FlatList
        data={lists}
        renderItem={renderList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No tienes listas aún.</Text>
            <Text style={styles.emptySub}>
              Haz swipe arriba en contenido para guardarlo en Pendientes, o swipe
              derecha para añadirlo a Visto.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: colors.white,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.purple[500],
  },
  listContent: { padding: 16 },
  listCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.purple[50],
  },
  listName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  listCount: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 4,
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
});
