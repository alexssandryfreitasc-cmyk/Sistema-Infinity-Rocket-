import React, { useState } from 'react';
import {
  Users2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building2,
  CheckSquare,
  ShieldCheck,
  TrendingUp,
  Plus,
  Trash2,
  Edit2,
  X,
  UserCheck,
  Mail,
  Phone,
  Briefcase
} from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { User, UserRole } from '../../types';

export const TeamPage: React.FC = () => {
  const { users, tasks, clients, addUser, updateUser, deleteUser, approveUser, rejectUser, currentUser } = useAgency();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Pending user requests
  const pendingUsers = users.filter((u) => u.status === 'PENDENTE_APROVACAO');
  const activeUsers = users.filter((u) => u.status !== 'PENDENTE_APROVACAO');
  const internalTeam = activeUsers.filter((u) => u.role !== 'CLIENTE');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'COLABORADOR' as UserRole,
    title: '',
    department: 'Operações',
    phone: '',
    maxCapacityHours: 40
  });

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      role: 'COLABORADOR',
      title: '',
      department: 'Operações',
      phone: '',
      maxCapacityHours: 40
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      title: user.title,
      department: user.department || 'Operações',
      phone: user.phone || '',
      maxCapacityHours: user.maxCapacityHours || 40
    });
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;

    if (editingUser) {
      updateUser(editingUser.id, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
        title: formData.title.trim(),
        department: formData.department,
        phone: formData.phone.trim(),
        maxCapacityHours: Number(formData.maxCapacityHours)
      });
    } else {
      // Default avatars based on name hash
      const randomSeed = Math.floor(Math.random() * 70) + 1;
      const avatarUrl = `https://images.unsplash.com/photo-${1534528741775 + randomSeed}?w=150&auto=format&fit=crop&q=80`;

      addUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
        avatar: avatarUrl,
        title: formData.title.trim() || 'Especialista',
        department: formData.department,
        phone: formData.phone.trim(),
        workloadHours: 0,
        maxCapacityHours: Number(formData.maxCapacityHours) || 40
      });
    }

    setIsAddModalOpen(false);
  };

  const handleDelete = (user: User) => {
    if (users.length <= 1) {
      alert('Não é possível excluir o único usuário do sistema.');
      return;
    }
    if (window.confirm(`Tem certeza que deseja excluir o colaborador "${user.name}"?`)) {
      deleteUser(user.id);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="p-5 rounded-lg bg-gray-800 border border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Users2 className="w-5 h-5 text-indigo-300" />
            <h1 className="text-xl font-bold text-white">
              Gestão de Equipe & Capacidade Operacional
            </h1>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Cadastre seus colaboradores reais, defina cargos, departamentos e gerencie capacidade semanal.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1.5 rounded-xl bg-gray-700 border border-gray-600 text-xs font-mono text-white">
            {internalTeam.length} Colaboradores
          </span>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer shadow-md shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Colaborador</span>
          </button>
        </div>
      </div>

      {/* Pending Access Approvals Section (Admin Action Required) */}
      {currentUser.role === 'ADMIN' && pendingUsers.length > 0 && (
        <div className="p-5 rounded-lg bg-amber-500/10 border border-amber-500/30 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <h2 className="text-sm font-bold text-amber-300">
                Solicitações de Acesso Pendentes ({pendingUsers.length})
              </h2>
            </div>
            <span className="text-[11px] text-amber-400/80">
              Liberar ou recusar novos colaboradores ou clientes
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {pendingUsers.map((pending) => (
              <div
                key={pending.id}
                className="p-4 rounded-xl bg-gray-800 border border-amber-500/20 flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={pending.avatar}
                      alt={pending.name}
                      className="w-10 h-10 rounded-full object-cover border border-amber-500/30"
                    />
                    <div>
                      <h3 className="text-xs font-bold text-white">{pending.name}</h3>
                      <p className="text-[11px] text-amber-400 font-medium">{pending.title || 'Solicitante'}</p>
                      <p className="text-[10px] text-gray-400">{pending.email} • {pending.phone || 'Sem WhatsApp'}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${
                      pending.role === 'CLIENTE'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                    }`}
                  >
                    {pending.role === 'CLIENTE' ? 'Portal do Cliente' : 'Colaborador Agência'}
                  </span>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-700">
                  <button
                    onClick={() => {
                      if (window.confirm(`Deseja recusar a solicitação de ${pending.name}?`)) {
                        rejectUser(pending.id);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Recusar
                  </button>

                  <button
                    onClick={() => approveUser(pending.id)}
                    className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer flex items-center space-x-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Liberar Acesso (Aprovar)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team Cards Grid */}
      {internalTeam.length === 0 ? (
        <div className="p-12 rounded-lg bg-gray-800 border border-gray-700 text-center space-y-3">
          <Users2 className="w-12 h-12 mx-auto text-gray-600" />
          <h3 className="text-sm font-bold text-white">Nenhum colaborador cadastrado</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Cadastre os membros da sua equipe para delegar tarefas e gerenciar clientes.
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs inline-flex items-center space-x-1.5 transition-colors cursor-pointer mt-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Cadastrar Primeiro Membro</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {internalTeam.map((user) => {
            const userTasks = tasks.filter(
              (t) => t.assignedToId === user.id && t.status !== 'CONCLUIDA' && t.status !== 'CANCELADA'
            );
            const assignedClientsList = clients.filter(
              (c) =>
                c.team.accountManagerId === user.id ||
                c.team.socialMediaId === user.id ||
                c.team.designerId === user.id ||
                c.team.trafficManagerId === user.id ||
                c.team.copywriterId === user.id ||
                user.assignedClientIds?.includes(c.id)
            );

            const workload = user.workloadHours || (userTasks.length * 4);
            const maxCapacity = user.maxCapacityHours || 40;
            const isOverloaded = workload > maxCapacity;
            const capacityPercent = Math.min(100, Math.round((workload / maxCapacity) * 100));

            return (
              <div
                key={user.id}
                className={`p-5 rounded-lg bg-gray-800 border transition-all flex flex-col justify-between space-y-4 ${
                  isOverloaded
                    ? 'border-rose-500/50 shadow-lg shadow-rose-500/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div>
                  {/* User avatar & Role */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-12 h-12 rounded-lg object-cover border border-gray-700"
                        onError={(e) => {
                          // Fallback avatar
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div>
                        <h3 className="text-sm font-bold text-white">{user.name}</h3>
                        <p className="text-xs text-indigo-300 font-semibold">{user.title}</p>
                        <p className="text-[10px] text-gray-400">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                          user.role === 'ADMIN'
                            ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-600/30'
                            : user.role === 'GESTOR'
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            : 'bg-gray-700 border border-gray-600 text-gray-300'
                        }`}
                      >
                        {user.role}
                      </span>

                      <button
                        onClick={() => handleOpenEdit(user)}
                        className="p-1.5 rounded-lg hover:bg-gray-600 text-gray-400 hover:text-white transition-colors"
                        title="Editar Colaborador"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {users.length > 1 && (
                        <button
                          onClick={() => handleDelete(user)}
                          className="p-1.5 rounded-lg hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 transition-colors"
                          title="Excluir Colaborador"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Department & Phone details */}
                  <div className="mt-3 flex items-center space-x-3 text-[11px] text-gray-400">
                    {user.department && (
                      <span className="flex items-center space-x-1">
                        <Briefcase className="w-3 h-3 text-gray-500" />
                        <span>{user.department}</span>
                      </span>
                    )}
                    {user.phone && (
                      <span className="flex items-center space-x-1">
                        <Phone className="w-3 h-3 text-gray-500" />
                        <span>{user.phone}</span>
                      </span>
                    )}
                  </div>

                  {/* Capacity Progress Bar */}
                  <div className="mt-4 p-3.5 rounded-xl bg-gray-700 border border-gray-600 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400 font-semibold flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>Carga de Trabalho:</span>
                      </span>
                      <span
                        className={`font-mono font-bold ${
                          isOverloaded ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {workload}h / {maxCapacity}h ({capacityPercent}%)
                      </span>
                    </div>

                    <div className="w-full h-2 bg-gray-900 rounded-full overflow-hidden border border-gray-700">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isOverloaded
                            ? 'bg-rose-500'
                            : capacityPercent > 80
                            ? 'bg-indigo-600'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${capacityPercent}%` }}
                      />
                    </div>

                    {isOverloaded && (
                      <p className="text-[10px] font-bold text-rose-400 flex items-center space-x-1 mt-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Sobrecarga: Acima da capacidade máxima semanal</span>
                      </p>
                    )}
                  </div>

                  {/* Assigned Clients */}
                  <div className="mt-4 space-y-1.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Clientes Atribuídos ({assignedClientsList.length}):
                    </span>
                    {assignedClientsList.length === 0 ? (
                      <p className="text-[11px] text-gray-500 italic">Nenhum cliente vinculado ainda</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {assignedClientsList.map((c) => (
                          <span
                            key={c.id}
                            className="px-2 py-0.5 rounded-lg bg-gray-700 text-[11px] text-gray-200 border border-gray-600"
                          >
                            {c.tradingName}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Active Tasks Count */}
                <div className="pt-3 border-t border-gray-700 flex items-center justify-between text-xs text-gray-400">
                  <span>Tarefas ativas na fila:</span>
                  <span className="font-bold text-indigo-300 font-mono">
                    {userTasks.length} tarefa(s)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Add or Edit Collaborator */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-xl bg-gray-800 border border-gray-600 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users2 className="w-5 h-5 text-indigo-300" />
                <h3 className="text-sm font-bold text-white">
                  {editingUser ? 'Editar Colaborador' : 'Novo Colaborador da Equipe'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João Victor Silva"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                  E-mail Corporativo *
                </label>
                <input
                  type="email"
                  required
                  placeholder="Ex: joao@suaagencia.com.br"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                    Papel de Acesso *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2.5 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white focus:outline-none focus:border-indigo-600"
                  >
                    <option value="ADMIN">ADMIN (Diretoria)</option>
                    <option value="GESTOR">GESTOR (Head/Líder)</option>
                    <option value="COLABORADOR">COLABORADOR (Operacional)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                    Departamento
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Design, Tráfego, Copy..."
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                    Cargo / Título
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Senior Designer"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                    Capacidade Semanal (h)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={80}
                    value={formData.maxCapacityHours}
                    onChange={(e) => setFormData({ ...formData, maxCapacityHours: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                  Telefone / WhatsApp
                </label>
                <input
                  type="text"
                  placeholder="(11) 98765-4321"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-800/40 text-[11px] text-indigo-300 flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-indigo-400" />
                <p>
                  <strong>Ativação Segura via Firebase Auth:</strong> O colaborador criará sua própria senha ou utilizará a conta Google corporativa ao acessar a plataforma. Nenhuma senha provisória é enviada ou salva em texto claro.
                </p>
              </div>

              <div className="pt-3 border-t border-gray-700 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-700 hover:bg-[#202020] text-xs font-semibold text-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  {editingUser ? 'Salvar Alterações' : 'Cadastrar Membro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
