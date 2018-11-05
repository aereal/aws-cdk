import cdk = require('@aws-cdk/cdk');

export interface LifecycleHookProps {
}

export class LifecycleHook extends cdk.Construct {
  constructor(parent: cdk.Construct, id: string, props: LifecycleHookProps) {
    super(parent, id);
  }
}