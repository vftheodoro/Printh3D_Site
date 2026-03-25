'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Folder,
  Package,
  Wallet,
  Receipt,
  Contact,
  Percent,
  Calculator,
  Settings,
  Users,
  Trash,
  LogOut,
  Download,
  Upload,
  Menu,
  Box
} from 'lucide-react';
import '../admin.css';

interface AdminUser {
  id: number;
  nome: string;
  email: string;
  tipo: string;
}

export default function AdminSidebar({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);

  // Parse user from cookie/session on mount
  useEffect(() => {
    // We could fetch `/api/admin/me` here to get full user data,
    // For now, let's just set a placeholder that will be replaced.
    setUser({
      id: 1,
      nome: 'Admin',
      email: 'admin@printh3d.com',
      tipo: 'ADMIN'
    });
  }, []);

  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const handleBackup = async () => {
    try {
      const res = await fetch('/api/admin/backup');
      if (!res.ok) throw new Error('Falha ao gerar backup');
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `printh3d_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      alert('Erro ao exportar backup.');
      console.error(err);
    }
  };

  const handleImportClick = () => {
    document.getElementById('file-import')?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm(`Atenção: A migração irá importar os dados do arquivo ${file.name} para o Supabase. Esse processo pode demorar alguns minutos. Continuar?`)) {
       e.target.value = '';
       return;
    }

    setIsMigrating(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
           const jsonString = event.target?.result as string;
           const payload = JSON.parse(jsonString); // Assuming format { data: { "categorias": [], ... } } from IndexedDB script

           const res = await fetch('/api/admin/migrate', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify(payload)
           });
           
           const result = await res.json();
           if (!res.ok) throw new Error(result.error || 'Erro na migração');
           alert('Migração concluída com sucesso! Verifique os dados no sistema.');
           window.location.reload();
        } catch (err: any) {
           alert(`Falha ao ler o arquivo ou na migração: ${err.message}`);
        } finally {
           setIsMigrating(false);
        }
      };
      reader.readAsText(file);
    } catch (err) {
      alert('Erro na leitura do arquivo.');
      setIsMigrating(false);
    }
    e.target.value = '';
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Categorias', path: '/admin/categorias', icon: Folder },
    { name: 'Produtos', path: '/admin/produtos', icon: Package },
    { name: 'Vendas', path: '/admin/vendas', icon: Wallet },
    { name: 'Gastos', path: '/admin/gastos', icon: Receipt },
    { name: 'Clientes', path: '/admin/clientes', icon: Contact },
    { name: 'Promoções', path: '/admin/promocoes', icon: Percent, adminOnly: true },
    { name: 'Calculadora', path: '/admin/calculadora', icon: Calculator },
    { type: 'divider' },
    { name: 'Configurações', path: '/admin/configuracoes', icon: Settings, adminOnly: true },
    { name: 'Usuários', path: '/admin/usuarios', icon: Users, adminOnly: true },
    { name: 'Lixeira', path: '/admin/lixeira', icon: Trash, adminOnly: true },
  ];

  return (
    <div className="admin-theme app-layout">
      {/* Sidebar */}
      <nav className={`sidebar ${isSidebarOpen ? 'open' : ''}`} id="sidebar">
        <div className="sidebar-brand">
          <div style={{ width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '0.2rem' }}>
            <img 
              src="/assets/imagens/logos/logo_printh_branca.png" 
              alt="Printh3D Logo" 
              style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 0 12px rgba(0, 188, 255, 0.6))' }} 
            />
          </div>
          <div className="brand-text">
            <h2>Printh<span>3D</span></h2>
            <small>Pro Edition</small>
          </div>
        </div>

        <ul className="sidebar-nav">
          {navItems.map((item, index) => {
            if (item.type === 'divider') {
              return <li key={index} className="nav-divider"></li>;
            }

            // Hide admin-only items if user is not ADMIN
            if (item.adminOnly && user?.tipo !== 'ADMIN') return null;

            const isActive = pathname === item.path || (item.path !== '/admin' && pathname.startsWith(item.path as string));
            const Icon = item.icon as React.ElementType;

            return (
              <li key={index} className={isActive ? 'active' : ''}>
                <Link href={item.path as string} onClick={closeSidebar}>
                  <Icon /> {item.name}
                </Link>
              </li>
            );
          })}
          
          <li className="nav-divider"></li>
          
          <li>
            <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
              <LogOut /> Sair
            </a>
          </li>
        </ul>

        <div className="sidebar-footer">
          <button className="btn btn-secondary" onClick={handleBackup}>
            <Download size={15} /> Backup (JSON)
          </button>
          <button className="btn btn-secondary" onClick={handleImportClick} disabled={isMigrating}>
            <Upload size={15} /> {isMigrating ? 'Migrando...' : 'Migrar Dados'}
          </button>
          <input type="file" id="file-import" accept=".json" style={{ display: 'none' }} onChange={handleFileChange} />
        </div>

        <div className="sidebar-user">
          <div className="user-avatar" id="user-avatar">
            {user?.nome ? user.nome.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="user-info">
            <div className="user-name" id="user-display-name">{user?.nome || 'Carregando...'}</div>
            <div className="user-role" id="user-display-role">{user?.tipo || ''}</div>
          </div>
        </div>
      </nav>

      <div className={`sidebar-backdrop ${isSidebarOpen ? 'show' : ''}`} onClick={closeSidebar}></div>

      {/* Content Area */}
      <div className="content-area">
        <header className="content-header">
          <button className="btn-hamburger" onClick={toggleSidebar}>
            <Menu size={20} />
          </button>
          <h2 id="page-title">
            {navItems.find(i => i.path === pathname)?.name || 'Dashboard'}
          </h2>
          <div className="header-user">
            <span className="user-name">{user?.nome || ''}</span>
          </div>
        </header>

        <main className="content-main">
          {children}
        </main>
      </div>
    </div>
  );
}
