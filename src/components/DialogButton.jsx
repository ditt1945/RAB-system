'use client';

import { useAppDialogs } from '@/components/AppDialogs';

/**
 * Tombol yang membuka popup edit data dari halaman server.
 * action: 'project' (baru / ubah bila `project` diisi), 'company', atau 'profile'.
 */
export default function DialogButton({ action, project, openCosts = false, className, children, ...props }) {
  const dialogs = useAppDialogs();
  const open = () => {
    if (action === 'company') dialogs.openCompany();
    else if (action === 'profile') dialogs.openProfile();
    else dialogs.openProject({ project, openCosts });
  };
  return (
    <button type="button" onClick={open} className={className} {...props}>
      {children}
    </button>
  );
}
