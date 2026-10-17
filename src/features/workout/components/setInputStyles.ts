// SPDX-License-Identifier: GPL-3.0-or-later
import { StyleSheet } from 'react-native';
import { colors } from '@shared/theme';

export const styles = StyleSheet.create({
  weightInput: {
    color: colors.text.primary,
    fontSize: 40,
    fontWeight: '700',
    textAlign: 'center',
    minWidth: 80,
    padding: 0,
    borderBottomWidth: 2,
    borderBottomColor: colors.indigo,
  },
  unitToggle: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: colors.indigo + '20',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  unitToggleText: {
    color: colors.indigoLight,
    fontSize: 11,
    fontWeight: '600',
  },
  counterCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.indigo + '10',
    borderWidth: 3,
    borderColor: colors.border.default,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  counterCircleActive: {
    borderColor: colors.success,
    backgroundColor: colors.success + '10',
  },
  counterCount: {
    color: colors.text.primary,
    fontSize: 48,
    fontWeight: '800' as const,
  },
  counterLabel: {
    color: colors.text.muted,
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 2,
    marginTop: -4,
  },
  counterLabelActive: {
    color: colors.success,
  },
  counterActionButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  counterStartButton: {
    backgroundColor: colors.success,
  },
  counterStopButton: {
    backgroundColor: colors.error,
  },
  counterActionText: {
    color: colors.text.white,
    fontSize: 14,
    fontWeight: '700' as const,
  },
  counterResetButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.bg.elevated,
  },
  tempoChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: colors.bg.elevated,
  },
  tempoChipActive: {
    backgroundColor: colors.indigo + '30',
  },
  tempoChipText: {
    color: colors.text.muted,
    fontSize: 11,
    fontWeight: '600' as const,
  },
  tempoChipTextActive: {
    color: colors.indigoLight,
  },
  repCounterToggle: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
});
