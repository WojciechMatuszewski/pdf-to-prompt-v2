import { DocumentUpload } from "./components/DocumentUpload";
import { DocumentsTable } from "./components/DocumentsTable";
import { getUploadedDocuments, uploadDocument } from "./lib/openai";

export default async function Home() {
  const uploadedDocuments = await getUploadedDocuments();

  return (
    <div className={"max-w-2xl m-auto"}>
      <DocumentUpload onDocument={uploadDocument} />
      <DocumentsTable uploadedDocuments={uploadedDocuments} />
    </div>
  );
}
