'use client';
import { AdminSearch } from './admin-search';
import { NotificationBell } from './notification-bell';

// Admin search + notifications, shown in the site header on /admin-dashboard.
export function AdminHeaderTools() {
  return (
    <div className="flex min-w-0 items-center gap-1 sm:gap-2">
      <AdminSearch />
      <NotificationBell />
    </div>
  );
}
