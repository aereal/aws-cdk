import { Construct, Resource } from "@aws-cdk/core";
import { CfnReplicationTask } from "./dms.generated";
import { IEndpoint } from "./endpoint-ref";
import { IReplicationInstance } from "./replication-instance-ref";
import { ReplicationTaskSettings } from "./replication-task-settings";
import { TableMapping } from './table-mappings';
import { MigrationType } from "./types";

export interface ReplicationTaskProps {
  readonly migrationType: MigrationType
  readonly replicationInstance: IReplicationInstance
  readonly sourceEndpoint: IEndpoint
  readonly targetEndpoint: IEndpoint
  readonly replicationTaskIdentifier?: string
  readonly cdcStartTime?: number
  readonly replicationTaskSettings?: ReplicationTaskSettings;
  readonly tableMappings: TableMapping;
}

/**
 * @resource AWS::DMS::ReplicationTask
 */
export class ReplicationTask extends Resource {
  constructor(scope: Construct, id: string, props: ReplicationTaskProps) {
    super(scope, id);
    new CfnReplicationTask(this, 'Resource', {
      cdcStartTime: props.cdcStartTime,
      migrationType: props.migrationType,
      replicationInstanceArn: props.replicationInstance.replicationInstanceArn,
      replicationTaskSettings: props.replicationTaskSettings ? JSON.stringify(props.replicationTaskSettings) : undefined,
      sourceEndpointArn: props.sourceEndpoint.endpointArn,
      tableMappings: JSON.stringify(props.tableMappings),
      targetEndpointArn: props.targetEndpoint.endpointArn,
    });
    this.node.addDependency(props.replicationInstance, props.sourceEndpoint, props.targetEndpoint);
  }
}
