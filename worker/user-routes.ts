import { Hono } from "hono";
import type { Env } from './core-utils';
import { AgentEntity, BetEntity, LimitEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import { Agent, Bet, BetStatus, BetType, DashboardStats, GroupedBetReport, ReportSession, Limits, ReportPeriod } from "@shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // AGENTS
  app.get('/api/agents', async (c) => {
    await AgentEntity.ensureSeed(c.env);
    const cq = c.req.query('cursor');
    const lq = c.req.query('limit');
    const page = await AgentEntity.list(c.env, cq ?? null, lq ? Math.max(1, (Number(lq) | 0)) : undefined);
    return ok(c, page);
  });
  app.post('/api/agents', async (c) => {
    const { name, commissionRate } = (await c.req.json()) as Partial<Agent>;
    if (!name?.trim()) return bad(c, 'Agent name is required');
    if (typeof commissionRate !== 'number' || commissionRate < 0) return bad(c, 'A valid commission rate is required');
    const newAgent: Agent = {
      id: crypto.randomUUID(),
      name: name.trim(),
      commissionRate,
      status: 'active'
    };
    const created = await AgentEntity.create(c.env, newAgent);
    return ok(c, created);
  });
  app.get('/api/agents/:id', async (c) => {
    const id = c.req.param('id');
    const agent = new AgentEntity(c.env, id);
    if (!await agent.exists()) return notFound(c, 'Agent not found');
    return ok(c, await agent.getState());
  });
  // BETS
  app.get('/api/bets', async (c) => {
    await BetEntity.ensureSeed(c.env);
    const cq = c.req.query('cursor');
    const lq = c.req.query('limit');
    const page = await BetEntity.list(c.env, cq ?? null, lq ? Math.max(1, (Number(lq) | 0)) : 1000); // Fetch up to 1000
    return ok(c, page);
  });
  app.post('/api/bets', async (c) => {
    const body = (await c.req.json()) as Partial<Bet>;
    if (!isStr(body.agentId)) return bad(c, 'agentId is required');
    if (body.type !== '2D' && body.type !== '3D') return bad(c, 'Invalid bet type');
    if (!isStr(body.number)) return bad(c, 'Bet number is required');
    if (typeof body.amount !== 'number' || body.amount <= 0) return bad(c, 'A valid amount is required');
    const newBet: Bet = {
      id: crypto.randomUUID(),
      agentId: body.agentId,
      type: body.type,
      number: body.number,
      amount: body.amount,
      timestamp: Date.now(),
      status: 'Pending',
    };
    const created = await BetEntity.create(c.env, newBet);
    return ok(c, created);
  });
  app.post('/api/bets/bulk', async (c) => {
    const body = (await c.req.json()) as Partial<Bet>[];
    if (!Array.isArray(body)) return bad(c, 'Request body must be an array of bets');
    const newBets: Bet[] = [];
    for (const bet of body) {
      if (!isStr(bet.agentId)) return bad(c, 'agentId is required for all bets');
      if (bet.type !== '2D' && bet.type !== '3D') return bad(c, 'Invalid bet type');
      if (!isStr(bet.number)) return bad(c, 'Bet number is required for all bets');
      if (typeof bet.amount !== 'number' || bet.amount <= 0) return bad(c, 'A valid amount is required for all bets');
      newBets.push({
        id: crypto.randomUUID(),
        agentId: bet.agentId,
        type: bet.type,
        number: bet.number,
        amount: bet.amount,
        timestamp: Date.now(),
        status: 'Pending',
      });
    }
    const createdBets = await Promise.all(newBets.map(b => BetEntity.create(c.env, b)));
    return ok(c, createdBets);
  });
  app.put('/api/bets/:id/status', async (c) => {
    const id = c.req.param('id');
    const { status } = (await c.req.json()) as { status: BetStatus };
    if (!status || !['Pending', 'Won', 'Lost'].includes(status)) {
      return bad(c, 'Invalid status provided.');
    }
    const betEntity = new BetEntity(c.env, id);
    if (!(await betEntity.exists())) {
      return notFound(c, 'Bet not found');
    }
    await betEntity.patch({ status });
    const updatedBet = await betEntity.getState();
    return ok(c, updatedBet);
  });
  // DASHBOARD
  app.get('/api/dashboard/stats', async (c) => {
    const { items: bets } = await BetEntity.list(c.env, null, 10000); // Fetch all bets for calculation
    const totalSales = bets.reduce((sum, bet) => sum + bet.amount, 0);
    // Assuming a simple profit model for demonstration
    const netProfit = totalSales * 0.15; // Example: 15% profit margin
    const salesByMonth: { [key: string]: { sales: number; profit: number } } = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    bets.forEach(bet => {
      const date = new Date(bet.timestamp);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      if (!salesByMonth[monthKey]) {
        salesByMonth[monthKey] = { sales: 0, profit: 0 };
      }
      salesByMonth[monthKey].sales += bet.amount;
      salesByMonth[monthKey].profit += bet.amount * 0.15; // Same 15% margin
    });
    const salesData = Object.entries(salesByMonth)
      .map(([key, value]) => {
        const [year, month] = key.split('-');
        return {
          name: `${monthNames[parseInt(month, 10)]} '${String(year).slice(-2)}`,
          sales: value.sales,
          profit: value.profit,
          year: parseInt(year, 10),
          month: parseInt(month, 10),
        };
      })
      .sort((a, b) => a.year - b.year || a.month - b.month)
      .slice(-7); // Get last 7 months
    const stats: DashboardStats = {
      totalSales,
      netProfit,
      salesData,
    };
    return ok(c, stats);
  });
  // REPORTS
  app.get('/api/reports/by-number', async (c) => {
    const gameType = c.req.query('gameType') as BetType;
    if (gameType !== '2D' && gameType !== '3D') {
      return bad(c, 'A valid gameType (2D/3D) is required.');
    }
    let startDate: Date, endDate: Date;
    if (gameType === '2D') {
      const dateStr = c.req.query('date'); // YYYY-MM-DD
      const session = c.req.query('session') as ReportSession;
      if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr) || (session !== 'morning' && session !== 'evening')) {
        return bad(c, 'For 2D reports, date (YYYY-MM-DD) and session (morning/evening) are required.');
      }
      const [year, month, day] = dateStr.split('-').map(Number);
      if (session === 'morning') {
        startDate = new Date(Date.UTC(year, month - 1, day, 0, 1, 0, 0)); // 12:01 AM
        endDate = new Date(Date.UTC(year, month - 1, day, 12, 1, 0, 0)); // 12:01 PM
      } else { // evening
        startDate = new Date(Date.UTC(year, month - 1, day, 12, 2, 0, 0)); // 12:02 PM
        endDate = new Date(Date.UTC(year, month - 1, day, 16, 30, 0, 0)); // 4:30 PM
      }
    } else { // gameType === '3D'
      const yearStr = c.req.query('year');
      const monthStr = c.req.query('month');
      const period = c.req.query('period') as ReportPeriod;
      const year = parseInt(yearStr || '', 10);
      const month = parseInt(monthStr || '', 10);
      if (isNaN(year) || isNaN(month) || (period !== 'first_half' && period !== 'second_half')) {
        return bad(c, 'For 3D reports, year, month, and period (first_half/second_half) are required.');
      }
      if (period === 'first_half') {
        startDate = new Date(Date.UTC(year, month, 1));
        endDate = new Date(Date.UTC(year, month, 15, 23, 59, 59, 999));
      } else { // second_half
        startDate = new Date(Date.UTC(year, month, 16));
        const lastDay = new Date(year, month + 1, 0).getDate();
        endDate = new Date(Date.UTC(year, month, lastDay, 23, 59, 59, 999));
      }
    }
    const { items: allBets } = await BetEntity.list(c.env, null, 10000);
    const filteredBets = allBets.filter(bet => {
      const betDate = new Date(bet.timestamp);
      return bet.type === gameType && betDate >= startDate && betDate <= endDate;
    });
    const groupedBets = filteredBets.reduce((acc, bet) => {
      if (!acc[bet.number]) {
        acc[bet.number] = { number: bet.number, totalAmount: 0, betCount: 0 };
      }
      acc[bet.number].totalAmount += bet.amount;
      acc[bet.number].betCount += 1;
      return acc;
    }, {} as Record<string, GroupedBetReport>);
    const reportData = Object.values(groupedBets).sort((a, b) => b.totalAmount - a.totalAmount);
    return ok(c, reportData);
  });
  // LIMITS
  app.get('/api/limits', async (c) => {
    await LimitEntity.ensureSeed(c.env);
    const limitEntity = new LimitEntity(c.env, 'main');
    const limits = await limitEntity.getState();
    return ok(c, limits);
  });
  app.post('/api/limits', async (c) => {
    const newLimits = (await c.req.json()) as Limits;
    if (!newLimits || typeof newLimits['2D'] !== 'object' || typeof newLimits['3D'] !== 'object') {
      return bad(c, 'Invalid limits format.');
    }
    const limitEntity = new LimitEntity(c.env, 'main');
    await limitEntity.patch(newLimits);
    const updatedLimits = await limitEntity.getState();
    return ok(c, updatedLimits);
  });
}