import { IndexedEntity } from "./core-utils";
import type { Agent, Bet, LimitsData } from "@shared/types";
import { MOCK_AGENTS, MOCK_BETS, MOCK_LIMITS } from "@shared/mock-data";
// AGENT ENTITY: one DO instance per agent
export class AgentEntity extends IndexedEntity<Agent> {
  static readonly entityName = "agent";
  static readonly indexName = "agents";
  static readonly initialState: Agent = {
    id: "",
    name: "",
    commissionRate: 0,
    status: 'inactive'
  };
  static seedData = MOCK_AGENTS;
}
// BET ENTITY: one DO instance per bet
export class BetEntity extends IndexedEntity<Bet> {
  static readonly entityName = "bet";
  static readonly indexName = "bets";
  static readonly initialState: Bet = {
    id: "",
    agentId: "",
    type: '2D',
    number: "",
    amount: 0,
    timestamp: 0,
  };
  static seedData = MOCK_BETS;
}
// LIMITS ENTITY: a single instance to hold all bet limits
export class LimitEntity extends IndexedEntity<LimitsData> {
  static readonly entityName = "limit";
  static readonly indexName = "limits";
  static readonly initialState: LimitsData = {
    id: "main",
    '2D': {},
    '3D': {},
  };
  static seedData = [MOCK_LIMITS];
}