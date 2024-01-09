"use server";

import "server-only";

import { revalidatePath } from "next/cache";
import OpenAI from "openai";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { PrismaClient } from "@prisma/client";

const EnvSchema = z.object({
  OPENAI_API_KEY: z.string().min(1),
  DATABASE_URL: z.string().min(1)
});
const { OPENAI_API_KEY, DATABASE_URL } = EnvSchema.parse(process.env);

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const prisma = new PrismaClient({ datasourceUrl: DATABASE_URL });

const UploadFileSchema = zfd.formData({
  document: zfd.file()
});

export async function uploadDocument(formData: FormData) {
  const { document } = UploadFileSchema.parse(formData);

  const file = await openai.files.create({
    file: document,
    purpose: "assistants"
  });

  const assistant = await openai.beta.assistants.create({
    name: `PDFChatter-${file.id}`,
    instructions: `You are great at summarizing and answering questions.
 When asked a question, use the information in the provided file to form a friendly and concise response.
If you cannot find the answer in the file, do your best to infer what the answer should be.
Mind that it is better to tell "I do not know" rather than to lie.`,
    model: "gpt-4-1106-preview",
    tools: [{ type: "retrieval" }],
    file_ids: [file.id]
  });

  const thread = await openai.beta.threads.create({});

  await prisma.documentMetadata.create({
    data: {
      id: file.id,
      assistantId: assistant.id,
      threadId: thread.id
    }
  });

  revalidatePath("/");
}

const DeleteDocumentSchema = zfd.formData({
  documentId: zfd.text()
});

export async function deleteDocument(formData: FormData) {
  const { documentId } = DeleteDocumentSchema.parse(formData);
  const { assistantId } = await prisma.documentMetadata.findUniqueOrThrow({
    where: { id: documentId }
  });

  await Promise.all([
    openai.files.del(documentId),
    openai.beta.assistants.del(assistantId),
    prisma.documentMetadata.delete({ where: { id: documentId } })
  ]);
  await revalidatePath("/");
}

export async function getUploadedDocuments() {
  return await openai.files.list({ purpose: "assistants" });
}

export async function getDocumentData({ documentId }: { documentId: string }) {
  const document = await openai.files.retrieve(documentId);

  const { assistantId, threadId } =
    await prisma.documentMetadata.findUniqueOrThrow({
      where: {
        id: documentId
      }
    });

  const messages = await openai.beta.threads.messages.list(threadId);

  return { document, messages, assistantId, threadId };
}

const PostMessageSchema = zfd.formData({
  message: zfd.text(),
  threadId: zfd.text(),
  assistantId: zfd.text(),
  documentId: zfd.text()
});

export async function postThreadMessage(formData: FormData) {
  const { message, threadId, assistantId, documentId } =
    PostMessageSchema.parse(formData);

  await openai.beta.threads.messages.create(threadId, {
    content: message,
    role: "user"
  });

  const { id: runId } = await openai.beta.threads.runs.create(threadId, {
    assistant_id: assistantId
  });

  const status = await waitForThread({ threadId, runId });
  if (status !== "completed") {
    throw new Error("Error!");
  }

  revalidatePath(`/file/${documentId}`);
}

async function waitForThread({
  threadId,
  runId
}: {
  threadId: string;
  runId: string;
}) {
  const SLEEP_DURATION_MS = 1_500;
  const sleep = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(undefined);
      }, SLEEP_DURATION_MS);
    });
  };

  do {
    await sleep();
    const { status: runStatus } = await openai.beta.threads.runs.retrieve(
      threadId,
      runId
    );

    const statusesToWaitFor: Array<typeof runStatus> = [
      "queued",
      "in_progress"
    ];
    if (!statusesToWaitFor.includes(runStatus)) {
      return runStatus;
    }
  } while (true);
}
