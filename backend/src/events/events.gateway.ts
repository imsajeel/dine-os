
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  emitOrderCreated(order: any) {
    this.server.emit('order_created', order);
  }

  emitOrderUpdated(order: any) {
    this.server.emit('order_updated', order);
  }
  
  emitMenuUpdated() {
    this.server.emit('menu_updated');
  }

  emitTablesUpdated() {
    this.server.emit('tables_updated');
  }
}
