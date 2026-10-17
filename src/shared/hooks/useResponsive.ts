// SPDX-License-Identifier: GPL-3.0-or-later
import { useWindowDimensions } from 'react-native';

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const isWide = width >= 500; // Z Fold 4 inner screen
  const cardPadding = isWide ? 20 : 16;
  const buttonHeight = isWide ? 64 : 56;
  return { width, height, isWide, cardPadding, buttonHeight };
}
