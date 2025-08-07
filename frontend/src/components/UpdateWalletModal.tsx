import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useAuth } from '../contexts/AuthContext';
import { Alert, AlertDescription } from './ui/alert';

interface UpdateWalletModalProps {
  userId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const UpdateWalletModal: React.FC<UpdateWalletModalProps> = ({ userId, isOpen, onClose, onSuccess }) => {
  const { token } = useAuth();
  const [amount, setAmount] = useState<string>('');
  const [operation, setOperation] = useState<'ADD' | 'SUBTRACT'>('ADD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const API_URL = 'http://localhost:8080';
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/api/wallet/${userId}/update`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          operation
        })
      });
      
      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        setError('Failed to update wallet balance');
      }
    } catch (err) {
      setError('Failed to update wallet balance');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Wallet Balance</DialogTitle>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-2">
            <Button
              type="button"
              variant={operation === 'ADD' ? 'default' : 'outline'}
              onClick={() => setOperation('ADD')}
              className="flex-1"
            >
              Add
            </Button>
            <Button
              type="button"
              variant={operation === 'SUBTRACT' ? 'default' : 'outline'}
              onClick={() => setOperation('SUBTRACT')}
              className="flex-1"
            >
              Subtract
            </Button>
          </div>
          
          <Input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            required
          />
          
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Updating...' : 'Update Balance'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateWalletModal;
