'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function PromoCodeAdmin() {
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPromo, setNewPromo] = useState({
    code: '',
    discountType: 'percent',
    discountValue: 0,
    usageLimit: '',
    expiryDate: '',
  });

  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    setLoading(true);
    const res = await axios.get('/api/admin/promocodes');
    setPromoCodes(res.data);
    setLoading(false);
  };

  const handleAdd = async (e: any) => {
    e.preventDefault();
    await axios.post('/api/admin/promocodes', {
      ...newPromo,
      usageLimit: newPromo.usageLimit ? parseInt(newPromo.usageLimit) : null,
      discountValue: parseInt(newPromo.discountValue as any),
      expiryDate: newPromo.expiryDate ? new Date(newPromo.expiryDate) : null,
    });
    setNewPromo({
      code: '',
      discountType: 'percent',
      discountValue: 0,
      usageLimit: '',
      expiryDate: '',
    });
    fetchPromos();
  };

  const handleDelete = async (id: string) => {
    const confirmed = confirm('Are you sure you want to delete this promo code?');
    if (!confirmed) return;
    await axios.delete('/api/admin/promocodes', { data: { id } });
    fetchPromos();
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 text-white">
      <h2 className="text-4xl font-bold mb-8 text-center">Promo Code </h2>

      {/* Form */}
      <form
        onSubmit={handleAdd}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-800 p-6 rounded-2xl shadow-lg mb-10"
      >
        <Input
          required
          placeholder="Promo Code"
          value={newPromo.code}
          onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value })}
        />
        <Select
          value={newPromo.discountType}
          onValueChange={(value) => setNewPromo({ ...newPromo, discountType: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="percent">Percentage</SelectItem>
            <SelectItem value="flat">Flat</SelectItem>
          </SelectContent>
        </Select>
        <Input
          required
          type="number"
          placeholder="Discount Value"
          value={newPromo.discountValue}
          onChange={(e) => setNewPromo({ ...newPromo, discountValue: Number(e.target.value) })}
        />
        <Input
          type="number"
          placeholder="Usage Limit"
          value={newPromo.usageLimit}
          onChange={(e) => setNewPromo({ ...newPromo, usageLimit: e.target.value })}
        />
        <Input
          type="date"
          placeholder="Expiry Date"
          value={newPromo.expiryDate}
          onChange={(e) => setNewPromo({ ...newPromo, expiryDate: e.target.value })}
        />
        <div className="md:col-span-3">
          <Button type="submit" className="w-full">
            ➕ Add Promo Code
          </Button>
        </div>
      </form>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin w-8 h-8 text-gray-400" />
        </div>
      ) : (
        <div className="bg-gray-900 rounded-xl shadow-lg overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-800">
              <TableRow>
                <TableHead className="text-white">Code</TableHead>
                <TableHead className="text-white">Type</TableHead>
                <TableHead className="text-white">Value</TableHead>
                <TableHead className="text-white">Limit</TableHead>
                <TableHead className="text-white">Expiry</TableHead>
                <TableHead className="text-white text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promoCodes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-gray-400">
                    No promo codes added yet.
                  </TableCell>
                </TableRow>
              ) : (
                promoCodes.map((promo) => (
                  <TableRow key={promo.id}>
                    <TableCell>{promo.code}</TableCell>
                    <TableCell>{promo.discountType}</TableCell>
                    <TableCell>{promo.discountValue}</TableCell>
                    <TableCell>{promo.usageLimit ?? '-'}</TableCell>
                    <TableCell>
                      {promo.expiryDate
                        ? new Date(promo.expiryDate).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(promo.id)}
                        className="flex gap-1 items-center"
                      >
                        <Trash2 size={16} /> Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
