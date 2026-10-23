import { redirect } from 'next/navigation';

// Practice Exams are created together with their question bank, so the old
// "New product" form now lives at Create Practice Exam.
export default function NewPracticeExamPage() {
  redirect('/admin-dashboard/exams/new');
}
