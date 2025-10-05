import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useAppStore } from '@/store/store';
import { toast } from 'sonner';
import type { BetType } from '@shared/types';
const betFormSchema = (type: BetType) => z.object({
  bulk: z.string().min(1, 'At least one bet is required.'),
});
const BetForm = ({ type }: { type: BetType }) => {
  const agents = useAppStore((state) => state.agents);
  const fetchAgents = useAppStore((state) => state.fetchAgents);
  const addBulkBets = useAppStore((state) => state.addBulkBets);
  useEffect(() => {
    if (agents.length === 0) fetchAgents();
  }, [fetchAgents, agents.length]);
  const currentBetFormSchema = betFormSchema(type);
  type BetFormValues = z.infer<typeof currentBetFormSchema>;
  const form = useForm<BetFormValues>({
    resolver: zodResolver(currentBetFormSchema),
    defaultValues: { bulk: '' },
  });
  const onSubmit = async (data: BetFormValues) => {
    const defaultAgentId = agents[0]?.id;
    if (!defaultAgentId) {
      toast.error('No agents available to assign bets to.');
      return;
    }
    const bulkBets = data.bulk.split('\n').map(line => line.trim()).filter(line => line);
    const betsToSubmit = [];
    for (const line of bulkBets) {
      const [number, amountStr] = line.split(/[, ]+/).map(s => s.trim());
      const amount = parseFloat(amountStr);
      if (number && !isNaN(amount) && amount > 0) {
        if (number.length !== (type === '2D' ? 2 : 3) || !/^\d+$/.test(number)) {
          toast.error(`Invalid number format for "${number}". Must be ${type === '2D' ? 2 : 3} digits.`);
          return;
        }
        betsToSubmit.push({ agentId: defaultAgentId, type, number, amount });
      }
    }
    if (betsToSubmit.length === 0) {
      toast.error('No valid bets to submit. Please check your format.');
      return;
    }
    const promise = addBulkBets(betsToSubmit);
    toast.promise(promise, {
      loading: 'Submitting bets...',
      success: (newBets) => {
        form.reset();
        return `${newBets.length} bet(s) submitted successfully!`;
      },
      error: 'Failed to submit bets.',
    });
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>{type} Bulk Bet Entry</CardTitle>
            <CardDescription>
              Enter bets in the format: <strong>number,amount</strong> (e.g., {type === '2D' ? '23,100' : '789,50'}) on each line.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="bulk"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="bulk-entry" className="sr-only">Bulk Entry</Label>
                  <FormControl>
                    <Textarea
                      id="bulk-entry"
                      placeholder={`23,100\n45,50\n88,200...`}
                      className="min-h-[250px] font-mono"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="ml-auto active:scale-95 transition-transform" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Submitting...' : `Submit ${type} Bets`}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};
export function BetEntryPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Tabs defaultValue="2d" className="w-full max-w-2xl mx-auto">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="2d">2D Game</TabsTrigger>
          <TabsTrigger value="3d">3D Game</TabsTrigger>
        </TabsList>
        <TabsContent value="2d">
          <BetForm type="2D" />
        </TabsContent>
        <TabsContent value="3d">
          <BetForm type="3D" />
        </TabsContent>
      </Tabs>
    </div>
  );
}