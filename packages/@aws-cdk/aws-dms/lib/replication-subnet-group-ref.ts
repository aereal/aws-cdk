import { IResource } from "@aws-cdk/core";

export interface IReplicationSubnetGroup extends IResource {
  /** @attribute */
  readonly replicationSubnetGroupArn: string;
}
