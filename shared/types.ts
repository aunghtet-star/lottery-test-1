export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export interface Agent {
  id: string;
  name: string;
  commissionRate: number; // as a percentage, e.g., 5 for 5%
  parentId?: string; // For hierarchical agent structures
  status: 'active' | 'inactive';
}
export type BetType = '2D' | '3D';
export type BetStatus = 'Pending' | 'Won' | 'Lost';
export interface Bet {
  id: string;
  agentId: string;
  type: BetType;
  number: string; // e.g., "42" for 2D, "123" for 3D
  amount: number;
  timestamp: number; // epoch millis
  status?: BetStatus;
}
export interface LedgerEntry {
  id: string;
  betId: string;
  agentId: string;
  amount: number;
  type: 'credit' | 'debit'; // credit = win, debit = bet placed
  timestamp: number;
  description: string;
}
export interface DashboardStats {
  totalSales: number;
  netProfit: number;
  salesData: { name: string; sales: number; profit: number }[];
}
export interface GroupedBetReport {
  number: string;
  totalAmount: number;
  betCount: number;
}
export type ReportSession = 'morning' | 'evening';
export type ReportPeriod = 'first_half' | 'second_half';
export type Limits = {
  '2D': Record<string, number>;
  '3D': Record<string, number>;
};
export interface LimitsData extends Limits {
  id: 'main';
}