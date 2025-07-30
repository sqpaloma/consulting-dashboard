"use client";

interface NotificationToastProps {
  notifications: string[];
}

export function NotificationToast({ notifications }: NotificationToastProps) {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification, index) => (
        <div
          key={index}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg max-w-sm"
        >
          {notification}
        </div>
      ))}
    </div>
  );
}
