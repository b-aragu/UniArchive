import { FormEvent, useState } from "react";
import { api } from "../api/client";

type Result = {
  id: number;
  title: string;
  course_code?: string;
  course_name?: string;
  academic_year?: string;
  document_type?: string;
  original_filename: string;
  snippet?: string;
  created_at: string;
};

export default function SearchPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [message, setMessage] = useState("");

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const q = String(formData.get("q") || "");
    const course_code = String(formData.get("course_code") || "");
    const document_type = String(formData.get("document_type") || "");

    try {
      const response = await api.get("/search", {
        params: { q, course_code: course_code || undefined, document_type: document_type || undefined },
      });
      setResults(response.data);
      setMessage(response.data.length ? "" : "No matching documents found.");
    } catch (error) {
      setMessage("Search failed. Make sure backend is running.");
    }
  }

  return (
    <section>
      <h2>Search Archive</h2>
      <form className="search-bar" onSubmit={handleSearch}>
        <input name="q" placeholder="Search by title, topic, or document text..." />
        <input name="course_code" placeholder="Course code" />
        <input name="document_type" placeholder="Type" />
        <button>Search</button>
      </form>

      {message && <p className="message">{message}</p>}

      <div className="results">
        {results.map((doc) => (
          <article className="result-card" key={doc.id}>
            <h3>{doc.title}</h3>
            <p className="meta">
              {doc.course_code || "No course"} · {doc.document_type || "No type"} · {doc.academic_year || "No year"}
            </p>
            <p>{doc.snippet || "No OCR snippet available."}</p>
            <small>Original file: {doc.original_filename}</small>
          </article>
        ))}
      </div>
    </section>
  );
}