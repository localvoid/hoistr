TypeScript transformer for hoisting expressions to the module scope.

```sh
$ npm i --save-dev hoistr ts-hoistr
```

Input:

```ts
import { hoist } from "hoistr";

function A() {
  return hoist({ value: 123 });
}
```

Output:

```js
const ___hoisted_1 = { value: 123 };

function A() {
  return ___hoisted_1;
}
```
