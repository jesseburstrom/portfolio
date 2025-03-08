'use client';

import { useRouter } from 'next/navigation';
import { isAdmin, logout } from '@/lib/auth';

export default function AdminHeader() {
  const router = useRouter();
  const adminStatus = isAdmin();

  const handleLogout = () => {
    logout();
    router.refresh();
  };

  if (!adminStatus) return null;

  return (
    <div className="bg-indigo-600 text-white py-2 px-4 flex justify-between items-center">
      <span className="font-semibold">Admin Mode</span>
      <button
        onClick={handleLogout}
        className="text-sm bg-indigo-700 px-3 py-1 rounded hover:bg-indigo-800 transition-colors"
      >
        Logout
      </button>
    </div>
  );
}
