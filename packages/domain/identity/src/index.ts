/**
 * @simplicion/domain-identity
 * Conforms to SAFS-00, SAFS-01, SAFS-02 & PRD FR-STU-1
 */

export interface OtpRequestProps {
  id: string;
  tenantId: string;
  phone: string;
  code: string;
  expiresAt: Date;
  attempts: number;
  maxAttempts: number;
  isVerified: boolean;
  createdAt: Date;
}

export class OtpSession {
  private props: OtpRequestProps;

  constructor(props: OtpRequestProps) {
    this.props = props;
  }

  public static generate(id: string, tenantId: string, phone: string, expiryMinutes: number = 5): { session: OtpSession; rawCode: string } {
    const cleanedPhone = phone.replace(/\D/g, '');
    if (cleanedPhone.length < 10 || cleanedPhone.length > 13) {
      throw new Error(`Invalid phone number format: "${phone}".`);
    }

    // Generate secure 6-digit numeric OTP
    const rawCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    const session = new OtpSession({
      id,
      tenantId,
      phone: cleanedPhone,
      code: rawCode,
      expiresAt,
      attempts: 0,
      maxAttempts: 5,
      isVerified: false,
      createdAt: new Date(),
    });

    return { session, rawCode };
  }

  public verify(inputCode: string): boolean {
    if (this.props.isVerified) {
      return true;
    }

    if (Date.now() > this.props.expiresAt.getTime()) {
      throw new Error('OTP has expired. Please request a new code.');
    }

    if (this.props.attempts >= this.props.maxAttempts) {
      throw new Error('Maximum verification attempts exceeded. Number locked for 15 minutes.');
    }

    this.props.attempts++;

    if (this.props.code !== inputCode.trim()) {
      throw new Error(`Invalid OTP code. Attempts remaining: ${this.props.maxAttempts - this.props.attempts}`);
    }

    this.props.isVerified = true;
    return true;
  }

  // Getters
  public get id(): string { return this.props.id; }
  public get tenantId(): string { return this.props.tenantId; }
  public get phone(): string { return this.props.phone; }
  public get isVerified(): boolean { return this.props.isVerified; }
  public get attempts(): number { return this.props.attempts; }
}

export interface UserProps {
  id: string;
  tenantId: string;
  phone: string;
  name: string;
  email?: string;
  role: 'student' | 'teacher' | 'staff' | 'superadmin';
  createdAt: Date;
  updatedAt: Date;
}

export class UserAggregate {
  private props: UserProps;

  constructor(props: UserProps) {
    this.props = props;
  }

  public static createStudent(id: string, tenantId: string, phone: string, name: string): UserAggregate {
    return new UserAggregate({
      id,
      tenantId,
      phone,
      name,
      role: 'student',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  public updateName(name: string): void {
    if (!name.trim()) throw new Error('Name cannot be empty.');
    this.props.name = name.trim();
    this.props.updatedAt = new Date();
  }

  public get id(): string { return this.props.id; }
  public get tenantId(): string { return this.props.tenantId; }
  public get phone(): string { return this.props.phone; }
  public get name(): string { return this.props.name; }
  public get role(): UserProps['role'] { return this.props.role; }
  public toJSON(): UserProps { return { ...this.props }; }
}

export * from './repository';

