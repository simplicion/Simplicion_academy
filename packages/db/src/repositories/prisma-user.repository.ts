import { IUserRepository, UserAggregate, UserProps } from '@simplicion/identity';
import { enforceTenantScope } from '../index';

export class PrismaUserRepository implements IUserRepository {
  private store = new Map<string, UserProps>();

  constructor(initialUsers: UserAggregate[] = []) {
    initialUsers.forEach((u) => {
      this.store.set(u.id, u.toJSON());
    });
  }

  async findById(id: string): Promise<UserAggregate | null> {
    const data = this.store.get(id);
    if (!data) return null;
    return new UserAggregate(data);
  }

  async findByPhone(tenantId: string, phone: string): Promise<UserAggregate | null> {
    const cleaned = phone.replace(/\D/g, '');
    for (const props of this.store.values()) {
      if (props.tenantId === tenantId && props.phone.replace(/\D/g, '') === cleaned) {
        return new UserAggregate(props);
      }
    }
    return null;
  }

  async findAllByTenant(tenantId: string): Promise<UserAggregate[]> {
    const list: UserAggregate[] = [];
    for (const props of this.store.values()) {
      if (props.tenantId === tenantId) {
        list.push(new UserAggregate(props));
      }
    }
    return list;
  }

  async save(user: UserAggregate): Promise<void> {
    const data = user.toJSON();
    this.store.set(user.id, data);
  }
}

