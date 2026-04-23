import Profile from './components/Profile';
import FileBrowser from './components/FileBrowser';
import SocialLinks from './components/SocialLinks';
import { motion } from 'motion/react';
import { LayoutGrid, FileSearch, Sparkles } from 'lucide-react';
import { cn } from './lib/utils';
import { useEffect } from 'react';
import { ConfigProvider, useConfig } from './contexts/ConfigContext';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

function AppContent() {
  const { config, loading } = useConfig();

  // Gestion dynamique du favicon et du titre
  useEffect(() => {
    if (!config) return;

    let faviconUrl = "";
    if (config.favicon) {
      faviconUrl = `./assets/favicon/${config.favicon}`;
    } else {
      faviconUrl = `https://github.com/${config.githubUsername}.png`;
    }

    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    (link as HTMLLinkElement).type = 'image/x-icon';
    (link as HTMLLinkElement).rel = 'shortcut icon';
    (link as HTMLLinkElement).href = faviconUrl;
    document.getElementsByTagName('head')[0].appendChild(link);

    if (config.siteTitle) {
      document.title = config.siteTitle;
    }
  }, [config]);

  if (loading || !config) {
    return (
      <div className="min-h-screen bg-[#15202b] flex items-center justify-center text-[#1d9bf0]">
        <Sparkles className="animate-spin mr-2" />
        <span>Chargement de la configuration...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative p-4 md:p-6 h-screen overflow-hidden flex flex-col md:flex-row gap-6">
      <aside className="w-full md:w-80 flex flex-col gap-6 flex-shrink-0 overflow-y-auto custom-scrollbar pr-1">
        <Profile />
        <div className="fluent-glass rounded-3xl p-6 flex flex-col gap-6">
          <SocialLinks />
        </div>
      </aside>

      <main className="flex-1 fluent-glass rounded-3xl flex flex-col overflow-hidden">
        <FileBrowser />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ConfigProvider>
      <AppContent />
    </ConfigProvider>
  );
}

function NavLink({ children, active, href }: { children: React.ReactNode; active?: boolean; href: string }) {
  return (
    <a 
      href={href}
      className={cn(
        "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
        active ? "bg-dim-surface text-dim-accent shadow-sm" : "text-dim-muted hover:text-dim-text"
      )}
    >
      {children}
    </a>
  );
}

function InfoCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="fluent-card p-6 flex flex-col gap-3 group"
    >
      <div className="p-3 bg-dim-hover w-fit rounded-xl group-hover:bg-dim-accent/10 transition-colors">
        {icon}
      </div>
      <h3 className="font-bold text-lg">{title}</h3>
      <p className="text-sm text-dim-muted leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}
