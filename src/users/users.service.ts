import { Injectable } from '@nestjs/common';
import { wrap } from '@mikro-orm/core';

import { User } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';
import { CreateUser, FindUser, UpdateUser } from './dtos';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(data: CreateUser): Promise<User> {
    await this.exist({
      username: data.username,
      email: data.email,
    }).then((exist) => {
      if (exist) return null;
    });

    const user = this.userRepository.create(data);
    await this.userRepository.persistAndFlush(user);

    return user;
  }

  async find(data: FindUser): Promise<User> {
    return this.userRepository.findOne({
      $or: [{ username: data.username }, { email: data.email }],
    });
  }

  async exist(data: FindUser): Promise<boolean> {
    return this.userRepository
      .count({
        $or: [{ username: data.username }, { email: data.email }],
      })
      .then((count) => {
        if (count > 0) return true;

        return false;
      });
  }

  async update(user: User, data: UpdateUser): Promise<User> {
    wrap(user).assign(data, { mergeObjects: true });
    await this.userRepository.flush();

    return user;
  }

  async delete(user: User): Promise<void> {
    return this.userRepository.removeAndFlush(user);
  }

  async findById(id: number): Promise<User> {
    return this.userRepository.findOne(id);
  }
}
