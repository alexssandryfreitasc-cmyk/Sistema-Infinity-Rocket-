import React, { useState } from 'react';
import { X, Building2, Save, Trash2, AlertCircle } from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { Client, PlanType } from '../../types';

interface EditClientModalProps {
  client: Client;
  onClose: () => void;
}

export const EditClientModal: React.FC<EditClientModalProps> = ({ client, onClose }) => {
  const { updateClient, deleteClient, plans, currentUser } = useAgency();

  const [formData, setFormData] = useState({
    companyName: client.companyName,
    tradingName: client.tradingName,
    contactName: client.contactName,
    email: client.email,
    phone: client.phone,
    whatsapp: client.whatsapp,
    cnpj: client.cnpj,
    segment: client.segment,
    city: client.city,
    instagram: client.instagram,
    site: client.site || '',
    plan: client.plan,
    monthlyValue: client.monthlyValue,
    renewalDate: client.renewalDate,
    notes: client.notes || ''
  });

  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handlePlanChange = (planId: PlanType) => {
    const selectedPlan = plans.find((p) => p.id === planId);
    setFormData((prev) => ({
      ...prev,
      plan: planId,
      monthlyValue: selectedPlan ? selectedPlan.monthlyValue : prev.monthlyValue
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName.trim() || !formData.contactName.trim() || !formData.email.trim()) {
      setError('Por favor, preencha os campos obrigatórios: Razão Social, Responsável e E-mail.');
      return;
    }

    updateClient(client.id, {
      companyName: formData.companyName.trim(),
      tradingName: formData.tradingName.trim() || formData.companyName.trim(),
      contactName: formData.contactName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      whatsapp: formData.whatsapp.trim(),
      cnpj: formData.cnpj.trim(),
      segment: formData.segment.trim(),
      city: formData.city.trim(),
      instagram: formData.instagram.trim(),
      site: formData.site.trim(),
      plan: formData.plan,
      monthlyValue: Number(formData.monthlyValue),
      renewalDate: formData.renewalDate,
      notes: formData.notes.trim()
    });

    onClose();
  };

  const handleDelete = () => {
    deleteClient(client.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-gray-850">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Editar Dados do Cliente</h2>
              <p className="text-[11px] text-gray-400">{client.tradingName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">
                Nome Fantasia <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.tradingName}
                onChange={(e) => setFormData({ ...formData, tradingName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">
                Razão Social <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">
                Contato Responsável <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">
                E-mail de Contato <span className="text-rose-400">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">WhatsApp / Telefone</label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">CNPJ</label>
              <input
                type="text"
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">Nicho / Segmento</label>
              <input
                type="text"
                value={formData.segment}
                onChange={(e) => setFormData({ ...formData, segment: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">Instagram (@)</label>
              <input
                type="text"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">Plano Contratado</label>
              <select
                value={formData.plan}
                onChange={(e) => handlePlanChange(e.target.value as PlanType)}
                className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (R$ {p.monthlyValue.toLocaleString('pt-BR')})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">Mensalidade (R$)</label>
              <input
                type="number"
                value={formData.monthlyValue}
                onChange={(e) => setFormData({ ...formData, monthlyValue: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1">Observações Operacionais</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Delete Danger Zone */}
          {(currentUser.role === 'ADMIN' || currentUser.role === 'GESTOR') && (
            <div className="pt-4 border-t border-gray-800">
              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir este cliente e projetos associados</span>
                </button>
              ) : (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2">
                  <p className="text-xs text-rose-300 font-semibold">
                    Tem certeza? Esta ação removerá o cliente, tarefas e dados financeiros do banco de dados.
                  </p>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Confirmar Exclusão
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-medium transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer Action Buttons */}
          <div className="pt-4 border-t border-gray-800 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Alterações</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
