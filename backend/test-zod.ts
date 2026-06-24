import { z } from 'zod';

const splitSchema = z.object({
  mode: z.enum(['equal', 'by_items']),
  guestCount: z.number().int().min(2).max(20),
  assignments: z.array(z.object({
    itemId: z.string(),
    guestIndex: z.number().int().min(0),
  })).optional(),
}).optional();

const finalizeSchema = z.object({
  orderId: z.string(),
  tipAmount: z.number().min(0).optional().default(0),
  tipWaiterId: z.string().optional(),
  paymentMethod: z.enum(['CARD', 'CASH', 'SPLIT']).default('CARD'),
  splitSettlement: z.enum(['CARD', 'CASH']).optional(),
  split: splitSchema,
  simulateEmail: z.string().email().optional(),
  stripePaymentIntentId: z.string().optional(),
  discountCode: z.string().optional(),
  applyLoyaltyDiscount: z.boolean().optional().default(true),
});

const payload = {
  orderId: 'cmqsj50yv00075enghwlt20cq',
  tipAmount: 15,
  tipWaiterId: 'some-waiter-id',
  paymentMethod: 'CARD',
};

const result = finalizeSchema.safeParse(payload);
console.log(result.success ? "SUCCESS" : JSON.stringify(result.error.flatten(), null, 2));
