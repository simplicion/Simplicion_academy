/**
 * @simplicion/domain-catalog
 * Conforms to SAFS-00, SAFS-01, SAFS-02 & PRD FR-CAT
 */

export interface Pricing {
  mrp: number;
  salePrice: number;
  currency: string;
  offerEndsAt?: Date;
}

export interface OfferingFeature {
  id: string;
  icon: string;
  text: string;
  order: number;
}

export interface Unit {
  id: string;
  name: string;
  slug: string;
  order: number;
  contentCount?: number;
}

export interface FreePreviewCaps {
  demoClasses: number;
  sampleTests: number;
  samplePapers: number;
}

export interface OfferingProps {
  id: string;
  tenantId: string;
  categoryId: string;
  title: string;
  slug: string;
  type: 'batch' | 'course' | 'test_series' | 'free_resource' | 'bundle';
  description: string;
  startDate?: Date;
  endDate?: Date;
  language: string;
  bannerUrl?: string;
  status: 'draft' | 'upcoming' | 'live' | 'archived';
  visibility: 'public' | 'unlisted' | 'private';
  capacity?: number;
  pricing: Pricing;
  features: OfferingFeature[];
  units: Unit[];
  freePreviewCaps: FreePreviewCaps;
  createdAt: Date;
  updatedAt: Date;
}

export class OfferingAggregate {
  private props: OfferingProps;

  constructor(props: OfferingProps) {
    OfferingAggregate.validatePricing(props.pricing);
    this.props = props;
  }

  public static create(
    id: string,
    tenantId: string,
    categoryId: string,
    title: string,
    slug: string,
    type: OfferingProps['type'],
    description: string,
    pricing: Pricing,
    language: string = 'bilingual'
  ): OfferingAggregate {
    OfferingAggregate.validatePricing(pricing);

    return new OfferingAggregate({
      id,
      tenantId,
      categoryId,
      title,
      slug: slug.toLowerCase(),
      type,
      description,
      language,
      status: 'draft',
      visibility: 'public',
      pricing,
      features: [],
      units: [],
      freePreviewCaps: {
        demoClasses: 1,
        sampleTests: 1,
        samplePapers: 1,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  public static validatePricing(pricing: Pricing): void {
    if (pricing.mrp < 0 || pricing.salePrice < 0) {
      throw new Error('MRP and Sale Price cannot be negative.');
    }
    if (pricing.salePrice > pricing.mrp) {
      throw new Error(`Sale price (₹${pricing.salePrice}) cannot exceed MRP (₹${pricing.mrp}).`);
    }
  }

  /**
   * Auto-computes discount badge percentage (e.g., 50 for 50% OFF)
   */
  public get discountPercent(): number {
    if (this.props.pricing.mrp === 0) return 0;
    const discount = ((this.props.pricing.mrp - this.props.pricing.salePrice) / this.props.pricing.mrp) * 100;
    return Math.round(discount);
  }

  public get isFree(): boolean {
    return this.props.pricing.salePrice === 0;
  }

  public updatePricing(newPricing: Pricing): void {
    OfferingAggregate.validatePricing(newPricing);
    this.props.pricing = newPricing;
    this.props.updatedAt = new Date();
  }

  public addFeature(icon: string, text: string): void {
    this.props.features.push({
      id: `feat-${Date.now()}-${this.props.features.length}`,
      icon,
      text,
      order: this.props.features.length,
    });
    this.props.updatedAt = new Date();
  }

  public addUnit(name: string, slug: string): void {
    this.props.units.push({
      id: `unit-${Date.now()}-${this.props.units.length}`,
      name,
      slug: slug.toLowerCase(),
      order: this.props.units.length,
    });
    this.props.updatedAt = new Date();
  }

  public publish(): void {
    if (this.props.status === 'archived') {
      throw new Error('Archived offering cannot be published directly.');
    }
    this.props.status = 'live';
    this.props.updatedAt = new Date();
  }

  public archive(): void {
    this.props.status = 'archived';
    this.props.updatedAt = new Date();
  }

  // Getters
  public get id(): string { return this.props.id; }
  public get tenantId(): string { return this.props.tenantId; }
  public get title(): string { return this.props.title; }
  public get slug(): string { return this.props.slug; }
  public get pricing(): Readonly<Pricing> { return this.props.pricing; }
  public get status(): OfferingProps['status'] { return this.props.status; }
  public get units(): Readonly<Unit[]> { return this.props.units; }
  public get features(): Readonly<OfferingFeature[]> { return this.props.features; }
  public toJSON(): OfferingProps & { discountPercent: number; isFree: boolean } {
    return {
      ...this.props,
      discountPercent: this.discountPercent,
      isFree: this.isFree,
    };
  }
}

export * from './repository';

