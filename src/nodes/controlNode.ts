import { DefaultValueType, Definition, PlainEntity } from '../contracts/ngx-openapi-types';
import { isString } from '../services/utils';
import getRule from '../validation/rules';
import BaseNode from './baseNode';

export default class ControlNode extends BaseNode {

  private readonly disabled: boolean;
  private readonly defaultValue: DefaultValueType;
  private readonly validators?: ReadonlyArray<string>;

  private static transformDefaultValue<T>(value: T | null): NonNullable<T> | string {
    if (value === null) {
      return 'null';
    }

    if (isString(value)) {
      return `"${value}"`;
    }

    // TODO: fix
    return value as any;
  }

  constructor({ name, value }: PlainEntity) {
    super(name, 'control');

    const definitions = Object.entries(value) as Array<[keyof Definition, Definition]>;

    this.validators = definitions
      .map(([name, definition]) => getRule(name, definition))
      .filter((v: string | null): v is string => isString(v));

    this.disabled = definitions.map(([name]) => name).includes('readOnly');
    this.defaultValue = value['default'] ?? null;
  }

  public build(): string {
    const { defaultValue } = this;
    const transformedValue = ControlNode.transformDefaultValue(defaultValue);

    return `${this.name}: new FormControl({
      value: ${transformedValue.toString()},
      disabled: ${this.disabled.toString()},
    }, [${this.validators?.join(', ') ?? ''}])`;
  }
}
