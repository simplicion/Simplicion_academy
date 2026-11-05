/**
 * @simplicion/domain-commerce
 * Conforms to SAFS-00, SAFS-01, SAFS-02 & PRD FR-PAY
 */

export interface SplitSettlement {
  grossAmount: number;
  platformFeePercent: number;
  platformFeeAmount: number;
  teacherPayoutAmount: number;
}

export interface OrderProps {
  id: string;
  tenantId: string;
  userId: string;
  offeringId: string;
  split: SplitSettlement;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  webhookReceivedAt?: Date;
  grantedOfferingIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class OrderAggregate {
  private props: OrderProps;

  constructor(props: OrderProps) {
    this.props = props;
  }

  public static calculateSplit(grossAmount: number, platformFeePercent: number): SplitSettlement {
    if (grossAmount < 0) throw new Error('Gross amount cannot be negative.');
    if (platformFeePercent < 0 || platformFeePercent > 100) {
      throw new Error('Platform fee percent must be between 0 and 100.');
    }

    const platformFeeAmount = Math.round(grossAmount * (platformFeePercent / 100));
    const teacherPayoutAmount = grossAmount - platformFeeAmount;

    return {
      grossAmount,
      platformFeePercent,
      platformFeeAmount,
      teacherPayoutAmount,
    };
  }

  public static create(
    id: string,
    tenantId: string,
    userId: string,
    offeringId: string,
    grossAmount: number,
    platformFeePercent: number = 5,
    gatewayOrderId?: string
  ): OrderAggregate {
    const split = OrderAggregate.calculateSplit(grossAmount, platformFeePercent);

    return new OrderAggregate({
      id,
      tenantId,
      userId,
      offeringId,
      split,
      status: 'pending',
      gatewayOrderId,
      grantedOfferingIds: [offeringId],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Idempotent payment verification handler
   */
  public markPaid(gatewayPaymentId: string, entitledOfferingIds: string[] = []): boolean {
    if (this.props.status === 'paid') {
      // Already paid; return false indicating idempotent duplicate webhook
      return false;
    }

    this.props.status = 'paid';
    this.props.gatewayPaymentId = gatewayPaymentId;
    this.props.webhookReceivedAt = new Date();
    this.props.updatedAt = new Date();

    // Attach entitlement bonuses (e.g. Free Crash Course with Foundation Batch)
    for (const entId of entitledOfferingIds) {
      if (!this.props.grantedOfferingIds.includes(entId)) {
        this.props.grantedOfferingIds.push(entId);
      }
    }

    return true;
  }

  public markFailed(reason?: string): void {
    if (this.props.status === 'paid') {
      throw new Error('Cannot mark a paid order as failed.');
    }
    this.props.status = 'failed';
    this.props.updatedAt = new Date();
  }

  // Getters
  public get id(): string { return this.props.id; }
  public get tenantId(): string { return this.props.tenantId; }
  public get userId(): string { return this.props.userId; }
  public get offeringId(): string { return this.props.offeringId; }
  public get status(): OrderProps['status'] { return this.props.status; }
  public get split(): Readonly<SplitSettlement> { return this.props.split; }
  public get grantedOfferingIds(): ReadonlyArray<string> { return this.props.grantedOfferingIds; }
  public toJSON(): OrderProps { return { ...this.props }; }
}

export * from './repository';

