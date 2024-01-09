"use client";

import { Button, FileTrigger } from "react-aria-components";
import { version } from "react-dom";
console.log({ version });

interface DocumentUploadProps {
  onDocument: (formData: FormData) => void;
}

export function DocumentUpload({ onDocument }: DocumentUploadProps) {
  function handleOnSelect(fileList: FileList | null) {
    if (!fileList) {
      return;
    }

    const files = Array.from(fileList);
    if (files.length > 1) {
      throw new Error("Too many files");
    }

    const [document] = Array.from(fileList);
    if (document.type !== "application/pdf") {
      return;
    }

    const formData = new FormData();
    formData.set("document", document);

    onDocument(formData);
  }

  return (
    <FileTrigger
      allowsMultiple
      onSelect={handleOnSelect}
      acceptedFileTypes={["application/pdf"]}
      acceptDirectory={false}
    >
      <Button className={"btn btn-primary w-[max-content]"}>
        Select document
      </Button>
    </FileTrigger>
  );
}
