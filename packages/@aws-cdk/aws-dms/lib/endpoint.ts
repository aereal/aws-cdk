import { Construct, Resource, SecretValue } from "@aws-cdk/core";
import { CfnEndpoint } from "./dms.generated";
import { IEndpoint } from "./endpoint-ref";
import { EndpointType, EngineName, SslMode } from "./types";

export interface EndpointProps {
  databaseName?: string
  endpointIdentifier?: string
  endpointType: EndpointType
  engineName: EngineName
  extraConnectionAttributes?: string
  port?: number
  serverName?: string
  sslMode?: SslMode
  username?: string
  password?: SecretValue
}

/**
 * @resource AWS::DMS::Endpoint
 */
export class Endpoint extends Resource implements IEndpoint {
  protected resource: CfnEndpoint;

  constructor(scope: Construct, id: string, props: EndpointProps) {
    super(scope, id);
    const {password, ...passThroughProps} = props;
    this.resource = new CfnEndpoint(this, 'Resource', {
      ...passThroughProps,
      password: password ? password.toString() : undefined,
    });
  }

  get endpointArn(): string {
    return this.resource.ref;
  }
}
