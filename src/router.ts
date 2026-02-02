import {Router} from 'express';

const router = Router();

// routing
router.get('/', (req, res) => {
  res.send('Hello World!Typescript');
});

router.get('/us', (req, res) => {
  res.send('Us');
});

router.get('/journal', (req, res) => {
  res.send('Hello Journal!');
});
export default router;
