import { useState, useEffect } from 'react';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';
import { useConfig } from '../contexts/ConfigContext';

interface GitHubProfile {
  name: string;
  login: string;
  avatar_url: string;
  bio: string;
  html_url: string;
}

export default function Profile() {
  const [profile, setProfile] = useState<GitHubProfile | null>(null);
  const { config } = useConfig();

  useEffect(() => {
    if (!config) return;

    fetch(`https://api.github.com/users/${config.githubUsername}`)
      .then(res => res.json())
      .then(data => {
        setProfile({
          name: config.displayName || data.name || data.login,
          login: data.login,
          avatar_url: data.avatar_url,
          bio: config.bio || data.bio || 'Hub personnel pour le partage de ressources.',
          html_url: data.html_url
        });
      })
      .catch(err => {
        console.error('Failed to fetch GitHub profile', err);
        // Fallback simple si l'API échoue
        setProfile({
          name: config.displayName || config.githubUsername,
          login: config.githubUsername,
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${config.githubUsername}`,
          bio: config.bio || '',
          html_url: `https://github.com/${config.githubUsername}`
        });
      });
  }, [config]);

  if (!profile) {
    return (
      <div className="fluent-glass rounded-3xl p-8 flex flex-col items-center text-center animate-pulse">
        <div className="w-32 h-32 rounded-full bg-dim-hover mb-6"></div>
        <div className="h-6 bg-dim-hover w-32 rounded mb-2"></div>
        <div className="h-4 bg-dim-hover w-24 rounded mb-4"></div>
        <div className="h-4 bg-dim-hover w-full rounded mb-6"></div>
      </div>
    );
  }

  return (
    <div className="fluent-glass rounded-3xl p-8 flex flex-col items-center text-center">
      <div className="w-32 h-32 rounded-full overflow-hidden profile-bubble mb-6">
        <img 
          src={profile.avatar_url}
          alt={profile.name}
          className="w-full h-full object-cover"
        />
      </div>

      <h1 className="text-2xl font-bold mb-1 text-dim-text">{profile.name}</h1>
      <p className="text-dim-muted text-sm mb-4">@{profile.login}</p>
      
      <p className="text-sm leading-relaxed text-dim-muted whitespace-pre-wrap">
        {profile.bio}
      </p>

    </div>
  );
}

function SocialIcon({ icon }: { icon: React.ReactNode }) {
  return (
    <div className="p-2 rounded-full bg-[#38444d] hover:bg-[#1d9bf0] transition-colors cursor-pointer text-white">
      {icon}
    </div>
  );
}
