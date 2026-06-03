# Chapter 1: Introduction

## 1.1 Background
The rapid digitalization of education has resulted in an overwhelming influx of academic resources, including past papers, lecture notes, and continuous assessment tests (CATs). However, a significant portion of these materials exists in non-searchable formats, primarily scanned PDFs and raw images. This creates a critical bottleneck in information retrieval within academic institutions.

## 1.2 Problem Statement
Students and faculty spend excessive amounts of time manually sifting through disjointed physical or digitally scanned archives to find relevant study materials. Traditional university repositories rely on manual metadata tagging (e.g., file names), which is error-prone, incomplete, and fails to expose the actual content of the documents. Consequently, valuable academic knowledge remains effectively invisible and inaccessible.

## 1.3 Objectives
*   **Primary Objective:** To design and implement "UniArchive," an intelligent academic document retrieval system capable of extracting and indexing content from scanned academic materials.
*   **Specific Objectives:**
    1.  To develop an automated Optical Character Recognition (OCR) pipeline.
    2.  To implement a dual-engine search system utilizing PostgreSQL Full-Text Search and FAISS Semantic Vector Search.
    3.  To create a secure, role-based architecture for managing academic hierarchy and document life cycles.

## 1.4 Scope
The scope of this project is limited to the backend processing, indexing, and retrieval of textual data from uploaded academic documents (PDFs and common image formats). It includes the development of a functional MVP frontend interface. It does not encompass video/audio transcription, real-time collaboration features, or deep LLM-based generative question-answering.

## 1.5 Significance
By unlocking the text hidden within scanned documents, UniArchive drastically improves the efficiency of academic research and revision. It democratizes access to institutional knowledge, ensuring that all students, regardless of when a document was created or how it was scanned, can easily find the exact concept or past question they are looking for.
