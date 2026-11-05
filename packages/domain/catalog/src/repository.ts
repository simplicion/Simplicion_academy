import { OfferingAggregate } from './index';

export interface IOfferingRepository {
  findById(tenantId: string, id: string): Promise<OfferingAggregate | null>;
  findBySlug(tenantId: string, slug: string): Promise<OfferingAggregate | null>;
  findAllByTenant(tenantId: string): Promise<OfferingAggregate[]>;
  findActiveByTenant(tenantId: string): Promise<OfferingAggregate[]>;
  save(offering: OfferingAggregate): Promise<void>;
  delete(tenantId: string, id: string): Promise<void>;
}

