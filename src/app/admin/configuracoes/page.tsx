'use client';

import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Activity, Droplet } from 'lucide-react';

interface SettingsData {
  margem_padrao: number;
  custo_kg: number;
  custo_hora_maquina: number;
  custo_kwh: number;
  consumo_maquina_w: number;
  percentual_falha: number;
  depreciacao_percentual: number;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      setSettings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (!res.ok) throw new Error((await res.json()).error);
      
      // Toast would be here in a full app
      alert('Configurações salvas com sucesso!');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Carregando configurações...</div>;
  if (!settings) return <div className="p-8 text-[var(--danger)]">Erro ao carregar configurações.</div>;

  return (
    <div className="section active">
      <div className="section-header">
        <h1><SettingsIcon /> Parâmetros de Cálculo e Sistema</h1>
      </div>

      <div style={{ maxWidth: '800px' }}>
        <form onSubmit={handleSave}>
          
          <div className="card" style={{ padding: '1rem lg:1.5rem', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem lg:1.1rem', marginBottom: '1.25rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Droplet size={18} style={{ color: 'var(--accent)' }} /> 
              Matéria Prima (Base)
            </h3>
            
            <div className="form-row">
              <div className="form-group">
                <label style={{ fontSize: '0.85rem' }}>Custo Padrão do Filamento (R$/kg)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={settings.custo_kg} 
                  onChange={e => setSettings({...settings, custo_kg: parseFloat(e.target.value)})} 
                  required 
                />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.85rem' }}>Margem Padrão de Lucro (%)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  value={settings.margem_padrao} 
                  onChange={e => setSettings({...settings, margem_padrao: parseFloat(e.target.value)})} 
                  required 
                />
                <small style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Ex: 100% dobra o custo de produção.</small>
              </div>
            </div>
            
            <div className="form-group">
              <label style={{ fontSize: '0.85rem' }}>Taxa de Falha Estimada (%)</label>
              <input 
                type="number" 
                step="0.1" 
                value={settings.percentual_falha} 
                onChange={e => setSettings({...settings, percentual_falha: parseFloat(e.target.value)})} 
                required 
              />
              <small style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Percentual adicionado ao peso para compensar falhas e suportes.</small>
            </div>
          </div>

          <div className="card" style={{ padding: '1rem lg:1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem lg:1.1rem', marginBottom: '1.25rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} style={{ color: 'var(--warning)' }} /> 
              Custos Operacionais (Energia e Máquina)
            </h3>
            
            <div className="form-row">
              <div className="form-group">
                <label style={{ fontSize: '0.85rem' }}>Tarifa de Energia (R$/kWh)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={settings.custo_kwh} 
                  onChange={e => setSettings({...settings, custo_kwh: parseFloat(e.target.value)})} 
                  required 
                />
                <small style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Consulte na sua conta de luz (incluindo taxas).</small>
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.85rem' }}>Consumo Médio da Impressora (W)</label>
                <input 
                  type="number" 
                  value={settings.consumo_maquina_w} 
                  onChange={e => setSettings({...settings, consumo_maquina_w: parseInt(e.target.value)})} 
                  required 
                />
                <small style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Ex: Ender 3 opera em média com 150W-250W durante impressão.</small>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label style={{ fontSize: '0.85rem' }}>Custo Hora de Máquina (R$/h)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={settings.custo_hora_maquina} 
                  onChange={e => setSettings({...settings, custo_hora_maquina: parseFloat(e.target.value)})} 
                  required 
                />
                <small style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Valor cobrado por desgaste / tempo imobilizado.</small>
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.85rem' }}>Depreciação e Manutenção (%)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  value={settings.depreciacao_percentual} 
                  onChange={e => setSettings({...settings, depreciacao_percentual: parseFloat(e.target.value)})} 
                  required 
                />
                <small style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Percentual extra pelo desgaste dos equipamentos.</small>
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '1rem', width: '100%', justifyContent: 'center' }} disabled={saving}>
            <Save size={18} /> {saving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
          
        </form>
      </div>
    </div>
  );
}
