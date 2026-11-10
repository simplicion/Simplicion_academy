/**
 * @simplicion/domain-tenant
 * Conforms to SAFS-00, SAFS-01, SAFS-02 & PRD FR-PLAT & FR-STUDIO
 */

export interface TenantSettings {
  branding: {
    logoUrl?: string;
    faviconUrl?: string;
    tagline: string;
    primaryColor: string;
    accentColor: string;
    borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
    fontFamily: string;
    headerLayout: 'login-left' | 'login-right';
  };
  labels: {
    studyEntry: string;      // default: "Study"
    unitsHeader: string;     // default: "Let's Study" or "Curriculum"
    offeringName: string;    // default: "Batch" or "Course"
  };
  sectionsOrder: string[];   // ['hero', 'upcoming-slider', 'categories', 'why-us', 'testimonials', 'faq']
  enabledModules: {
    doubtSupport: boolean;
    mentorship: boolean;
    whatsappCommunity: boolean;
    advisoryTools: boolean;
  };
  contact: {
    supportPhone?: string;
    whatsappNumber?: string;
    whatsappTemplate?: string;
  };
  seo: {
    titleTemplate: string;
    metaDescription: string;
    keywords: string[];
    ogImageUrl?: string;
  };
}

export interface TenantProps {
  id: string;
  slug: string;
  name: string;
  status: 'draft' | 'active' | 'suspended';
  planId: string;
  ownerUserId: string;
  customDomain?: string;
  settings: TenantSettings;
  createdAt: Date;
  updatedAt: Date;
}

export class TenantAggregate {
  private static RESERVED_SLUGS = new Set([
    'api',
    'admin',
    'studio',
    'platform',
    'app',
    'auth',
    'docs',
    'static',
    'cdn',
    'support',
    'billing',
  ]);

  private props: TenantProps;

  constructor(props: TenantProps) {
    TenantAggregate.validateSlug(props.slug);
    this.props = props;
  }

  public static create(
    id: string,
    slug: string,
    name: string,
    ownerUserId: string,
    planId: string,
    customSettings?: Partial<TenantSettings>
  ): TenantAggregate {
    TenantAggregate.validateSlug(slug);

    const defaultSettings: TenantSettings = {
      branding: {
        tagline: 'Empowering students to achieve mastery',
        primaryColor: '#2563eb',
        accentColor: '#3b82f6',
        borderRadius: 'md',
        fontFamily: 'Inter',
        headerLayout: 'login-right',
      },
      labels: {
        studyEntry: 'Study',
        unitsHeader: "Let's Study",
        offeringName: 'Batch',
      },
      sectionsOrder: ['hero', 'upcoming-slider', 'categories', 'why-us', 'testimonials', 'faq'],
      enabledModules: {
        doubtSupport: true,
        mentorship: false,
        whatsappCommunity: true,
        advisoryTools: false,
      },
      contact: {},
      seo: {
        titleTemplate: `${name} | Online Classes & Test Series`,
        metaDescription: `Join ${name} for structured courses and interactive CBT assessments.`,
        keywords: ['online learning', 'test series', name.toLowerCase()],
      },
    };

    return new TenantAggregate({
      id,
      slug: slug.toLowerCase(),
      name,
      status: 'draft',
      planId,
      ownerUserId,
      settings: { ...defaultSettings, ...customSettings },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Instantly provisions an active tenant with zero approval delay
   */
  public static createInstantSelfServe(
    id: string,
    slug: string,
    name: string,
    ownerUserId: string,
    planId: string = 'plan_starter_free',
    customSettings?: Partial<TenantSettings>
  ): TenantAggregate {
    TenantAggregate.validateSlug(slug);

    const defaultSettings: TenantSettings = {
      branding: {
        tagline: 'Empowering students to achieve mastery',
        primaryColor: '#2563eb',
        accentColor: '#3b82f6',
        borderRadius: 'md',
        fontFamily: 'Inter',
        headerLayout: 'login-right',
      },
      labels: {
        studyEntry: 'Study',
        unitsHeader: "Let's Study",
        offeringName: 'Batch',
      },
      sectionsOrder: ['hero', 'upcoming-slider', 'categories', 'why-us', 'testimonials', 'faq'],
      enabledModules: {
        doubtSupport: true,
        mentorship: false,
        whatsappCommunity: true,
        advisoryTools: false,
      },
      contact: {},
      seo: {
        titleTemplate: `${name} | Online Classes & Test Series`,
        metaDescription: `Join ${name} for structured courses and interactive CBT assessments.`,
        keywords: ['online learning', 'test series', name.toLowerCase()],
      },
    };

    return new TenantAggregate({
      id,
      slug: slug.toLowerCase(),
      name,
      status: 'active', // Immediately active
      planId,
      ownerUserId,
      settings: { ...defaultSettings, ...customSettings },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  public static validateSlug(slug: string): void {
    const normalized = slug.trim().toLowerCase();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalized)) {
      throw new Error(`Invalid slug format: "${slug}". Must contain lowercase alphanumeric characters and hyphens only.`);
    }
    if (normalized.length < 3 || normalized.length > 32) {
      throw new Error('Tenant slug must be between 3 and 32 characters long.');
    }
    if (TenantAggregate.RESERVED_SLUGS.has(normalized)) {
      throw new Error(`The slug "${slug}" is reserved by the platform.`);
    }
  }

  public publish(): void {
    if (this.props.status === 'suspended') {
      throw new Error('Suspended tenant cannot be published.');
    }
    if (!this.props.name || !this.props.slug) {
      throw new Error('Tenant must have a name and slug before publishing.');
    }
    this.props.status = 'active';
    this.props.updatedAt = new Date();
  }

  public suspend(reason: string): void {
    this.props.status = 'suspended';
    this.props.updatedAt = new Date();
  }

  public updateBranding(branding: Partial<TenantSettings['branding']>): void {
    this.props.settings.branding = {
      ...this.props.settings.branding,
      ...branding,
    };
    this.props.updatedAt = new Date();
  }

  public updateSectionsOrder(sections: string[]): void {
    if (!sections.includes('hero')) {
      throw new Error('Hero section is mandatory and cannot be removed.');
    }
    this.props.settings.sectionsOrder = sections;
    this.props.updatedAt = new Date();
  }

  public attachCustomDomain(domain: string, isPlanEligible: boolean): void {
    if (!isPlanEligible) {
      throw new Error('Custom domains are not available on the current SaaS plan. Please upgrade to Pro or Business.');
    }
    if (!/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i.test(domain)) {
      throw new Error('Invalid custom domain format.');
    }
    this.props.customDomain = domain.toLowerCase();
    this.props.updatedAt = new Date();
  }

  // Getters
  public get id(): string { return this.props.id; }
  public get slug(): string { return this.props.slug; }
  public get name(): string { return this.props.name; }
  public get status(): 'draft' | 'active' | 'suspended' { return this.props.status; }
  public get planId(): string { return this.props.planId; }
  public get settings(): Readonly<TenantSettings> { return this.props.settings; }
  public get customDomain(): string | undefined { return this.props.customDomain; }
  public toJSON(): TenantProps { return { ...this.props }; }
}

export * from './repository';

