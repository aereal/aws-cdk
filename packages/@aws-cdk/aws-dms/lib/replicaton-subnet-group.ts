import { IVpc, SubnetSelection } from "@aws-cdk/aws-ec2";
import { Construct, Resource } from "@aws-cdk/core";
import { CfnReplicationSubnetGroup } from "./dms.generated";
import { IReplicationSubnetGroup } from "./replication-subnet-group-ref";

export interface ReplicationSubnetGroupProps {
  readonly description: string;

  /**
   * @default automatically generated
   */
  readonly replicationSubnetGroupName?: string;
  readonly vpc: IVpc;
  /**
   * @default private subnets
   */
  readonly vpcSubnets ?: SubnetSelection;
}

export interface ReplicationSubnetGroupAttributes {
  readonly replicationSubnetGroupArn: string
}

/**
 * @resource AWS::DMS::ReplicationSubnetGroup
 */
export class ReplicationSubnetGroup extends Resource implements IReplicationSubnetGroup {
  public static fromReplicationSubnetGroupAttributes(scope: Construct, id: string, attrs: ReplicationSubnetGroupAttributes): IReplicationSubnetGroup {
    class Import extends Resource implements IReplicationSubnetGroup {
      public readonly replicationSubnetGroupArn = attrs.replicationSubnetGroupArn;
    }
    return new Import(scope, id);
  }

  private resource: CfnReplicationSubnetGroup;

  constructor(scope: Construct, id: string, props: ReplicationSubnetGroupProps) {
    super(scope, id);

    const subnets = props.vpc.selectSubnets(props.vpcSubnets);

    this.resource = new CfnReplicationSubnetGroup(this, 'Resource', {
      replicationSubnetGroupDescription: props.description,
      replicationSubnetGroupIdentifier: props.replicationSubnetGroupName,
      subnetIds: subnets.subnetIds,
    });
  }

  /** @attribute */
  get replicationSubnetGroupArn(): string {
    return this.resource.ref;
  }
}
