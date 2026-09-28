import React, { useState } from 'react';
import {
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Plus,
  Lock,
  Copy,
  Check,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { AccessItem } from '../../types';

interface AccessChecklistVaultProps {
  clientId?: string;
}

export const AccessChecklistVault: React.FC<AccessChecklistVaultProps> = ({ clientId: initialClientId }) => {
  const { accesses, updateAccessStatus, createAccess, clients, currentUser, activeClient, setActiveClientId } = useAgency();

  const [selectedClientId, setSelectedClientId] = useState<string>(
    initialClientId || activeClient?.id || clients[0]?.id || ''
  );

  const effectiveClientId = initialClientId || selectedClientId;
  const client = clients.find((c) => c.id === effectiveClientId) || clients[0];
  const clientAccesses = accesses.filter((a) => a.clientId === effectiveClientId);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTutorial, setSelectedTutorial] = useState<AccessItem | null>(null);

  // New Access form state (Secure: No plaintext passwords collected)
  const [newAccess, setNewAccess] = useState({
    platformName: '',
    category: 'REDES_SOCIAIS' as AccessItem['category'],
    loginOrUser: '',
    authMethod: 'CONVITE_GESTOR',
    accessUrl: '',
    notes: '',
    guideInstructions: ''
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateCustomAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccess.platformName || !effectiveClientId) return;

    createAccess({
      clientId: effectiveClientId,
      platformName: newAccess.platformName,
      category: newAccess.category,
      loginOrUser: newAccess.loginOrUser,
      authMethod: newAccess.authMethod,
      accessUrl: newAccess.accessUrl,
      notes: newAccess.notes,
      guideInstructions: newAccess.guideInstructions,
      status: 'PENDENTE'
    });

    setNewAccess({
      platformName: '',
      category: 'REDES_SOCIAIS',
      loginOrUser: '',
      authMethod: 'CONVITE_GESTOR',
      accessUrl: '',
      notes: '',
      guideInstructions: ''
    });
    setShowAddModal(false);
  };

  const validatedCount = clientAccesses.filter((a) => a.status === 'VALIDADO').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-lg bg-gray-800 border border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-indigo-600/15 text-indigo-300">
              <KeyRound className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-white">
              Central de Acessos & Cofre Seguro • {client?.tradingName}
            </h2>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Armazenamento seguro com criptografia de ponta a ponta e validação do time técnico
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {clients.length > 1 && !initialClientId && (
            <select
              value={selectedClientId}
              onChange={(e) => {
                setSelectedClientId(e.target.value);
                setActiveClientId(e.target.value);
              }}
              className="px-3 py-1.5 rounded-lg bg-gray-700 border border-gray-600 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.tradingName}
                </option>
              ))}
            </select>
          )}

          <span className="px-3 py-1.5 rounded-xl bg-gray-700 border border-gray-600 text-xs font-mono text-white">
            {validatedCount} de {clientAccesses.length} Validados
          </span>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Acesso</span>
          </button>
        </div>
      </div>

      {/* Security Notice */}
      <div className="p-4 rounded-lg bg-gray-700 border border-gray-600 flex items-start space-x-3">
        <ShieldCheck className="w-5 h-5 text-indigo-300 shrink-0 mt-0.5" />
        <div className="text-xs text-gray-200 space-y-1">
          <p className="font-bold text-indigo-300">Políticas de Segurança e Acesso por Parceiro:</p>
          <p className="text-gray-400">
            Sempre que possível, recomendamos a delegação via Meta Business Suite (ID de Parceiro da Agência) ou permissões de usuário no Google Ads, sem necessidade de compartilhar senhas pessoais.
          </p>
        </div>
      </div>

      {/* Access Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {clientAccesses.map((item) => {
          return (
            <div
              key={item.id}
              className="p-5 rounded-lg bg-gray-800 border border-gray-700 hover:border-gray-600 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Header item */}
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-gray-700 border border-gray-600 text-indigo-300 font-bold uppercase text-[10px]">
                    {item.category.replace('_', ' ')}
                  </span>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      item.status === 'VALIDADO'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : item.status === 'RECEBIDO'
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="mt-3">
                  <h3 className="text-sm font-bold text-white">{item.platformName}</h3>
                  {item.accessUrl && (
                    <a
                      href={item.accessUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-indigo-300 hover:underline inline-flex items-center space-x-1 mt-0.5"
                    >
                      <span>Abrir Plataforma</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {/* Login & Password fields */}
                <div className="mt-4 space-y-2.5">
                  <div className="p-2.5 rounded-xl bg-gray-700 border border-gray-600 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">Usuário / ID</span>
                      <span className="font-mono text-white">{item.loginOrUser || 'Não preenchido'}</span>
                    </div>
                    {item.loginOrUser && (
                      <button
                        onClick={() => handleCopy(item.loginOrUser, `user-${item.id}`)}
                        className="p-1 rounded text-gray-400 hover:text-white cursor-pointer"
                        title="Copiar usuário"
                      >
                        {copiedId === `user-${item.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>

                  <div className="p-2.5 rounded-xl bg-gray-700 border border-gray-600 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">Método de Concessão / Acesso</span>
                      <span className="text-white flex items-center space-x-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        <span className="font-medium text-xs">
                          {item.authMethod === 'CONVITE_GESTOR' ? 'Convite por E-mail / Parceiro Oficial' : item.authMethod || 'Acesso Delegado / Gestor de Negócios'}
                        </span>
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-semibold border border-emerald-500/20">
                        🔒 Sem Senhas em Texto
                      </span>
                    </div>
                  </div>
                </div>

                {/* Instructions preview */}
                {item.guideInstructions && (
                  <button
                    onClick={() => setSelectedTutorial(item)}
                    className="mt-3 text-[11px] text-indigo-300 hover:text-indigo-300 font-semibold flex items-center space-x-1 cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Ver Tutorial Passo a Passo</span>
                  </button>
                )}
              </div>

              {/* Status Action Buttons */}
              <div className="pt-3 border-t border-gray-700 flex items-center justify-between">
                <div className="text-[10px] text-gray-400">
                  {item.validatedBy
                    ? `Validado por ${item.validatedBy} em ${item.validatedAt}`
                    : 'Aguardando teste'}
                </div>

                {currentUser.role !== 'CLIENTE' && (
                  <div className="flex items-center space-x-1.5">
                    {item.status !== 'VALIDADO' ? (
                      <button
                        onClick={() => updateAccessStatus(item.id, 'VALIDADO', currentUser.name)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow transition-colors flex items-center space-x-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Validar Acesso</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => updateAccessStatus(item.id, 'PENDENTE')}
                        className="px-2.5 py-1 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 text-[11px] transition-colors cursor-pointer border border-gray-600"
                      >
                        Reabrir
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tutorial Modal */}
      {selectedTutorial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between pb-2 border-b border-gray-700">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-indigo-300" />
                <span>Tutorial: {selectedTutorial.platformName}</span>
              </h3>
              <button
                onClick={() => setSelectedTutorial(null)}
                className="text-xs text-gray-400 hover:text-white cursor-pointer"
              >
                Fechar
              </button>
            </div>
            <p className="text-xs text-gray-200 leading-relaxed whitespace-pre-line bg-gray-700 p-4 rounded-xl border border-gray-600">
              {selectedTutorial.guideInstructions}
            </p>
            <button
              onClick={() => setSelectedTutorial(null)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Add Custom Access Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleCreateCustomAccess}
            className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-2xl space-y-4 text-white"
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-700">
              <h3 className="text-sm font-bold text-white">Adicionar Plataforma ao Cofre</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-xs text-gray-400 hover:text-white cursor-pointer"
              >
                Fechar
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                  Nome da Plataforma *
                </label>
                <input
                  type="text"
                  required
                  value={newAccess.platformName}
                  onChange={(e) => setNewAccess({ ...newAccess, platformName: e.target.value })}
                  placeholder="Ex: Shopify, TikTok Ads, Hotmart..."
                  className="w-full px-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-300 block mb-1">Categoria</label>
                <select
                  value={newAccess.category}
                  onChange={(e) => setNewAccess({ ...newAccess, category: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white focus:outline-none focus:border-indigo-600"
                >
                  <option value="REDES_SOCIAIS">Redes Sociais</option>
                  <option value="GERENCIADOR_ANUNCIOS">Gerenciador de Anúncios</option>
                  <option value="DESIGN_WEB">Design & Site / Web</option>
                  <option value="DOMINIO_HOSPEDAGEM">Domínio & Hospedagem</option>
                  <option value="ECOMMERCE">E-commerce / Gateway</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                  Usuário / E-mail
                </label>
                <input
                  type="text"
                  value={newAccess.loginOrUser}
                  onChange={(e) => setNewAccess({ ...newAccess, loginOrUser: e.target.value })}
                  placeholder="login@empresa.com"
                  className="w-full px-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                  Método de Concessão de Acesso
                </label>
                <select
                  value={newAccess.authMethod}
                  onChange={(e) => setNewAccess({ ...newAccess, authMethod: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white focus:outline-none focus:border-indigo-600"
                >
                  <option value="CONVITE_GESTOR">Convite por E-mail (Recomendado: Adicionar e-mail da agência)</option>
                  <option value="GESTOR_NEGOCIOS">Acesso Delegado / Gerenciador de Negócios (Parceiro)</option>
                  <option value="OAUTH_CONEXAO">Autorização Direta na Plataforma</option>
                  <option value="SOLICITACAO_ACESSO">Solicitação Enviada via Suporte</option>
                </select>
                <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                  <span>🔒</span> Segurança Reforçada: Não solicitamos nem armazenamos senhas em texto puro.
                </p>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                  Link de Acesso ou Painel (URL)
                </label>
                <input
                  type="text"
                  value={newAccess.accessUrl}
                  onChange={(e) => setNewAccess({ ...newAccess, accessUrl: e.target.value })}
                  placeholder="https://business.facebook.com ou painel de login"
                  className="w-full px-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                  Orientações ou Observações
                </label>
                <input
                  type="text"
                  value={newAccess.notes}
                  onChange={(e) => setNewAccess({ ...newAccess, notes: e.target.value })}
                  placeholder="Ex: Convite enviado para o e-mail da agência com perfil de editor."
                  className="w-full px-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-700">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-2 rounded-xl bg-gray-700 text-gray-300 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Salvar no Cofre
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
