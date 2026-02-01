import React, { useState, useEffect } from 'react';
import { FaBell } from 'react-icons/fa';
import { db } from '../../firebase/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, limit } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const { userRole } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (userRole !== 'admin') return;

        // Real-time listener for admin notifications (no orderBy to avoid slow loading)
        const q = query(
            collection(db, 'notifications'),
            where('targetRole', '==', 'admin'),
            limit(10)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notifs = [];
            let unread = 0;

            snapshot.forEach((doc) => {
                const data = doc.data();
                notifs.push({ id: doc.id, ...data });
                if (!data.read) unread++;
            });

            // Sort by createdAt in JavaScript instead of Firestore
            notifs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            setNotifications(notifs);
            setUnreadCount(unread);
        });

        return () => unsubscribe();
    }, [userRole]);

    const markAsRead = async (notificationId) => {
        try {
            await updateDoc(doc(db, 'notifications', notificationId), {
                read: true
            });
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleNotificationClick = (notification) => {
        markAsRead(notification.id);
        if (notification.actionUrl) {
            navigate(notification.actionUrl);
        }
        setShowDropdown(false);
    };

    const getTimeAgo = (timestamp) => {
        const now = new Date();
        const notifTime = new Date(timestamp);
        const diffMs = now - notifTime;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    if (userRole !== 'admin') return null;

    return (
        <div className="relative">
            {/* Bell Icon */}
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
                <FaBell className="text-xl" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {showDropdown && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowDropdown(false)}
                    />

                    {/* Dropdown Content */}
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-20 max-h-96 overflow-y-auto">
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-900">
                                Notifications
                                {unreadCount > 0 && (
                                    <span className="ml-2 text-xs text-gray-500">
                                        ({unreadCount} unread)
                                    </span>
                                )}
                            </h3>
                        </div>

                        {/* Notifications List */}
                        <div className="divide-y divide-gray-100">
                            {notifications.length === 0 ? (
                                <div className="px-4 py-8 text-center text-gray-500 text-sm">
                                    No notifications
                                </div>
                            ) : (
                                notifications.map((notif) => (
                                    <button
                                        key={notif.id}
                                        onClick={() => handleNotificationClick(notif)}
                                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${!notif.read ? 'bg-blue-50' : ''
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Unread Indicator */}
                                            {!notif.read && (
                                                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                                            )}

                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 mb-1">
                                                    {notif.title}
                                                </p>
                                                <p className="text-xs text-gray-600 mb-2">
                                                    {notif.message}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {getTimeAgo(notif.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
                                <button
                                    onClick={() => {
                                        navigate('/admin/partner-accounts');
                                        setShowDropdown(false);
                                    }}
                                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    View all partner requests →
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
