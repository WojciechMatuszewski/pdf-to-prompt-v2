import { expect, test } from "@playwright/experimental-ct-react";
import sinon from "sinon";
import { DocumentUpload } from "./DocumentUpload";

test("calls the callback when user uploads pdf file", async ({
  mount,
  page
}) => {
  const onDocumentFake = sinon.fake();
  const component = await mount(<DocumentUpload onDocument={onDocumentFake} />);

  await expect(page.locator("input")).toHaveAttribute(
    "accept",
    "application/pdf"
  );

  {
    const fileChooserPromise = page.waitForEvent("filechooser");

    await component.getByRole("button", { name: "Select document" }).click();

    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: "foo.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.alloc(10, "a")
    });

    expect(onDocumentFake.calledOnce).toEqual(true);
  }

  onDocumentFake.resetHistory();

  {
    const fileChooserPromise = page.waitForEvent("filechooser");

    await component.getByRole("button", { name: "Select document" }).click();

    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: "foo.txt",
      mimeType: "text/plain",
      buffer: Buffer.alloc(10, "a")
    });

    expect(onDocumentFake.calledOnce).toEqual(false);
  }
});
