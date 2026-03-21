import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getPublicSettings } from '../services/settingsService';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSettings = useCallback(async (force = false) => {
    try {
      setLoading(true);
      const data = await getPublicSettings();
      setSettings(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching settings in Context:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const value = {
    settings,
    loading,
    error,
    refreshSettings: fetchSettings
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
