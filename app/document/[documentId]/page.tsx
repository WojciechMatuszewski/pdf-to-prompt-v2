import "server-only";

import { z } from "zod";
import { getDocumentData, postThreadMessage } from "../../lib/openai";
import clsx from "clsx";
import Link from "next/link";
import { PostThreadMessage } from "../../components/PostThreadMessage";

const ParamsSchema = z.object({
  documentId: z.string()
});

export default async function Page({ params }: { params: unknown }) {
  const { documentId } = ParamsSchema.parse(params);
  const { document, messages, threadId, assistantId } = await getDocumentData({
    documentId
  });

  return (
    <section className={"prose max-w-2xl m-auto"}>
      <div className={"flex flex-col gap-3 align-center"}>
        <div>
          <h1 className={"m-0"}>Chatting with {document.filename}</h1>
          <Link href={"/"} className={"inline-block"}>
            Go back
          </Link>
        </div>
      </div>
      <ul className={"flex flex-col-reverse"}>
        {messages.data.map((threadMessage) => {
          const { role, content, id } = threadMessage;
          const threadMessageContent = content[0];
          if (threadMessageContent.type !== "text") {
            return;
          }

          const wrapperClassName = clsx("chat", {
            "chat-start": role === "user",
            "chat-end": role === "assistant"
          });

          const bubbleClassName = clsx("chat-bubble", {
            "chat-bubble-primary": role === "user",
            "chat-bubble-secondary": role === "assistant"
          });

          return (
            <li key={id} className={wrapperClassName}>
              <div className={"chat-header"}>{role.toLocaleUpperCase()}</div>
              <div className={bubbleClassName}>
                {threadMessageContent.text.value}
              </div>
            </li>
          );
        })}
      </ul>
      <PostThreadMessage
        action={postThreadMessage}
        assistantId={assistantId}
        documentId={documentId}
        threadId={threadId}
      />
    </section>
  );
}
