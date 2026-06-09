import { createServer } from 'http';
import { app } from './app.js';
import { initDB } from './db.js';
import { setupWS } from './ws.js';

const server = createServer(app);
const PORT = Number(process.env.PORT) || 3001;

async function start() {
  await initDB();
  setupWS(server);
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

start();
