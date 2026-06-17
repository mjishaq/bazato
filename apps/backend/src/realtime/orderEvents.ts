import { EventEmitter } from "node:events";

import type { Order } from "../domain/models.js";

type OrderEvents = {
  orderUpdated: [Order];
};

class TypedOrderEventBus {
  private readonly emitter = new EventEmitter();

  on<K extends keyof OrderEvents>(
    event: K,
    listener: (...args: OrderEvents[K]) => void
  ) {
    this.emitter.on(event, listener);
  }

  off<K extends keyof OrderEvents>(
    event: K,
    listener: (...args: OrderEvents[K]) => void
  ) {
    this.emitter.off(event, listener);
  }

  publishOrderUpdated(order: Order) {
    this.emitter.emit("orderUpdated", order);
  }
}

export const orderEvents = new TypedOrderEventBus();
