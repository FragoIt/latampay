import { Router } from 'express';

const router = Router();

// Mock database for now
const invoices: any[] = [];

router.post('/', (req, res) => {
  const { amount, currency, description, client } = req.body;

  if (!amount || !currency) {
    return res.status(400).json({ error: 'Amount and currency are required' });
  }

  const newInvoice = {
    id: `inv_${Date.now()}`,
    amount,
    currency,
    description,
    client,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  invoices.push(newInvoice);

  res.status(201).json(newInvoice);
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  const invoice = invoices.find((inv) => inv.id === id);

  if (!invoice) {
    return res.status(404).json({ error: 'Invoice not found' });
  }

  res.json(invoice);
});

export default router;
