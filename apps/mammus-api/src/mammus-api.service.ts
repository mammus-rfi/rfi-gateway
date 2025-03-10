import { Injectable } from '@nestjs/common';

@Injectable()
export class MammusApiService {
	getHello(): string {
		return 'Hello World!';
	}
}
