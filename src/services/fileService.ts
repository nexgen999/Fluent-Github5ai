/**
 * Service pour gérer la liste des fichiers soit via l'API locale (Express)
 * soit via l'API GitHub (pour GitHub Pages).
 */

export interface FileEntry {
  name: string;
  isDirectory: boolean;
  size: number;
  mtime: string;
  mime: string;
  downloadUrl?: string; // Utilisé pour GitHub
}

import { type HubConfig, type HubSource } from '../contexts/ConfigContext';

export async function fetchFiles(path: string, config: HubConfig, sourceOverride?: HubSource): Promise<FileEntry[]> {
  const hostname = window.location.hostname;
  
  // On utilise soit la source passée en paramètre, soit le défaut du config
  const source = sourceOverride || {
    id: 'default',
    name: 'Default',
    owner: config.githubUsername,
    repo: config.githubRepo,
    path: config.filesDirectory || "files"
  };

  const githubRepo = `${source.owner}/${source.repo}`;
  const filesDir = source.path;

  // Debug pour la console
  console.log('Hub Fetching:', { hostname, githubRepo, path, filesDir });

  // Si on est sur le web (GitHub Pages ou preview), on utilise l'API GitHub
  if (hostname.includes('github.io') || hostname.includes('run.app') || import.meta.env.PROD) {
    return fetchFromGitHub(githubRepo, filesDir, path, source.branch);
  }

  // En développement local pur (localhost)
  try {
    const res = await fetch(`/api/files?path=${encodeURIComponent(path)}`);
    if (res.ok) {
      const data = await res.json();
      return data.files || [];
    }
    return fetchFromGitHub(githubRepo, filesDir, path, source.branch);
  } catch (err) {
    return fetchFromGitHub(githubRepo, filesDir, path, source.branch);
  }
}

async function fetchFromGitHub(repo: string, filesDir: string, path: string, branch?: string): Promise<FileEntry[]> {
  const branchParam = branch ? `?ref=${branch}` : '';
  const url = `https://api.github.com/repos/${repo}/contents/${filesDir}${path ? '/' + path : ''}${branchParam}`;
  console.log('Fetching from GitHub API:', url);
  
  try {
    const res = await fetch(url);
    if (!res.ok) {
      const errorData = await res.json();
      console.error('GitHub API Error detailed:', errorData);
      throw new Error(`GitHub API Error: ${res.status} ${res.statusText}`);
    }
    
    const data = await res.json();
    if (!Array.isArray(data)) {
      console.error('GitHub API expected array but got:', data);
      return [];
    }
    
    // Normalisation des données GitHub vers notre format
    return data.map((item: any) => ({
      name: item.name,
      isDirectory: item.type === 'dir',
      size: item.size,
      mtime: new Date().toISOString(),
      mime: item.type === 'dir' ? 'directory' : 'application/octet-stream',
      downloadUrl: item.download_url
    }));
  } catch (error) {
    console.error('Fetch operation failed:', error);
    throw error;
  }
}
