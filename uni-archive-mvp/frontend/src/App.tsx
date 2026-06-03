import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import UploadPage from "./pages/UploadPage";
import SearchPage from "./pages/SearchPage";

type Page = "dashboard" | "upload" | "search";

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");

  return (
    <div className="app">
      <aside className="sidebar">
        <h1>UNI ARCHIVE</h1>
        <p>Academic Document Retrieval</p>
        <button onClick={() => setPage("dashboard")}>Dashboard</button>
        <button onClick={() => setPage("upload")}>Upload</button>
        <button onClick={() => setPage("search")}>Search</button>
      </aside>

      <main className="content">
        {page === "dashboard" && <Dashboard />}
        {page === "upload" && <UploadPage />}
        {page === "search" && <SearchPage />}
      </main>
    </div>
  );
}