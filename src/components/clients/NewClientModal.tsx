import React, { useState } from 'react';
import {
  X,
  Building2,
  UserCheck,
  DollarSign,
  Calendar,
  Sparkles,
  CheckSquare,
  Shield,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { PlanType } from '../../types';

interface NewClientModalProps {
  onClose: () => void;
}

export const NewClientModal: React.FC<NewClientModalProps> = ({ onClose }) => {
  const { createClient, users, plans } = useAgency();

  const [formData, setFormData] = useState({
    companyName: '',
    tradingName: '',
    contactName: '',
    email: '',
    phone: '',
    whatsapp: '',
    cnpj: '',
    segment: '',
    city: '',
    instagram: '',
    facebook: '',
    site: '',
    plan: 'PRO' as PlanType,
    monthlyValue: 6800,
    startDate: new Date().toISOString().split('T')[0],
    renewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    contractedServices: ['Social Media', 'Reels', 'Meta Ads'] as string[],
    accountManagerId: users.find((u) => u.role === 'GESTOR')?.id || users[0].id,
    socialMediaId: users.find((u) => u.role === 'COLABORADOR')?.id || '',
    designerId: users.find((u) => u.role === 'COLABORADOR')?.id || '',
    trafficManagerId: '',
    copywriterId: '',
    notes: ''
  });

  const availableServices = [
    'Social Media',
    'Reels & Edição de Vídeos',
    'Meta Ads (Facebook & Instagram)',
    'Google Ads (Pesquisa & Display)',
    'Identidade Visual & Branding',
    'Copywriting & Roteirização',
    'Fotografia & Captação',
    'Landing Pages & Sites',
    'Assessoria de Imprensa',
    'Relatórios Semanais'
  ];

  const handlePlanChange = (planId: PlanType) => {
    const selectedPlan = plans.find((p) => p.id === planId);
    setFormData((prev) => ({
      ...prev,
      plan: planId,
      monthlyValue: selectedPlan ? selectedPlan.monthlyValue : prev.monthlyValue
    }));
  };

  const handleToggleService = (service: string) => {
    setFormData((prev) => {
      const exists = prev.contractedServices.includes(service);
      return {
        ...prev,
        contractedServices: exists
          ? prev.contractedServices.filter((s) => s !== service)
          : [...prev.contractedServices, service]
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.contactName || !formData.email) {
      alert('Por favor, preencha os campos obrigatórios (Empresa, Responsável e E-mail).');
      return;
    }

    createClient({
      companyName: formData.companyName,
      tradingName: formData.tradingName || formData.companyName,
      contactName: formData.contactName,
      email: formData.email,
      phone: formData.phone,
      whatsapp: formData.whatsapp || formData.phone,
      cnpj: formData.cnpj,
      segment: formData.segment || 'Geral',
      city: formData.city || 'São Paulo - SP',
      instagram: formData.instagram,
      facebook: formData.facebook,
      site: formData.site,
      contractedServices: formData.contractedServices,
      plan: formData.plan,
      monthlyValue: Number(formData.monthlyValue),
      startDate: formData.startDate,
      renewalDate: formData.renewalDate,
      status: 'ONBOARDING',
      pipelineStage: 'NOVO_CLIENTE',
      team: {
        accountManagerId: formData.accountManagerId,
        socialMediaId: formData.socialMediaId,
        designerId: formData.designerId,
        trafficManagerId: formData.trafficManagerId,
        copywriterId: formData.copywriterId
      },
      notes: formData.notes,
      whatsappGroup: {
        status: 'PENDENTE'
      }
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-4xl max-h-[92vh] bg-gray-800 border border-gray-600 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-5 border-b border-gray-700 flex items-center justify-between bg-gray-700">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/15 text-indigo-300 border border-indigo-600/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Cadastrar Novo Cliente</h2>
              <p className="text-xs text-gray-400">
                O sistema criará automaticamente o projeto, onboarding, tarefas e acessos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Dados da Empresa & Contato */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center space-x-1.5 border-b border-slate-800 pb-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>1. Dados da Empresa & Responsável</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Razão Social / Nome da Empresa *
                </label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="Ex: Fontana Dermatologia Ltda"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Nome Fantasia (Como é conhecida)
                </label>
                <input
                  type="text"
                  value={formData.tradingName}
                  onChange={(e) => setFormData({ ...formData, tradingName: e.target.value })}
                  placeholder="Ex: Fontana Dermato"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Nome do Responsável / Contato *
                </label>
                <input
                  type="text"
                  required
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  placeholder="Ex: Dra. Beatriz Fontana"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  E-mail Principal *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contato@empresa.com.br"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  WhatsApp (com DDD) *
                </label>
                <input
                  type="text"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="(11) 98765-4321"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">CNPJ</label>
                <input
                  type="text"
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  placeholder="00.000.000/0001-00"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Segmento</label>
                <input
                  type="text"
                  value={formData.segment}
                  onChange={(e) => setFormData({ ...formData, segment: e.target.value })}
                  placeholder="Ex: Saúde & Estética"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Cidade / Região</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="São Paulo - SP (Itaim)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Instagram (@)</label>
                <input
                  type="text"
                  value={formData.instagram}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  placeholder="@nomedaempresa"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Site</label>
                <input
                  type="text"
                  value={formData.site}
                  onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                  placeholder="https://suaempresa.com.br"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Plano & Valores */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5 border-b border-slate-800 pb-1">
              <DollarSign className="w-3.5 h-3.5" />
              <span>2. Plano Contratado & Financeiro</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {plans.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handlePlanChange(p.id as PlanType)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                    formData.plan === p.id
                      ? 'bg-indigo-600/20 border-indigo-500 shadow-md shadow-indigo-600/20'
                      : 'bg-slate-800/50 border-slate-700/80 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-100">{p.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-indigo-300 font-mono">
                      {p.id}
                    </span>
                  </div>
                  <div className="text-base font-extrabold text-emerald-400 mt-1">
                    R$ {p.monthlyValue.toLocaleString('pt-BR')} <span className="text-[10px] text-slate-400 font-normal">/mês</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                    {p.postsPerMonth} posts • {p.reelsPerMonth} reels {p.trafficManagement ? '• Tráfego Pago' : ''}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Valor Mensal Personalizado (R$)
                </label>
                <input
                  type="number"
                  value={formData.monthlyValue}
                  onChange={(e) => setFormData({ ...formData, monthlyValue: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Data de Início do Contrato
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Data de Renovação (12 meses)
                </label>
                <input
                  type="date"
                  value={formData.renewalDate}
                  onChange={(e) => setFormData({ ...formData, renewalDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Serviços Contratados */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center space-x-1.5 border-b border-slate-800 pb-1">
              <CheckSquare className="w-3.5 h-3.5" />
              <span>3. Escopo & Serviços Contratados</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {availableServices.map((srv) => {
                const checked = formData.contractedServices.includes(srv);
                return (
                  <button
                    type="button"
                    key={srv}
                    onClick={() => handleToggleService(srv)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-colors flex items-center space-x-2 ${
                      checked
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 font-semibold'
                        : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] border ${
                        checked ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-600'
                      }`}
                    >
                      {checked ? '✓' : ''}
                    </span>
                    <span className="truncate">{srv}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Atribuição de Equipe Interna */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5 border-b border-slate-800 pb-1">
              <UserCheck className="w-3.5 h-3.5" />
              <span>4. Responsáveis Internos (Equipe da Conta)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Account Manager / Gestor
                </label>
                <select
                  value={formData.accountManagerId}
                  onChange={(e) => setFormData({ ...formData, accountManagerId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  {users
                    .filter((u) => u.role === 'ADMIN' || u.role === 'GESTOR')
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.title})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Social Media / Copywriter
                </label>
                <select
                  value={formData.socialMediaId}
                  onChange={(e) => setFormData({ ...formData, socialMediaId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Selecione um colaborador...</option>
                  {users
                    .filter((u) => u.role === 'COLABORADOR' || u.role === 'GESTOR')
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.department || u.title})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Designer Responsável
                </label>
                <select
                  value={formData.designerId}
                  onChange={(e) => setFormData({ ...formData, designerId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Selecione um designer...</option>
                  {users
                    .filter((u) => u.role === 'COLABORADOR')
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.title})
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 5: Observações Iniciais */}
          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">
              Observações Estratégicas Iniciais
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Ex: Foco no lançamento de outubro. Cliente prefere reuniões às quintas pela manhã."
              className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </form>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-800 flex items-center justify-between">
          <p className="text-xs text-gray-400 hidden sm:block">
            Ao salvar, o sistema dispara a esteira de onboarding imediatamente.
          </p>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-gray-600 text-gray-200 text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 flex items-center space-x-2 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Criar Projeto & Iniciar Onboarding</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
