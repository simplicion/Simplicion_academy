import { IOrderRepository, OrderAggregate, OrderProps } from '@simplicion/commerce';
import { enforceTenantScope } from '../index';

export class PrismaOrderRepository implements IOrderRepository {
  private store = new Map<string, OrderProps>();

  constructor(initialOrders: OrderAggregate[] = []) {
    initialOrders.forEach((ord) => {
      this.store.set(ord.id, ord.toJSON());
    });
  }

  async findById(tenantId: string, id: string): Promise<OrderAggregate | null> {
    const data = this.store.get(id);
    if (!data) return null;

    enforceTenantScope({ tenantId: data.tenantId }, { tenantId });
    return new OrderAggregate(data);
  }

  async findByGatewayOrderId(gatewayOrderId: string): Promise<OrderAggregate | null> {
    for (const props of this.store.values()) {
      if (props.gatewayOrderId === gatewayOrderId) {
        return new OrderAggregate(props);
      }
    }
    return null;
  }

  async findByUserId(tenantId: string, userId: string): Promise<OrderAggregate[]> {
    const list: OrderAggregate[] = [];
    for (const props of this.store.values()) {
      if (props.tenantId === tenantId && props.userId === userId) {
        list.push(new OrderAggregate(props));
      }
    }
    return list;
  }

  async findAllByTenant(tenantId: string): Promise<OrderAggregate[]> {
    const list: OrderAggregate[] = [];
    for (const props of this.store.values()) {
      if (props.tenantId === tenantId) {
        list.push(new OrderAggregate(props));
      }
    }
    return list;
  }

  async save(order: OrderAggregate): Promise<void> {
    const data = order.toJSON();
    this.store.set(order.id, data);
  }
}

