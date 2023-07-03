import jsonServer from 'json-server';
import path from 'path';

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, '../db.json'));
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(router);
const port = 3000;

server.listen(port, () => {
  console.log(`JSON Server is running on port ${port}`);
});
