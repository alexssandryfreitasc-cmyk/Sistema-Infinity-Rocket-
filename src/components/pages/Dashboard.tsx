import React from 'react';
import { useAgency } from '../../context/AgencyContext';
import { AdminDashboard } from '../dashboard/AdminDashboard';
import { ManagerDashboard } from '../dashboard/ManagerDashboard';
import { CollabDashboard } from '../dashboard/CollabDashboard';
import { ClientDashboard } from '../dashboard/ClientDashboard';

interface DashboardProps {
  onOpenNewClient: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onOpenNewClient }) => {
  const { currentUser } = useAgency();

  if (currentUser.role === 'ADMIN') {
    return <AdminDashboard onOpenNewClient={onOpenNewClient} />;
  }

  if (currentUser.role === 'GESTOR') {
    return <ManagerDashboard />;
  }

  if (currentUser.role === 'COLABORADOR') {
    return <CollabDashboard />;
  }

  // Client view
  return <ClientDashboard />;
};
