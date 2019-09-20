import { IConnectable } from "@aws-cdk/aws-ec2";
import { IResource } from "@aws-cdk/core";

export interface IReplicationInstance extends IResource, IConnectable {
  /** @attribute */
  readonly replicationInstanceArn: string
}
