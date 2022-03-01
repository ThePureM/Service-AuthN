import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';

import { DatabaseConfig } from 'src/common';
import { databaseConfig } from 'src/config';
import { User } from 'src/users/entities/user.entity';
import { Auth } from 'src/auth/entities/auth.entity';

@Module({
  imports: [
    MikroOrmModule.forRootAsync({
      imports: [ConfigModule.forFeature(databaseConfig)],
      useFactory: async (configService: ConfigService) => {
        const databaseConfig = configService.get<DatabaseConfig>('database');
        const logger = new Logger('MikroORM');

        return {
          driver: PostgreSqlDriver,
          clientUrl: databaseConfig.url,
          entities: [User, Auth],
          logger: logger.log.bind(logger),
          metadataProvider: TsMorphMetadataProvider,
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class OrmModule {}
