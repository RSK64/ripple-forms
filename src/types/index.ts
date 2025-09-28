 
import { track } from "ripple";
import { Path } from "./path";

/** Validator function type */
export type ValidatorFn<TValues = any> = (
  value: any,
  values: TValues
) => string | undefined | Promise<string | undefined>;

export interface RegisterOptions<TValues = any> {
  validate?: ValidatorFn<TValues> | ValidatorFn<TValues>[];
}

export interface RegisteredField<TValue = any> {
  name: string;
  value: ReturnType<typeof track<TValue>>;
  error: ReturnType<typeof track<string | undefined>>;
  touched: ReturnType<typeof track<boolean>>;
  isDirty: ReturnType<typeof track<boolean>>;
  oninput: (evOrVal: Event | any) => void;
  onchange: (ev?: Event) => void;
}

export interface CreateFormProps<TValues = any> {
  initialValue?: Partial<TValues>;
  resolver?: (
    values: Partial<TValues>
  ) =>
    | Promise<{ values?: Partial<TValues>; errors?: Record<string, string> }>
    | { values?: Partial<TValues>; errors?: Record<string, string> };
  mode?: "onSubmit" | "all";
}

/**
 * PathValue<T, P>
 * Resolves the value type for a given path.
 */
export type PathValue<T, P extends string> =
  // object nesting: user.name
  P extends `${infer K}.${infer Rest}`
    ? K extends keyof T
      ? PathValue<T[K], Rest>
      : any
  // array element child: addresses.[0].street
  : P extends `${infer K}.[${number}].${infer Rest}`
    ? K extends keyof T
      ? T[K] extends (infer U)[]
        ? PathValue<U, Rest>
        : any
      : any
  // array element: addresses.[0]
  : P extends `${infer K}.[${number}]`
    ? K extends keyof T
      ? T[K] extends (infer U)[]
        ? U
        : any
      : any
  // direct property: username
  : P extends keyof T
    ? T[P]
  : any;

/** Strongly typed form errors */
export type FormErrors<TValues> = {
  [K in Path<TValues>]?: string;
};

/** Hook return type */
export interface UseFormReturn<TValues = any> {
  register: <TPath extends Path<TValues>>(
    name: TPath,
    options?: RegisterOptions<TValues>
  ) => RegisteredField<PathValue<TValues, TPath>>;

  handleSubmit: (
    successCB: (values: TValues) => void,
    errorCB?: (errors: FormErrors<TValues>) => void
  ) => (e?: Event) => void;

  reset: (
    values?: Partial<TValues>,
    options?: {
      keepDirty?: boolean;
      keepTouched?: boolean;
      keepError?: boolean;
    }
  ) => void;
}
