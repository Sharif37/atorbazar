import express from 'express';
import z from 'zod';
import { db } from '../database';
import { requireRole, verifySession } from './auth/auth';
import generateToken from './auth/generateRandomNumber';
import { Role } from './auth/register';

const transactionRouter = express.Router();

const createTransactionSchema = z.object({
  user_id: z.string(),
  order_id: z.string(),
  amount: z.coerce.number(),
  transaction_type: z.enum(['Payment', 'Refund']),
  status: z.enum(['Completed', 'Pending', 'Failed']),
  payment_method: z.enum(['Credit Card', 'PayPal', 'Bank Transfer', 'Bkash', 'Nagad', 'Rocket', 'Cash On Delivery']),
});

transactionRouter.post(
  '/create',
  verifySession,
  requireRole([Role.Customer, Role.Admin]),
  async (req, res) => {
    try {
        const transaction_id=generateToken(12) ;
      const transactionData = createTransactionSchema.parse(req.body);
      //console.log(transactionData);
      const transaction={
        transaction_id:transaction_id,
        ...transactionData
      };

      await db
        .insertInto('Transaction')
        .values(transaction)
        .execute();
      res.status(201).json({ message: 'Transaction created successfully' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid data', errors: error.errors });
      }
      console.error('Error creating transaction:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);


transactionRouter.get(
    '/all',
    verifySession,
    requireRole([Role.Admin]),
    async (req, res) => {
      try {
        const transactions = await db
          .selectFrom('Transaction')
          .selectAll()
          .execute();
        res.status(200).json(transactions);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  );

  transactionRouter.get(
    '/:transaction_id',
    verifySession,
    requireRole([Role.Admin, Role.Customer]),
    async (req, res) => {
      try {
        const transaction_id = z.string().parse(req.params.transaction_id);
        const transaction = await db
          .selectFrom('Transaction')
          .where('transaction_id', '=', transaction_id)
          .selectAll()
          .executeTakeFirst();
  
        if (!transaction) {
          return res.status(404).json({ message: 'Transaction not found' });
        }
  
        res.status(200).json(transaction);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ message: 'Invalid data', errors: error.errors });
        }
        console.error('Error fetching transaction:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  );
  

  const updateTransactionSchema = z.object({
    amount: z.coerce.number().optional(),
    transaction_type: z.enum(['Payment', 'Refund']).optional(),
    status: z.enum(['Completed', 'Pending', 'Failed']).optional(),
    payment_method: z.enum(['Credit Card', 'PayPal', 'Bank Transfer', 'Bkash', 'Nagad', 'Rocket', 'Cash On Delivery']).optional(),
    details: z.string().optional(),
  });
  
  transactionRouter.put(
    '/:transaction_id',
    verifySession,
    requireRole([Role.Admin]),
    async (req, res) => {
      try {
        const transaction_id = z.string().parse(req.params.transaction_id);
        const updatedData = updateTransactionSchema.parse(req.body);
  
        const [result] = await db
          .updateTable('Transaction')
          .set(updatedData)
          .where('transaction_id', '=', transaction_id)
          .execute();
  
        if (result.numUpdatedRows === BigInt(0)) {
          return res.status(404).json({ message: 'Transaction not found' });
        }
  
        res.status(200).json({ message: 'Transaction updated successfully' });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ message: 'Invalid data', errors: error.errors });
        }
        console.error('Error updating transaction:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  );
  
  transactionRouter.delete(
    '/:transaction_id',
    verifySession,
    requireRole([Role.Admin]),
    async (req, res) => {
      try {
        const transaction_id = z.string().parse(req.params.transaction_id);
  
        const [result] = await db
          .deleteFrom('Transaction')
          .where('transaction_id', '=', transaction_id)
          .execute();
  
        if (result.numDeletedRows === BigInt(0)) {
          return res.status(404).json({ message: 'Transaction not found' });
        }
  
        res.status(200).json({ message: 'Transaction deleted successfully' });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ message: 'Invalid data', errors: error.errors });
        }
        console.error('Error deleting transaction:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  );
  export default transactionRouter ;