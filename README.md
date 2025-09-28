# ripple-forms

A reactive, type-safe form library for **Ripple** framework inspired by React Hook Form. It supports nested objects, arrays, and dot-bracket notation for field paths (e.g., `addresses.[0].street`). Built for simplicity, full TypeScript support, and reactive updates using `ripple`'s `track`/`effect`.

---

## Features

* Fully reactive form state with `track` from Ripple
* Type-safe field registration with nested paths
* Supports arrays with dot-bracket notation (`addresses.[0].street`)
* Validation support (sync and async)
* Easy reset functionality
* Minimal boilerplate

---
🚧 Alpha Version - This library is currently in alpha development and may have breaking changes.

---

## Installation

```bash
npm install ripple-forms
```

---

## Usage

```ts
import { effect } from 'ripple';
import { createForm } from 'ripple-forms';

// Initial form state
const initial = {
  username: 'john_doe',
  firstname: 'John',
  lastname: 'Doe',
  contact: {
    email: 'john.doe@example.com',
    phone: '+1-202-555-0173',
  },
  addresses: [
    {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip: '10001',
    },
  ],
  preferences: {
    newsletter: true,
    notifications: {
      email: true,
      sms: false,
      language: 'EN',
    },
  },
};

// Create form
export component App() {
  const { register, handleSubmit, reset } = createForm({
    initialValue: initial,
  });

  const onSuccess = (values) => console.log('Form values:', values);
  const onError = (errors) => console.log('Form errors:', errors);

  // Register fields
  const newsletter = register('preferences.newsletter');

  <Inp
    {...register('username', {
      validate: (value) => {
        if (value.length > 10) return 'Username should be less than 10 chars';
        if (value.length < 5) return 'Username should be more than 5 chars';
        return '';
      },
    })}
  />

  <Inp {...register('firstname')} />
  <Inp {...register('lastname')} />
  <Inp {...register('contact.email')} />
  <Inp {...register('contact.phone')} />
  <Inp {...register(`addresses.[0].street`)} />
  <Inp {...register(`preferences.notifications.language`)} />

  <input
    type="checkbox"
    checked={newsletter.@value}
    oninput={newsletter.oninput}
    name={newsletter.name}
    onchange={newsletter.onchange}
  />

  <button onClick={handleSubmit(onSuccess, onError)}>Submit</button>
  <button onClick={() => reset({ firstname: 'user', username: 'test' })}>
    Reset
  </button>
}

// Input wrapper component
component Inp(props) {
  <input
    value={props.@value}
    oninput={props.oninput}
    name={props.name}
    onchange={props.onchange}
  />

  if (props.error) {
    <div>{props.@error}</div>
  }

  if (props.@touched) {
    <div>{'touched'}</div>
  }

  if (props.@isDirty) {
    <div>{'dirty'}</div>
  }
}
```

---

### Example Error Handling

```ts
const onError = (errors: FormErrors<Form>) => {
  if (errors['addresses.[0].street']) {
    console.log(errors['addresses.[0].street']);
  }
};
```


---

### Example: Synchronous Validator

```ts
const { register } = createForm({
  initialValue: { username: '' },
});

<Inp
  {...register('username', {
    validate: (value, values) => {
      if (!value) return 'Username is required';
      if (value.length < 5) return 'Username must be at least 5 characters';
      if (value.length > 10) return 'Username must be at most 10 characters';
      return undefined; // no error
    },
  })}
/>
```

* `value` → current field value (`username` in this case)
* `values` → full form values (`{ username: '', ... }`)
* Returning a string sets the error, returning `undefined` clears it

---

### Example: Async Validator

```ts
<Inp
  {...register('username', {
    validate: async (value) => {
      // simulate server check
      const takenUsernames = ['admin', 'root', 'john'];
      await new Promise((res) => setTimeout(res, 500)); // delay 500ms
      if (takenUsernames.includes(value)) {
        return 'Username is already taken';
      }
      return undefined;
    },
  })}
/>
```

* Async validators are supported — you can use `await` or return a Promise.

---

### Example: Multiple Validators

```ts
<Inp
  {...register('username', {
    validate: [
      (v) => (!v ? 'Required' : undefined),
      (v) => (v.length < 5 ? 'Too short' : undefined),
      async (v) => {
        await new Promise((res) => setTimeout(res, 100));
        return v === 'admin' ? 'Username taken' : undefined;
      },
    ],
  })}
/>
```

* Pass an **array of validators**.
* The first failing validator’s message will be used.

---

### ✅ Notes

* Use `values` if you want **cross-field validation**:

```ts
validate: (value, values) => {
  if (value !== values.confirmPassword) return 'Passwords must match';
  return undefined;
}
```

* Validators can be **sync** or **async**, and the form will handle them properly in `handleSubmit`.

---

## API

### `createForm<T>(props: CreateFormProps<T>): UseFormReturn<T>`

Creates a reactive form instance.

**Props**

| Prop         | Type                                                                                                                                                  | Description                  |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| initialValue | `Partial<T>`                                                                                                                                          | Initial form values          |
| resolver     | `(values: Partial<T>) => Promise<{ values?: Partial<T>, errors?: Record<string,string> }> \| { values?: Partial<T>, errors?: Record<string,string> }` | Optional validation resolver |
| mode         | `'onSubmit' \| 'all'`                                                                                                                                 | Validation mode              |

**Returns:** `UseFormReturn<T>`

---

### `UseFormReturn<T>`

| Method         | Signature                                                                                                      | Description                                |
| -------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `register`     | `<TPath extends Path<T>>(name: TPath, options?: RegisterOptions<T>) => RegisteredField<PathValue<T,TPath>>`    | Registers a field with optional validation |
| `handleSubmit` | `(successCB: (values: T) => void, errorCB?: (errors: FormErrors<T>) => void) => (e?: Event) => void`           | Handles form submission                    |
| `reset`        | `(values?: Partial<T>, options?: { keepDirty?: boolean; keepTouched?: boolean; keepError?: boolean }) => void` | Resets form values                         |

---

### `RegisteredField<T>`

| Property   | Type                              | Description                     |
| ---------- | --------------------------------- | ------------------------------- |
| `name`     | `string`                          | Field name (path)               |
| `value`    | `track<T>`                        | Reactive field value            |
| `error`    | `track<string \| undefined>`      | Reactive validation error       |
| `touched`  | `track<boolean>`                  | Whether the field was touched   |
| `isDirty`  | `track<boolean>`                  | Whether the field value changed |
| `oninput`  | `(evOrVal: Event \| any) => void` | Input handler                   |
| `onchange` | `(ev?: Event) => void`            | Change handler                  |

---

### `RegisterOptions<T>`

| Prop       | Type                                 | Description        |
| ---------- | ------------------------------------ | ------------------ |
| `validate` | `ValidatorFn<T> \| ValidatorFn<T>[]` | Field validator(s) |

---

### Types

```ts
type Path<T> = ... // generates valid string paths including `addresses.[0].street`
type PathValue<T, P> = ... // resolves type of nested field by path
type FormErrors<T> = { [K in Path<T>]?: string } // typed errors object
```


---

### Notes
* Only **dot-before-bracket array notation** is supported: `addresses.[0].street`
* Fully reactive via `ripple`’s `track`
* This is currently in alpha version

 