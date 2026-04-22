import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Search
} from 'lucide-react';
import { formatBytes } from '../lib/utils';
import { format } from 'date-fns';
import { fetchFiles, type FileEntry } from '../services/fileService';
import { useConfig } from '../contexts/ConfigContext';

export default function FileBrowser() {
  const { config } = useConfig();
  const [currentPath, setCurrentPath] = useState('');
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (config) {
      loadFiles(currentPath);
    }
  }, [currentPath, config]);

  const loadFiles = async (path: string) => {
    if (!config) return;
    setLoading(true);
    try {
      const data = await fetchFiles(path, config);
      setFiles(data);
    } catch (err) {
      console.error('Failed to load files:', err);
    } finally {
      setLoading(false);
    }
  };

  const navigateTo = async (file: FileEntry) => {
    if (file.isDirectory) {
      setCurrentPath(prev => prev ? `${prev}/${file.name}` : file.name);
    } else {
      const url = file.downloadUrl || `/files/${currentPath ? currentPath + '/' : ''}${file.name}`;
      
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);
      } catch (error) {
        console.error('Download failed, falling back to new tab:', error);
        window.open(url, '_blank');
      }
    }
  };

  const goBack = () => {
    const parts = currentPath.split('/');
    parts.pop();
    setCurrentPath(parts.join('/'));
  };

  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="p-6 border-b border-dim-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          {currentPath && (
            <button 
              onClick={goBack}
              className="p-1 hover:bg-dim-hover rounded transition-colors text-dim-muted hover:text-dim-text mr-1"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <span className="text-dim-accent font-mono tracking-tighter">~/</span>
          <span className="font-bold text-xl">files</span>
          {currentPath && (
            <span className="text-dim-muted text-sm truncate max-w-[150px]">
              /{currentPath}
            </span>
          )}
          <span className="ml-2 px-2 py-0.5 bg-[#38444d] rounded text-[10px] font-bold text-dim-muted uppercase tracking-wider">
            {files.length} Items
          </span>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dim-muted" size={14} />
            <input 
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-[#38444d] border-none rounded-full text-xs focus:ring-1 focus:ring-dim-accent outline-none w-40 transition-all focus:w-56"
            />
          </div>
        </div>
      </header>

      {/* Main List */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Table Head */}
        <div className="grid grid-cols-12 px-6 py-3 border-b border-dim-border text-dim-muted text-[10px] font-bold uppercase tracking-[0.1em]">
          <div className="col-span-7">Name</div>
          <div className="col-span-3">Last Modified</div>
          <div className="col-span-2 text-right">Size</div>
        </div>

        {/* Scrollable File List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="p-12 flex justify-center">
              <div className="w-6 h-6 border-2 border-dim-accent border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="p-12 text-center text-dim-muted text-sm italic">
              {loading ? 'Chargement...' : 'Aucun fichier trouvé. Vérifiez que le dossier /files existe à la racine de votre dépôt GitHub.'}
            </div>
          ) : (
            filteredFiles.map((file) => (
              <div 
                key={file.name}
                onClick={() => navigateTo(file)}
                className="file-row grid grid-cols-12 px-6 py-4 items-center group"
              >
                <div className="col-span-7 flex items-center gap-3 font-medium">
                  <span className="text-lg leading-none shrink-0" style={{ filter: 'grayscale(0.2)' }}>
                    {file.isDirectory ? '📁' : getFileEmoji(file.mime)}
                  </span>
                  <span className="truncate group-hover:text-dim-accent transition-colors">
                    {file.name}{file.isDirectory ? '/' : ''}
                  </span>
                </div>
                <div className="col-span-3 text-sm text-dim-muted tabular-nums">
                  {format(new Date(file.mtime), 'yyyy-MM-dd HH:mm')}
                </div>
                <div className="col-span-2 text-right text-sm text-dim-muted tabular-nums">
                  {file.isDirectory ? '-' : formatBytes(file.size)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="p-4 border-t border-dim-border bg-[#1e2732]/30 text-center text-[10px] text-dim-muted tracking-[0.2em] uppercase shrink-0">
        {config?.footerText}
      </footer>
    </div>
  );
}

function getFileEmoji(mime: string) {
  if (mime.includes('pdf')) return '📄';
  if (mime.includes('image')) return '🖼️';
  if (mime.includes('zip') || mime.includes('archive')) return '📦';
  if (mime.includes('csv') || mime.includes('excel')) return '📊';
  if (mime.includes('text') || mime.includes('markdown')) return '📝';
  return '📃';
}
