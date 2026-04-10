import React, { useState, useCallback, useEffect } from 'react';
import { Play, Square, RotateCcw, AlertTriangle, Server, Shield } from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { WebTerminal } from './WebTerminal';
import { LabTimer } from './LabTimer';
import { LabObjectives } from './LabObjectives';

interface LabEnvironment {
  id: number;
  status: string;
  attacker_ip: string;
  target_ip: string;
  started_at: string;
  expires_at: string;
}

interface LabTemplate {
  id: number;
  module_id: number;
  name: string;
  description: string;
  time_limit_minutes: number;
  objectives: string;
}

interface ObjectiveResult {
  id: number;
  description: string;
  passed: boolean;
  output?: string;
}

interface LabSimulationProps {
  moduleId: number;
}

export const LabSimulation: React.FC<LabSimulationProps> = ({ moduleId }) => {
  const { toast } = useToast();
  const [env, setEnv] = useState<LabEnvironment | null>(null);
  const [template, setTemplate] = useState<LabTemplate | null>(null);
  const [provisioning, setProvisioning] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [checkResults, setCheckResults] = useState<ObjectiveResult[] | undefined>();
  const [checkScore, setCheckScore] = useState<number | undefined>();
  const [checking, setChecking] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [containerHealth, setContainerHealth] = useState<{
    attacker: { running: boolean; oomKilled: boolean; status: string };
    target: { running: boolean; oomKilled: boolean; status: string };
  } | null>(null);

  // Load template and status on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [templates, status] = await Promise.all([
          api<LabTemplate[]>('/api/labs/templates'),
          api<LabEnvironment & { status: string }>(`/api/labs/status/${moduleId}`),
        ]);

        const tmpl = templates.find(t => t.module_id === moduleId);
        setTemplate(tmpl || null);

        if (status.status === 'running') {
          setEnv(status);
        }
      } catch {
        // Lab service may not be available
      }
    };
    loadData();
  }, [moduleId]);

  // Poll container health every 15s while lab is running
  useEffect(() => {
    if (!env) { setContainerHealth(null); return; }

    const checkHealth = async () => {
      try {
        const health = await api<typeof containerHealth>(`/api/labs/container-health/${env.id}`);
        setContainerHealth(health);
        if (health && !health.attacker.running && !health.target.running) {
          toast.error('Both containers have stopped unexpectedly. Reset the target or relaunch the lab.');
        }
      } catch {
        // Advisory only — silently ignore
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, [env?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleProvision = useCallback(async () => {
    setProvisioning(true);
    try {
      const data = await api<LabEnvironment>(`/api/labs/provision/${moduleId}`, { method: 'POST' });
      setEnv(data);
      toast.success('Lab environment launched!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to launch lab');
    } finally {
      setProvisioning(false);
    }
  }, [moduleId, toast]);

  const handleStop = useCallback(async () => {
    if (!env) return;
    setStopping(true);
    try {
      await api(`/api/labs/stop/${env.id}`, { method: 'POST' });
      setEnv(null);
      setCheckResults(undefined);
      setCheckScore(undefined);
      toast.success('Lab environment stopped');
    } catch (err: any) {
      toast.error(err.message || 'Failed to stop lab');
    } finally {
      setStopping(false);
    }
  }, [env, toast]);

  const handleReset = useCallback(async () => {
    if (!env) return;
    setResetting(true);
    try {
      await api(`/api/labs/reset-target/${env.id}`, { method: 'POST' });
      toast.success('Target reset successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset target');
    } finally {
      setResetting(false);
    }
  }, [env, toast]);

  const handleCheckObjectives = useCallback(async () => {
    if (!env) return;
    setChecking(true);
    try {
      const data = await api<{ results: ObjectiveResult[]; score: number; passed: number; total: number }>(
        `/api/labs/check-objectives/${env.id}`, { method: 'POST' }
      );
      setCheckResults(data.results);
      setCheckScore(data.score);
      if (data.score === 100) {
        toast.success('All objectives completed!');
      } else {
        toast.info(`Score: ${data.score}% (${data.passed}/${data.total} objectives)`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to check objectives');
    } finally {
      setChecking(false);
    }
  }, [env, toast]);

  if (!template) {
    return null; // No lab template for this module
  }

  const objectives = template.objectives ? JSON.parse(template.objectives) : [];

  // Not launched yet
  if (!env) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm mb-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
            <Shield className="w-8 h-8 text-emerald-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-900 mb-2">{template.name}</h3>
            <p className="text-slate-600 text-sm mb-4">{template.description}</p>
            <div className="flex items-center gap-4 text-xs text-slate-500 mb-6">
              <span>Time limit: {template.time_limit_minutes} min</span>
              <span>{objectives.length} objectives</span>
            </div>
            <button
              onClick={handleProvision}
              disabled={provisioning}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {provisioning ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Launching containers...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Launch Lab Environment
                </>
              )}
            </button>
          </div>
        </div>
        {provisioning && (
          <div className="mt-4 bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-600">
            <p>Creating isolated Docker containers for your lab session...</p>
            <p className="text-xs text-slate-400 mt-1">This typically takes 5-15 seconds</p>
          </div>
        )}
      </div>
    );
  }

  // Lab is running
  return (
    <div className="space-y-4 mb-6">
      {/* Control bar */}
      <div className="bg-slate-900 rounded-xl px-4 py-3 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm text-emerald-400 font-medium">Running</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 ml-2">
          <Shield className="w-3.5 h-3.5" />
          <span>Attacker: {env.attacker_ip}</span>
          <span className="text-slate-600">|</span>
          <Server className="w-3.5 h-3.5" />
          <span>Target: {env.target_ip}</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <LabTimer expiresAt={env.expires_at} onExpired={() => { setEnv(null); toast.info('Lab session expired'); }} />

          <button
            onClick={handleReset}
            disabled={resetting}
            className="px-3 py-1.5 bg-yellow-600/20 text-yellow-400 text-sm rounded-lg hover:bg-yellow-600/30 transition-colors flex items-center gap-1.5 disabled:opacity-50"
            title="Reset target container to original state"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
            Reset Target
          </button>

          <button
            onClick={handleStop}
            disabled={stopping}
            className="px-3 py-1.5 bg-red-600/20 text-red-400 text-sm rounded-lg hover:bg-red-600/30 transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <Square className="w-3.5 h-3.5" />
            Stop
          </button>
        </div>
      </div>

      {/* Terminals + Objectives */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <WebTerminal envId={env.id} container="attacker" className="h-[400px]" containerHealth={containerHealth?.attacker} />
          <WebTerminal envId={env.id} container="target" className="h-[400px]" containerHealth={containerHealth?.target} />
        </div>
        <div>
          <LabObjectives
            objectives={objectives}
            results={checkResults}
            score={checkScore}
            checking={checking}
            onCheck={handleCheckObjectives}
          />
        </div>
      </div>

      {/* Warning */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800 flex gap-2">
        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span>
          Save your work to files (e.g., <code className="bg-amber-100 px-1 rounded">scan_results.txt</code>) in the attacker container before checking objectives.
          The environment will auto-stop after {template.time_limit_minutes} minutes or 30 minutes of inactivity.
        </span>
      </div>

      {/* Collapsible lab guide toggle */}
      <button
        onClick={() => setShowGuide(!showGuide)}
        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
      >
        {showGuide ? 'Hide' : 'Show'} Lab Guide (step-by-step instructions)
      </button>
    </div>
  );
};
