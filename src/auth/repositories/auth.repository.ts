import { EntityRepository } from '@mikro-orm/postgresql';

import { Auth } from '../entities/auth.entity';

export class AuthRepository extends EntityRepository<Auth> {}
