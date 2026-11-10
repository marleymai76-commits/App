import * as fs from 'fs';
import * as path from 'path';

export interface SorteioConfig {
  total: number;
  sorteados: number;
  inicio: string;
  ultimoSorteio: number | null;
  proximoSorteio: number;
  ativo: boolean;
  updatedAt?: number;
}

export interface SorteioParticipant {
  id: string;
  uid?: string;
  email: string;
  plano: string;
  joinedAt: number;
}

export interface SorteioWinner {
  id: string;
  uid?: string;
  email: string;
  plano: string;
  sorteadoEm: number;
}

export interface SorteioStoreData {
  config: SorteioConfig;
  participants: SorteioParticipant[];
  winners: SorteioWinner[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_PATH = path.join(DATA_DIR, 'sorteio_store.json');

const DEFAULT_CONFIG: SorteioConfig = {
  total: 10,
  sorteados: 0,
  inicio: "2027-07-01", // 8 meses à frente da data atual (Julho de 2027)
  ultimoSorteio: null,
  proximoSorteio: new Date("2027-07-01T00:00:00Z").getTime(),
  ativo: true
};

let inMemoryStore: SorteioStoreData | null = null;

function ensureDataDir(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (e) {
    // ignore
  }
}

export function getSorteioStore(): SorteioStoreData {
  if (inMemoryStore) {
    return inMemoryStore;
  }

  ensureDataDir();

  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && parsed.config) {
        // Guarantee 8-month ahead date if not configured or if outdated
        if (!parsed.config.inicio || parsed.config.inicio === "2026-08-01") {
          parsed.config.inicio = "2027-07-01";
          parsed.config.proximoSorteio = new Date("2027-07-01T00:00:00Z").getTime();
        }
        inMemoryStore = {
          config: { ...DEFAULT_CONFIG, ...parsed.config },
          participants: Array.isArray(parsed.participants) ? parsed.participants : [],
          winners: Array.isArray(parsed.winners) ? parsed.winners : [],
        };
        return inMemoryStore;
      }
    }
  } catch {
    // ignore file read error, fall back to default
  }

  inMemoryStore = {
    config: { ...DEFAULT_CONFIG },
    participants: [],
    winners: []
  };

  saveSorteioStore(inMemoryStore);
  return inMemoryStore;
}

export function saveSorteioStore(data: SorteioStoreData): void {
  inMemoryStore = data;
  try {
    ensureDataDir();
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch {
    // in-memory fallback remains intact
  }
}

export function getPublicSorteioData() {
  const store = getSorteioStore();
  return {
    success: true,
    config: store.config,
    winners: store.winners,
  };
}

export function getFullSorteioData(uid?: string) {
  const store = getSorteioStore();
  const isParticipating = Boolean(
    uid && store.participants.some(p => p.id === uid || p.uid === uid)
  );

  return {
    success: true,
    config: store.config,
    participants: store.participants,
    winners: store.winners,
    isParticipating,
  };
}

export function addParticipant(uid: string, email: string, plano?: string) {
  const store = getSorteioStore();
  const existingIndex = store.participants.findIndex(p => p.id === uid || p.uid === uid);

  const participant: SorteioParticipant = {
    id: uid,
    uid,
    email,
    plano: plano || "Pocket Pro",
    joinedAt: Date.now(),
  };

  if (existingIndex >= 0) {
    store.participants[existingIndex] = participant;
  } else {
    store.participants.push(participant);
  }

  saveSorteioStore(store);
  return participant;
}

export function drawWinner() {
  const store = getSorteioStore();
  if (store.participants.length === 0) {
    throw new Error("Nenhum participante inscrito no sorteio ainda.");
  }

  const winnerIndex = Math.floor(Math.random() * store.participants.length);
  const picked = store.participants[winnerIndex];

  const winner: SorteioWinner = {
    id: `winner_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    uid: picked.id,
    email: picked.email,
    plano: picked.plano,
    sorteadoEm: Date.now(),
  };

  store.winners.unshift(winner);
  store.config.sorteados = (store.config.sorteados || 0) + 1;
  store.config.ultimoSorteio = Date.now();
  store.config.updatedAt = Date.now();

  saveSorteioStore(store);
  return winner;
}

export function updateSorteioDate(inicio: string, proximoSorteio?: number) {
  const store = getSorteioStore();
  const timestamp = proximoSorteio || new Date(`${inicio}T00:00:00Z`).getTime();
  
  store.config.inicio = inicio;
  store.config.proximoSorteio = timestamp;
  store.config.updatedAt = Date.now();

  saveSorteioStore(store);
  return { inicio, proximoSorteio: timestamp };
}

export function resetSorteioStore() {
  const store = getSorteioStore();
  store.config = {
    ...DEFAULT_CONFIG,
    total: 10,
    sorteados: 0,
    inicio: "2027-07-01",
    ultimoSorteio: null,
    proximoSorteio: new Date("2027-07-01T00:00:00Z").getTime(),
    ativo: true,
    updatedAt: Date.now()
  };
  saveSorteioStore(store);
  return store.config;
}
