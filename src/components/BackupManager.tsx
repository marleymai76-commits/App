import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database, 
  Download, 
  Cloud, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  HardDrive, 
  ShieldCheck, 
  ExternalLink, 
  Clock, 
  FileJson, 
  Trash2, 
  Layers,
  ChevronDown,
  ChevronUp,
  FolderArchive
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  generateFirestoreBackup, 
  downloadBackupLocally, 
  uploadBackupToGoogleDrive, 
  getBackupHistory, 
  clearBackupHistory,
  BackupHistoryEntry,
  BackupCollectionInfo,
  FirestoreBackupPayload
} from '../services/backupService';
import { getGoogleDriveAccessToken, hasGoogleDriveToken } from '../services/googleDriveAuth';
import DashboardHeader from './DashboardHeader';
import { cn } from '../lib/utils';

interface BackupManagerProps {
  embedded?: boolean;
  onMenuToggle?: () => void;
}

export default function BackupManager({ embedded = false, onMenuToggle }: BackupManagerProps) {
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [loadingDrive, setLoadingDrive] = useState(false);
  const [inspecting, setInspecting] = useState(false);
  const [collectionsInfo, setCollectionsInfo] = useState<BackupCollectionInfo[]>([]);
  const [history, setHistory] = useState<BackupHistoryEntry[]>([]);
  const [expandedCol, setExpandedCol] = useState<string | null>(null);
  const [showDriveConfirmModal, setShowDriveConfirmModal] = useState(false);
  const [preparedPayload, setPreparedPayload] = useState<FirestoreBackupPayload | null>(null);

  useEffect(() => {
    loadHistory();
    inspectFirestore();
  }, []);

  const loadHistory = () => {
    setHistory(getBackupHistory());
  };

  const inspectFirestore = async () => {
    try {
      setInspecting(true);
      const { collectionsDetails, payload } = await generateFirestoreBackup();
      setCollectionsInfo(collectionsDetails);
      setPreparedPayload(payload);
    } catch (err: any) {
      console.error('[BackupManager] Erro ao inspecionar Firestore:', err);
      toast.error('Não foi possível analisar todas as coleções do Firestore.');
    } finally {
      setInspecting(false);
    }
  };

  const totalDocsCount = collectionsInfo.reduce((acc, curr) => acc + curr.count, 0);

  // Trigger Local Download
  const handleLocalDownload = async () => {
    setLoadingLocal(true);
    try {
      let payloadToUse = preparedPayload;
      if (!payloadToUse) {
        const result = await generateFirestoreBackup();
        payloadToUse = result.payload;
        setCollectionsInfo(result.collectionsDetails);
        setPreparedPayload(result.payload);
      }

      const { fileName, sizeFormatted } = downloadBackupLocally(payloadToUse);
      loadHistory();
      toast.success(`Backup local concluído! Arquivo ${fileName} (${sizeFormatted}) baixado com sucesso.`);
    } catch (err: any) {
      console.error('[BackupManager] Falha no download local:', err);
      toast.error(err.message || 'Erro ao gerar backup local.');
    } finally {
      setLoadingLocal(false);
    }
  };

  // Step 1: Open Confirmation Modal for Google Drive Upload
  const handlePromptDriveUpload = async () => {
    try {
      if (!preparedPayload) {
        setInspecting(true);
        const { payload, collectionsDetails } = await generateFirestoreBackup();
        setPreparedPayload(payload);
        setCollectionsInfo(collectionsDetails);
      }
      setShowDriveConfirmModal(true);
    } catch (err: any) {
      toast.error('Falha ao preparar dados para o Google Drive.');
    } finally {
      setInspecting(false);
    }
  };

  // Step 2: User Confirmed Google Drive Action
  const handleExecuteDriveUpload = async () => {
    setShowDriveConfirmModal(false);
    setLoadingDrive(true);
    try {
      let payloadToUse = preparedPayload;
      if (!payloadToUse) {
        const result = await generateFirestoreBackup();
        payloadToUse = result.payload;
        setCollectionsInfo(result.collectionsDetails);
        setPreparedPayload(result.payload);
      }

      const result = await uploadBackupToGoogleDrive(payloadToUse);
      loadHistory();
      toast.success(
        `Backup enviado com sucesso para o Google Drive! Arquivo: ${result.name}`,
        {
          action: {
            label: 'Abrir no Drive',
            onClick: () => window.open(result.webViewLink, '_blank'),
          },
          duration: 8000,
        }
      );
    } catch (err: any) {
      console.error('[BackupManager] Erro ao enviar para o Google Drive:', err);
      toast.error(err.message || 'Falha na comunicação com o Google Drive.');
    } finally {
      setLoadingDrive(false);
    }
  };

  const handleClearHistory = () => {
    if (confirm('Deseja realmente limpar o registro do histórico de backups deste dispositivo?')) {
      clearBackupHistory();
      loadHistory();
      toast.info('Histórico de backups limpo.');
    }
  };

  return (
    <div className={cn("space-y-8", !embedded && "pb-20")}>
      {!embedded && (
        <DashboardHeader
          title="Backup & Segurança de Dados"
          subtitle="Faça download dos dados críticos do Firestore ou sincronize na nuvem do Google Drive."
          onMenuToggle={onMenuToggle}
        />
      )}

      {/* Confirmation Modal for Google Drive Upload */}
      <AnimatePresence>
        {showDriveConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border border-slate-300 dark:border-gold/20 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-slate-900 dark:text-gold">
                <div className="p-3 bg-blue-50 dark:bg-gold/10 rounded-xl border border-blue-200 dark:border-gold/20 text-blue-600 dark:text-gold">
                  <Cloud size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                    Confirmar Envio para o Google Drive
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Sincronização em nuvem segura
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-zinc-800/60 p-4 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs text-slate-700 dark:text-zinc-300 space-y-2">
                <p>
                  Será gerado um arquivo <strong className="text-slate-900 dark:text-white">JSON de backup</strong> com todas as coleções críticas do Firestore e enviado para a raiz da sua conta Google Drive.
                </p>
                <div className="flex justify-between py-1 border-t border-slate-200 dark:border-zinc-700 font-medium">
                  <span>Documentos a incluir:</span>
                  <span className="font-bold text-slate-900 dark:text-gold">{totalDocsCount} registros</span>
                </div>
                <div className="flex justify-between py-1 border-t border-slate-200 dark:border-zinc-700 font-medium">
                  <span>Coleções analisadas:</span>
                  <span className="font-bold text-slate-900 dark:text-gold">{collectionsInfo.length} coleções</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                O arquivo ficará privado na sua conta Google e acessível a qualquer momento. Se solicitado, conceda permissão no pop-up do Google.
              </p>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDriveConfirmModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleExecuteDriveUpload}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-gold dark:hover:bg-[#e6c75f] dark:text-black rounded-xl transition-all shadow-md flex items-center gap-1.5"
                >
                  <Cloud size={14} />
                  Confirmar e Salvar no Drive
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Overview Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="premium-card border border-slate-200 dark:border-gold/10 p-5 bg-white dark:bg-card-app shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-bold text-slate-500 dark:text-zinc-400 tracking-wider">
              Documentos Mapeados
            </span>
            <Database className="text-slate-800 dark:text-gold w-5 h-5" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {inspecting ? (
              <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
            ) : (
              totalDocsCount
            )}
          </div>
          <p className="text-xs text-slate-600 dark:text-zinc-400 mt-2 font-medium">
            Em {collectionsInfo.length} coleções de dados críticas
          </p>
        </div>

        <div className="premium-card border border-slate-200 dark:border-gold/10 p-5 bg-white dark:bg-card-app shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-bold text-slate-500 dark:text-zinc-400 tracking-wider">
              Google Drive Integrado
            </span>
            <Cloud className="text-blue-600 dark:text-gold w-5 h-5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              OAuth 2.0 Ativo
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-zinc-400 mt-2 font-medium">
            Escopo seguro: <code className="bg-slate-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-[10px]">drive.file</code>
          </p>
        </div>

        <div className="premium-card border border-slate-200 dark:border-gold/10 p-5 bg-white dark:bg-card-app shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-bold text-slate-500 dark:text-zinc-400 tracking-wider">
              Último Backup
            </span>
            <Clock className="text-slate-800 dark:text-gold w-5 h-5" />
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white">
            {history.length > 0
              ? new Date(history[0].timestamp).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Nenhum recente'}
          </div>
          <p className="text-xs text-slate-600 dark:text-zinc-400 mt-2 font-medium">
            {history.length > 0 ? (
              <span className="capitalize">{history[0].type === 'gdrive' ? 'Google Drive' : 'Download Local'} ({history[0].sizeFormatted})</span>
            ) : (
              'Execute uma exportação abaixo'
            )}
          </p>
        </div>
      </div>

      {/* Main Action Trigger Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Local Download Card */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-gold/20 bg-white dark:bg-card-app shadow-md flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-gold/10 border border-slate-300 dark:border-gold/20 flex items-center justify-center text-slate-900 dark:text-gold">
              <Download size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Download Local (JSON)
              </h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 leading-relaxed">
                Extrai instantaneamente um arquivo JSON contendo todas as contas, clientes, histórico de pagamentos, agendamentos e transações para armazenamento no seu computador ou pendrive.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/40 font-medium">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>Compatível com qualquer ferramenta de análise e restauração de dados.</span>
            </div>
          </div>

          <button
            onClick={handleLocalDownload}
            disabled={loadingLocal}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:border dark:border-gold/30 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {loadingLocal ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Gerando arquivo JSON...
              </>
            ) : (
              <>
                <Download size={16} />
                Baixar Backup Agora (JSON)
              </>
            )}
          </button>
        </div>

        {/* Google Drive Card */}
        <div className="p-6 rounded-2xl border border-blue-200 dark:border-gold/20 bg-white dark:bg-card-app shadow-md flex flex-col justify-between space-y-6 relative overflow-hidden">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-gold/10 border border-blue-200 dark:border-gold/20 flex items-center justify-center text-blue-600 dark:text-gold">
              <Cloud size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Backup no Google Drive
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-gold/20 dark:text-gold border border-blue-200 dark:border-gold/30">
                  Nuvem
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 leading-relaxed">
                Salva o backup estruturado diretamente no seu Google Drive com versionamento cronológico. Proteção contra perdas de dados e acessível de qualquer dispositivo.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-cyan-400 bg-blue-50 dark:bg-cyan-950/30 p-2.5 rounded-xl border border-blue-200 dark:border-cyan-800/40 font-medium">
              <ShieldCheck size={16} className="shrink-0" />
              <span>Autenticação OAuth oficial com confirmação do usuário antes de salvar.</span>
            </div>
          </div>

          <button
            onClick={handlePromptDriveUpload}
            disabled={loadingDrive || inspecting}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white dark:bg-gold dark:hover:bg-[#e6c75f] dark:text-black transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
          >
            {loadingDrive ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Enviando para o Google Drive...
              </>
            ) : (
              <>
                <Cloud size={16} />
                Salvar no Meu Google Drive
              </>
            )}
          </button>
        </div>
      </div>

      {/* Firestore Collections Explorer */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-gold/10 bg-white dark:bg-card-app shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers size={18} className="text-slate-800 dark:text-gold" />
              Coleções Monitoradas no Firestore
            </h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400">
              Resumo dos documentos mapeados em tempo real prontos para empacotamento.
            </p>
          </div>
          <button
            onClick={inspectFirestore}
            disabled={inspecting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold transition-all w-fit disabled:opacity-50"
          >
            <RefreshCw size={13} className={cn(inspecting && "animate-spin")} />
            Atualizar Mapeamento
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {collectionsInfo.map((col) => {
            const isExpanded = expandedCol === col.name;
            return (
              <div
                key={col.name}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50 hover:border-slate-300 dark:hover:border-gold/20 transition-all flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white block">
                      {col.label}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500 dark:text-zinc-500">
                      {col.name}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-800 dark:bg-gold/10 dark:text-gold border border-slate-300 dark:border-gold/20">
                    {col.count} {col.count === 1 ? 'doc' : 'docs'}
                  </span>
                </div>

                {col.count > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-200 dark:border-zinc-800/80">
                    <button
                      onClick={() => setExpandedCol(isExpanded ? null : col.name)}
                      className="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-gold/80 hover:text-slate-900 dark:hover:text-gold flex items-center justify-between w-full"
                    >
                      <span>{isExpanded ? 'Ocultar Detalhes' : 'Ver Amostra'}</span>
                      {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                    {isExpanded && (
                      <pre className="mt-2 p-2 bg-slate-900 text-emerald-400 rounded-lg text-[9px] max-h-36 overflow-auto font-mono">
                        {JSON.stringify(col.data.slice(0, 2), null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Backup History Table */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-gold/10 bg-white dark:bg-card-app shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FolderArchive size={18} className="text-slate-800 dark:text-gold" />
              Histórico Recente de Backups
            </h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400">
              Registros das últimas exportações realizadas neste navegador.
            </p>
          </div>
          {history.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 dark:text-red-400 font-bold hover:underline"
            >
              <Trash2 size={13} />
              Limpar Registro
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl text-slate-500 dark:text-zinc-500 text-xs">
            Nenhum backup registrado até o momento. Clique em "Baixar Backup Agora" ou "Salvar no Meu Google Drive" acima para gerar seu primeiro ponto de restauração.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-zinc-800 text-[10px] uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-bold">
                  <th className="py-2.5">Data & Hora</th>
                  <th className="py-2.5">Destino</th>
                  <th className="py-2.5">Nome do Arquivo</th>
                  <th className="py-2.5">Registros</th>
                  <th className="py-2.5">Tamanho</th>
                  <th className="py-2.5 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                {history.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 font-medium text-slate-900 dark:text-white">
                      {new Date(entry.timestamp).toLocaleString('pt-BR')}
                    </td>
                    <td className="py-3">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                          entry.type === 'gdrive'
                            ? "bg-blue-100 text-blue-800 dark:bg-gold/20 dark:text-gold"
                            : "bg-slate-200 text-slate-800 dark:bg-zinc-800 dark:text-zinc-300"
                        )}
                      >
                        {entry.type === 'gdrive' ? 'Google Drive' : 'Download Local'}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-[11px] text-slate-700 dark:text-zinc-300">
                      {entry.fileName}
                    </td>
                    <td className="py-3 font-semibold text-slate-900 dark:text-white">
                      {entry.totalDocuments} docs
                    </td>
                    <td className="py-3 text-slate-600 dark:text-zinc-400">
                      {entry.sizeFormatted}
                    </td>
                    <td className="py-3 text-right">
                      {entry.driveLink ? (
                        <a
                          href={entry.driveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 dark:text-gold font-bold hover:underline"
                        >
                          <span>Abrir</span>
                          <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span className="text-slate-400 dark:text-zinc-600 text-[11px]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
