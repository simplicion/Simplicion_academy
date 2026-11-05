import { TenantAggregate } from './index';

export interface ITenantRepository {
  findById(id: string): Promise<TenantAggregate | null>;
  findBySlug(slug: string): Promise<TenantAggregate | null>;
  findByCustomDomain(domain: string): Promise<TenantAggregate | null>;
  findAll(): Promise<TenantAggregate[]>;
  save(tenant: TenantAggregate): Promise<void>;
  delete(id: string): Promise<void>;
}

