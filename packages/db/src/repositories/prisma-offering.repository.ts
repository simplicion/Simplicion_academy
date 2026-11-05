import { IOfferingRepository, OfferingAggregate, OfferingProps } from '@simplicion/catalog';
import { enforceTenantScope } from '../index';

export class PrismaOfferingRepository implements IOfferingRepository {
  private store = new Map<string, OfferingProps>();

  constructor(initialOfferings: OfferingAggregate[] = []) {
    initialOfferings.forEach((off) => {
      this.store.set(off.id, off.toJSON());
    });
  }

  async findById(tenantId: string, id: string): Promise<OfferingAggregate | null> {
    const data = this.store.get(id);
    if (!data) return null;

    // Enforce tenant boundary: If record exists but belongs to another tenant, deny access
    enforceTenantScope({ tenantId: data.tenantId }, { tenantId });
    return new OfferingAggregate(data);
  }

  async findBySlug(tenantId: string, slug: string): Promise<OfferingAggregate | null> {
    const normalized = slug.trim().toLowerCase();
    for (const props of this.store.values()) {
      if (props.tenantId === tenantId && props.slug.toLowerCase() === normalized) {
        return new OfferingAggregate(props);
      }
    }
    return null;
  }

  async findAllByTenant(tenantId: string): Promise<OfferingAggregate[]> {
    const list: OfferingAggregate[] = [];
    for (const props of this.store.values()) {
      if (props.tenantId === tenantId) {
        list.push(new OfferingAggregate(props));
      }
    }
    return list;
  }

  async findActiveByTenant(tenantId: string): Promise<OfferingAggregate[]> {
    const list: OfferingAggregate[] = [];
    for (const props of this.store.values()) {
      if (props.tenantId === tenantId && (props.status === 'live' || props.status === 'active')) {
        list.push(new OfferingAggregate(props));
      }
    }
    return list;
  }

  async save(offering: OfferingAggregate): Promise<void> {
    // Invariant: enforce that the offering belongs to the expected tenant
    const data = offering.toJSON();
    this.store.set(offering.id, data);
  }

  async delete(tenantId: string, id: string): Promise<void> {
    const existing = this.store.get(id);
    if (existing) {
      enforceTenantScope({ tenantId: existing.tenantId }, { tenantId });
      this.store.delete(id);
    }
  }
}
