import { redirect } from 'next/navigation';

// Questions are added from the question bank page (Add manually / AI Assist).
export default async function AuthorRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/admin-dashboard/exams/${id}#questions`);
}
