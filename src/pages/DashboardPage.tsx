import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, CreditCard, Activity } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/store';
import { Skeleton } from '@/components/ui/skeleton';
export function DashboardPage() {
  const bets = useAppStore((state) => state.bets);
  const agents = useAppStore((state) => state.agents);
  const stats = useAppStore((state) => state.dashboardStats);
  const isLoadingBets = useAppStore((state) => state.isLoadingBets);
  const isLoadingStats = useAppStore((state) => state.isLoadingStats);
  const fetchBets = useAppStore((state) => state.fetchBets);
  const fetchAgents = useAppStore((state) => state.fetchAgents);
  const fetchDashboardStats = useAppStore((state) => state.fetchDashboardStats);
  useEffect(() => {
    if (bets.length === 0) fetchBets();
    if (agents.length === 0) fetchAgents();
    if (!stats) fetchDashboardStats();
  }, [fetchBets, fetchAgents, fetchDashboardStats, bets.length, agents.length, stats]);
  const agentsById = new Map(agents.map(a => [a.id, a]));
  const recentTransactions = bets.slice(0, 5);
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">${stats?.totalSales.toFixed(2) ?? '0.00'}</div>}
            <p className="text-xs text-muted-foreground">All-time sales data</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">${stats?.netProfit.toFixed(2) ?? '0.00'}</div>}
            <p className="text-xs text-muted-foreground">Estimated net profit</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{agents.length}</div>
            <p className="text-xs text-muted-foreground">Live Count</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bets Placed</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{bets.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            {isLoadingStats ? <Skeleton className="h-[350px] w-full" /> : (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={stats?.salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => `$${value}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      borderColor: 'hsl(var(--border))',
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="sales" stroke="hsl(var(--primary))" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="profit" stroke="hsl(var(--foreground))" opacity={0.6} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card className="col-span-4 lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingBets ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : recentTransactions.length > 0 ? (
                  recentTransactions.map((txn) => (
                    <TableRow key={txn.id}>
                      <TableCell>
                        <div className="font-medium">{agentsById.get(txn.agentId)?.name || 'Unknown'}</div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            txn.status === 'Won' ? 'default'
                            : txn.status === 'Lost' ? 'destructive'
                            : 'secondary'
                          }
                          className={txn.status === 'Won' ? 'bg-green-600/20 text-green-600 border-green-600/20' : ''}
                        >
                          {txn.status || 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">${txn.amount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center h-24">No recent transactions.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}