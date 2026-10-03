---
title: "Iterating over Records in TypeScript"
description: "TypeScript is wonderful, but sometimes the typing can get in the way. In this article we go through how to do something that \"just works\" in normal JavaScript but requires a bit of finesse in TypeScript: iterating through records."
date: 2022-09-20
tags: [typescript]
image: /images/posts/iterating-over-records-in-typescript/carbon.png
---

If you're familiar with JavaScript, the following code snippet will look pretty boring:

```js
const myRecord = {
  key1: "value 1",
  key2: "value 2"
};

for (const k of myRecord) {
  console.log(`${k}: ${myRecord[k]}`);
}
```

This just goes over the keys in an object and prints them all out. Nothing exciting here. But what about in TypeScript with an interface?

```typescript
interface MyRecord {
  key1: string;
  key2: string;
}

let myRecord: MyRecord = {
  key1: "value 1",
  key2: "value 2"
}

for (const key in myRecord) {
  console.log(`${key}: ${myRecord[key]}`);
}
```

But this throws an error! :-(

```
Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'MyRecord'.
  No index signature with a parameter of type 'string' was found on type 'MyRecord'.(7053)
```

It turns out that we need to cast this string value as we iterate into the type representing the key for the interface `MyRecord`. We can do this pretty easily with `as keyof MyRecord`, so we just need to update our snippet with this and everything should work just fine.

```typescript
interface MyRecord {
  key1: string;
  key2: string;
}

let myRecord: MyRecord = {
  key1: "value 1",
  key2: "value 2"
}

for (const key in myRecord) {
  console.log(`${key}: ${myRecord[key as keyof MyRecord]}`);
}
```
