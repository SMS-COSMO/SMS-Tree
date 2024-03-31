import type { ZodIssueOptionalMessage } from 'zod';
import { ZodIssueCode, ZodParsedType } from 'zod';

function jsonStringifyReplacer(_: string, value: any): any {
  if (typeof value === 'bigint')
    return value.toString();

  return value;
}

function joinValues<T extends any[]>(array: T, separator = ' | '): string {
  return array
    .map(val => (typeof val === 'string' ? `'${val}'` : val))
    .join(separator);
}

// Translations borrowed from https://github.com/aiji42/zod-i18n (MIT)
export function localizeError(issue: ZodIssueOptionalMessage) {
  let message: string;
  message = '错误的输入格式';

  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === ZodParsedType.undefined || issue.received === ZodParsedType.null)
        message = '必填';
      else
        message = `预期输入为 ${issue.expected}，而输入为 ${issue.received}`;
      break;
    case ZodIssueCode.invalid_literal:
      message = `错误的字面量值，请输入 ${JSON.stringify(issue.expected, jsonStringifyReplacer)}`;
      break;
    case ZodIssueCode.unrecognized_keys:
      message = `对象中的键无法识别: ${joinValues(issue.keys, ', ')}`;
      break;
    case ZodIssueCode.invalid_union:
      message = `不满足联合类型中的选项`;
      break;
    case ZodIssueCode.invalid_union_discriminator:
      message = `标识值无法被区分。请输入 ${joinValues(issue.options)}`;
      break;
    case ZodIssueCode.invalid_enum_value:
      message = `错误的枚举值 '${issue.received}'。请输入 ${joinValues(issue.options)}`;
      break;
    case ZodIssueCode.invalid_arguments:
      message = `错误的函数参数格式`;
      break;
    case ZodIssueCode.invalid_return_type:
      message = `错误的函数返回值格式`;
      break;
    case ZodIssueCode.invalid_date:
      message = `错误的日期格式`;
      break;
    case ZodIssueCode.invalid_string:
      if (typeof issue.validation === 'object') {
        if ('startsWith' in issue.validation)
          message = `文本必须以 "${issue.validation.startsWith}" 开头`;
        else if ('endsWith' in issue.validation)
          message = `文本必须以 "${issue.validation.endsWith}" 结尾`;
      } else {
        message = '错误的格式';
      }
      break;
    case ZodIssueCode.too_small:
      if (issue.type === 'array') {
        if (issue.exact)
          message = `数组元素必须为 ${issue.minimum} 个`;
        else
          if (issue.inclusive)
            message = `数组元素不得少于 ${issue.minimum} 个`;
          else
            message = `数组元素必须超过 ${issue.minimum} 个`;
      } else if (issue.type === 'string') {
        if (issue.exact)
          message = `文本长度必须为 ${issue.minimum} 个字符`;
        else
          if (issue.inclusive)
            message = `文本长度不得少于 ${issue.minimum} 个字符`;
          else
            message = `文本长度必须超过 ${issue.minimum} 个字符`;
      } else if (issue.type === 'number') {
        if (issue.exact)
          message = `数值必须为 ${issue.minimum}`;
        else
          if (issue.inclusive)
            message = `数值不得小于 ${issue.minimum}`;
          else
            message = `数值必须大于 ${issue.minimum}`;
      } else if (issue.type === 'date') {
        if (issue.exact)
          message = `日期必须为 ${new Date(Number(issue.minimum))}`;
        else
          if (issue.inclusive)
            message = `日期不得晚于 ${new Date(Number(issue.minimum))}`;
          else
            message = `日期必须早于 ${new Date(Number(issue.minimum))}`;
      } else {
        message = '错误的格式';
      }
      break;
    case ZodIssueCode.too_big:
      if (issue.type === 'array') {
        if (issue.exact)
          message = `数组元素必须为 ${issue.maximum} 个`;
        else
          if (issue.inclusive)
            message = `数组元素不得多于 ${issue.maximum} 个`;
          else
            message = `数组元素必须少于 ${issue.maximum} 个`;
      } else if (issue.type === 'string') {
        if (issue.exact)
          message = `文本长度必须为 ${issue.maximum} 个字符`;
        else
          if (issue.inclusive)
            message = `文本长度不得多于 ${issue.maximum} 个字符`;
          else
            message = `文本长度必须少于 ${issue.maximum} 个字符`;
      } else if (issue.type === 'number' || issue.type === 'bigint') {
        if (issue.exact)
          message = `数值必须为 ${issue.maximum}`;
        else
          if (issue.inclusive)
            message = `数值不得大于 ${issue.maximum}`;
          else
            message = `数值必须小于 ${issue.maximum}`;
      } else if (issue.type === 'date') {
        if (issue.exact)
          message = `日期必须为 ${new Date(Number(issue.maximum))}`;
        else
          if (issue.inclusive)
            message = `日期不得早于 ${new Date(Number(issue.maximum))}`;
          else
            message = `日期必须晚于 ${new Date(Number(issue.maximum))}`;
      } else {
        message = '错误的格式';
      }
      break;
    case ZodIssueCode.custom:
      message = `错误的输入格式`;
      break;
    case ZodIssueCode.invalid_intersection_types:
      message = `交叉类型结果无法被合并`;
      break;
    case ZodIssueCode.not_multiple_of:
      message = `数值必须是 ${issue.multipleOf} 的倍数`;
      break;
    case ZodIssueCode.not_finite:
      message = '数值必须有限';
      break;
    default:
  }
  return { message };
}
