import {
	Body,
	Controller,
	Get,
	HttpException,
	HttpStatus,
	Logger,
	Param,
	Post,
	Put,
} from '@nestjs/common';
import { MammusApiService } from './mammus-api.service';
import { PrismaClient, User } from '@prisma/client';
import { ChatGateway } from './chat-gateway/chat-gateway.gateway';

@Controller()
export class MammusApiController {
	constructor(
		private readonly mammusApiService: MammusApiService,
		private readonly chatGateway: ChatGateway,
	) {}

	private readonly dbClient: PrismaClient = new PrismaClient();
	private readonly logger: Logger = new Logger('ChatDB');

	@Get()
	getHello(): string {
		return this.mammusApiService.getHello();
	}

	@Post('/createUser')
	async createUser(@Body() user: User) {
		try {
			const userData = await this.dbClient.user.create({
				data: user,
			});

			this.chatGateway.io.emit('createSuccess', userData);
			return { user: userData };
		} catch (error) {
			this.logger.error(error);
			throw new HttpException(`${error}`, HttpStatus.BAD_REQUEST);
		}
	}

	@Get('/users')
	async getUsers() {
		try {
			const users = await this.dbClient.user.findMany();

			return { users: users };
		} catch (error) {
			this.logger.error(error);
			throw new HttpException(`${error}`, HttpStatus.BAD_REQUEST);
		}
	}

	@Put('/user/:id')
	async updateUser(@Param('id') id: string, @Body() userData: User) {
		try {
			const user = await this.dbClient.user.update({
				where: {
					userId: id,
				},
				data: userData,
			});

			return { status: HttpStatus.OK, user: user };
		} catch (error) {
			this.logger.error(error);
			throw new HttpException(`${error}`, HttpStatus.BAD_REQUEST);
		}
	}
}
