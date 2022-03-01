import {
  Entity,
  EntityRepositoryType,
  OneToOne,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/core';
import { IsEmail } from 'class-validator';

import { UserRepository } from '../repositories/user.repository';
import { Auth } from 'src/auth/entities/auth.entity';

@Entity({ customRepository: () => UserRepository })
export class User {
  [EntityRepositoryType]?: UserRepository;

  @PrimaryKey()
  id!: number;

  @Property()
  createdAt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();

  @Property()
  firstName: string;

  @Property()
  lastName: string;

  @Property({ name: 'fullName' })
  getFullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  @Property()
  @Unique()
  username: string;

  @Property()
  @Unique()
  @IsEmail()
  email: string;

  @Property({ hidden: true })
  password: string;

  @OneToOne({ hidden: true, orphanRemoval: true })
  auth = Auth;
}
