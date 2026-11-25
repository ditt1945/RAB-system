'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { api } from '@/lib/client';
import { Modal } from '@/components/overlay';
import { useToast } from '@/components/toast';
import ProjectForm from '@/app/(app)/projects/ProjectForm';
import CompanySettingsForm from '@/app/(app)/company-settings/CompanySettingsForm';
import ProfileSettingsForm from '@/app/(app)/profile/ProfileSettingsForm';

const DialogContext = createContext(null);

/**
 * Popup untuk mengubah data tanpa pindah halaman:
 * proyek baru / ubah proyek / pengaturan biaya, data perusahaan, dan pengaturan akun.
 * Pakai: const dialogs = useAppDialogs(); dialogs.openProject({ project, openCosts }) · dialogs.openCompany() · dialogs.openProfile()
 */
export function AppDialogsProvider({ children }) {
  const router = useRouter();
  const toast = useToast();
  const [dialog, setDialog] = useState(null); // { type: 'project'|'company'|'profile', ... }
  const [shown, setShown] = useState(null); // isi terakhir, tetap ditampilkan selama animasi tutup
  const close = () => setDialog(null);

  const open = (next) => {
    setDialog(next);
    setShown(next);
  };

  const api_ = {
    openProject: ({ project = null, openCosts = false } = {}) => open({ type: 'project', project, openCosts, key: Date.now() }),
    openCompany: () => open({ type: 'company', key: Date.now() }),
    openProfile: () => open({ type: 'profile', key: Date.now() }),
  };

  const current = dialog ?? shown;
  const projectSaved = (saved) => {
    const isEdit = Boolean(current?.project);
    close();
    if (isEdit) {
      toast('Data proyek disimpan');
      router.refresh();
    } else {
      toast('Proyek dibuat. Silakan susun RAB-nya.');
      router.push(`/projects/${saved.id}`);
    }
  };

  return (
    <DialogContext.Provider value={api_}>
      {children}

      <Modal
        open={dialog?.type === 'project'}
        onClose={close}
        title={current?.project ? 'Ubah data proyek' : 'Proyek baru'}
        description={current?.project ? current.project.projectName : 'Isi data utama dulu; setelah disimpan Anda langsung masuk ke penyusunan RAB.'}
      >
        {current?.type === 'project' && (
          <ProjectForm key={current.key} project={current.project ?? undefined} openCosts={current.openCosts} inModal onDone={projectSaved} onCancel={close} />
        )}
      </Modal>

      <Modal open={dialog?.type === 'company'} onClose={close} title="Data perusahaan" description="Dipakai sebagai kop pada preview dan PDF RAB.">
        {current?.type === 'company' && (
          <Loaded key={current.key} url="/api/company-settings">
            {(company) => (
              <CompanySettingsForm
                company={company}
                onCancel={close}
                onDone={() => {
                  close();
                  toast('Data perusahaan disimpan');
                }}
              />
            )}
          </Loaded>
        )}
      </Modal>

      <Modal open={dialog?.type === 'profile'} onClose={close} title="Pengaturan akun" description="Ubah nama, email masuk, atau kata sandi.">
        {current?.type === 'profile' && (
          <Loaded key={current.key} url="/api/profile">
            {(profile) => (
              <ProfileSettingsForm
                profile={{ name: profile.name, email: profile.email, phoneNumber: profile.profileSettings?.phoneNumber, department: profile.profileSettings?.department }}
              />
            )}
          </Loaded>
        )}
      </Modal>
    </DialogContext.Provider>
  );
}

/** Ambil data untuk isi popup, tampilkan kerangka selama memuat. */
function Loaded({ url, children }) {
  const [state, setState] = useState({ loading: true, data: null, error: null });
  useEffect(() => {
    let active = true;
    api(url).then((res) => {
      if (active) setState({ loading: false, data: res.ok ? res.data.data : null, error: res.ok ? null : res.error });
    });
    return () => {
      active = false;
    };
  }, [url]);
  if (state.loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Memuat data…
      </div>
    );
  }
  if (state.error) return <p className="py-10 text-center text-sm text-red-700">{state.error}</p>;
  return children(state.data);
}

export function useAppDialogs() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error('useAppDialogs harus dipakai di dalam <AppDialogsProvider>');
  return ctx;
}
