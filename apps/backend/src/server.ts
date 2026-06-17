import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { attachOrderWebSocket } from "./realtime/orderWebSocket.js";

const app = createApp();
const server = app.listen(env.PORT, () => {
  console.log(`Bazzato API listening on http://localhost:${env.PORT}`);
});

attachOrderWebSocket(server);
