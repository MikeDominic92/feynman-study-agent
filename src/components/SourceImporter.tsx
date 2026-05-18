"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileUp } from "lucide-react";

export function SourceImporter() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState(
    "PPTX and XLSX are production-supported first.",
  );
  const [isPending, startTransition] = useTransition();

  async function submitImport() {
    const files = inputRef.current?.files;
    if (!files || files.length === 0) {
      setMessage("Choose at least one local source file.");
      return;
    }

    const formData = new FormData();
    for (const file of Array.from(files)) {
      formData.append("files", file);
    }

    setMessage("Importing local source...");
    const response = await fetch("/api/sources", {
      method: "POST",
      body: formData,
    });
    const payload = (await response.json()) as {
      imported?: Array<{ title: string; chunks: number; concepts: number }>;
      error?: string;
    };

    if (!response.ok) {
      setMessage(payload.error ?? "Import failed.");
      return;
    }

    const count = payload.imported?.length ?? 0;
    const chunks =
      payload.imported?.reduce((sum, item) => sum + item.chunks, 0) ?? 0;
    const concepts =
      payload.imported?.reduce((sum, item) => sum + item.concepts, 0) ?? 0;
    setMessage(`Imported ${count} file(s), ${chunks} chunks, ${concepts} concepts.`);
    startTransition(() => router.refresh());
  }

  return (
    <div className="upload-control">
      <input
        ref={inputRef}
        aria-label="Import course files"
        type="file"
        multiple
        accept=".pptx,.xlsx,.xls,.md,.markdown,.txt"
      />
      <button
        className="button primary"
        type="button"
        onClick={submitImport}
        disabled={isPending}
      >
        <FileUp size={18} aria-hidden="true" />
        Import local files
      </button>
      <p>{message}</p>
    </div>
  );
}
