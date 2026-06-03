# UNI ARCHIVE: An Intelligent Academic Document Retrieval System with OCR and Semantic Search

A Project Report Submitted in Partial Fulfilment of the Requirements for the Award of the Degree of Bachelor of Science in Computer Science

By:

**Antony Baragu Gichuki**

**CIT-223-009/2022**

Department of Computer Science

Multimedia University of Kenya

---

**Supervisor:**

Dr. Ngari

February, 2026

---

## Declaration

### Declaration by Student

I, Antony Baragu Gichuki the undersigned, hereby declare that this project report is my original work and has not been submitted to any other university or institution of higher learning for any academic award to the best of my knowledge.

**Student Name:** Antony Baragu Gichuki

**Registration Number:** CIT-223-009/2022

**Signature:** ___________________

**Date:** 6th February 2026

---

## Approval

This project report has been submitted for examination with my approval as the university supervisor.

**Supervisor Name:** Dr. Ngari

**Signature:** ___________________

**Date:** 6th February 2026

---

## Dedication

*(Optional - Insert Dedication Here if desired)*

---

## Acknowledgement

I wish to express my sincere gratitude to everyone who contributed, directly or indirectly, to the successful completion of this project.

My deepest appreciation goes to my supervisor, Dr. Ngari, for their invaluable guidance, constructive criticism, patience, and encouragement throughout the project. Their expertise and insightful suggestions were instrumental in shaping this work.

I am also grateful to the Department of Computer Science at Multimedia University of Kenya for providing the necessary resources and a conducive academic environment that facilitated this research. Special thanks to my peers for their collaborative spirit and intellectual discussions that contributed significantly to my understanding of information retrieval and computer vision techniques.

I acknowledge the open-source community for providing the tools and libraries that made this project possible, including the Hugging Face team for transformer models and the Tesseract OCR project.

A special note of thanks goes to my family and friends for their unwavering love, support, and encouragement, which provided the strength and motivation needed to overcome challenges.

To all those who supported me in countless ways, I offer my heartfelt thanks.

---

## Abstract

Academic institutions generate vast quantities of valuable study materials, including past examination papers and lecture notes. However, a significant percentage of these documents are digitized as non-searchable, scanned images. Traditional repositories fail to index the actual content of these files, leading to a critical bottleneck in resource discovery. UniArchive is a modern, web-based platform designed to eradicate this "dark data" problem. It serves as an intelligent repository that automatically extracts, indexes, and retrieves the hidden textual content of scanned academic materials. By combining a fault-tolerant Optical Character Recognition (OCR) pipeline (utilizing PyMuPDF and Tesseract) with advanced Machine Learning (Sentence-BERT), the system transforms flat images into a searchable semantic knowledge graph. Furthermore, it implements Reciprocal Rank Fusion (RRF) to merge exact keyword searches with conceptual meaning, yielding highly precise retrievals. The system effectively prevents duplicate uploads using perceptual hashing (pHash) and is optimized for lightweight deployment, demonstrating that modern machine learning techniques can be practically applied to legacy academic archiving problems.

---

## Abbreviations and Acronyms

| Abbreviation/Acronym | Full Form |
|---------------------|-----------|
| AI | Artificial Intelligence |
| ANN | Approximate Nearest Neighbor |
| API | Application Programming Interface |
| BM25 | Best Matching 25 (Ranking Algorithm) |
| CAT | Continuous Assessment Test |
| CER | Character Error Rate |
| CRUD | Create, Read, Update, Delete |
| CV | Computer Vision |
| DB | Database |
| DBMS | Database Management System |
| DFD | Data Flow Diagram |
| ERD | Entity Relationship Diagram |
| FAISS | Facebook AI Similarity Search |
| FTS | Full-Text Search |
| GIN | Generalized Inverted Index |
| IDE | Integrated Development Environment |
| IR | Information Retrieval |
| JSON | Javascript Object Notation |
| JWT | JSON Web Token |
| LLM | Large Language Model |
| ML | Machine Learning |
| MRR | Mean Reciprocal Rank |
| MVC | Model-View-Controller |
| nDCG | Normalized Discounted Cumulative Gain |
| NLP | Natural Language Processing |
| OCR | Optical Character Recognition |
| OS | Operating System |
| PDF | Portable Document Format |
| pHash | Perceptual Hash |
| RAG | Retrieval-Augmented Generation |
| RBAC | Role-Based Access Control |
| RDBMS | Relational Database Management System |
| REST | Representational State Transfer |
| RRF | Reciprocal Rank Fusion |
| SBERT | Sentence-BERT |
| SPA | Single Page Application |
| UI | User Interface |
| UML | Unified Modelling Language |
| WER | Word Error Rate |

---

## Table of Contents
*(To be auto-generated in Word/LaTeX)*

## List of Figures
*(To be auto-generated in Word/LaTeX)*

## List of Tables
*(To be auto-generated in Word/LaTeX)*
