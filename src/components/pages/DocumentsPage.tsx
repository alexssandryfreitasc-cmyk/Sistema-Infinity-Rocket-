import React, { useState, useEffect } from 'react';
import {
  FolderLock,
  Plus,
  FileText,
  Download,
  Image as ImageIcon,
  FileCode,
  Building2,
  X,
  ExternalLink,
  Upload,
  RefreshCw,
  FolderPlus,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Layers,
  FileVideo,
  FileSpreadsheet,
  FileCheck,
  Shield,
  HardDrive
} from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { DocumentFile } from '../../types';
import {
  getSavedDriveToken,
  requestGoogleDriveAccess,
  listGoogleDriveFiles,
  createGoogleDriveFolder,
  uploadFileToGoogleDrive,
  clearDriveToken,
  DriveFileItem
} from '../../services/googleDriveService';

export const DocumentsPage: React.FC = () => {
  const {
    documents,
    clients,
    activeClient,
    uploadDocument,
    deleteDocument,
    updateClient,
    currentUser
  } = useAgency();

  const [selectedClient, setSelectedClient] = useState<string>(activeClient?.id || 'TODOS');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODOS');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Google Drive state
  const [isDriveConnected, setIsDriveConnected] = useState<boolean>(false);
  const [driveToken, setDriveToken] = useState<string | null>(null);
  const [isLoadingDrive, setIsLoadingDrive] = useState<boolean>(false);
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [driveError, setDriveError] = useState<string | null>(null);
  const [driveSearch, setDriveSearch] = useState<string>('');

  // Modals & Uploads
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isDrivePickerModalOpen, setIsDrivePickerModalOpen] = useState<boolean>(false);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgressMsg, setUploadProgressMsg] = useState<string>('');

  // Form State
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocCategory, setNewDocCategory] = useState<DocumentFile['category']>('CONTRATOS');
  const [newDocClientId, setNewDocClientId] = useState(activeClient?.id || clients[0]?.id || '');
  const [selectedLocalFile, setSelectedLocalFile] = useState<File | null>(null);
  const [syncToDriveOnUpload, setSyncToDriveOnUpload] = useState<boolean>(true);
  const [newFolderName, setNewFolderName] = useState('');

  // Check saved token on mount
  useEffect(() => {
    const token = getSavedDriveToken();
    if (token) {
      setDriveToken(token);
      setIsDriveConnected(true);
      fetchDriveFiles(token);
    }
  }, []);

  // Fetch files from Google Drive
  const fetchDriveFiles = async (token: string, query: string = '') => {
    setIsLoadingDrive(true);
    setDriveError(null);
    try {
      const files = await listGoogleDriveFiles(token, query);
      setDriveFiles(files);
    } catch (err: any) {
      setDriveError(err.message || 'Erro ao carregar arquivos do Google Drive');
      if (err.message?.includes('expirada')) {
        setIsDriveConnected(false);
        setDriveToken(null);
      }
    } finally {
      setIsLoadingDrive(false);
    }
  };

  // Handle Connect to Google Drive
  const handleConnectDrive = async () => {
    setIsLoadingDrive(true);
    setDriveError(null);
    try {
      const token = await requestGoogleDriveAccess();
      setDriveToken(token);
      setIsDriveConnected(true);
      await fetchDriveFiles(token);
    } catch (err: any) {
      setDriveError(err.message || 'Não foi possível autorizar o acesso ao Google Drive.');
    } finally {
      setIsLoadingDrive(false);
    }
  };

  const handleDisconnectDrive = () => {
    clearDriveToken();
    setDriveToken(null);
    setIsDriveConnected(false);
    setDriveFiles([]);
  };

  // Create Client Folder in Google Drive
  const handleCreateClientFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driveToken || !newFolderName.trim()) return;

    setIsLoadingDrive(true);
    try {
      const folder = await createGoogleDriveFolder(driveToken, newFolderName.trim());
      if (selectedClient !== 'TODOS') {
        updateClient(selectedClient, {
          driveFolder: {
            id: folder.id,
            name: folder.name,
            webViewLink: folder.webViewLink,
            isLinked: true
          }
        });
      }
      setIsCreateFolderModalOpen(false);
      setNewFolderName('');
      await fetchDriveFiles(driveToken);
    } catch (err: any) {
      setDriveError(err.message || 'Erro ao criar pasta no Drive');
    } finally {
      setIsLoadingDrive(false);
    }
  };

  // Import / Link File from Google Drive to AgencyOS
  const handleLinkDriveFile = (file: DriveFileItem, targetClientId: string) => {
    const matchedClient = clients.find((c) => c.id === targetClientId) || activeClient || clients[0];
    
    // Guess category from mimeType
    let cat: DocumentFile['category'] = 'MATERIAIS';
    if (file.mimeType.includes('image')) cat = 'IDENTIDADE_VISUAL';
    else if (file.mimeType.includes('video')) cat = 'VIDEOS';
    else if (file.mimeType.includes('pdf') || file.name.toLowerCase().includes('contrato')) cat = 'CONTRATOS';
    else if (file.name.toLowerCase().includes('briefing')) cat = 'BRIEFINGS';
    else if (file.name.toLowerCase().includes('logo')) cat = 'LOGOS';

    const newDoc: Omit<DocumentFile, 'id' | 'uploadedAt'> = {
      clientId: matchedClient.id,
      name: file.name,
      category: cat,
      fileSize: file.size || 'Google Drive',
      fileType: file.mimeType.includes('folder') ? 'FOLDER' : file.mimeType.split('/').pop()?.toUpperCase() || 'DRIVE',
      uploadedBy: `${currentUser.name} (via Google Drive)`,
      url: file.webViewLink,
      driveFileId: file.id,
      driveWebViewLink: file.webViewLink,
      driveThumbnailLink: file.thumbnailLink,
      isDriveSync: true
    };

    uploadDocument(newDoc);
    setIsDrivePickerModalOpen(false);
  };

  // Handle Manual Upload + optional Drive Sync
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim()) return;

    setIsUploading(true);
    setUploadProgressMsg('Processando arquivo...');

    try {
      let driveUrl: string | undefined = undefined;
      let driveId: string | undefined = undefined;
      let driveThumb: string | undefined = undefined;

      // If local file selected and Google Drive is connected & sync checked
      if (selectedLocalFile && isDriveConnected && driveToken && syncToDriveOnUpload) {
        setUploadProgressMsg('Sincronizando com seu Google Drive...');
        const uploadedDrive = await uploadFileToGoogleDrive(driveToken, selectedLocalFile);
        driveUrl = uploadedDrive.webViewLink;
        driveId = uploadedDrive.id;
        driveThumb = uploadedDrive.thumbnailLink;
      }

      const client = clients.find((c) => c.id === newDocClientId) || clients[0];

      const res = await uploadDocument(
        {
          clientId: client.id,
          name: newDocTitle,
          category: newDocCategory,
          fileSize: selectedLocalFile ? `${(selectedLocalFile.size / (1024 * 1024)).toFixed(2)} MB` : '1.2 MB',
          fileType: selectedLocalFile ? selectedLocalFile.name.split('.').pop()?.toUpperCase() || 'PDF' : 'PDF',
          uploadedBy: currentUser.name,
          url: driveUrl || '#',
          driveFileId: driveId,
          driveWebViewLink: driveUrl,
          driveThumbnailLink: driveThumb,
          isDriveSync: Boolean(driveId)
        },
        selectedLocalFile || undefined
      );

      if (!res.success) {
        setDriveError(res.message || 'Erro ao fazer upload do arquivo.');
        return;
      }

      setIsUploadModalOpen(false);
      setNewDocTitle('');
      setSelectedLocalFile(null);
    } catch (err: any) {
      setDriveError(err.message || 'Erro ao enviar documento');
    } finally {
      setIsUploading(false);
      setUploadProgressMsg('');
    }
  };

  // Filter local & linked documents
  const filteredDocs = documents.filter((d) => {
    const matchClient = selectedClient === 'TODOS' ? true : d.clientId === selectedClient;
    const matchCategory = selectedCategory === 'TODOS' ? true : d.category === selectedCategory;
    const matchSearch = searchQuery.trim()
      ? d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchClient && matchCategory && matchSearch;
  });

  const categories = [
    { id: 'TODOS', label: 'Todos' },
    { id: 'CONTRATOS', label: 'Contratos' },
    { id: 'BRIEFINGS', label: 'Briefings' },
    { id: 'IDENTIDADE_VISUAL', label: 'ID Visual' },
    { id: 'LOGOS', label: 'Logotipos' },
    { id: 'FOTOS', label: 'Fotos & Mídia' },
    { id: 'VIDEOS', label: 'Vídeos' },
    { id: 'RELATORIOS', label: 'Relatórios' },
    { id: 'MATERIAIS', label: 'Outros' }
  ];

  const currentFocusedClient = clients.find((c) => c.id === selectedClient);

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header Banner */}
      <div className="p-6 rounded-xl bg-gray-800 border border-gray-700 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <FolderLock className="w-6 h-6 text-indigo-300" />
              <h1 className="text-xl font-extrabold text-white tracking-tight">
                Biblioteca de Documentos & Google Drive
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-900 border border-gray-600 text-indigo-300 font-bold">
                {filteredDocs.length} arquivos
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Gerencie contratos, manuais de marca, pastas compartilhadas e arquivos sincronizados com o Google Drive.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Google Drive Status Button */}
            {!isDriveConnected ? (
              <button
                onClick={handleConnectDrive}
                disabled={isLoadingDrive}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#1a73e8]/20 to-[#4285f4]/30 hover:from-[#1a73e8]/30 hover:to-[#4285f4]/40 border border-[#1a73e8]/50 text-[#8ab4f8] text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer shadow-sm"
              >
                <Cloud className="w-4 h-4 text-[#8ab4f8]" />
                <span>{isLoadingDrive ? 'Conectando...' : 'Conectar Google Drive'}</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsDrivePickerModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 border border-gray-600 text-xs font-semibold text-white flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <HardDrive className="w-3.5 h-3.5 text-indigo-300" />
                  <span>Explorar Drive</span>
                </button>

                <button
                  onClick={() => setIsCreateFolderModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 border border-gray-600 text-xs font-semibold text-white flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <FolderPlus className="w-3.5 h-3.5 text-[#8ab4f8]" />
                  <span>Criar Pasta</span>
                </button>

                <span className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Drive Conectado</span>
                </span>
              </div>
            )}

            {/* Upload Document Modal Button */}
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer shadow-md shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Documento</span>
            </button>
          </div>
        </div>

        {/* Client Linked Google Drive Banner (if client has dedicated folder) */}
        {currentFocusedClient && currentFocusedClient.driveFolder?.isLinked && (
          <div className="p-3.5 rounded-lg bg-gradient-to-r from-gray-800 to-gray-900 border border-[#1a73e8]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-[#1a73e8]/20 text-[#8ab4f8]">
                <HardDrive className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-white flex items-center space-x-1.5">
                  <span>Pasta Google Drive do Cliente:</span>
                  <span className="text-[#8ab4f8]">{currentFocusedClient.driveFolder.name}</span>
                </p>
                <p className="text-[11px] text-gray-400">
                  Todos os arquivos colocados nesta pasta do Drive ficam acessíveis à equipe e ao cliente.
                </p>
              </div>
            </div>
            {currentFocusedClient.driveFolder.webViewLink && (
              <a
                href={currentFocusedClient.driveFolder.webViewLink}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] text-white font-semibold text-xs flex items-center justify-center space-x-1.5 transition-colors shrink-0"
              >
                <span>Abrir no Google Drive</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}

        {/* Error notification if any */}
        {driveError && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{driveError}</span>
            </div>
            <button onClick={() => setDriveError(null)} className="text-rose-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-gray-700">
          {/* Client Filter */}
          <div className="sm:col-span-4">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Filtrar por Cliente
            </label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white focus:outline-none focus:border-indigo-600"
            >
              <option value="TODOS">Todos os Clientes</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.tradingName}
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="sm:col-span-5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Buscar Arquivo
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Ex: Contrato, Logo vetor, Identidade Visual..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="sm:col-span-3 flex items-end">
            <div className="w-full px-3 py-2 rounded-xl bg-gray-700 border border-gray-600 flex items-center justify-between text-xs">
              <span className="text-gray-400">Drive Sincronizado:</span>
              <span className="font-bold text-indigo-300">
                {filteredDocs.filter((d) => d.isDriveSync).length}
              </span>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pt-1 pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-gray-700 text-gray-400 hover:text-white hover:bg-[#202020]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid */}
      {filteredDocs.length === 0 ? (
        <div className="p-12 rounded-xl bg-gray-800 border border-gray-700 text-center space-y-3">
          <FolderLock className="w-12 h-12 mx-auto text-gray-600" />
          <h3 className="text-sm font-bold text-white">Nenhum documento encontrado</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Faça upload de arquivos ou conecte o Google Drive para importar e vincular ativos digitais.
          </p>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs inline-flex items-center space-x-1.5 transition-colors cursor-pointer mt-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar Arquivo Agora</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => {
            const client = clients.find((c) => c.id === doc.clientId);

            return (
              <div
                key={doc.id}
                className="p-5 rounded-lg bg-gray-800 border border-gray-700 hover:border-gray-500 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div>
                  {/* Category Badge & Drive Tag */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-600/15 text-indigo-300 border border-indigo-600/30 uppercase">
                      {doc.category}
                    </span>
                    <div className="flex items-center space-x-1.5">
                      {doc.isDriveSync && (
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#1a73e8]/20 text-[#8ab4f8] border border-[#1a73e8]/40 flex items-center space-x-1"
                          title="Sincronizado com Google Drive"
                        >
                          <Cloud className="w-3 h-3" />
                          <span>Drive</span>
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-gray-400">{doc.fileSize}</span>
                    </div>
                  </div>

                  {/* Thumbnail / Icon & Title */}
                  <div className="mt-3.5 flex items-start space-x-3">
                    <div className="p-3 rounded-xl bg-gray-700 border border-gray-600 text-indigo-300 shrink-0 group-hover:scale-105 transition-transform">
                      {doc.category === 'VIDEOS' ? (
                        <FileVideo className="w-5 h-5" />
                      ) : doc.category === 'IDENTIDADE_VISUAL' || doc.category === 'LOGOS' || doc.category === 'FOTOS' ? (
                        <ImageIcon className="w-5 h-5" />
                      ) : doc.category === 'RELATORIOS' ? (
                        <FileSpreadsheet className="w-5 h-5" />
                      ) : (
                        <FileText className="w-5 h-5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xs font-bold text-white truncate" title={doc.name}>
                        {doc.name}
                      </h3>
                      <p className="text-[11px] text-indigo-300 font-medium mt-0.5 truncate">
                        {client?.tradingName || 'Cliente Geral'}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        Por {doc.uploadedBy} • {new Date(doc.uploadedAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-gray-700 flex items-center space-x-2">
                  <a
                    href={doc.driveWebViewLink || doc.url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 rounded-xl bg-gray-700 hover:bg-[#242424] border border-gray-600 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    {doc.isDriveSync ? (
                      <>
                        <ExternalLink className="w-3.5 h-3.5 text-[#8ab4f8]" />
                        <span>Abrir no Drive</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5 text-indigo-300" />
                        <span>Visualizar Arquivo</span>
                      </>
                    )}
                  </a>

                  <button
                    onClick={() => deleteDocument(doc.id)}
                    className="p-2 rounded-xl hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 border border-transparent hover:border-rose-500/30 transition-colors"
                    title="Remover da lista"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: Upload / Add Document */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-xl bg-gray-800 border border-gray-600 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Upload className="w-5 h-5 text-indigo-300" />
                <h3 className="text-sm font-bold text-white">Adicionar Documento / Arquivo</h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                  Nome do Documento / Título *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Manual de Identidade Visual v2.pdf"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                    Cliente Vinculado *
                  </label>
                  <select
                    value={newDocClientId}
                    onChange={(e) => setNewDocClientId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white focus:outline-none focus:border-indigo-600"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.tradingName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                    Categoria *
                  </label>
                  <select
                    value={newDocCategory}
                    onChange={(e) => setNewDocCategory(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white focus:outline-none focus:border-indigo-600"
                  >
                    <option value="CONTRATOS">Contratos</option>
                    <option value="BRIEFINGS">Briefings</option>
                    <option value="IDENTIDADE_VISUAL">Identidade Visual</option>
                    <option value="LOGOS">Logotipos & Vetores</option>
                    <option value="FOTOS">Fotos & Imagens</option>
                    <option value="VIDEOS">Vídeos & Motion</option>
                    <option value="RELATORIOS">Relatórios</option>
                    <option value="MATERIAIS">Outros Materiais</option>
                  </select>
                </div>
              </div>

              {/* Local File Selection */}
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                  Selecionar Arquivo do Computador (Opcional)
                </label>
                <div className="p-4 rounded-xl bg-gray-700 border border-dashed border-gray-500 hover:border-indigo-600 transition-colors text-center cursor-pointer relative">
                  <input
                    type="file"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedLocalFile(e.target.files[0]);
                        if (!newDocTitle) {
                          setNewDocTitle(e.target.files[0].name);
                        }
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <Upload className="w-6 h-6 mx-auto mb-1.5 text-indigo-300" />
                  <p className="text-xs font-semibold text-white">
                    {selectedLocalFile ? selectedLocalFile.name : 'Clique para selecionar ou arraste o arquivo'}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">PDF, PNG, JPG, MP4, AI, PSD, ZIP até 50MB</p>
                </div>
              </div>

              {/* Google Drive Sincronization Toggle */}
              {isDriveConnected && (
                <div className="p-3.5 rounded-xl bg-gray-700 border border-gray-600 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <Cloud className="w-4 h-4 text-[#8ab4f8]" />
                    <div>
                      <p className="text-xs font-bold text-white">Salvar no Google Drive</p>
                      <p className="text-[10px] text-gray-400">
                        Gera link permanente e backup seguro no seu Drive.
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={syncToDriveOnUpload}
                    onChange={(e) => setSyncToDriveOnUpload(e.target.checked)}
                    className="w-4 h-4 accent-[#5850ec] rounded cursor-pointer"
                  />
                </div>
              )}

              {uploadProgressMsg && (
                <div className="p-3 rounded-xl bg-[#1a73e8]/20 border border-[#1a73e8]/40 text-[#8ab4f8] text-xs flex items-center space-x-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{uploadProgressMsg}</span>
                </div>
              )}

              <div className="pt-3 border-t border-gray-700 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-700 hover:bg-[#202020] text-xs font-semibold text-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors shadow-md shadow-indigo-600/20"
                >
                  {isUploading ? 'Enviando...' : 'Salvar Documento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Google Drive Explorer & Picker */}
      {isDrivePickerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-3xl rounded-xl bg-gray-800 border border-gray-600 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Cloud className="w-5 h-5 text-[#8ab4f8]" />
                <div>
                  <h3 className="text-sm font-bold text-white">Explorador de Arquivos do Google Drive</h3>
                  <p className="text-[11px] text-gray-400">
                    Selecione arquivos do seu Drive para vincular diretamente ao AgencyOS.
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => driveToken && fetchDriveFiles(driveToken, driveSearch)}
                  className="p-2 rounded-xl bg-gray-700 text-gray-300 hover:text-white"
                  title="Atualizar"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDrive ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => setIsDrivePickerModalOpen(false)}
                  className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Search within Drive */}
            <div className="p-4 bg-gray-700 border-b border-gray-700 flex items-center space-x-3">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Pesquisar por nome no Google Drive..."
                  value={driveSearch}
                  onChange={(e) => setDriveSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && driveToken) {
                      fetchDriveFiles(driveToken, driveSearch);
                    }
                  }}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-900 border border-gray-600 text-xs text-white focus:outline-none focus:border-[#8ab4f8]"
                />
              </div>
              <button
                onClick={() => driveToken && fetchDriveFiles(driveToken, driveSearch)}
                className="px-3.5 py-2 rounded-xl bg-[#8ab4f8]/20 hover:bg-[#8ab4f8]/30 border border-[#8ab4f8]/40 text-[#8ab4f8] text-xs font-semibold"
              >
                Buscar
              </button>
            </div>

            {/* Files List from Google Drive */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {isLoadingDrive ? (
                <div className="p-12 text-center text-gray-400 space-y-2">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#8ab4f8]" />
                  <p className="text-xs">Carregando seus arquivos do Google Drive...</p>
                </div>
              ) : driveFiles.length === 0 ? (
                <div className="p-12 text-center text-gray-400 space-y-2">
                  <Cloud className="w-8 h-8 mx-auto text-gray-600" />
                  <p className="text-xs font-semibold text-gray-200">Nenhum arquivo encontrado no Drive</p>
                  <p className="text-[11px]">Tente buscar por outro termo ou faça upload de um arquivo.</p>
                </div>
              ) : (
                driveFiles.map((file) => (
                  <div
                    key={file.id}
                    className="p-3 rounded-xl bg-gray-700 border border-gray-700 hover:border-[#8ab4f8]/40 flex items-center justify-between text-xs transition-colors"
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="p-2 rounded-lg bg-gray-600 text-[#8ab4f8] shrink-0">
                        {file.mimeType.includes('image') ? (
                          <ImageIcon className="w-4 h-4" />
                        ) : file.mimeType.includes('video') ? (
                          <FileVideo className="w-4 h-4" />
                        ) : file.mimeType.includes('folder') ? (
                          <FolderLock className="w-4 h-4 text-indigo-300" />
                        ) : (
                          <FileText className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-white truncate">{file.name}</p>
                        <p className="text-[10px] text-gray-400">
                          {file.size} • Modificado em {file.modifiedTime || 'recente'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 ml-3">
                      {file.webViewLink && (
                        <a
                          href={file.webViewLink}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-lg bg-gray-600 hover:bg-[#333] text-gray-400 hover:text-white"
                          title="Visualizar no Drive"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        onClick={() => handleLinkDriveFile(file, selectedClient === 'TODOS' ? activeClient?.id || clients[0]?.id || '' : selectedClient)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] transition-colors cursor-pointer"
                      >
                        Vincular ao AgencyOS
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-gray-700 bg-gray-900 flex items-center justify-between text-xs text-gray-400">
              <span>Mostrando até 50 itens mais recentes do seu Drive</span>
              <button
                onClick={handleDisconnectDrive}
                className="text-rose-400 hover:underline text-[11px]"
              >
                Desconectar Google Drive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Create Google Drive Folder */}
      {isCreateFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-xl bg-gray-800 border border-gray-600 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FolderPlus className="w-5 h-5 text-[#8ab4f8]" />
                <h3 className="text-sm font-bold text-white">Criar Pasta no Google Drive</h3>
              </div>
              <button
                onClick={() => setIsCreateFolderModalOpen(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateClientFolder} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                  Nome da Pasta *
                </label>
                <input
                  type="text"
                  required
                  placeholder={`Ex: [AGÊNCIA] ${currentFocusedClient?.tradingName || 'Cliente'} - Arquivos 2026`}
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white focus:outline-none focus:border-[#8ab4f8]"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-gray-700 border border-gray-700 text-xs text-gray-300 space-y-1">
                <p className="font-semibold text-white">Vinculação Automática:</p>
                <p className="text-[11px]">
                  A nova pasta será criada na raiz do seu Google Drive e automaticamente vinculada ao cliente selecionado.
                </p>
              </div>

              <div className="pt-3 border-t border-gray-700 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreateFolderModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-700 hover:bg-[#202020] text-xs font-semibold text-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoadingDrive}
                  className="px-4 py-2 rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] text-white font-bold text-xs transition-colors shadow-md shadow-[#1a73e8]/20"
                >
                  {isLoadingDrive ? 'Criando...' : 'Criar e Vincular'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
