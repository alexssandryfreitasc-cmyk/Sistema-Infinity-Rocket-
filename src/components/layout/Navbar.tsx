import React, { useState } from 'react';
import {
  Search,
  Bell,
  Plus,
  RotateCcw,
  Sparkles,
  ChevronDown,
  Building2,
  UserCheck,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  Trash2,
  ShieldAlert,
  Settings,
  LogOut
} from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { NotificationCenter } from './NotificationCenter';

interface NavbarProps {
  onOpenNewClient: () => void;
  onOpenSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenNewClient, onOpenSearch }) => {
  const {
    currentUser,
    users,
    setCurrentUser,
    clients,
    activeClient,
    setActiveClientId,
    setGlobalSearchOpen,
    resetDemoData,
    clearAllData,
    notifications,
    setActiveTab,
    logout
  } = useAgency();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const roleColors: Record<string, { bg: string; text: string; border: string; label: string }> = {
    ADMIN: { bg: 'bg-indigo-600/15', text: 'text-indigo-300', border: 'border-indigo-600/30', label: '1. Administrador (Acesso Total)' },
    GESTOR: { bg: 'bg-gray-600', text: 'text-white', border: 'border-gray-500', label: '2. Gestor / Head de Contas' },
    COLABORADOR: { bg: 'bg-gray-600', text: 'text-gray-300', border: 'border-gray-600', label: '3. Colaborador (Design/Copy/Tráfego)' },
    CLIENTE: { bg: 'bg-gray-700', text: 'text-indigo-300', border: 'border-indigo-600/40', label: '4. Cliente (Portal Exclusivo)' }
  };

  return (
    <header className="h-16 bg-gray-800 border-b border-gray-700 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shrink-0">
      {/* Client Selector (Visible for Internal Team: Admin, Gestor, Colaborador) */}
      <div className="flex items-center gap-4">
        {currentUser.role !== 'CLIENTE' ? (
          <div className="relative">
            <button
              onClick={() => {
                setClientDropdownOpen(!clientDropdownOpen);
                setRoleDropdownOpen(false);
                setNotificationsOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-md border border-gray-600 text-sm text-gray-200 hover:text-white transition-colors cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-gray-400" />
              <span className="max-w-[140px] sm:max-w-[200px] truncate font-medium">
                {activeClient ? activeClient.tradingName : 'Selecione um Cliente'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {clientDropdownOpen && (
              <div className="absolute left-0 mt-2 w-72 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 border-b border-gray-700 text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Clientes Ativos & Onboarding</span>
                  <span className="text-gray-300">{clients.length}</span>
                </div>
                <div className="max-h-64 overflow-y-auto py-1">
                  {clients.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setActiveClientId(c.id);
                        setClientDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-gray-700 transition-colors cursor-pointer ${
                        c.id === activeClient?.id ? 'bg-indigo-600/20 text-indigo-300 font-medium' : 'text-gray-300'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="text-xs font-medium truncate">{c.tradingName}</div>
                        <div className="text-[10px] text-gray-400 truncate">{c.segment}</div>
                      </div>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                          c.status === 'ATIVO'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : c.status === 'ONBOARDING'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {c.status}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 rounded-md border border-gray-600 text-sm text-white">
            <Building2 className="w-4 h-4 text-indigo-300" />
            <span className="font-medium truncate">{activeClient?.tradingName}</span>
          </div>
        )}
      </div>

      {/* Center Search Trigger (Desktop & Tablet) */}
      <div className="flex-1 max-w-xl px-4 sm:px-6 hidden sm:block">
        <button
          id="navbar-search-btn"
          type="button"
          onClick={() => {
            setGlobalSearchOpen(true);
            onOpenSearch?.();
          }}
          className="relative w-full text-left flex items-center"
        >
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-gray-500" />
          </span>
          <div className="w-full pl-10 pr-12 py-2 border border-gray-700 hover:border-gray-500 rounded-md leading-5 bg-gray-900 text-gray-400 text-sm flex items-center justify-between transition-colors cursor-pointer">
            <span>Buscar clientes, tarefas, briefings...</span>
            <span className="text-gray-500 text-xs border border-gray-700 rounded px-1.5 py-0.5 bg-gray-800">⌘K</span>
          </div>
        </button>
      </div>

      {/* Right Controls: Mobile Search, Role Switcher, New Client, Notifs, Settings */}
      <div className="flex items-center gap-4">
        {/* Mobile Search Icon Button */}
        <button
          id="navbar-mobile-search-btn"
          type="button"
          onClick={() => {
            setGlobalSearchOpen(true);
            onOpenSearch?.();
          }}
          className="sm:hidden p-2 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors cursor-pointer"
          title="Buscar no sistema"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Quick Role Tester Switcher */}
        <div className="relative">
          <button
            onClick={() => {
              setRoleDropdownOpen(!roleDropdownOpen);
              setClientDropdownOpen(false);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors cursor-pointer"
            title="Alternar Perfil para Testar Visões"
          >
            <span className="hidden md:inline font-medium text-xs text-gray-400">{currentUser.role}:</span>
            <span className="font-semibold text-sm text-gray-200 truncate max-w-[100px]">{currentUser.name.split(' ')[0]}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-2 py-1.5 text-[11px] font-semibold text-gray-400 border-b border-gray-700 mb-1 flex items-center justify-between">
                <span>Alternar Papel de Acesso (RBAC)</span>
                <span className="text-[10px] text-indigo-300 font-normal">Ambiente Vivo</span>
              </div>
              <div className="space-y-1">
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      setCurrentUser(u);
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-md flex items-center space-x-3 transition-colors cursor-pointer ${
                      u.id === currentUser.id
                        ? 'bg-indigo-600/20 border border-indigo-600/30'
                        : 'hover:bg-gray-700'
                    }`}
                  >
                    <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover border border-gray-600" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-white truncate">{u.name}</p>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                          u.role === 'ADMIN' ? 'bg-indigo-600/20 text-indigo-300' :
                          u.role === 'GESTOR' ? 'bg-gray-700 text-gray-200' :
                          u.role === 'COLABORADOR' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-sky-500/20 text-sky-400'
                        }`}>
                          {u.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 truncate">{u.title}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Add Client Button (Only for Admin & Gestor) */}
        {(currentUser.role === 'ADMIN' || currentUser.role === 'GESTOR') && (
          <button
            onClick={onOpenNewClient}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 shadow-sm shadow-indigo-600/20 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Novo Cliente</span>
          </button>
        )}

        {/* Notifications Popover and Settings */}
        <div className="flex items-center gap-3 border-l border-gray-700 pl-4">
          <div className="relative">
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setRoleDropdownOpen(false);
                setClientDropdownOpen(false);
              }}
              className="relative text-gray-400 hover:text-white p-1 transition-colors cursor-pointer"
              title="Notificações"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifs > 0 && (
                <span className="absolute -top-1 -right-1 block h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadNotifs}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <NotificationCenter onClose={() => setNotificationsOpen(false)} />
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={() => {
              if (window.confirm('Deseja encerrar sua sessão no AgencyOS?')) {
                logout();
              }
            }}
            className="text-gray-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-gray-700/60 transition-colors cursor-pointer flex items-center gap-1.5 text-xs"
            title="Sair do Sistema"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline font-medium">Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
};
