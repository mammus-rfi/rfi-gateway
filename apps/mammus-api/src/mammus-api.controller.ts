import {
	Body,
	Controller,
	Delete,
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

			throw new HttpException({ users: users }, HttpStatus.OK);
		} catch (error) {
			this.logger.error(error);

			throw new HttpException(`${error}`, HttpStatus.BAD_REQUEST);
		}
	}

	@Get('/user/:id')
	async getUserById(@Param('id') id: string) {
		try {
			const userData = await this.dbClient.user.findFirst({
				where: { userId: id },
			});

			throw new HttpException({ user: userData }, HttpStatus.OK);
		} catch (error) {
			this.logger.error(error);

			throw new HttpException(`${error}`, HttpStatus.BAD_REQUEST);
		}
	}

	@Put('/editUser')
	async updateUser(@Body() userData: User) {
		try {
			const user = await this.dbClient.user.update({
				where: {
					userId: userData.userId,
				},
				data: userData,
			});

			throw new HttpException({ user: user }, HttpStatus.OK);
		} catch (error) {
			this.logger.error(error);

			throw new HttpException(`${error}`, HttpStatus.BAD_REQUEST);
		}
	}

	@Post('/createChatRoom')
	async createChatRoom(@Body('chatName') name: string) {
		try {
			const chatData = await this.dbClient.chatRoom.create({
				data: {
					name: name,
				},
			});

			throw new HttpException(chatData, HttpStatus.OK);
		} catch (error) {
			this.logger.error(error);

			throw new HttpException(`${error}`, HttpStatus.BAD_REQUEST);
		}
	}

	@Delete('/chatRoom/:id')
	async deleteChatRoom(@Param('id') roomId: string) {
		try {
			await this.dbClient.chatRoom.delete({
				where: {
					chatRoomId: roomId,
				},
			});

			throw new HttpException('OK', HttpStatus.OK);
		} catch (error) {
			this.logger.error(error);

			throw new HttpException(`${error}`, HttpStatus.BAD_REQUEST);
		}
	}

	@Post('/token')
	async getDiscordToken(@Body() code: string) {
		try {
			const token = await this.mammusApiService.getToken(code);

			this.logger.log(token);
			return token;
		} catch (error) {
			this.logger.error(error);
			throw new HttpException(`${error}`, HttpStatus.BAD_REQUEST);
		}
	}
}
