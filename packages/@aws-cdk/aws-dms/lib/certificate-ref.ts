import { IResource } from "@aws-cdk/core";

export interface ICertificate extends IResource {
  readonly certificateArn: string
}
