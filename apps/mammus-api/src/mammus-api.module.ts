import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MammusApiController } from './mammus-api.controller';
import { MammusApiService } from './mammus-api.service';
import { ChatGatewayModule } from './chat-gateway/chat-gateway.module';

@Module({
	imports: [ChatGatewayModule, HttpModule],
	controllers: [MammusApiController],
	providers: [MammusApiService],
})
export class MammusApiModule {}
