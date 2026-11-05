import { ITenantRepository, TenantAggregate, TenantProps } from '@simplicion/tenant';

export class PrismaTenantRepository implements ITenantRepository {
  private store = new Map<string, TenantProps>();

  constructor(initialTenants: TenantAggregate[] = []) {
    initialTenants.forEach((t) => {
      this.store.set(t.id, t.toJSON());
    });
  }

  async findById(id: string): Promise<TenantAggregate | null> {
    const data = this.store.get(id);
    if (!data) return null;
    return new TenantAggregate(data);
  }

  async findBySlug(slug: string): Promise<TenantAggregate | null> {
    const normalized = slug.trim().toLowerCase();
    for (const props of this.store.values()) {
      if (props.slug.toLowerCase() === normalized) {
        return new TenantAggregate(props);
      }
    }
    return null;
  }

  async findByCustomDomain(domain: string): Promise<TenantAggregate | null> {
    const normalized = domain.trim().toLowerCase();
    for (const props of this.store.values()) {
      if (props.customDomain && props.customDomain.toLowerCase() === normalized) {
        return new TenantAggregate(props);
      }
    }
    return null;
  }

  async findAll(): Promise<TenantAggregate[]> {
    return Array.from(this.store.values()).map((p) => new TenantAggregate(p));
  }

  async save(tenant: TenantAggregate): Promise<void> {
    this.store.set(tenant.id, tenant.toJSON());
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }
}

