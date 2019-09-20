import { IResource } from "@aws-cdk/core";

export interface IEndpoint extends IResource {
  endpointArn: string
}
