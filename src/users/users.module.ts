import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { UsersService } from './users.service';
import { User } from './entities/user.entity';

@Module({
  imports: [MikroOrmModule.forFeature({ entities: [User] })],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
