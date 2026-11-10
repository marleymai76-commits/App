import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebaseClient';
import { getGoogleDriveAccessToken } from './googleDriveAuth';

export interface BackupCollectionInfo {
  name: string;
  label: string;
  count: number;
  data: any[];
}

export interface FirestoreBackupPayload {
  app: string;
  version: string;
  exportTimestamp: string;
  exportedBy: {
    uid: string | null;
    email: string | null;
  };
  environment: string;
  summary: {
    totalCollections: number;
    totalDocuments: number;
    estimatedSizeBytes: number;
  };
  collections: Record<string, any[]>;
}

export interface BackupHistoryEntry {
  id: string;
  timestamp: string;
  type: 'local' | 'gdrive';
  totalDocuments: number;
  sizeFormatted: string;
  fileName: string;
  driveFileId?: string;
  driveLink?: string;
  status: 'concluido' | 'falha';
}

const CRITICAL_COLLECTIONS: { id: string; label: string }[] = [
  { id: 'users', label: 'Usuários e Contas' },
  { id: 'clients', label: 'Clientes & Assinaturas' },
  { id: 'staff', label: 'Equipe e Colaboradores' },
  { id: 'wallets', label: 'Carteiras & Saldo' },
  { id: 'payments', label: 'Histórico de Pagamentos' },
  { id: 'pendingPayments', label: 'Pagamentos Pendentes' },
  { id: 'reservations', label: 'Reservas & Agendamentos' },
  { id: 'client_items', label: 'Itens de Cardápio & Serviços' },
  { id: 'client_settings', label: 'Configurações de Estabelecimento' },
  { id: 'client_metrics', label: 'Métricas e Analytics' },
  { id: 'auditLogs', label: 'Logs de Auditoria' },
  { id: 'admins', label: 'Administradores do Sistema' }
];

const BACKUP_STORAGE_KEY = 'sfx_backup_history_v1';

/**
 * Collects and aggregates all critical user and system data from Firestore.
 */
export async function generateFirestoreBackup(): Promise<{
  payload: FirestoreBackupPayload;
  collectionsDetails: BackupCollectionInfo[];
}> {
  const collectionsMap: Record<string, any[]> = {};
  const collectionsDetails: BackupCollectionInfo[] = [];
  let totalDocsCount = 0;

  for (const col of CRITICAL_COLLECTIONS) {
    try {
      const colRef = collection(db, col.id);
      const snapshot = await getDocs(colRef);
      const items: any[] = [];

      snapshot.forEach((docSnapshot) => {
        items.push({
          _id: docSnapshot.id,
          ...docSnapshot.data(),
        });
      });

      collectionsMap[col.id] = items;
      totalDocsCount += items.length;
      collectionsDetails.push({
        name: col.id,
        label: col.label,
        count: items.length,
        data: items,
      });
    } catch (err) {
      console.warn(`[BackupService] Aviso ao consultar coleção ${col.id}:`, err);
      collectionsMap[col.id] = [];
      collectionsDetails.push({
        name: col.id,
        label: col.label,
        count: 0,
        data: [],
      });
    }
  }

  const jsonString = JSON.stringify(collectionsMap);
  const sizeBytes = new Blob([jsonString]).size;

  const payload: FirestoreBackupPayload = {
    app: 'SISTENFOX',
    version: '3.5.0',
    exportTimestamp: new Date().toISOString(),
    exportedBy: {
      uid: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
    },
    environment: 'production',
    summary: {
      totalCollections: Object.keys(collectionsMap).length,
      totalDocuments: totalDocsCount,
      estimatedSizeBytes: sizeBytes,
    },
    collections: collectionsMap,
  };

  return { payload, collectionsDetails };
}

/**
 * Triggers a local JSON file download of the backup payload to the user's computer.
 */
export function downloadBackupLocally(payload: FirestoreBackupPayload): { fileName: string; sizeFormatted: string } {
  const jsonContent = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const fileName = `sistenfox-backup-${dateStr}.json`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  const sizeFormatted = formatFileSize(blob.size);

  saveBackupHistoryEntry({
    id: `local-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'local',
    totalDocuments: payload.summary.totalDocuments,
    sizeFormatted,
    fileName,
    status: 'concluido',
  });

  return { fileName, sizeFormatted };
}

/**
 * Uploads the Firestore JSON backup directly into the user's Google Drive.
 * Uses multipart upload with file metadata and content.
 */
export async function uploadBackupToGoogleDrive(payload: FirestoreBackupPayload): Promise<{
  id: string;
  name: string;
  webViewLink: string;
  sizeFormatted: string;
}> {
  const { accessToken } = await getGoogleDriveAccessToken();
  const jsonContent = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const fileName = `sistenfox-backup-${dateStr}.json`;

  const metadata = {
    name: fileName,
    mimeType: 'application/json',
    description: `Backup de segurança dos dados do Firestore do SISTENFOX gerado em ${new Date().toLocaleString('pt-BR')}. Total de ${payload.summary.totalDocuments} documentos.`,
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    jsonContent +
    closeDelimiter;

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink,size',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!response.ok) {
    const errorDetails = await response.text();
    throw new Error(`Falha no upload para o Google Drive (${response.status}): ${errorDetails}`);
  }

  const driveFile = await response.json();
  const webViewLink = driveFile.webViewLink || `https://drive.google.com/file/d/${driveFile.id}/view`;
  const sizeFormatted = formatFileSize(blob.size);

  saveBackupHistoryEntry({
    id: `gdrive-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'gdrive',
    totalDocuments: payload.summary.totalDocuments,
    sizeFormatted,
    fileName,
    driveFileId: driveFile.id,
    driveLink: webViewLink,
    status: 'concluido',
  });

  return {
    id: driveFile.id,
    name: fileName,
    webViewLink,
    sizeFormatted,
  };
}

/**
 * Returns formatted file size (KB / MB).
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Retrieves the local backup activity log.
 */
export function getBackupHistory(): BackupHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(BACKUP_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Saves a new backup entry to history.
 */
export function saveBackupHistoryEntry(entry: BackupHistoryEntry): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getBackupHistory();
    const updated = [entry, ...current].slice(0, 30);
    localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('[BackupService] Não foi possível salvar histórico:', e);
  }
}

/**
 * Clears the backup history.
 */
export function clearBackupHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(BACKUP_STORAGE_KEY);
}
