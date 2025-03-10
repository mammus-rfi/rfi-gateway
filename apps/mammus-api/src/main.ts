import { NestFactory } from '@nestjs/core';
import { MammusApiModule } from './mammus-api.module';

async function bootstrap() {
	const app = await NestFactory.create(MammusApiModule);
	await app.listen(process.env.port ?? 3000);
}
bootstrap();
