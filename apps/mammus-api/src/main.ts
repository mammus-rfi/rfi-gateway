import { NestFactory } from '@nestjs/core';
import { MammusApiModule } from './mammus-api.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
	const app = await NestFactory.create(MammusApiModule);
	const config = new DocumentBuilder()
		.setTitle('Mammus API')
		.setDescription('API for Roll For Initiative database.')
		.setVersion('0.1')
		.build();

	const document = SwaggerModule.createDocument(app, config);

	SwaggerModule.setup('swagger', app, document);

	await app.listen(process.env.port ?? 3000);
}
bootstrap();
