import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function InfoModal({ visible, onClose }: Props) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={styles.container}
          onStartShouldSetResponder={() => true}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="sparkles" size={24} color={colors.purple[500]} />
            </View>
            <Text style={styles.title}>¿Cómo funciona Hidden?</Text>
            <Text style={styles.subtitle}>
              Descubre y organiza tus contenidos favoritos en un instante
            </Text>
          </View>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {/* 1. Skip */}
            <View style={styles.item}>
              <View style={[styles.badgeIcon, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="close" size={20} color="#EF4444" />
              </View>
              <View style={styles.itemContent}>
                <View style={styles.itemTitleRow}>
                  <Text style={[styles.actionTag, { color: '#EF4444' }]}>← Skip</Text>
                  <Text style={styles.itemTitle}>Pasar</Text>
                </View>
                <Text style={styles.itemDesc}>
                  Desliza a la izquierda o pulsa la cruz si este contenido no te interesa.
                </Text>
              </View>
            </View>

            {/* 2. Valorar */}
            <View style={styles.item}>
              <View style={[styles.badgeIcon, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="star" size={20} color="#F59E0B" />
              </View>
              <View style={styles.itemContent}>
                <View style={styles.itemTitleRow}>
                  <Text style={[styles.actionTag, { color: '#F59E0B' }]}>→ Valorar</Text>
                  <Text style={styles.itemTitle}>Visto y recompensa</Text>
                </View>
                <Text style={styles.itemDesc}>
                  Desliza a la derecha o pulsa la estrella. Márcalo como visto, califícalo y gana monedas.
                </Text>
              </View>
            </View>

            {/* 3. Guardar */}
            <View style={styles.item}>
              <View style={[styles.badgeIcon, { backgroundColor: '#D1FAE5' }]}>
                <Ionicons name="bookmark" size={20} color="#10B981" />
              </View>
              <View style={styles.itemContent}>
                <View style={styles.itemTitleRow}>
                  <Text style={[styles.actionTag, { color: '#10B981' }]}>↑ Guardar</Text>
                  <Text style={styles.itemTitle}>Mi lista personal</Text>
                </View>
                <Text style={styles.itemDesc}>
                  Desliza hacia arriba o pulsa el marcador para guardarlo y verlo más tarde.
                </Text>
              </View>
            </View>

            {/* 4. Ver ficha */}
            <View style={styles.item}>
              <View style={[styles.badgeIcon, { backgroundColor: colors.purple[50] }]}>
                <Ionicons name="eye-outline" size={20} color={colors.purple[500]} />
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>Ver información completa</Text>
                <Text style={styles.itemDesc}>
                  Toca la tarjeta o el botón del ojo para leer la sinopsis, ver notas y ver tráilers.
                </Text>
              </View>
            </View>

            {/* 5. Filtros */}
            <View style={styles.item}>
              <View style={[styles.badgeIcon, { backgroundColor: colors.purple[50] }]}>
                <Ionicons name="options-outline" size={20} color={colors.purple[500]} />
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>Filtros personalizados</Text>
                <Text style={styles.itemDesc}>
                  Usa el botón de Filtros arriba para elegir categorías (Anime, Manga, Cine...) o géneros.
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Botón cerrar */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.closeButtonText}>¡Entendido!</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 15, 26, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.purple[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  list: {
    marginVertical: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 16,
  },
  badgeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  itemContent: {
    flex: 1,
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  actionTag: {
    fontSize: 12,
    fontWeight: '800',
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
  },
  itemDesc: {
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 17,
  },
  closeButton: {
    backgroundColor: colors.purple[500],
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  closeButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
