import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { api } from '@/lib/api-client';
import type { Agent, Bet, BetStatus, BetType, DashboardStats, GroupedBetReport, ReportSession, Limits, LimitsData, ReportPeriod } from '@shared/types';
type ReportParams = {
  gameType: BetType;
} & ({
  date: Date;
  session: ReportSession;
} | {
  year: number;
  month: number;
  period: ReportPeriod;
});
export type AppState = {
  agents: Agent[];
  bets: Bet[];
  dashboardStats: DashboardStats | null;
  reportsData: GroupedBetReport[] | null;
  limits: Limits | null;
  searchQuery: string;
  isLoadingAgents: boolean;
  isLoadingBets: boolean;
  isLoadingStats: boolean;
  isLoadingReports: boolean;
  isLoadingLimits: boolean;
  error: string | null;
};
export type AppActions = {
  fetchAgents: () => Promise<void>;
  addAgent: (agentData: Omit<Agent, 'id' | 'status'>) => Promise<Agent>;
  fetchBets: () => Promise<void>;
  addBet: (betData: Omit<Bet, 'id' | 'timestamp' | 'status'>) => Promise<Bet>;
  addBulkBets: (betsData: Omit<Bet, 'id' | 'timestamp' | 'status'>[]) => Promise<Bet[]>;
  updateBetStatus: (betId: string, status: BetStatus) => Promise<void>;
  fetchDashboardStats: () => Promise<void>;
  fetchReports: (params: ReportParams) => Promise<void>;
  fetchLimits: () => Promise<void>;
  updateLimits: (newLimits: Limits) => Promise<void>;
  setSearchQuery: (query: string) => void;
};
export const useAppStore = create<AppState & AppActions>()(
  immer((set, get) => ({
    agents: [],
    bets: [],
    dashboardStats: null,
    reportsData: null,
    limits: null,
    searchQuery: '',
    isLoadingAgents: false,
    isLoadingBets: false,
    isLoadingStats: false,
    isLoadingReports: false,
    isLoadingLimits: false,
    error: null,
    setSearchQuery: (query: string) => {
      set({ searchQuery: query });
    },
    fetchAgents: async () => {
      set({ isLoadingAgents: true, error: null });
      try {
        const response = await api<{ items: Agent[] }>('/api/agents');
        set((state) => {
          state.agents = response.items;
          state.isLoadingAgents = false;
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch agents';
        set({ isLoadingAgents: false, error: errorMessage });
        console.error(errorMessage);
      }
    },
    addAgent: async (agentData) => {
      try {
        const newAgent = await api<Agent>('/api/agents', {
          method: 'POST',
          body: JSON.stringify(agentData),
        });
        set((state) => {
          state.agents.push(newAgent);
        });
        return newAgent;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to add agent';
        set({ error: errorMessage });
        console.error(errorMessage);
        throw new Error(errorMessage);
      }
    },
    fetchBets: async () => {
      set({ isLoadingBets: true, error: null });
      try {
        const response = await api<{ items: Bet[] }>('/api/bets');
        const sortedBets = response.items.sort((a, b) => b.timestamp - a.timestamp);
        set((state) => {
          state.bets = sortedBets;
          state.isLoadingBets = false;
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch bets';
        set({ isLoadingBets: false, error: errorMessage });
        console.error(errorMessage);
      }
    },
    addBet: async (betData) => {
      try {
        const newBet = await api<Bet>('/api/bets', {
          method: 'POST',
          body: JSON.stringify(betData),
        });
        set((state) => {
          state.bets.unshift(newBet);
        });
        return newBet;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to add bet';
        set({ error: errorMessage });
        console.error(errorMessage);
        throw new Error(errorMessage);
      }
    },
    addBulkBets: async (betsData) => {
      try {
        const response = await api<Bet[]>('/api/bets/bulk', {
          method: 'POST',
          body: JSON.stringify(betsData),
        });
        set((state) => {
          state.bets.unshift(...response.sort((a, b) => b.timestamp - a.timestamp));
        });
        get().fetchDashboardStats();
        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to add bulk bets';
        set({ error: errorMessage });
        console.error(errorMessage);
        throw new Error(errorMessage);
      }
    },
    updateBetStatus: async (betId, status) => {
      try {
        const updatedBet = await api<Bet>(`/api/bets/${betId}/status`, {
          method: 'PUT',
          body: JSON.stringify({ status }),
        });
        set(state => {
          const betIndex = state.bets.findIndex(b => b.id === betId);
          if (betIndex !== -1) {
            state.bets[betIndex] = updatedBet;
          }
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update bet status';
        set({ error: errorMessage });
        console.error(errorMessage);
        throw new Error(errorMessage);
      }
    },
    fetchDashboardStats: async () => {
      set({ isLoadingStats: true, error: null });
      try {
        const stats = await api<DashboardStats>('/api/dashboard/stats');
        set(state => {
          state.dashboardStats = stats;
          state.isLoadingStats = false;
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch dashboard stats';
        set({ isLoadingStats: false, error: errorMessage });
        console.error(errorMessage);
      }
    },
    fetchReports: async (params) => {
      set({ isLoadingReports: true, error: null, reportsData: null });
      try {
        const query = new URLSearchParams({ gameType: params.gameType });
        if ('date' in params) {
          query.append('date', params.date.toISOString().split('T')[0]);
          query.append('session', params.session);
        } else {
          query.append('year', String(params.year));
          query.append('month', String(params.month));
          query.append('period', params.period);
        }
        const reportData = await api<GroupedBetReport[]>(`/api/reports/by-number?${query.toString()}`);
        set(state => {
          state.reportsData = reportData;
          state.isLoadingReports = false;
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch reports';
        set({ isLoadingReports: false, error: errorMessage });
        console.error(errorMessage);
      }
    },
    fetchLimits: async () => {
      set({ isLoadingLimits: true, error: null });
      try {
        const limitsData = await api<LimitsData>('/api/limits');
        set(state => {
          state.limits = { '2D': limitsData['2D'], '3D': limitsData['3D'] };
          state.isLoadingLimits = false;
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch limits';
        set({ isLoadingLimits: false, error: errorMessage });
        console.error(errorMessage);
      }
    },
    updateLimits: async (newLimits) => {
      try {
        const updatedLimitsData = await api<LimitsData>('/api/limits', {
          method: 'POST',
          body: JSON.stringify(newLimits),
        });
        set(state => {
          state.limits = { '2D': updatedLimitsData['2D'], '3D': updatedLimitsData['3D'] };
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update limits';
        set({ error: errorMessage });
        console.error(errorMessage);
        throw new Error(errorMessage);
      }
    },
  }))
);