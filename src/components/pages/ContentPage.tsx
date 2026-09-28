import React, { useState } from 'react';
import {
  FileCheck2,
  Plus,
  Filter,
  Search,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  X,
  Instagram,
  Facebook,
  Linkedin,
  Video,
  Image as ImageIcon,
  Trash2
} from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { ContentItem, ContentPlatform, ContentFormat, ContentStatus } from '../../types';
import { ContentApprovalModal } from '../content/ContentApprovalModal';

export const ContentPage: React.FC = () => {
  const {
    contents,
    clients,
    users,
    createContent,
    deleteContent,
    activeClient,
    currentUser
  } = useAgency();

  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<string>(activeClient?.id || 'TODOS');
  const [selectedStatus, setSelectedStatus] = useState<string>('TODOS');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('TODOS');
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedForApproval, setSelectedForApproval] = useState<ContentItem | null>(null);

  // New Content state
  const [newContent, setNewContent] = useState({
    clientId: activeClient?.id || (clients[0]?.id || ''),
    title: '',
    caption: '',
    platform: 'INSTAGRAM' as ContentPlatform,
    format: 'CARROSSEL' as ContentFormat,
    scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    mediaUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80',
    visualBriefing: ''
  });

  const filteredContents = contents.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.caption.toLowerCase().includes(search.toLowerCase());
    const matchesClient = selectedClient === 'TODOS' ? true : c.clientId === selectedClient;
    const matchesStatus = selectedStatus === 'TODOS' ? true : c.status === selectedStatus;
    const matchesPlatform = selectedPlatform === 'TODOS' ? true : c.platform === selectedPlatform;

    return matchesSearch && matchesClient && matchesStatus && matchesPlatform;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.title || !newContent.clientId) return;

    createContent({
      clientId: newContent.clientId,
      title: newContent.title,
      caption: newContent.caption,
      platform: newContent.platform,
      format: newContent.format,
      status: currentUser.role === 'CLIENTE' ? 'IDEIA' : 'AGUARDANDO_CLIENTE',
      scheduledDate: newContent.scheduledDate,
      mediaUrl: newContent.mediaUrl,
      visualBriefing: newContent.visualBriefing,
      currentVersion: 1
    });

    setShowNewModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <FileCheck2 className="w-5 h-5 text-indigo-300" />
            <span>Conteúdos & Fluxo de Aprovação ({filteredContents.length})</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Calendário editorial, legendas, criativos visuais e histórico de revisões com aprovação em 1 clique
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/10 flex items-center space-x-1.5 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Conteúdo</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-lg bg-gray-800 border border-gray-700 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título, texto da legenda..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-indigo-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Client select */}
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="px-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white focus:outline-none focus:border-indigo-600"
          >
            <option value="TODOS">Todos os Clientes</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.tradingName}
              </option>
            ))}
          </select>

          {/* Status select */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white focus:outline-none focus:border-indigo-600"
          >
            <option value="TODOS">Todos os Status</option>
            <option value="AGUARDANDO_CLIENTE">Aguardando Cliente</option>
            <option value="APROVADO">Aprovado</option>
            <option value="REVISAO_INTERNA">Revisão / Alteração Solicitada</option>
            <option value="PROGRAMADO">Programado</option>
            <option value="PUBLICADO">Publicado</option>
          </select>

          {/* Platform select */}
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="px-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white focus:outline-none focus:border-indigo-600"
          >
            <option value="TODOS">Todas Plataformas</option>
            <option value="INSTAGRAM">Instagram</option>
            <option value="FACEBOOK">Facebook</option>
            <option value="LINKEDIN">LinkedIn</option>
            <option value="TIKTOK">TikTok</option>
            <option value="YOUTUBE">YouTube</option>
          </select>
        </div>
      </div>

      {/* Grid of Content Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContents.map((item) => {
          const client = clients.find((c) => c.id === item.clientId);

          return (
            <div
              key={item.id}
              className="p-5 rounded-lg bg-gray-800 border border-gray-700 hover:border-gray-600 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div>
                {/* Header: Platform & Status */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-600/15 text-indigo-300 border border-indigo-600/30 uppercase">
                    {item.platform} • {item.format}
                  </span>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      item.status === 'APROVADO'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : item.status === 'AGUARDANDO_CLIENTE'
                        ? 'bg-amber-500/20 text-amber-300 animate-pulse'
                        : item.status === 'PROGRAMADO' || item.status === 'PUBLICADO'
                        ? 'bg-sky-500/20 text-sky-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {item.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Media preview */}
                {item.mediaUrl && (
                  <div className="mt-3 h-44 rounded-xl overflow-hidden bg-black border border-gray-700 relative">
                    <img
                      src={item.mediaUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white backdrop-blur-sm border border-gray-700">
                      v{item.currentVersion}.0
                    </span>
                  </div>
                )}

                {/* Content details */}
                <div className="mt-3 space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    {client?.tradingName}
                  </span>
                  <h3 className="text-sm font-bold text-white line-clamp-1">{item.title}</h3>
                  <p className="text-xs text-gray-300 line-clamp-2 mt-1 leading-relaxed">
                    {item.caption}
                  </p>
                </div>
              </div>

              {/* Bottom bar & Action */}
              <div className="pt-3 border-t border-gray-700 flex items-center justify-between">
                <span className="text-[11px] text-gray-400 font-mono">
                  Data: <strong className="text-gray-200">{item.scheduledDate}</strong>
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      if (window.confirm(`Excluir o conteúdo "${item.title}"?`)) {
                        deleteContent(item.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-gray-800 transition-colors cursor-pointer"
                    title="Excluir conteúdo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setSelectedForApproval(item)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow transition-colors flex items-center space-x-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Revisar / Aprovar</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Approval Modal */}
      {selectedForApproval && (
        <ContentApprovalModal
          content={selectedForApproval}
          onClose={() => setSelectedForApproval(null)}
        />
      )}

      {/* New Content Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleCreateSubmit}
            className="w-full max-w-xl bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-white"
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-700">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <FileCheck2 className="w-4 h-4 text-indigo-300" />
                <span>Novo Conteúdo Editorial</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="text-xs text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                  Cliente *
                </label>
                <select
                  required
                  value={newContent.clientId}
                  onChange={(e) => setNewContent({ ...newContent, clientId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white focus:outline-none focus:border-indigo-600"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.tradingName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                  Título / Tema do Post *
                </label>
                <input
                  type="text"
                  required
                  value={newContent.title}
                  onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                  placeholder="Ex: 5 Dicas Essenciais de Cuidados no Inverno"
                  className="w-full px-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                    Canal / Plataforma
                  </label>
                  <select
                    value={newContent.platform}
                    onChange={(e) => setNewContent({ ...newContent, platform: e.target.value as ContentPlatform })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white focus:outline-none focus:border-indigo-600"
                  >
                    <option value="INSTAGRAM">Instagram</option>
                    <option value="FACEBOOK">Facebook</option>
                    <option value="LINKEDIN">LinkedIn</option>
                    <option value="TIKTOK">TikTok</option>
                    <option value="YOUTUBE">YouTube</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                    Formato
                  </label>
                  <select
                    value={newContent.format}
                    onChange={(e) => setNewContent({ ...newContent, format: e.target.value as ContentFormat })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white focus:outline-none focus:border-indigo-600"
                  >
                    <option value="CARROSSEL">Carrossel</option>
                    <option value="VIDEO">Vídeo / Reels</option>
                    <option value="ESTATICO">Post Estático</option>
                    <option value="STORY">Story Sequência</option>
                    <option value="ARTIGO">Artigo / Blog</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                  Legenda / Copy Completa
                </label>
                <textarea
                  rows={4}
                  value={newContent.caption}
                  onChange={(e) => setNewContent({ ...newContent, caption: e.target.value })}
                  placeholder="Escreva a legenda com emojis, hashtags e CTA..."
                  className="w-full p-3 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                    Data Prevista de Postagem
                  </label>
                  <input
                    type="date"
                    value={newContent.scheduledDate}
                    onChange={(e) => setNewContent({ ...newContent, scheduledDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                    URL da Mídia / Imagem
                  </label>
                  <input
                    type="text"
                    value={newContent.mediaUrl}
                    onChange={(e) => setNewContent({ ...newContent, mediaUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-700">
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="px-3 py-2 rounded-xl bg-gray-700 text-gray-300 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Criar e Enviar para Aprovação
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
