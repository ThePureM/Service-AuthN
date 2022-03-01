import {
  Entity,
  EntityRepositoryType,
  OneToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';

import { AuthRepository } from '../repositories/auth.repository';
import { User } from 'src/users/entities/user.entity';

@Entity({ customRepository: () => AuthRepository })
export class Auth {
  [EntityRepositoryType]?: AuthRepository;

  @PrimaryKey()
  id!: number;

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();

  @OneToOne(() => User, (user) => user.auth, { hidden: true })
  user!: User;

  @Property({ persist: false })
  refreshToken: string[];
}
