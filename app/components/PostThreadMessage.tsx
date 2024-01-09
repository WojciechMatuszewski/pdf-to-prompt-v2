"use client";

import { useId } from "react";
import { useFormStatus } from "react-dom";

interface PostThreadMessageProps {
  threadId: string;
  assistantId: string;
  documentId: string;
  action: (formData: FormData) => Promise<void>;
}

export function PostThreadMessage({
  threadId,
  assistantId,
  documentId,
  action
}: PostThreadMessageProps) {
  const messageFieldId = useId();

  return (
    <form action={action}>
      <fieldset className={"flex flex-col gap-2"}>
        <label className={"sr-only"} htmlFor={messageFieldId}>
          Message
        </label>
        <textarea
          className={"textarea textarea-bordered"}
          name="message"
          id={messageFieldId}
        ></textarea>
        <input
          aria-label="Thread"
          type="hidden"
          name="threadId"
          value={threadId}
        />
        <input
          aria-label="Assistant"
          type="hidden"
          name="assistantId"
          value={assistantId}
        />
        <input
          aria-label="Document"
          type="hidden"
          name="documentId"
          value={documentId}
        />
        <SubmitButton />
      </fieldset>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className={"btn w-36 self-end"} disabled={pending}>
      {pending ? (
        <span className={"loading loading-spinner"}></span>
      ) : (
        <span>Post message</span>
      )}
    </button>
  );
}
