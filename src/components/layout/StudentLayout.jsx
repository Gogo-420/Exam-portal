import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import StudentSidebar from '../student/StudentSidebar';
import StudentHeader from '../student/StudentHeader';
import { MOCK_STUDENT_NOTIFICATIONS } from '../../utils/mockData';

export default function StudentLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_STUDENT_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex text-slate-800 font-sans">
      <StudentSidebar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        unreadCount={unreadCount}
      />
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <StudentHeader
          setMobileOpen={setMobileOpen}
          unreadCount={unreadCount}
          onMarkAllRead={handleMarkAllRead}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
