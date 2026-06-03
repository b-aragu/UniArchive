export default function Dashboard() {
  return (
    <section>
      <h2>Dashboard</h2>
      <div className="card-grid">
        <div className="card">
          <h3>Upload Documents</h3>
          <p>Add PDFs or images with academic metadata.</p>
        </div>
        <div className="card">
          <h3>OCR Extraction</h3>
          <p>Extract text from academic documents for search.</p>
        </div>
        <div className="card">
          <h3>Search Archive</h3>
          <p>Find resources by title, course, year, type, or content.</p>
        </div>
      </div>
    </section>
  );
}