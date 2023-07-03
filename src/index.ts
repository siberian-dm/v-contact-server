import jsonServer from 'json-server';
import path from 'path';
import jwt, { JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { UserDto, UserCredentials } from './types';

const secretKey = 'your-secret-key';
const port = process.env.PORT || 3001;

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, '../db.json'));
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

server.post('/register', (req, res) => {
  const { name, email, password } = req.body as UserDto;

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  (router.db.get('users') as any).push({ id: uuidv4(), name, email, password: hashedPassword }).write();

  res.sendStatus(201);
});

server.post('/login', (req, res) => {
  const { email, password } = req.body as UserCredentials;

  const user = (router.db.get('users') as any).find({ email }).value() as UserDto;

  if (!user) {
    res.sendStatus(401);
    return;
  }

  if (!bcrypt.compareSync(password, user.password)) {
    res.sendStatus(401);
    return;
  }

  const accessToken = jwt.sign({ email: user.email }, secretKey, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ email: user.email }, secretKey, { expiresIn: '7d' });

  res.json({ user: { id: user.id, name: user.name, email: user.email }, accessToken, refreshToken });
});

server.post('/refresh-token', (req, res) => {
  const { refreshToken } = req.body as { refreshToken: string };

  if (!refreshToken) {
    res.sendStatus(401);
    return;
  }

  try {
    const decoded = jwt.verify(refreshToken, secretKey) as JwtPayload;

    const accessToken = jwt.sign({ email: decoded.email }, secretKey, { expiresIn: '15m' });

    res.json({ accessToken });
  } catch (error) {
    res.sendStatus(401);
  }
});

server.use((req, res, next) => {
  if (req.method === 'POST') {
    req.body.createdAt = Date.now();
  }
  // Continue to JSON Server router
  next();
});
server.use(router);
server.listen(port, () => {
  console.log(`JSON Server is running on port ${port}`);
});
