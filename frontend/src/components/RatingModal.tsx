import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import api from '../services/api';
import type { ContentItem } from '../types';

interface Props {
  item: ContentItem | null;
  onClose: () => void;
}

export default function RatingModal({ item, onClose }: Props) {
  const [score, setScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  if (!item) return null;

  const handleRate = async () => {
    if (score === 0) {
      Alert.alert('Selecciona una puntuación para continuar');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post('/ratings', {
        content_id: item.id,
        score,
      });
      Alert.alert(
        '¡Gracias por valorar!',
        `Has ganado ${data.coins_earned} monedas.\nTotal acumulado: ${data.total_coins}`
      );
      onClose();
    } catch {
      Alert.alert('Error', 'No se pudo enviar la valoración');
    } finally {
      setSubmitting(false);
      setScore(0);
    }
  };

  return (
    <Modal visible={!!item} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Icono decorativo */}
          <View style={styles.iconCircle}>
            <Ionicons name="star" size={28} color="#F59E0B" />
          </View>

          <Text style={styles.headline}>¿Qué te pareció?</Text>
          <Text style={styles.contentTitle} numberOfLines={2}>
            {item.title}
          </Text>

          {/* Estrellas */}
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setScore(star)}
                style={styles.starButton}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={star <= score ? 'star' : 'star-outline'}
                  size={38}
                  color={star <= score ? '#F59E0B' : colors.purple[100]}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Etiqueta descriptiva del score */}
          <Text style={styles.scoreLabel}>
            {score === 0 && 'Toca una estrella para valorar'}
            {score === 1 && 'No me gustó'}
            {score === 2 && 'Pasable'}
            {score === 3 && 'Bueno'}
            {score === 4 && 'Muy bueno'}
            {score === 5 && '¡Obra maestra!'}
          </Text>

          {/* Monedas ganadas */}
          <View style={styles.rewardRow}>
            <Ionicons name="sparkles" size={16} color="#F59E0B" />
            <Text style={styles.rewardText}>Ganarás 10 monedas al valorar</Text>
          </View>

          {/* Botón principal */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              score === 0 && styles.submitButtonDisabled,
            ]}
            onPress={handleRate}
            disabled={score === 0 || submitting}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>
              {submitting ? 'Enviando...' : 'Enviar Valoración'}
            </Text>
          </TouchableOpacity>

          {/* Omitir valoración */}
          <TouchableOpacity
            style={styles.skipButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.skipButtonText}>Omitir por ahora</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: colors.white,
    borderRadius: 28,
    padding: 28,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headline: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  contentTitle: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  starButton: {
    padding: 4,
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.purple[500],
    marginBottom: 16,
    height: 20,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  rewardText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
  },
  submitButton: {
    backgroundColor: colors.purple[500],
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  submitButtonDisabled: {
    backgroundColor: colors.purple[100],
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  skipButton: {
    paddingVertical: 8,
  },
  skipButtonText: {
    color: colors.text.secondary,
    fontSize: 14,
  },
});
