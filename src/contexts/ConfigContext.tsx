import React, { createContext, useContext, useState, useEffect } from 'react';

export interface HubConfig {
  githubUsername: string;
  githubRepo: string;
  displayName: string;
  bio: string;
  siteTitle: string;
  footerText: string;
  socials: {
    [key: string]: string;
  };
  filesDirectory: string;
  favicon: string;
  theme: string;
}

const ConfigContext = createContext<{ config: HubConfig | null; loading: boolean }>({
  config: null,
  loading: true
});

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<HubConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadConfig() {
      try {
        // On essaie de charger le config.json externe
        // En dev il est dans public/, en prod il sera à la racine
        const response = await fetch('./config.json');
        if (!response.ok) throw new Error('Config not found');
        const data = await response.json();
        setConfig(data);
      } catch (err) {
        console.error('Failed to load external config, using fallback defaults', err);
        // Fallback par défaut si le fichier manque (pour ne pas crasher)
        setConfig({
          githubUsername: "nexgen999",
          githubRepo: "nexgen999.github.io",
          displayName: "Nexgen Hub",
          bio: "Hub personnel",
          siteTitle: "Nexgen HUB",
          footerText: "Powered by Hub Engine",
          socials: { github: "https://github.com/nexgen999" },
          filesDirectory: "files",
          favicon: "",
          theme: "dim"
        });
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  return (
    <ConfigContext.Provider value={{ config, loading }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => useContext(ConfigContext);
