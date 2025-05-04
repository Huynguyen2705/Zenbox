'use client';

import { isEqual } from 'es-toolkit';
import { useMemo, useState, useCallback } from 'react';
import { useCookies, useLocalStorage } from 'minimal-shared/hooks';

import { SettingsContext } from './settings-context';
import { SETTINGS_STORAGE_KEY } from '../settings-config';

import type { SettingsState, SettingsProviderProps } from '../types';

// ----------------------------------------------------------------------

export function SettingsProvider({
  children,
  cookieSettings,
  defaultSettings,
  storageKey = SETTINGS_STORAGE_KEY,
  regionId = process.env.NEXT_PUBLIC_REGION_ID
}: SettingsProviderProps) {
  const isCookieEnabled = !!cookieSettings;
  const useStorage = isCookieEnabled ? useCookies : useLocalStorage;
  const initialSettings = isCookieEnabled ? cookieSettings : defaultSettings;

  const { state, setState, resetState, setField } = useStorage<SettingsState>(
    storageKey,
    { ...initialSettings, regionId }
  );

  const [openDrawer, setOpenDrawer] = useState(false);

  const onToggleDrawer = useCallback(() => {
    setOpenDrawer((prev) => !prev);
  }, []);

  const onCloseDrawer = useCallback(() => {
    setOpenDrawer(false);
  }, []);

  const canReset = !isEqual(state, defaultSettings);

  const onReset = useCallback(() => {
    resetState(defaultSettings);
  }, [defaultSettings, resetState]);

  const memoizedValue = useMemo(
    () => ({
      canReset,
      onReset,
      openDrawer,
      onCloseDrawer,
      onToggleDrawer,
      state,
      setState,
      setField,
    }),
    [canReset, onReset, openDrawer, onCloseDrawer, onToggleDrawer, state, setField, setState]
  );

  return <SettingsContext.Provider value={memoizedValue}>{children}</SettingsContext.Provider>;
}
