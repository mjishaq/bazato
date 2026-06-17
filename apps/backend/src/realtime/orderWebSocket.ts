import type { Server } from "node:http";
import { WebSocketServer, type WebSocket } from "ws";

import { services } from "../container.js";
import { orderEvents } from "./orderEvents.js";
import { authenticateToken } from "../security/keycloak.js";

type Client = {
  orderId: string;
  socket: WebSocket;
  userId: string;
};

const clients = new Set<Client>();

function sendJson(socket: WebSocket, data: unknown) {
  if (socket.readyState === socket.OPEN) {
    socket.send(JSON.stringify(data));
  }
}

export function attachOrderWebSocket(server: Server) {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", async (request, socket, head) => {
    const url = new URL(request.url ?? "", "http://localhost");
    const match = url.pathname.match(/^\/orders\/([^/]+)\/live$/);

    if (!match) {
      return;
    }

    const token = url.searchParams.get("token");
    const auth = await authenticateToken(token);

    if (!auth?.sub) {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    }

    const orderId = decodeURIComponent(match[1]);
    const order = await services.orders.getOrder(orderId);

    if (!order || order.userId !== auth.sub) {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
      socket.destroy();
      return;
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
      const client = { orderId, socket: ws, userId: auth.sub as string };
      clients.add(client);

      sendJson(ws, { order, type: "order.updated" });
      ws.on("close", () => clients.delete(client));
      ws.on("error", () => clients.delete(client));
    });
  });

  orderEvents.on("orderUpdated", (order) => {
    for (const client of clients) {
      if (client.orderId === order.id && client.userId === order.userId) {
        sendJson(client.socket, { order, type: "order.updated" });
      }
    }
  });
}
