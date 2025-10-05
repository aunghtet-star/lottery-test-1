import type { Agent, Bet, LimitsData } from './types';
export const MOCK_AGENTS: Agent[] = [
  { id: 'agent-001', name: 'John Doe', commissionRate: 5, status: 'active' },
  { id: 'agent-002', name: 'Jane Smith', commissionRate: 4.5, status: 'active' },
  { id: 'agent-003', name: 'Mike Johnson', commissionRate: 5.5, parentId: 'agent-001', status: 'inactive' },
];
export const MOCK_BETS: Bet[] = [
  { id: 'bet-001', agentId: 'agent-001', type: '2D', number: '42', amount: 100, timestamp: Date.now() - 10000 },
  { id: 'bet-002', agentId: 'agent-002', type: '3D', number: '123', amount: 50, timestamp: Date.now() - 20000 },
  { id: 'bet-003', agentId: 'agent-001', type: '2D', number: '88', amount: 200, timestamp: Date.now() - 30000 },
];
export const MOCK_LIMITS: LimitsData = {
  id: 'main',
  '2D': {
    '12': 500,
    '45': 1000,
    '88': 250,
  },
  '3D': {
    '123': 200,
    '789': 350,
  },
};