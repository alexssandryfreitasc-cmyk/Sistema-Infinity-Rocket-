import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Play,
  CheckCircle2,
  Calendar,
  Users,
  Building2,
  Briefcase,
  Clock,
  Sparkles,
  ArrowRight,
  X,
  CheckSquare
} from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { ProcessTemplate, TaskCategory } from '../../types';

export const TemplatesPage: React.FC = () => {
  const {
    templates,
    clients,
    applyTemplateToClient,
    createProcessTemplate,
    currentUser,
    setActiveTab,
    setActiveClientId
  } = useAgency();

  const [selectedTemplate, setSelectedTemplate] = useState<ProcessTemplate | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // New Template Form
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDesc, setNewTemplateDesc] = useState('');
  const [newTemplateTasks, setNewTemplateTasks] = useState([
    { title: 'Reunião de Alinhamento e Briefing', category: 'REUNIAO' as TaskCategory, relativeDays: 1, defaultRole: 'ACCOUNT_MANAGER' as const },
    { title: 'Produção das Peças Iniciais', category: 'DESIGN' as TaskCategory, relativeDays: 4, defaultRole: 'DESIGNER' as const },
    { title: 'Revisão e Validação Interna', category: 'REVISAO' as TaskCategory, relativeDays: 6, defaultRole: 'SOCIAL_MEDIA' as const }
  ]);

  const handleOpenApply = (tpl: ProcessTemplate) => {
    setSelectedTemplate(tpl);
    setSelectedClientId(clients[0]?.id || '');
    setIsApplyModalOpen(true);
  };

  const handleConfirmApply = () => {
    if (!selectedTemplate || !selectedClientId) return;
    const client = clients.find((c) => c.id === selectedClientId);
    applyTemplateToClient(selectedTemplate.id, selectedClientId);

    setIsApplyModalOpen(false);
    setSuccessMessage(`Template "${selectedTemplate.name}" aplicado com sucesso para ${client?.tradingName || 'o cliente'}!`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName.trim() || newTemplateTasks.length === 0) return;

    createProcessTemplate({
      name: newTemplateName.trim(),
      description: newTemplateDesc.trim() || 'Processo operacional padronizado da agência',
      planId: 'PRO',
      tasksCount: newTemplateTasks.length,
      defaultTasks: newTemplateTasks
    });

    setIsCreateModalOpen(false);
    setNewTemplateName('');
    setNewTemplateDesc('');
    setSuccessMessage('Novo template de processo criado com sucesso!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleAddTaskField = () => {
    setNewTemplateTasks((prev) => [
      ...prev,
      {
        title: '',
        category: 'GERAL',
        relativeDays: (prev[prev.length - 1]?.relativeDays || 1) + 2,
        defaultRole: 'ACCOUNT_MANAGER'
      }
    ]);
  };

  const handleRemoveTaskField = (index: number) => {
    setNewTemplateTasks((prev) => prev.filter((_, idx) => idx !== index));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span>Templates de Processos & SOPs ({templates.length})</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Fluxos operacionais padronizados para aplicar em clientes com 1 clique (Onboarding, Sprints de Tráfego, Produção Recorrente)
          </p>
        </div>

        {(currentUser.role === 'ADMIN' || currentUser.role === 'GESTOR') && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 flex items-center space-x-1.5 transition-all self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Template</span>
          </button>
        )}
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Templates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="p-5 rounded-2xl bg-gray-800 border border-gray-700 hover:border-gray-600 transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                    Plano {tpl.planId}
                  </span>
                  <h3 className="text-base font-bold text-white mt-1.5">{tpl.name}</h3>
                  <p className="text-xs text-gray-400 mt-1">{tpl.description}</p>
                </div>

                <span className="px-2.5 py-1 rounded-lg bg-gray-700 text-gray-300 text-xs font-mono font-bold shrink-0">
                  {tpl.tasksCount} tarefas
                </span>
              </div>

              {/* Steps Timeline Preview */}
              <div className="mt-4 space-y-2 border-t border-gray-700/60 pt-3">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                  Etapas do Fluxo:
                </span>
                <div className="space-y-1.5">
                  {tpl.defaultTasks.map((t, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-gray-700/40 border border-gray-700/60 flex items-center justify-between text-xs gap-2"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-gray-700 text-indigo-400 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-gray-200 truncate">{t.title}</span>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gray-700 text-gray-300 uppercase">
                          {t.category}
                        </span>
                        <span className="text-[11px] font-mono text-indigo-400 font-bold">
                          D+{t.relativeDays}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-2 border-t border-gray-700 flex items-center justify-between">
              <span className="text-[11px] text-gray-400">
                Padrão operacional da agência
              </span>

              <button
                onClick={() => handleOpenApply(tpl)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center space-x-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Aplicar a um Cliente</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Apply to Client Modal */}
      {isApplyModalOpen && selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between pb-2 border-b border-gray-700">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Play className="w-4 h-4 text-indigo-400" />
                <span>Aplicar Template Operacional</span>
              </h3>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="text-xs text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-gray-700/50 border border-gray-700">
                <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">Template Selecionado</span>
                <span className="text-sm font-bold text-indigo-300">{selectedTemplate.name}</span>
                <p className="text-xs text-gray-400 mt-1">
                  Gerará {selectedTemplate.tasksCount} tarefas escalonadas no prazo para o cliente escolhido.
                </p>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                  Selecione o Cliente Destino *
                </label>
                {clients.length === 0 ? (
                  <p className="text-xs text-rose-400">
                    Nenhum cliente cadastrado ainda. Cadastre um cliente primeiro para aplicar templates.
                  </p>
                ) : (
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.tradingName} ({c.plan} - {c.status})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-700">
              <button
                type="button"
                onClick={() => setIsApplyModalOpen(false)}
                className="px-3 py-2 rounded-xl bg-gray-700 text-gray-300 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!selectedClientId}
                onClick={handleConfirmApply}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Confirmar & Gerar Tarefas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Template Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <form
            onSubmit={handleCreateTemplate}
            className="w-full max-w-lg bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-2xl space-y-4 text-white my-8"
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-700">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Novo Template de Processo</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-xs text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                  Nome do Template *
                </label>
                <input
                  type="text"
                  required
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="Ex: Auditoria Inicial de SEO & Tráfego"
                  className="w-full px-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                  Descrição do Fluxo
                </label>
                <input
                  type="text"
                  value={newTemplateDesc}
                  onChange={(e) => setNewTemplateDesc(e.target.value)}
                  placeholder="Ex: Checklist de 5 tarefas para diagnóstico inicial nos primeiros 10 dias"
                  className="w-full px-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-gray-300">
                    Tarefas do Template ({newTemplateTasks.length}) *
                  </label>
                  <button
                    type="button"
                    onClick={handleAddTaskField}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Tarefa</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {newTemplateTasks.map((task, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-gray-700 border border-gray-600 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-gray-400">Etapa {idx + 1}</span>
                        {newTemplateTasks.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTaskField(idx)}
                            className="text-gray-400 hover:text-rose-400 text-xs cursor-pointer"
                          >
                            Remover
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        required
                        value={task.title}
                        onChange={(e) => {
                          const updated = [...newTemplateTasks];
                          updated[idx].title = e.target.value;
                          setNewTemplateTasks(updated);
                        }}
                        placeholder="Título da tarefa..."
                        className="w-full px-2.5 py-1.5 rounded-lg bg-gray-800 border border-gray-600 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                      />

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="text-[10px] text-gray-400 block mb-0.5">Prazo Relativo (D+)</label>
                          <input
                            type="number"
                            min={1}
                            max={60}
                            value={task.relativeDays}
                            onChange={(e) => {
                              const updated = [...newTemplateTasks];
                              updated[idx].relativeDays = Number(e.target.value);
                              setNewTemplateTasks(updated);
                            }}
                            className="w-full px-2 py-1 rounded bg-gray-800 border border-gray-600 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-400 block mb-0.5">Categoria</label>
                          <select
                            value={task.category}
                            onChange={(e) => {
                              const updated = [...newTemplateTasks];
                              updated[idx].category = e.target.value as TaskCategory;
                              setNewTemplateTasks(updated);
                            }}
                            className="w-full px-2 py-1 rounded bg-gray-800 border border-gray-600 text-xs text-white"
                          >
                            <option value="ONBOARDING">ONBOARDING</option>
                            <option value="CONTEUDO">CONTEÚDO</option>
                            <option value="DESIGN">DESIGN</option>
                            <option value="COPY">COPY</option>
                            <option value="TRAFEGO">TRÁFEGO</option>
                            <option value="REUNIAO">REUNIÃO</option>
                            <option value="RELATORIO">RELATÓRIO</option>
                            <option value="GERAL">GERAL</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-700">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-3 py-2 rounded-xl bg-gray-700 text-gray-300 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Salvar Template
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
