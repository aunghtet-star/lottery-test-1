import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppStore } from '@/store/store';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import type { BetType, Limits } from '@shared/types';
const limitFormSchema = z.object({
  number: z.string().min(1, 'Number is required.'),
  amount: z.coerce
    .number()
    .min(0, 'Limit must be a positive number.'),
});
type LimitFormValues = z.infer<typeof limitFormSchema>;
const LimitsTabContent = ({ type }: { type: BetType }) => {
  const limits = useAppStore((state) => state.limits);
  const updateLimits = useAppStore((state) => state.updateLimits);
  const isLoading = useAppStore((state) => state.isLoadingLimits);
  const form = useForm<LimitFormValues>({
    resolver: zodResolver(limitFormSchema),
    defaultValues: { number: '', amount: 0 },
  });
  const onSubmit = (values: LimitFormValues) => {
    if (!limits) return;
    const numberPattern = type === '2D' ? /^\d{2}$/ : /^\d{3}$/;
    if (!numberPattern.test(values.number)) {
      form.setError('number', { message: `Must be a ${type} number.` });
      return;
    }
    const newLimits: Limits = JSON.parse(JSON.stringify(limits));
    newLimits[type][values.number] = values.amount;
    const promise = updateLimits(newLimits);
    toast.promise(promise, {
      loading: 'Saving limit...',
      success: () => {
        form.reset();
        return `Limit for ${values.number} saved successfully.`;
      },
      error: 'Failed to save limit.',
    });
  };
  const handleDelete = (number: string) => {
    if (!limits) return;
    const newLimits: Limits = JSON.parse(JSON.stringify(limits));
    delete newLimits[type][number];
    const promise = updateLimits(newLimits);
    toast.promise(promise, {
      loading: 'Deleting limit...',
      success: `Limit for ${number} deleted successfully.`,
      error: 'Failed to delete limit.',
    });
  };
  const currentLimits = limits ? Object.entries(limits[type]).sort(([a], [b]) => a.localeCompare(b)) : [];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Set {type} Limits</CardTitle>
        <CardDescription>Add or update the maximum sales amount for a specific {type} number.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-end gap-4 mb-6 p-4 border rounded-lg bg-muted/50">
            <FormField
              control={form.control}
              name="number"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Number</FormLabel>
                  <FormControl>
                    <Input placeholder={type === '2D' ? 'e.g., 42' : 'e.g., 123'} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Max Amount ($)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 5000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Save Limit</Button>
          </form>
        </Form>
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Current Limits</h3>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : currentLimits.length > 0 ? (
            <div className="max-h-60 overflow-y-auto pr-2 space-y-2 rounded-md border">
              {currentLimits.map(([number, amount]) => (
                <div key={number} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md">
                  <div className="font-mono">
                    <span className="font-semibold">{number}</span>
                    <span className="text-muted-foreground mx-2">-&gt;</span>
                    <span>${amount.toLocaleString()}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(number)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No limits set for {type}.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
export function LimitsPage() {
  const fetchLimits = useAppStore((state) => state.fetchLimits);
  useEffect(() => {
    fetchLimits();
  }, [fetchLimits]);
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Limits / Breaks</h2>
          <p className="text-muted-foreground">Set maximum sales limits for each game number.</p>
        </div>
      </div>
      <Tabs defaultValue="2d" className="w-full max-w-2xl mx-auto">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="2d">2D Game Limits</TabsTrigger>
          <TabsTrigger value="3d">3D Game Limits</TabsTrigger>
        </TabsList>
        <TabsContent value="2d">
          <LimitsTabContent type="2D" />
        </TabsContent>
        <TabsContent value="3d">
          <LimitsTabContent type="3D" />
        </TabsContent>
      </Tabs>
    </div>
  );
}