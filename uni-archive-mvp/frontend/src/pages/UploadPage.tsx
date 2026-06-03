import { FormEvent, useState } from "react";
import { api } from "../api/client";

export default function UploadPage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage("Document uploaded and processed successfully.");
      form.reset();
    } catch (error) {
      setMessage("Upload failed. Check backend terminal for details.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h2>Upload Document</h2>
      <form className="form" onSubmit={handleSubmit}>
        <label>Title <input name="title" required /></label>
        <label>Course Code <input name="course_code" placeholder="e.g. CS101" /></label>
        <label>Course Name <input name="course_name" placeholder="e.g. Database Systems" /></label>
        <label>Academic Year <input name="academic_year" placeholder="e.g. 2024/2025" /></label>
        <label>Semester <input name="semester" placeholder="e.g. Semester 1" /></label>
        <label>Document Type <input name="document_type" placeholder="Exam, CAT, Notes, Assignment" /></label>
        <label>File <input type="file" name="file" accept=".pdf,.png,.jpg,.jpeg" required /></label>
        <button disabled={loading}>{loading ? "Uploading..." : "Upload"}</button>
      </form>
      {message && <p className="message">{message}</p>}
    </section>
  );
}