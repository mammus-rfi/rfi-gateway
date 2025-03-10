import { Test, TestingModule } from '@nestjs/testing';
import { MammusApiController } from './mammus-api.controller';
import { MammusApiService } from './mammus-api.service';

describe('MammusApiController', () => {
	let mammusApiController: MammusApiController;

	beforeEach(async () => {
		const app: TestingModule = await Test.createTestingModule({
			controllers: [MammusApiController],
			providers: [MammusApiService],
		}).compile();

		mammusApiController = app.get<MammusApiController>(MammusApiController);
	});

	describe('root', () => {
		it('should return "Hello World!"', () => {
			expect(mammusApiController.getHello()).toBe('Hello World!');
		});
	});
});
