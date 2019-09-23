export interface TableMapping {
  readonly rules: readonly Rule[];
}

type Rule = SelectionRule | TransformationRule;

type SelectionRuleAction = "include" | "exclude";

type TransformationRuleAction =
  | "rename"
  | "remove-column"
  | "convert-lowercase"
  | "convert-uppercase"
  | "add-prefix"
  | "remove-prefix"
  | "replace-prefix"
  | "add-suffix"
  | "remove-suffix"
  | "replace-suffix";

type TransformationTarget = "schema" | "table" | "column";

type ParallelLoadType = "partition-auto" | "subpartitions-auto" | "none";

interface ParallelLoad {
  readonly type: ParallelLoadType;
}

interface ObjectLocatorProps {
  readonly schemaName: string;
  readonly tableName: string;
  readonly columnName?: string;
}

export class ObjectLocator {
  private readonly props: ObjectLocatorProps;

  constructor(props: ObjectLocatorProps) {
    this.props = props;
  }

  public toJSON() {
    return {
      "schema-name": this.props.schemaName,
      "table-name": this.props.tableName,
      ...(this.props.columnName !== undefined
        ? { "column-name": this.props.columnName }
        : {}),
    };
  }
}

interface BaseRuleProps<A extends string> {
  readonly action: A;
  readonly id: number;
  readonly name: string;
  readonly objectLocator: ObjectLocator;
}

abstract class BaseRule<P extends {}> {
  constructor(protected props: P) {}

  public abstract toJSON(): Record<string, any>;
}

interface SelectionRuleProps extends BaseRuleProps<SelectionRuleAction> {
  readonly loadOrder?: number;
}

export class SelectionRule extends BaseRule<SelectionRuleProps> {
  public toJSON() {
    return ({
      "object-locator": this.props.objectLocator,
      "rule-action": this.props.action,
      "rule-id": this.props.id,
      "rule-name": this.props.name,
      "rule-type": 'selection',
      ...(this.props.loadOrder !== undefined
        ? {
            "load-order": this.props.loadOrder,
          }
        : {}),
    });
  }
}

interface TransformationRuleProps extends BaseRuleProps<TransformationRuleAction> {
  readonly target: TransformationTarget;
  readonly value?: string;
  readonly oldValue?: string;
  readonly parallelLoad: ParallelLoad;
}

export class TransformationRule extends BaseRule<TransformationRuleProps> {
  public toJSON() {
    return {
      "object-locator": this.props.objectLocator,
      "parallel-load": this.props.parallelLoad,
      "rule-action": this.props.action,
      "rule-id": this.props.id,
      "rule-name": this.props.name,
      "rule-target": this.props.target,
      "rule-type": 'transformation',
      ...(this.props.value !== undefined
        ? {
            value: this.props.value,
          }
        : {}),
      ...(this.props.oldValue !== undefined ? { "old-value": this.props.oldValue } : {}),
    };
  }
}
