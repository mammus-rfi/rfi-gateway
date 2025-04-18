import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MammusApiService {
	constructor(private readonly httpService: HttpService) {}

	getHello(): string {
		return 'Hello World!';
	}
	async getToken(code: string) {
		try {
			const data = await this.httpService.post(
				'https://discord.com/api/oauth2/token',
				{
					body: {
						client_id: process.env.CLIENT_ID,
						client_secret: process.env.CLIENT_TOKEN,
						grant_type: 'authorization_code',
						code: code,
					},
				},
			);

			const { access_token } = await firstValueFrom(data);

			return access_token;
		} catch (error) {
			console.error('Error fetching token:', error);
			throw new Error('Failed to fetch token');
		}
	}
}
