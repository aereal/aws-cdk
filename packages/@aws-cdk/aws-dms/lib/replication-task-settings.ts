import { Duration } from "@aws-cdk/core";

abstract class JsonableSettings<P extends {}, K extends keyof P = keyof P> {
  protected keyMappers: Partial<Record<K, (key: K) => string>> = {};
  protected valueMappers: Partial<Record<K, (value: any) => any>> = {};
  private props: P;

  constructor(props: P) {
    this.props = props;
  }

  public toJSON(): Record<string, any> {
    const entries: Array<[K, any]> = Object.entries(this.props) as any;
    return entries.reduce<Record<string, any>>((obj, [key, value]) => {
      const mapKey = this.keyMappers[key];
      const mapValue = this.valueMappers[key];
      return {
        ...obj,
        [mapKey ? mapKey(key) : capitalize(key as string)]:
          mapValue && value !== undefined ? mapValue(value) : value,
      };
    }, {});
  }
}

export interface ReplicationTaskSettingsProps {
  readonly targetMetadata?: TargetMetadata
  readonly fullLoadSettings?: FullLoadSettings
  readonly logging?: Logging
  readonly controlTableSettings?: ControlTableSettings
  readonly streamBufferSettings?: StreamBufferSettings
  readonly changeProcessingTuning?: ChangeProcessingTuning
  readonly changeProcessingDdlHandlingPolicy?: ChangeProcessingDdlHandlingPolicy
  readonly validationSettings?: ValidationSettings
  readonly errorBehavior?: ErrorBehavior
}

export class ReplicationTaskSettings extends JsonableSettings<
  ReplicationTaskSettingsProps
> {}

export interface LobSettingsProps {
  readonly chunkSize?: number
  readonly inlineLobMaxSize?: number
  readonly limitedLobMaxSize?: boolean
  readonly lobMaxSize?: number
}

export class LobSettings {
  constructor(private props: LobSettingsProps) {}

  public toJSON(): Record<string, any> {
    const {
      chunkSize,
      inlineLobMaxSize,
      limitedLobMaxSize,
      lobMaxSize,
    } = this.props;
    return {
      SupportLobs: true,
      FullLobMode: chunkSize !== undefined,
      LobChunkSize: chunkSize,
      InlineLobMaxSize: inlineLobMaxSize,
      LimitedSizeLobMode: limitedLobMaxSize,
      LobMaxSize: lobMaxSize,
    };
  }
}

export interface BatchApplyProps {
  readonly enabled?: boolean
  readonly preserveTransaction?: boolean
}

export interface TargetMetadataProps {
  readonly schema?: string
  readonly lob?: LobSettings
  readonly loadMaxFileSize?: number
  readonly batchApply?: BatchApplyProps
  readonly parallelLoadThread?: number
  readonly parallelLoadBufferSize?: number
}

export class TargetMetadata {
  constructor(private props: TargetMetadataProps) {}

  public toJSON(): Record<string, any> {
    const {
      lob,
      batchApply,
      schema,
      loadMaxFileSize,
      parallelLoadBufferSize,
      parallelLoadThread,
    } = this.props;
    return {
      ...(lob ? lob.toJSON() : {}),
      ...(batchApply
        ? {
            BatchApplyEnabled: batchApply.enabled,
            BatchApplyPreserveTransaction: batchApply.preserveTransaction,
          }
        : {}),
      TargetSchema: schema,
      LoadMaxFileSize: loadMaxFileSize,
      ParallelLoadBufferSize: parallelLoadBufferSize,
      ParallelLoadThread: parallelLoadThread,
    };
  }
}

export type TargetTablePrepMode =
  | "DO_NOTHING"
  | "DROP_AND_CREATE"
  | "TRUNCATE_BEFORE_LOAD";

export interface FullLoadSettingsProps {
  readonly targetTablePrepMode: TargetTablePrepMode
  readonly createPkAfterFullLoad?: boolean
  readonly stopTaskCachedChangesApplied?: boolean
  readonly stopTaskCachedChangesNotApplied?: boolean
  readonly maxFullLoadSubTasks?: number
  readonly transactionConsistencyTimeout?: Duration // seconds
  readonly commitRate?: number
}

export class FullLoadSettings extends JsonableSettings<FullLoadSettingsProps> {
  public valueMappers = {
    transactionConsistencyTimeout: (value: Duration): number =>
      value.toSeconds(),
  };
}

export interface LoggingProps {
  readonly enabled?: boolean
  readonly components?: LogComponent[]
}

export class Logging extends JsonableSettings<LoggingProps> {
  public keyMappers = {
    enabled: (): string => "EnableLogging",
    components: (): string => "LogComponents",
  };
  public valueMappers = {
    components: (value: LogComponent[]): any[] =>
      value.map(component => ({
        Id: component.id,
        Severity: component.severity,
      })),
  };
}

export interface LogComponent {
  readonly id: LogId
  readonly severity: LogSeverity
}

export type LogId =
  | "SOURCE_UNLOAD"
  | "SOURCE_CAPTURE"
  | "TARGET_LOAD"
  | "TARGET_APPLY"
  | "TASK_MANAGER";

export type LogSeverity =
  | "LOGGER_SEVERITY_ERROR"
  | "LOGGER_SEVERITY_WARNING"
  | "LOGGER_SEVERITY_INFO"
  | "LOGGER_SEVERITY_DEFAULT"
  | "LOGGER_SEVERITY_DETAILED_DEBUG";

export interface ControlTableSettingsProps {
  readonly controlSchema?: string
  readonly historyTimeslot?: Duration // HistoryTimeslotInMinutes
}

export class ControlTableSettings extends JsonableSettings<
  ControlTableSettingsProps
> {
  public keyMappers = {
    historyTimeslot: (): string => "HistoryTimeslotInMinutes",
  };
  public valueMappers = {
    historyTimeslot: (value: Duration): number => value.toMinutes(),
  };
}

export interface StreamBufferSettingsProps {
  readonly streamBufferCount?: number
  readonly streamBufferSizeInMB?: number
  readonly ctrlStreamBufferSizeInMB?: number
}

export class StreamBufferSettings extends JsonableSettings<
  StreamBufferSettingsProps
> {}

export interface ChangeProcessingTuningProps {
  readonly batchApply?: BatchApplySettings
  readonly transaction?: TransactionSettings
  readonly memoryLimitTotal?: number
  readonly memoryKeepTime?: Duration // seconds
  readonly statementCacheSize?: number
}

export class ChangeProcessingTuning {
  constructor(private props: ChangeProcessingTuningProps) {}

  public toJSON(): Record<string, any> {
    const {
      memoryKeepTime,
      memoryLimitTotal,
      statementCacheSize,
      batchApply,
      transaction,
    } = this.props;
    return {
      ...(batchApply ? batchApply.toJSON() : {}),
      ...(transaction ? transaction.toJSON() : {}),
      MemoryLimitTotal: memoryLimitTotal,
      MemoryKeepTime: memoryKeepTime ? memoryKeepTime.toSeconds() : undefined,
      StatementCacheSize: statementCacheSize,
    };
  }
}

export interface BatchApplySettingsProps {
  readonly preserveTransaction?: boolean
  readonly timeoutMin?: Duration // minutes
  readonly timeoutMax?: Duration // minutes
  readonly memoryLimit?: number
  readonly splitSize?: number
}

export class BatchApplySettings extends JsonableSettings<
  BatchApplySettingsProps
> {
  public keyMappers = {
    preserveTransaction: (): string => "BatchApplyPreserveTransaction",
    timeoutMax: (): string => "BatchApplyTimeoutMax",
    timeoutMin: (): string => "BatchApplyTimeoutMin",
    memoryLimit: (): string => "BatchApplyMemoryLimit",
    splitSize: (): string => "BatchApplySplitSize",
  };
  public valueMappers = {
    timeoutMax: (value: Duration): number => value.toMinutes(),
    timeoutMin: (value: Duration): number => value.toMinutes(),
  };
}

export interface TransactionSettingsProps {
  readonly minTransactionSize?: number
  readonly commitTimeout?: Duration // seconds
  readonly handleSourceTableAltered?: boolean
}

export class TransactionSettings extends JsonableSettings<
  TransactionSettingsProps
> {
  public valueMappers = {
    commitTimeout: (value: Duration): number => value.toSeconds(),
  };
}

export interface ChangeProcessingDdlHandlingPolicyProps {
  readonly handleSourceTableDropped?: boolean
  readonly handleSourceTableTruncated?: boolean
  readonly handleSourceTableAltered?: boolean
}

export class ChangeProcessingDdlHandlingPolicy extends JsonableSettings<
  ChangeProcessingDdlHandlingPolicyProps
> {}

export interface ValidationSettingsProps {
  readonly enabled?: boolean // EnableValidation
  readonly failureMaxCount?: number
  readonly handleCollationDiff?: boolean
  readonly recordFailureDelayLimit?: Duration // RecordFailureDelayLimitInMinutes
  readonly tableFailureMaxCount?: number
  readonly threadCount?: number
  readonly validationOnly?: boolean
}

export class ValidationSettings extends JsonableSettings<
  ValidationSettingsProps
> {
  public keyMappers = {
    enabled: (): string => "EnableValidation",
    recordFailureDelayLimit: (): string => "RecordFailureDelayLimitInMinutes",
  };
  public valueMappers = {
    recordFailureDelayLimit: (value: Duration): number => value.toMinutes(),
  };
}

export type BasicErrorAction =
  | "IGNORE_RECORD"
  | "LOG_ERROR"
  | "SUSPEND_TABLE"
  | "STOP_TASK";

export interface ErrorBehaviorProps {
  readonly dataErrorPolicy?: BasicErrorAction
  readonly dataTruncationErrorPolicy?: BasicErrorAction
  readonly dataErrorEscalationPolicy?: "SUSPEND_TABLE" | "STOP_TASK"
  readonly dataErrorEscalationCount?: number
  readonly tableErrorPolicy?: "SUSPEND_TABLE" | "STOP_TASK"
  readonly tableErrorEscalationPolicy?: "STOP_TASK"
  readonly tableErrorEscalationCount?: number
  readonly recoverableErrorCount?: number
  readonly recoverableErrorInterval?: Duration // seconds
  readonly recoverableErrorThrottling?: boolean
  readonly recoverableErrorThrottlingMax?: Duration // seconds
  readonly applyErrorDeletePolicy?: BasicErrorAction
  readonly applyErrorInsertPolicy?: BasicErrorAction | "INSERT_RECORD"
  readonly applyErrorUpdatePolicy?: BasicErrorAction | "UPDATE_RECORD"
  readonly applyErrorEscalationPolicy?: Exclude<
    BasicErrorAction,
    "IGNORE_RECORD"
  >
  readonly applyErrorEscalationCount?: number
  readonly applyErrorFailOnTruncationDdl?: boolean
  readonly failOnNoTablesCaptured?: boolean
  readonly failOnTransactionConsistencyBreached?: boolean
  readonly fullLoadIgnoreConflicts?: boolean
}

export class ErrorBehavior extends JsonableSettings<ErrorBehaviorProps> {
  public valueMappers = {
    recoverableErrorInterval: (value: Duration): number => value.toSeconds(),
    recoverableErrorThrottlingMax: (value: Duration): number =>
      value.toSeconds(),
  };
}

const capitalize = (str: string): string => {
  const [first, ...rest] = str;
  return first.toUpperCase() + rest.join("");
};
