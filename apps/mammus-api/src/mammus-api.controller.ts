import { Controller, Get } from '@nestjs/common';
import { MammusApiService } from './mammus-api.service';

@Controller()
export class MammusApiController {
	constructor(private readonly mammusApiService: MammusApiService) {}

	@Get()
	getHello(): string {
		return this.mammusApiService.getHello();
	}
}
