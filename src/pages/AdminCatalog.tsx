import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Pencil, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

const rowVariant = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] as const } }),
};

const AdminCatalog = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: products = [], isLoading } = useQuery({ queryKey: ['catalog'], queryFn: () => api.getCatalog() });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ sku: '', name: '', suggested_price: '', brand_id: '', image_url: '' });

  const createMut = useMutation({
    mutationFn: (data: any) => api.createCatalogProduct(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['catalog'] }); setDialogOpen(false); toast({ title: 'Product created' }); },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, ...data }: any) => api.updateCatalogProduct(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['catalog'] }); setDialogOpen(false); toast({ title: 'Product updated' }); },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ sku: '', name: '', suggested_price: '', brand_id: '', image_url: '' });
    setDialogOpen(true);
  };

  const openEdit = (p: any) => {
    setEditing(p);
    setForm({ sku: p.sku || '', name: p.name || '', suggested_price: String(p.suggested_price || ''), brand_id: String(p.brand_id || ''), image_url: p.image_url || '' });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, suggested_price: Number(form.suggested_price), brand_id: Number(form.brand_id) };
    if (editing) {
      updateMut.mutate({ id: editing.id, ...payload });
    } else {
      createMut.mutate(payload);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Master Catalog</h1>
        <Button onClick={openCreate} className="active-press">
          <Plus className="h-4 w-4 mr-1" /> Add Product
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p>No products in the catalog yet.</p>
        </div>
      ) : (
        <div className="rounded-lg border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="table-header w-16">Image</TableHead>
                <TableHead className="table-header">SKU</TableHead>
                <TableHead className="table-header">Name</TableHead>
                <TableHead className="table-header">Brand</TableHead>
                <TableHead className="table-header text-right">Suggested Price</TableHead>
                <TableHead className="table-header w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p: any, i: number) => (
                <motion.tr
                  key={p.id}
                  custom={i}
                  variants={rowVariant}
                  initial="hidden"
                  animate="visible"
                  className="group border-b last:border-0 hover:bg-muted/50 transition-colors"
                >
                  <TableCell className="py-3 px-4">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-muted" />
                    )}
                  </TableCell>
                  <TableCell className="data-cell font-mono text-muted-foreground">{p.sku}</TableCell>
                  <TableCell className="data-cell font-medium">{p.name}</TableCell>
                  <TableCell className="data-cell text-muted-foreground">{p.brand || p.brand_id}</TableCell>
                  <TableCell className="data-cell text-right font-mono">${Number(p.suggested_price).toFixed(2)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(p)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Product' : 'New Product'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>SKU</Label>
                <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Suggested Price</Label>
                <Input type="number" step="0.01" value={form.suggested_price} onChange={(e) => setForm({ ...form, suggested_price: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Brand ID</Label>
                <Input type="number" value={form.brand_id} onChange={(e) => setForm({ ...form, brand_id: e.target.value })} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMut.isPending || updateMut.isPending} className="active-press">
                {(createMut.isPending || updateMut.isPending) ? 'Saving…' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCatalog;
