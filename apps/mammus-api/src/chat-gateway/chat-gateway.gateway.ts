import {
	SubscribeMessage,
	WebSocketGateway,
	OnGatewayConnection,
	OnGatewayDisconnect,
	WebSocketServer,
	OnGatewayInit,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';

import { Server, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { MongoClient } from 'mongodb';

@WebSocketGateway()
export class ChatGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	private readonly logger: Logger = new Logger(ChatGateway.name);
	private readonly dbClient: PrismaClient = new PrismaClient();

	@WebSocketServer() io: Server;

	async afterInit() {
		const client = new MongoClient(process.env.DATABASE_URL);
		await client.connect();

		const db = client.db();

		const collection = db.collection('Message');

		const changeStream = collection.watch();

		changeStream.on('change', async () => {
			const messages = await this.dbClient.message.findMany();
			this.io.emit('messagesUpdated', messages);
		});

		this.logger.log('WebSocket iniciado.');
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
	handlePing(client: Socket, payload: any) {
		this.logger.log(`Mensagem de client ID: ${client.id}`);
		this.logger.debug(`Payload: ${payload}`);
		return {
			event: 'pong',
			data: payload,
		};
	}

	@SubscribeMessage('message')
	async handleMessageCreate(client: Socket, payload: any) {
		try {
			if (payload.chatRoomId) {
				const messageData = await this.dbClient.message.create({
					data: {
						User: {
							connect: {
								userId: payload.userId,
							},
						},
						ChatRoom: {
							connect: {
								chatRoomId: payload.chatRoomId,
							},
						},
						data: payload.data,
					},
				});

				this.io.to(payload.chatRoomId).emit('memberEnter', payload);

				return {
					event: 'messageResponse',
					data: messageData,
				};
			}
			const messageData = await this.dbClient.message.create({
				data: {
					User: {
						connect: {
							userId: payload.userId,
						},
					},
					data: payload.data,
				},
			});
			return {
				event: 'messageResponse',
				data: messageData,
			};
		} catch (error) {
			this.logger.error('Erro ao criar mensagem:', error);
		}
	}

	@SubscribeMessage('enterChat')
	async handleEnterChat(client: Socket, payload: any) {
		try {
			client.join(payload.chatRoomId);
			await this.dbClient.chatRoom.update({
				where: {
					chatRoomId: payload.chatRoomId,
				},
				data: {
					users: {
						connect: {
							userId: payload.userId,
						},
					},
				},
			});
			this.io
				.to(payload.chatRoomId)
				.emit('memberEnter', 'MEMBRO ENTROU NA SALA');
			return {
				event: 'enteredChatRoom',
				data: true,
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
