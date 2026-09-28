import React from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  Sparkles,
  AlertCircle,
  FileCheck2,
  Calendar,
  X
} from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';

interface NotificationCenterProps {
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onClose }) => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setActiveTab,
    setActiveClientId
  } = useAgency();

  const getIcon = (type: string) => {
    switch (type) {
      case 'APROVACAO':
        return <FileCheck2 className="w-4 h-4 text-emerald-400" />;
      case 'ALERTA':
        return <AlertCircle className="w-4 h-4 text-rose-400" />;
      case 'REUNIAO':
        return <Calendar className="w-4 h-4 text-sky-400" />;
      case 'ALTERACAO':
        return <Clock className="w-4 h-4 text-amber-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-gray-700 border border-gray-600 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between bg-gray-800">
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-indigo-300" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Central de Notificações</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={markAllNotificationsAsRead}
            className="text-[11px] text-indigo-300 hover:text-indigo-300 transition-colors flex items-center space-x-1 font-medium"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Ler todas</span>
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-[#262626]">
        {notifications.length === 0 ? (
          <div className="py-8 text-center px-4">
            <Check className="w-8 h-8 text-gray-500 mx-auto mb-2" />
            <p className="text-xs text-gray-400">Você está em dia com todas as notificações.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                markNotificationAsRead(notif.id);
                if (notif.clientId) setActiveClientId(notif.clientId);
                if (notif.linkTab) setActiveTab(notif.linkTab);
                onClose();
              }}
              className={`p-3.5 hover:bg-gray-600 cursor-pointer transition-colors flex items-start space-x-3 ${
                !notif.read ? 'bg-indigo-600/10' : ''
              }`}
            >
              <div className="p-2 rounded-lg bg-[#111111] border border-gray-600 shrink-0 mt-0.5">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className={`text-xs font-semibold truncate ${!notif.read ? 'text-white' : 'text-gray-300'}`}>
                    {notif.title}
                  </h4>
                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 ml-2" />
                  )}
                </div>
                <p className="text-[11px] text-gray-400 line-clamp-2 mt-0.5">{notif.message}</p>
                <span className="text-[10px] text-gray-500 mt-1 block">
                  {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
