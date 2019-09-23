import { Construct, Resource } from "@aws-cdk/core";
import { ICertificate } from "./certificate-ref";
import { CfnCertificate } from "./dms.generated";

export interface CertificateProps {
  /**
   * @default automatically generated
   */
  readonly certificateName?: string

  /**
   * @default nothing
   */
  readonly pem?: string

  /**
   * @default nothing
   */
  readonly wallet?: string
}

export interface CertificateAttributes {
  readonly certificateArn: string
}

/**
 * @resource AWS::DMS::Certificate
 */
export class Certificate extends Resource  implements ICertificate {
  public static fromCertificateAttributes(scope: Construct, id: string, attrs: CertificateAttributes): ICertificate {
    class Import extends Resource implements ICertificate {
      public readonly certificateArn = attrs.certificateArn;
    }
    return new Import(scope, id);
  }

  private resource: CfnCertificate;

  constructor(scope: Construct, id: string, props: CertificateProps) {
    super(scope, id);
    this.resource = new CfnCertificate(this, 'Resource', {
      certificateIdentifier: props.certificateName,
      certificatePem: props.pem,
      certificateWallet: props.wallet
    });
  }

  /** @attribute */
  get certificateArn(): string {
    return this.resource.ref;
  }
}
