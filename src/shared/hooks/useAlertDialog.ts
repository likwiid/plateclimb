// SPDX-License-Identifier: GPL-3.0-or-later
import { useState } from 'react';

export type AlertButton = {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
};

export type AlertConfig = {
  visible: boolean;
  title: string;
  message: string;
  buttons: AlertButton[];
};

const INITIAL_ALERT: AlertConfig = { visible: false, title: '', message: '', buttons: [] };

export function useAlertDialog() {
  const [alertConfig, setAlertConfig] = useState<AlertConfig>(INITIAL_ALERT);

  function showAlert(title: string, message: string, buttons: AlertButton[]) {
    setAlertConfig({ visible: true, title, message, buttons });
  }

  function dismissAlert() {
    setAlertConfig((c) => ({ ...c, visible: false }));
  }

  return { alertConfig, showAlert, dismissAlert };
}
