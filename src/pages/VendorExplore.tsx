import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

const cardVariant = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] as const } }),
};

const VendorExplore = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: products = [], isLoading } = useQuery({ queryKey: ['explore'], queryFn: () => api.getExplore() });

  const [addOpen, setAddOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState({ stock: '', precio_personalizado: '' });

  const addMut = useMutation({
    mutationFn: (data: { catalog_id: number; stock: number; precio_personalizado: number }) => api.addToInventory(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['explore'] });
      qc.invalidateQueries({ queryKey: ['inventory'] });
      setAddOpen(false);
      toast({ title: 'Product added to inventory' });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const openAdd = (product: any) => {
    setSelected(product);
    setForm({ stock: '', precio_personalizado: String(product.suggested_price || '') });
    setAddOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMut.mutate({
      catalog_id: selected.id,
      stock: Number(form.stock),
      precio_personalizado: Number(form.precio_personalizado),
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Explore Products</h1>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p>No new products available to add.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p: any, i: number) => (
            <motion.div
              key={p.id}
              custom={i}
              variants={cardVariant}
              initial="hidden"
              animate="visible"
              className="rounded-lg border bg-card overflow-hidden group"
            >
              <div className="aspect-square bg-muted relative overflow-hidden">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm">No image</div>
                )}
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-medium text-sm leading-tight">{p.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.brand || `SKU: ${p.sku}`}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-medium">${Number(p.suggested_price).toFixed(2)}</span>
                  <Button size="sm" onClick={() => openAdd(p)} className="active-press">
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Inventory</DialogTitle>
          </DialogHeader>
          {selected && (
            <p className="text-sm text-muted-foreground">Adding <strong>{selected.name}</strong> to your inventory.</p>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Initial Stock</Label>
              <Input type="number" min="1" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required autoFocus />
            </div>
            <div className="space-y-2">
              <Label>Selling Price</Label>
              <Input type="number" step="0.01" min="0" value={form.precio_personalizado} onChange={(e) => setForm({ ...form, precio_personalizado: e.target.value })} required />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={addMut.isPending} className="active-press">
                {addMut.isPending ? 'Adding…' : 'Add to Inventory'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorExplore;
