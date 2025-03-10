import {
	SubscribeMessage,
	WebSocketGateway,
	OnGatewayConnection,
	OnGatewayDisconnect,
	WebSocketServer,
	OnGatewayInit,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';

import { Server } from 'socket.io';

@WebSocketGateway()
export class ChatGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	private readonly logger: Logger = new Logger(ChatGateway.name);

	@WebSocketServer() io: Server;

	afterInit() {
		this.logger.log('Iniciado');
	}

	handleConnection(client: any) {
		const { sockets } = this.io.sockets;

		this.logger.log(`Client ID: ${client.id} conectado`);
		this.logger.debug(`Quantidade de clientes conectados: ${sockets.size}`);
	}

	handleDisconnect(client: any) {
		this.logger.log(`Client ID: ${client.id} desconectado`);
	}

	@SubscribeMessage('ping')
	handleMessage(client: any, payload: any) {
		this.logger.log(`Mensagem de client ID: ${client.id}`);
		this.logger.debug(`Payload: ${payload}`);
		return {
			event: 'pong',
			data: payload,
		};
	}
}
