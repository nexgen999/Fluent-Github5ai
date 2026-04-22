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

import { type HubConfig } from '../contexts/ConfigContext';

export async function fetchFiles(path: string, config: HubConfig): Promise<FileEntry[]> {
  const hostname = window.location.hostname;
  
  // Le dépôt est maintenant géré par le fichier central config.json passé en paramètre
  const githubRepo = `${config.githubUsername}/${config.githubRepo}`;
  const filesDir = config.filesDirectory || "files";

  // Debug pour la console
  console.log('Hub Config:', { hostname, githubRepo, path, filesDir });

  // Si on est sur le web (GitHub Pages ou preview), on utilise l'API GitHub
  if (hostname.includes('github.io') || hostname.includes('run.app') || import.meta.env.PROD) {
    return fetchFromGitHub(githubRepo, filesDir, path);
  }

  // En développement local pur (localhost)
  try {
    const res = await fetch(`/api/files?path=${encodeURIComponent(path)}`);
    if (res.ok) {
      const data = await res.json();
      return data.files || [];
    }
    return fetchFromGitHub(githubRepo, filesDir, path);
  } catch (err) {
    return fetchFromGitHub(githubRepo, filesDir, path);
  }
}

async function fetchFromGitHub(repo: string, filesDir: string, path: string): Promise<FileEntry[]> {
  const url = `https://api.github.com/repos/${repo}/contents/${filesDir}${path ? '/' + path : ''}`;
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
