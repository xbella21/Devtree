import { Router } from 'express';
import { createAccount } from './handlers';

const router = Router();
// autenticacion y registro de users

router.post('/auth/register', createAccount);

export default router;
