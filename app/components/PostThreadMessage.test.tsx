import { expect, test } from "@playwright/experimental-ct-react";
import { PostThreadMessage } from "./PostThreadMessage";
import { fn } from "jest-mock";

test("user can post the message", async ({ mount }) => {
  const threadId = "1";
  const assistantId = "1";
  const documentId = "1";

  const actionSpy = fn(async (formData) => {
    /**
     * Not an instance of `FormData`.
     * I assume it's because Next.js performs some kind of serialization behind the scenes.
     * Since we are "detached" from Next.js here, the `formData` is a plain object.
     */
    console.log(formData, formData instanceof FormData);
    return undefined;
  });

  const component = await mount(
    <PostThreadMessage
      action={actionSpy}
      threadId={threadId}
      assistantId={assistantId}
      documentId={documentId}
    />
  );

  await component
    .getByRole("textbox", { name: "Message" })
    .fill("Some message");

  await component.getByRole("button", { name: "Post message" }).click();

  expect(actionSpy.mock.calls[0]).toHaveLength(1);

  await expect(component.locator("input[aria-label='Thread']")).toHaveValue(
    "1"
  );
  await expect(component.locator("input[aria-label='Assistant']")).toHaveValue(
    "1"
  );
  await expect(component.locator("input[aria-label='Document']")).toHaveValue(
    "1"
  );
});
