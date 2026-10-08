import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';
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
      Alert.alert('Selecciona una puntuación');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post('/ratings', {
        content_id: item.id,
        score,
      });
      Alert.alert(
        '¡Gracias!',
        `Has ganado ${data.coins_earned} monedas. Total: ${data.total_coins}`
      );
      onClose();
    } catch {
      Alert.alert('Error', 'No se pudo enviar la valoración');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={!!item} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>¿Qué te pareció</Text>
          <Text style={styles.contentTitle}>{item.title}?</Text>

          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setScore(star)}>
                <Text
                  style={[
                    styles.star,
                    star <= score && styles.starActive,
                  ]}
                >
                  ★
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.rateButton, submitting && styles.buttonDisabled]}
            onPress={handleRate}
            disabled={submitting}
          >
            <Text style={styles.rateButtonText}>
              {submitting ? 'Enviando...' : 'Valorar y ganar monedas'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} disabled={submitting}>
            <Text style={styles.skipText}>Ahora no</Text>
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
    padding: 32,
  },
  modal: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 32,
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  contentTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 24,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  star: {
    fontSize: 40,
    color: colors.purple[100],
  },
  starActive: {
    color: colors.warning,
  },
  rateButton: {
    backgroundColor: colors.purple[500],
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  rateButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  skipText: {
    color: colors.text.muted,
    fontSize: 14,
  },
});
