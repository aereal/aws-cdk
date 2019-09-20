import { IDatabaseCluster } from '@aws-cdk/aws-rds';
import { Construct } from "@aws-cdk/core";
import { Endpoint, EndpointProps } from "./endpoint";
import { RDSEngineName } from './types';

type PassThroughProps = Omit<EndpointProps, 'port' | 'serverName' | 'databaseName'>;

type RequiredProps = Required<Pick<EndpointProps, 'databaseName'>>;

export interface RDSEndpointProps extends PassThroughProps, RequiredProps {
  databaseCluster: IDatabaseCluster
  engineName: RDSEngineName
}

/**
 * @resource AWS::DMS::Endpoint
 */
export class RDSEndpoint extends Endpoint {
  constructor(scope: Construct, id: string, props: RDSEndpointProps) {
    const {databaseCluster, ...restProps} = props;
    super(scope, id, {
      ...restProps,
      port: databaseCluster.clusterEndpoint.port,
      serverName: databaseCluster.clusterEndpoint.hostname,
    });
    this.resource.node.addDependency(databaseCluster);
  }
}
