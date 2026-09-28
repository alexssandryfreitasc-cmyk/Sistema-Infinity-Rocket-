import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  History,
  Send,
  Sparkles,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { ContentItem } from '../../types';

interface ContentApprovalModalProps {
  content: ContentItem;
  onClose: () => void;
}

export const ContentApprovalModal: React.FC<ContentApprovalModalProps> = ({ content, onClose }) => {
  const { approveContent, requestContentRevision, currentUser } = useAgency();

  const [revisionMode, setRevisionMode] = useState(false);
  const [revisionReason, setRevisionReason] = useState('');
  const [approvalComment, setApprovalComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApprove = () => {
    setIsSubmitting(true);
    approveContent(content.id, approvalComment);
    setIsSubmitting(false);
    onClose();
  };

  const handleRequestRevision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionReason.trim()) return;

    setIsSubmitting(true);
    requestContentRevision(content.id, revisionReason);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-3xl max-h-[90vh] bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150 text-white">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-700 flex items-center justify-between bg-gray-700">
          <div className="flex items-center space-x-2.5">
            <span className="px-2.5 py-1 rounded-full bg-indigo-600/15 text-indigo-300 border border-indigo-600/30 text-xs font-bold uppercase">
              {content.platform} • {content.format}
            </span>
            <span className="text-xs text-gray-400 font-mono">Versão {content.currentVersion}.0</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Media Preview & Visual Briefing */}
          <div className="space-y-4">
            <div className="rounded-lg overflow-hidden bg-black border border-gray-700 shadow-inner flex items-center justify-center min-h-[260px] relative">
              {content.mediaUrl ? (
                <img
                  src={content.mediaUrl}
                  alt={content.title}
                  className="w-full h-auto max-h-[380px] object-cover"
                />
              ) : (
                <div className="p-6 text-center text-gray-400 text-xs">
                  Prévia de mídia ou carrossel em renderização
                </div>
              )}
            </div>

            {content.visualBriefing && (
              <div className="p-3.5 rounded-xl bg-gray-700 border border-gray-600 text-xs space-y-1">
                <span className="font-semibold text-gray-300 uppercase text-[10px] tracking-wider">
                  Diretrizes Visuais da Arte:
                </span>
                <p className="text-gray-200">{content.visualBriefing}</p>
              </div>
            )}
          </div>

          {/* Right: Caption, Scheduled Date & Action Center */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider">
                  Título do Conteúdo
                </span>
                <h2 className="text-base font-bold text-white">{content.title}</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Previsão de Publicação: <strong className="text-gray-200">{content.scheduledDate}</strong>
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  Legenda / Copy Completa
                </span>
                <div className="mt-1 p-3.5 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto font-sans">
                  {content.caption}
                </div>
              </div>

              {/* Version History */}
              {content.approvalHistory.length > 0 && (
                <div className="pt-2">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center space-x-1">
                    <History className="w-3 h-3" />
                    <span>Histórico de Interações & Versões</span>
                  </span>
                  <div className="mt-1.5 space-y-2 max-h-28 overflow-y-auto">
                    {content.approvalHistory.map((h) => (
                      <div
                        key={h.id}
                        className="p-2 rounded-lg bg-gray-700 border border-gray-600 text-[11px]"
                      >
                        <div className="flex items-center justify-between font-semibold">
                          <span className="text-white">{h.authorName} ({h.authorRole})</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                              h.status === 'APROVADO'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {h.status}
                          </span>
                        </div>
                        {h.comment && <p className="text-gray-300 mt-1 italic">"{h.comment}"</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Approval / Revision Actions */}
            <div className="pt-4 border-t border-gray-700 space-y-3">
              {!revisionMode ? (
                <>
                  <div className="space-y-1">
                    <label className="text-[11px] text-gray-400">Comentário opcional de aprovação:</label>
                    <input
                      type="text"
                      value={approvalComment}
                      onChange={(e) => setApprovalComment(e.target.value)}
                      placeholder="Ex: Ficou excelente! Pode postar na quinta-feira."
                      className="w-full px-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-indigo-600"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      onClick={handleApprove}
                      disabled={isSubmitting}
                      className="py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-indigo-600/10 transition-all cursor-pointer active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>APROVAR CONTEÚDO</span>
                    </button>

                    <button
                      onClick={() => setRevisionMode(true)}
                      className="py-3 px-4 rounded-xl bg-gray-700 hover:bg-rose-500/20 border border-gray-600 hover:border-rose-500/30 text-rose-300 font-semibold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                    >
                      <AlertCircle className="w-4 h-4" />
                      <span>SOLICITAR ALTERAÇÃO</span>
                    </button>
                  </div>
                </>
              ) : (
                <form onSubmit={handleRequestRevision} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-rose-300 block mb-1">
                      Explique detalhadamente o que deseja alterar (Obrigatório):
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={revisionReason}
                      onChange={(e) => setRevisionReason(e.target.value)}
                      placeholder="Ex: Por favor trocar a foto do slide 2 e corrigir a palavra na terceira linha..."
                      className="w-full p-3 rounded-xl bg-gray-700 border border-rose-500/40 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-rose-400"
                      autoFocus
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="submit"
                      disabled={!revisionReason.trim()}
                      className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md transition-all cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Enviar Pedido de Alteração</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRevisionMode(false)}
                      className="py-2.5 px-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white text-xs font-semibold cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
