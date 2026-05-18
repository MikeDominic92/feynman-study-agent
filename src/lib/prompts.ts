export const feynmanTutorSystemPrompt = `
You are Feynman Study Agent, a source-grounded tutor for a specific course.

Rules:
- Use the student's uploaded sources as the source of truth.
- Every source-backed claim must include source references.
- If you infer beyond the sources, mark confidence as "inferred" and ask for source material.
- Do not dump final answers in study mode. Coach with one clear question at a time.
- The student must teach concepts in simple, natural language.
- Flag filler words, vague phrases, and jargon that hides weak understanding.
- Convert each gap into a tiny review card or exam question.
- Prefer plain language over academic wording unless the exam requires the term.
`.trim();

export const deepResearchPrompt = `
I am designing an open-source AI study and exam-prep web app called Feynman Study Agent. Research the current market and architect the best possible v1.

Goal:
Design a simple, beautiful, source-grounded study app that can ingest a student's class materials such as slides, notes, assignments, syllabus, spreadsheets, and eventually textbooks. It should become a personal tutor for that class. The tutor must be built around the Feynman technique: if the student cannot explain a concept in simple natural language without filler, vague wording, or jargon, they do not understand it yet.

First domain:
Radiologic technology/radiation protection course material. Topics include ALARA, radiation exposure, time-distance-shielding, x-rays, biological effects, occupational responsibilities, background radiation, exposure, air kerma, absorbed dose, equivalent dose, effective dose, dose area product, and population dose. Do not copy proprietary course content; design for local import and sanitized demo data.

Research tasks:
1. Identify direct and adjacent competitors: NotebookLM, ChatGPT Study Mode, Khanmigo, Quizlet, Knowt, StudyFetch, Mindgrasp, Quizgecko, RemNote, Anki, Brainscape, Gizmo, and credible open-source AI study/RAG apps.
2. Compare their workflows: document upload, source citations, flashcards, quizzes, spaced repetition, tutoring style, progress tracking, exam simulation, Markdown export, collaboration, mobile use, privacy, and open-source gaps.
3. Distill only the highest-value workflows. Avoid feature bloat.
4. Recommend a v1 product architecture for a Next.js + TypeScript open-source app.
5. Design the UX: screens, navigation, visual style, empty states, study session flow, tutor flow, exam flow, review flow, and export flow.
6. Design the LLM system: prompts, retrieval, citation rules, hallucination controls, Feynman teach-back grading, gap detection, and personalized review scheduling.
7. Define the data model, API boundaries, local-first/privacy defaults, and repository structure.
8. Produce a 4-week implementation roadmap and acceptance criteria.
9. Include risks: copyright, hallucination, academic integrity, over-reliance on AI, poor generated flashcards, and privacy.
10. Output a concise competitor matrix, final product spec, technical architecture, and MVP backlog.

Use current sources and cite them. Prefer official product docs/pages, learning-science research, and reputable open-source repos.
`.trim();
