import React, { useState } from 'react';
import {
  FileText,
  Save,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { BriefingData } from '../../types';

interface BriefingFormProps {
  clientId?: string;
}

export const BriefingForm: React.FC<BriefingFormProps> = ({ clientId: propClientId }) => {
  const { briefings, saveBriefing, clients, activeClient, setActiveClientId } = useAgency();

  const [selectedClientId, setSelectedClientId] = useState<string>(
    propClientId || activeClient?.id || clients[0]?.id || ''
  );

  const effectiveClientId = propClientId || selectedClientId;
  const client = clients.find((c) => c.id === effectiveClientId) || clients[0];

  const existingBriefing = (effectiveClientId ? briefings[effectiveClientId] : undefined) || {
    clientId: effectiveClientId,
    isComplete: false,
    updatedAt: new Date().toISOString().split('T')[0],
    companyHistory: '',
    missionVisionValues: '',
    mainProductsServices: '',
    targetAudiencePersonas: '',
    competitiveDifferentiators: '',
    competitorsList: '',
    brandToneOfVoice: 'Profissional e acolhedor',
    taboosAndRestrictions: '',
    visualIdentityGuidelines: '',
    primaryMarketingGoals: '',
    priorityChannels: 'Instagram, Meta Ads',
    monthlyAdBudget: 'R$ 2.000 / mês',
    previousMarketingHistory: '',
    admirationReferences: '',
    clientInternalTeam: '',
    importantNicheDates: ''
  };

  const [formData, setFormData] = useState<BriefingData>(existingBriefing);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (field: keyof BriefingData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = (markAsComplete = false) => {
    if (!effectiveClientId) return;
    const dataToSave = {
      ...formData,
      isComplete: markAsComplete ? true : formData.isComplete,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    saveBriefing(effectiveClientId, dataToSave);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-lg bg-gray-800 border border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-indigo-300" />
            <h2 className="text-base font-bold text-white">
              Briefing Estratégico do Cliente • {client?.tradingName}
            </h2>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            16 diretrizes fundamentais para guiar a criação de conteúdo, posicionamento de marca e campanhas
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {clients.length > 1 && !propClientId && (
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

          {formData.isComplete ? (
            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Briefing Concluído</span>
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-xl bg-indigo-600/20 text-indigo-300 border border-indigo-600/30 text-xs font-semibold flex items-center space-x-1.5">
              <AlertCircle className="w-4 h-4" />
              <span>Em Preenchimento</span>
            </span>
          )}

          <button
            onClick={() => handleSave(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Salvar & Marcar Concluído</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Briefing salvo com sucesso no banco da agência!</span>
        </div>
      )}

      {/* 16 Questions Organized in 4 Pillars */}
      <div className="grid grid-cols-1 gap-6">
        {/* Pillar 1: Institucional & Negócio */}
        <div className="p-6 rounded-lg bg-gray-800 border border-gray-700 space-y-4">
          <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider border-b border-gray-700 pb-2">
            Pilar 1: História, Negócio & Diferenciais
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-white block mb-1">
                1. História da Empresa & Como Surgiu
              </label>
              <textarea
                rows={3}
                value={formData.companyHistory}
                onChange={(e) => handleChange('companyHistory', e.target.value)}
                placeholder="Conte brevemente a história, fundadores e marcos da empresa..."
                className="w-full p-3 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-white block mb-1">
                2. Missão, Visão e Valores Fundamentais
              </label>
              <textarea
                rows={3}
                value={formData.missionVisionValues}
                onChange={(e) => handleChange('missionVisionValues', e.target.value)}
                placeholder="Ex: Transformar a autoestima com segurança médica e excelência..."
                className="w-full p-3 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-white block mb-1">
                3. Produtos / Serviços Principais (Prioridades de Venda)
              </label>
              <textarea
                rows={3}
                value={formData.mainProductsServices}
                onChange={(e) => handleChange('mainProductsServices', e.target.value)}
                placeholder="Quais serviços têm maior margem e devem ser prioridade nos posts e anúncios?"
                className="w-full p-3 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-white block mb-1">
                4. Diferenciais Competitivos (Por que comprar de vocês?)
              </label>
              <textarea
                rows={3}
                value={formData.competitiveDifferentiators}
                onChange={(e) => handleChange('competitiveDifferentiators', e.target.value)}
                placeholder="Ex: Atendimento humanizado, equipamentos de ponta, 15 anos de experiência..."
                className="w-full p-3 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>
        </div>

        {/* Pillar 2: Persona, Público & Concorrência */}
        <div className="p-6 rounded-lg bg-gray-800 border border-gray-700 space-y-4">
          <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider border-b border-gray-700 pb-2">
            Pilar 2: Personas, Público-Alvo & Concorrentes
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-white block mb-1">
                5. Público-Alvo e Personas Detalhadas
              </label>
              <textarea
                rows={3}
                value={formData.targetAudiencePersonas}
                onChange={(e) => handleChange('targetAudiencePersonas', e.target.value)}
                placeholder="Idade, gênero, classe social, maiores dores, desejos e objeções de compra..."
                className="w-full p-3 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-white block mb-1">
                6. Concorrentes Diretos e Indiretos (com @ ou links)
              </label>
              <textarea
                rows={3}
                value={formData.competitorsList}
                onChange={(e) => handleChange('competitorsList', e.target.value)}
                placeholder="Ex: @clinica_x, @estetica_y (Quem disputa o mesmo cliente com você?)"
                className="w-full p-3 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-white block mb-1">
                7. Tom de Voz da Marca
              </label>
              <input
                type="text"
                value={formData.brandToneOfVoice}
                onChange={(e) => handleChange('brandToneOfVoice', e.target.value)}
                placeholder="Ex: Técnico, descontraído, autoritário, empático, sofisticado..."
                className="w-full px-3 py-2.5 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-rose-300 block mb-1">
                8. O que NUNCA falar ou fazer (Restrições e Tabus)
              </label>
              <textarea
                rows={2}
                value={formData.taboosAndRestrictions}
                onChange={(e) => handleChange('taboosAndRestrictions', e.target.value)}
                placeholder="Ex: Não prometer antes/depois que fira o CFM, não usar memes populares..."
                className="w-full p-3 rounded-xl bg-gray-700 border border-rose-500/30 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-rose-400"
              />
            </div>
          </div>
        </div>

        {/* Pillar 3: Identidade Visual & Metas */}
        <div className="p-6 rounded-lg bg-gray-800 border border-gray-700 space-y-4">
          <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider border-b border-gray-700 pb-2">
            Pilar 3: Identidade Visual, Metas & Orçamento
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-white block mb-1">
                9. Paleta de Cores, Tipografia & Diretrizes Visuais
              </label>
              <textarea
                rows={3}
                value={formData.visualIdentityGuidelines}
                onChange={(e) => handleChange('visualIdentityGuidelines', e.target.value)}
                placeholder="Cores principais, fontes institucionais, link para o drive da identidade visual..."
                className="w-full p-3 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-white block mb-1">
                10. Objetivo Principal com a Agência
              </label>
              <textarea
                rows={3}
                value={formData.primaryMarketingGoals}
                onChange={(e) => handleChange('primaryMarketingGoals', e.target.value)}
                placeholder="Ex: Aumentar o volume de agendamentos no WhatsApp em 40% nos primeiros 90 dias..."
                className="w-full p-3 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-white block mb-1">
                11. Canais Prioritários
              </label>
              <input
                type="text"
                value={formData.priorityChannels}
                onChange={(e) => handleChange('priorityChannels', e.target.value)}
                placeholder="Ex: Instagram Reels, Stories diários, Google Ads Pesquisa..."
                className="w-full px-3 py-2.5 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-white block mb-1">
                12. Orçamento Mensal para Tráfego Pago
              </label>
              <input
                type="text"
                value={formData.monthlyAdBudget}
                onChange={(e) => handleChange('monthlyAdBudget', e.target.value)}
                placeholder="Ex: R$ 3.000 / mês direto na conta da Meta/Google"
                className="w-full px-3 py-2.5 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>
        </div>

        {/* Pillar 4: Histórico, Referências & Equipe */}
        <div className="p-6 rounded-lg bg-gray-800 border border-gray-700 space-y-4">
          <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider border-b border-gray-700 pb-2">
            Pilar 4: Histórico Anterior, Referências & Equipe Interna
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-white block mb-1">
                13. Histórico de Marketing Anterior (O que funcionou e o que deu errado?)
              </label>
              <textarea
                rows={3}
                value={formData.previousMarketingHistory}
                onChange={(e) => handleChange('previousMarketingHistory', e.target.value)}
                placeholder="Já trabalharam com agências antes? O que sentiram falta?"
                className="w-full p-3 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-white block mb-1">
                14. Links de Referências que o Cliente Admira (Inspirações)
              </label>
              <textarea
                rows={3}
                value={formData.admirationReferences}
                onChange={(e) => handleChange('admirationReferences', e.target.value)}
                placeholder="Contas do Instagram, vídeos do TikTok ou sites que você acha incríveis..."
                className="w-full p-3 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-white block mb-1">
                15. Informações sobre a Equipe Interna do Cliente
              </label>
              <textarea
                rows={2}
                value={formData.clientInternalTeam}
                onChange={(e) => handleChange('clientInternalTeam', e.target.value)}
                placeholder="Quem atende os leads no WhatsApp? Quem grava os vídeos internamente?"
                className="w-full p-3 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-white block mb-1">
                16. Datas Comemorativas e Momentos Sazonais do Nicho
              </label>
              <textarea
                rows={2}
                value={formData.importantNicheDates}
                onChange={(e) => handleChange('importantNicheDates', e.target.value)}
                placeholder="Ex: Black Friday, Dia do Médico, Aniversário da Clínica em Julho..."
                className="w-full p-3 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button Bar */}
      <div className="p-4 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-between">
        <p className="text-xs text-gray-400">
          Última atualização em: {formData.updatedAt || 'Hoje'}
        </p>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleSave(false)}
            className="px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-300 hover:text-white text-xs font-semibold cursor-pointer transition-colors"
          >
            Salvar Rascunho
          </button>
          <button
            onClick={() => handleSave(true)}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/10 flex items-center space-x-1.5 cursor-pointer transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Finalizar Briefing Completo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
