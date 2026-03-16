import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, CheckCircle2 } from 'lucide-react';

const Sales = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: inventory = [], isLoading } = useQuery({ queryKey: ['inventory'], queryFn: () => api.getInventory() });

  const [selectedId, setSelectedId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [success, setSuccess] = useState(false);

  const selectedItem = inventory.find((item: any) => String(item.id) === selectedId);
  const maxQty = selectedItem?.stock || 0;

  const saleMut = useMutation({
    mutationFn: (data: { inventario_id: number; cantidad: number }) => api.registerSale(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory'] });
      setSuccess(true);
      setSelectedId('');
      setQuantity('');
      toast({ title: 'Sale registered. Stock updated.' });
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !quantity) return;
    saleMut.mutate({ inventario_id: Number(selectedId), cantidad: Number(quantity) });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Register Sale</h1>

      <div className="max-w-lg">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : inventory.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p>No products in your inventory. Add products first.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-lg border bg-card p-6 space-y-4">
              <div className="space-y-2">
                <Label>Product</Label>
                <Select value={selectedId} onValueChange={(v) => { setSelectedId(v); setQuantity(''); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {inventory.map((item: any) => (
                      <SelectItem key={item.id} value={String(item.id)} disabled={item.stock === 0}>
                        {item.name || item.product_name || `Product #${item.catalog_id}`} — Stock: {item.stock}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedItem && (
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>Available: <strong className="text-foreground font-mono">{maxQty}</strong></span>
                  <span>Price: <strong className="text-foreground font-mono">${Number(selectedItem.precio_personalizado).toFixed(2)}</strong></span>
                </div>
              )}

              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  max={maxQty}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder={selectedItem ? `Max ${maxQty}` : 'Select a product first'}
                  disabled={!selectedId}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full active-press"
              disabled={!selectedId || !quantity || Number(quantity) < 1 || Number(quantity) > maxQty || saleMut.isPending}
            >
              {saleMut.isPending ? (
                'Processing…'
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Register Sale
                </>
              )}
            </Button>

            {success && (
              <div className="flex items-center gap-2 rounded-md border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent">
                <CheckCircle2 className="h-4 w-4" />
                Sale registered. Stock updated.
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default Sales;
