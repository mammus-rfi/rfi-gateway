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
import { PrismaClient } from '@prisma/client';

@WebSocketGateway()
export class ChatGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	private readonly logger: Logger = new Logger(ChatGateway.name);
	private readonly dbClient: PrismaClient = new PrismaClient();

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
	handlePing(client: any, payload: any) {
		this.logger.log(`Mensagem de client ID: ${client.id}`);
		this.logger.debug(`Payload: ${payload}`);
		return {
			event: 'pong',
			data: payload,
		};
	}

	@SubscribeMessage('message')
	async handleMessageCreate(client: any, payload: any) {
		try {
			const messageData = await this.dbClient.message.create({
				data: payload,
			});
			this.logger.log('sexo 123');
			this.io.emit('messageResponse', messageData);
			return {
				event: 'messageResponse',
				data: messageData,
			};
		} catch (error) {
			this.logger.error(error);
			return {
				event: 'messageResponse',
				data: error,
			};
		}
	}

	@SubscribeMessage('enterChat')
	async handleEnterChat(client: any, payload: any) {
		try {
			const chatData = await this.dbClient.chatRoom.update({
				where: {
					id: payload.chatRoomId,
				},
				data: {
					users: {
						connect: {
							userId: payload.userId,
						},
					},
				},
			});
			return {
				event: 'enteredChatRoom',
				data: chatData,
			};
		} catch (error) {
			this.logger.error(error);
			return {
				event: 'enteredChatRoom',
				data: error,
			};
		}
	}
}
