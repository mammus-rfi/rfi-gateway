import { Module } from '@nestjs/common';
import { ChatGateway } from './chat-gateway.gateway';

@Module({
	providers: [ChatGateway],
	exports: [ChatGateway],
})
export class ChatGatewayModule {}
