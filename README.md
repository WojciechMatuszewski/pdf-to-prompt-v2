# PDF To Chat V2

Applying everything I've learned about OpenAI API to make a V2 of [this project](https://github.com/WojciechMatuszewski/pdf-to-prompt)

## Learnings

- It is relatively hard to implement "upload-file" button that automatically submits the form when user provides the file.

  - You need to manually submit the form, which is not ideal as it forces you to get the `ref` of the form, automatically transforming the component that renders the form into a _client component_.

    - Of course, _client components_ are not bad, but it does feel a bit suboptimal to me.

- The `thread.runs` API could really benefit from streaming.

  - Currently I have to poll manually. Not ideal.

- When using the Assistants API with the "retrieval" capability, there is a big disparity between models.

  - The GTP 3.5.x does not seem to be able to open any `.pdf` files.

  - The GTP 4.x is able to open any `.pdf` files without any issues.

- The [`vitest` browser mode](https://vitest.dev/guide/browser) works, but there is little to no documentation.

  - I'm unsure how to render my component in that environment.

  - It seems like `vitest` also integrates with `Playwright`. I'm unsure how that works yet, but looking at examples, a lot of stuff is mangled together creating unnecessary complexity.

  - I think **the main benefit of using this mode would be to combine it with `testing-library` but I was unable to make it work** – something about being unable to import the test file.

    - I've tried using the `provider: "none"` option, but vitest would not render my component.

    - It might have something to do with ESModules. There the imports are asynchronous.

      - Next.js will not allow you to set `type:"module"` in package.json.

- With the advent of client/server components and modules like `server-only`, testing as it used to be done, gets harder.

  - Developers use modules like `server-only` to ensure unwanted code does not end up on the client.

    - This creates boundaries, but is problematic for tests, where some components only work in the _server environment_ denoted by the framework of choice – in my case that is Next.js.

      - Since the test runner is not aware of _server environment_, the tests that import those modules fail.

  - **The go-to seem to be to use dependency injection rather than mocking**. This is a welcomed change tbh.

    - In some cases, **even if you use dependency injection, the end-result might not be what you expect**.

      Take the `action` prop on the `form` as an example. In the React code, we can do the following

      ```tsx
      export function PostThreadMessage({ action }: PostThreadMessageProps) {
        return (
          <form action={action}>
            <fieldset className={"flex flex-col gap-2"}>// stuff</fieldset>
          </form>
        );
      }
      ```

      The `action` takes `formData` and return a promise. Now in your test, you might do the following.

      ```tsx
      const actionSpy = fn(async (formData) => {
        /**
         * Not an instance of `FormData`.
         * I assume it's because Next.js performs some kind of serialization behind the scenes.
         * Since we are "detached" from Next.js here, the `formData` is a plain object.
         */
        console.log(formData, formData instanceof FormData);
        return undefined;
      });

      const component = await mount(<PostThreadMessage action={actionSpy} />);
      ```

      Notice the comment I've made. The best way I found out to go around this is to transform the `formData` into an object on the client side and then invoke the `action`. But that defeats the purpose of actions a bit for me. **The ecosystem does not seem to be ready for server actions**. It does not help that the notion of _component testing_ is relatively new.

- **Next.js does some weird things with `react` and `react-dom` package versions**.

  - **Next.js uses a compiled CANARY version of `react` and `react-dom`**. This is how you can import hooks like `useFormStatus` or `useFormState` while depending on version 18.2.0 (such hooks does not exist on that version).

    - I mean, this sounds very hacky to me. And it causes all sorts of problem with testing where they use the version you have installed in `package.json`.

    - **I had to manually add `overrides`** to the `package.json` and align with the React version Next.js uses. Such a shame tbh.
