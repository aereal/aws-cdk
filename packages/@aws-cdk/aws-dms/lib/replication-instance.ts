import { Connections, ISecurityGroup, IVpc, SecurityGroup } from "@aws-cdk/aws-ec2";
import { Construct, Resource } from "@aws-cdk/core";
import { CfnReplicationInstance } from "./dms.generated";
import { IReplicationInstance } from "./replication-instance-ref";
import { IReplicationSubnetGroup } from "./replication-subnet-group-ref";

export interface ReplicationInstanceProps {
  /**
   * @default ?
   */
  readonly allocatedStorage?: number

  /**
   * @default nothing
   */
  readonly allowMajorVersionUpgrade?: boolean

  /**
   * @default true
   */
  readonly autoMinorVersionUpgrade?: boolean

  /**
   * @default nothing
   */
  readonly engineVersion?: string

  /**
   * @default nothing
   */
  readonly availabilityZone?: string

  /**
   * @default nothing
   */
  readonly multiAz?: boolean

  /**
   * @default random 30 minutes
   */
  readonly preferredMaintenanceWindow?: string

  /**
   * @default true
   */
  readonly publiclyAccessible?: boolean

  /**
   * @default nothing
   */
  readonly replicationInstanceClass: string

  /**
   * @default automatically generated
   */
  readonly replicationInstanceName?: string

  /**
   * @default nothing
   */
  readonly replicationSubnetGroup?: IReplicationSubnetGroup
  readonly vpc: IVpc

  /**
   * @default automatically generated
   */
  readonly securityGroup?: ISecurityGroup
}

export interface ReplicationInstanceAttributes {
  readonly replicationInstanceArn: string
  readonly securityGroup: ISecurityGroup
}

/**
 * @resource AWS::DMS::ReplicationInstance
 */
export class ReplicationInstance extends Resource implements IReplicationInstance {
  public static fromReplicationInstanceAttributes(scope: Construct, id: string, attrs: ReplicationInstanceAttributes): IReplicationInstance {
    class Import extends Resource implements IReplicationInstance {
      public readonly replicationInstanceArn = attrs.replicationInstanceArn;
      public readonly connections = attrs.securityGroup.connections;
    }
    return new Import(scope, id);
  }

  public readonly connections: Connections;
  private resource: CfnReplicationInstance;

  constructor(scope: Construct, id: string, props: ReplicationInstanceProps) {
    super(scope, id);
    const {vpc, securityGroup: _, replicationSubnetGroup, ...passThroughProps} = props;
    const securityGroup = props.securityGroup || new SecurityGroup(this, 'SecurityGroup', {
      vpc,
    });
    this.connections = securityGroup.connections;
    this.resource = new CfnReplicationInstance(this, 'Resource', {
      ...passThroughProps,
      replicationSubnetGroupIdentifier: replicationSubnetGroup ? replicationSubnetGroup.replicationSubnetGroupArn : undefined,
    });
    this.resource.node.addDependency(securityGroup);
    if (replicationSubnetGroup) {
      this.resource.node.addDependency(replicationSubnetGroup);
    }
  }

  /** @attribute */
  get replicationInstanceArn(): string {
    return this.resource.ref;
  }

  /** @attribute */
  get replicationInstancePrivateIpAddresses(): string[] {
    return this.resource.attrReplicationInstancePrivateIpAddresses;
  }

  /** @attribute */
  get replicationInstancePublicIpAddresses(): string[] {
    return this.resource.attrReplicationInstancePublicIpAddresses;
  }
}
