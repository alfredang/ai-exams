import { redirect } from 'next/navigation';

// Certification details and SEO meta are edited on each Practice Exam page
// (/admin-dashboard/bundles/[id]); the old Certifications list forwards there.
export default function AdminCertificationsPage() {
  redirect('/admin-dashboard/bundles');
}
