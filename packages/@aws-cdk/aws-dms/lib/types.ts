export type EndpointType = 'source' | 'target';

export type RDSEngineName =
  | "mysql"
  | "oracle"
  | "postgres"
  | "mariadb"
  | "aurora"
  | "aurora-postgresql"
  | "sqlserver";

export type RDBEngineName = RDSEngineName | 'azuredb' | 'sybase' | 'db2';

export type EngineName = RDBEngineName | 'redshift' | 's3' | 'dynamodb' | 'mongodb';

export type SslMode = 'none' | 'require' | 'verify-ca' | 'verify-full';
