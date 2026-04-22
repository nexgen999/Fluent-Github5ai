import { useConfig } from '../contexts/ConfigContext';

export default function SocialLinks() {
  const { config } = useConfig();
  
  if (!config) return null;
  const { socials } = config;

  // Mapping des noms pour dashboard-icons (walkxcode)
  const getIconUrl = (key: string) => {
    const mapping: { [key: string]: string } = {
      "facebook": "facebook",
      "instagram": "instagram",
      "bluesky": "bluesky",
      "twitter": "twitter",
      "x": "x",
      "snapchat": "snapchat",
      "discord": "discord",
      "messenger": "messenger",
      "whatsapp": "whatsapp",
      "telegram": "telegram",
      "youtube": "youtube",
      "tiktok": "tiktok",
      "twitch": "twitch",
      "kick": "kick",
      "linkedin": "linkedin",
      "email": "gmail",
      "github": "github",
      "gitlab": "gitlab",
      "gitea": "gitea",
      "git": "git",
      "forgejo": "forgejo",
      "github page": "github",
      "url": "globe"
    };
    
    const iconName = mapping[key] || key;
    return `https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/${iconName}.png`;
  };

  const categories = [
    {
      title: "Social Network",
      links: [
        { key: "facebook", url: socials.facebook },
        { key: "instagram", url: socials.instagram },
        { key: "bluesky", url: socials.bluesky },
        { key: "twitter", url: socials.twitter },
        { key: "x", url: socials.x },
      ]
    },
    {
      title: "Messenger",
      links: [
        { key: "snapchat", url: socials.snapchat },
        { key: "discord", url: socials.discord },
        { key: "messenger", url: socials.messenger },
        { key: "whatsapp", url: socials.whatsapp },
        { key: "telegram", url: socials.telegram },
      ]
    },
    {
      title: "Video",
      links: [
        { key: "youtube", url: socials.youtube },
        { key: "tiktok", url: socials.tiktok },
        { key: "twitch", url: socials.twitch },
        { key: "kick", url: socials.kick },
      ]
    },
    {
      title: "Pro",
      links: [
        { key: "linkedin", url: socials.linkedin },
        { key: "email", url: socials.email, isEmail: true },
      ]
    },
    {
      title: "Repository",
      links: [
        { key: "github", url: socials.github },
        { key: "gitlab", url: socials.gitlab },
        { key: "gitea", url: socials.gitea },
        { key: "git", url: socials.git },
        { key: "forgejo", url: socials.forgejo },
      ]
    },
    {
      title: "Website",
      links: [
        { key: "github page", url: socials.githubPage },
        { key: "url", url: socials.url },
      ]
    }
  ];

  return (
    <div className="flex flex-col gap-6 w-full custom-scrollbar">
      {categories.map((cat) => {
        const activeLinks = cat.links.filter(l => l.url);
        if (activeLinks.length === 0) return null;

        return (
          <div key={cat.title} className="flex flex-col gap-3">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-dim-accent px-1 opacity-70">
              {cat.title}
            </span>
            <div className="grid grid-cols-5 gap-2 px-1">
              {activeLinks.map((link) => (
                <a
                  key={link.key}
                  href={link.isEmail ? `mailto:${link.url}` : link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={link.key}
                  className="flex items-center justify-center aspect-square bg-[#38444d] hover:bg-dim-accent/20 text-white rounded-full transition-all hover:scale-110 active:scale-95 shadow-sm p-2"
                >
                  <img 
                    src={getIconUrl(link.key)} 
                    alt={link.key}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${link.key}&backgroundColor=38444d`;
                    }}
                  />
                </a>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
