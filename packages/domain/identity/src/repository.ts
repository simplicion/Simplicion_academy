import { UserAggregate } from './index';

export interface IUserRepository {
  findById(id: string): Promise<UserAggregate | null>;
  findByPhone(tenantId: string, phone: string): Promise<UserAggregate | null>;
  findAllByTenant(tenantId: string): Promise<UserAggregate[]>;
  save(user: UserAggregate): Promise<void>;
}

