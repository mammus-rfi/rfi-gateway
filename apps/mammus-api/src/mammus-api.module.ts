import { Module } from '@nestjs/common';
import { MammusApiController } from './mammus-api.controller';
import { MammusApiService } from './mammus-api.service';
import { ChatGatewayModule } from './chat-gateway/chat-gateway.module';

@Module({
	imports: [ChatGatewayModule],
	controllers: [MammusApiController],
	providers: [MammusApiService],
})
export class MammusApiModule {}
