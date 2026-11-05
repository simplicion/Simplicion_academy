import { OrderAggregate } from './index';

export interface IOrderRepository {
  findById(tenantId: string, id: string): Promise<OrderAggregate | null>;
  findByGatewayOrderId(gatewayOrderId: string): Promise<OrderAggregate | null>;
  findByUserId(tenantId: string, userId: string): Promise<OrderAggregate[]>;
  findAllByTenant(tenantId: string): Promise<OrderAggregate[]>;
  save(order: OrderAggregate): Promise<void>;
}

