import "server-only";

import Link from "next/link";
import type { FileObject, FileObjectsPage } from "openai/resources/files.mjs";
import { deleteDocument } from "../lib/openai";

interface FilesTableProps {
  uploadedDocuments: FileObjectsPage;
}

export function DocumentsTable({ uploadedDocuments }: FilesTableProps) {
  return (
    <table className={"table table-md"}>
      <thead>
        <tr>
          <th>File name</th>
          <th>Uploaded at</th>
          <th></th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {uploadedDocuments.data.map((uploadedDocument, index) => {
          return (
            <DocumentRow
              key={uploadedDocument.id}
              uploadedDocument={uploadedDocument}
            />
          );
        })}
      </tbody>
    </table>
  );
}

interface DocumentRowProps {
  uploadedDocument: FileObject;
}

function DocumentRow({ uploadedDocument }: DocumentRowProps) {
  const uploadedAtDate = Intl.DateTimeFormat(["en"], {
    dateStyle: "medium",
    timeStyle: "medium"
  }).format(uploadedDocument.created_at * 1000);

  const linkToDocument = `/document/${uploadedDocument.id}`;

  return (
    <tr className={"hover"} key={uploadedDocument.id}>
      <th className={"font-normal"}>{uploadedDocument.filename}</th>
      <th className={"font-normal"}>{uploadedAtDate}</th>
      <th className={"font-normal"}>
        <Link className={"link link-secondary"} href={linkToDocument}>
          Chat with document
        </Link>
      </th>
      <th>
        <DeleteDocument documentId={uploadedDocument.id} />
      </th>
    </tr>
  );
}

interface DeleteDocumentProps {
  documentId: string;
}

function DeleteDocument({ documentId }: DeleteDocumentProps) {
  return (
    <form action={deleteDocument}>
      <button
        name="documentId"
        value={documentId}
        className={"btn btn-square btn-error btn-sm font-normal text-white"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </form>
  );
}
