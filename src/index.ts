import jsonServer from 'json-server';

import { ContactDto } from './types';

const server = jsonServer.create();
const router = jsonServer.router('../db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(router);
const port = process.env.PORT || 3001;

server.post('/contacts', (req, res) => {
  const { fullName, email, phone, tags } = req.body as ContactDto;
  const id = Date.now();

  (router.db.get('contacts') as any).push({ id, fullName, email, phone, tags }).write();

  res.status(201).json({ id, fullName, email, phone });
});

server.listen(port, () => {
  console.log(`JSON Server is running on port ${port}`);
});
