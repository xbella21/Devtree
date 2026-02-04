import {Router} from 'express';

const router = Router();
// autenticacion y registro de users

router.post('/auth/register', (req, res) => {
  console.log(req.body);
})

export default router;
