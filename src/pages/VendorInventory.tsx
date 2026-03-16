import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

const rowVariant = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] as const } }),
};

const VendorInventory = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: items = [], isLoading } = useQuery({ queryKey: ['inventory'], queryFn: () => api.getInventory() });

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ stock: '', precio_personalizado: '' });

  const updateMut = useMutation({
    mutationFn: ({ id, ...data }: any) => api.updateInventory(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['inventory'] }); setEditOpen(false); toast({ title: 'Inventory updated' }); },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const openEdit = (item: any) => {
    setEditing(item);
    setForm({ stock: String(item.stock), precio_personalizado: String(item.precio_personalizado) });
    setEditOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMut.mutate({ id: editing.id, stock: Number(form.stock), precio_personalizado: Number(form.precio_personalizado) });
  };

  const getStockVariant = (stock: number) => {
    if (stock === 0) return 'destructive';
    if (stock <= 5) return 'secondary';
    return 'default';
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">My Inventory</h1>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p>Your inventory is empty. Explore the catalog to start selling.</p>
        </div>
      ) : (
        <div className="rounded-lg border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="table-header w-16">Image</TableHead>
                <TableHead className="table-header">Product</TableHead>
                <TableHead className="table-header text-center">Stock</TableHead>
                <TableHead className="table-header text-right">Price</TableHead>
                <TableHead className="table-header w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item: any, i: number) => (
                <motion.tr
                  key={item.id}
                  custom={i}
                  variants={rowVariant}
                  initial="hidden"
                  animate="visible"
                  className="group border-b last:border-0 hover:bg-muted/50 transition-colors"
                >
                  <TableCell className="py-3 px-4">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-muted" />
                    )}
                  </TableCell>
                  <TableCell className="data-cell font-medium">{item.name || item.product_name || `Product #${item.catalog_id}`}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getStockVariant(item.stock)} className="font-mono">
                      {item.stock}
                    </Badge>
                  </TableCell>
                  <TableCell className="data-cell text-right font-mono">${Number(item.precio_personalizado).toFixed(2)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(item)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Inventory</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Stock</Label>
              <Input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Price</Label>
              <Input type="number" step="0.01" min="0" value={form.precio_personalizado} onChange={(e) => setForm({ ...form, precio_personalizado: e.target.value })} required />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={updateMut.isPending} className="active-press">
                {updateMut.isPending ? 'Saving…' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorInventory;
