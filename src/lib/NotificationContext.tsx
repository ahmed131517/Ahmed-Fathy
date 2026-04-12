import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo, useCallback } from 'react';
import { db, Notification } from './db';
import { useLiveQuery } from 'dexie-react-hooks';
import { toast } from 'sonner';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'localId' | 'createdAt' | 'lastModified' | 'isDeleted' | 'isSynced' | 'isRead'>) => Promise<void>;
  markAsRead: (localId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (localId: number) => Promise<void>;
  clearAll: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const notifications = useLiveQuery(
    () => db.notifications.where('isDeleted').equals(0).reverse().sortBy('createdAt')
  ) || [];

  const unreadCount = notifications.filter(n => n.isRead === 0).length;

  const addNotification = useCallback(async (notification: Omit<Notification, 'localId' | 'createdAt' | 'lastModified' | 'isDeleted' | 'isSynced' | 'isRead'>) => {
    const now = Date.now();
    await db.notifications.add({
      ...notification,
      isRead: 0,
      createdAt: now,
      lastModified: now,
      isDeleted: 0,
      isSynced: 0
    });
    
    // Show a toast for important notifications
    if (notification.type === 'error' || notification.type === 'warning' || notification.type === 'success') {
      toast[notification.type](notification.title, {
        description: notification.message
      });
    }
  }, []);

  const markAsRead = useCallback(async (localId: number) => {
    await db.notifications.update(localId, {
      isRead: 1,
      lastModified: Date.now()
    });
  }, []);

  const markAllAsRead = useCallback(async () => {
    const unreadIds = notifications.filter(n => n.isRead === 0).map(n => n.localId).filter((id): id is number => id !== undefined);
    if (unreadIds.length === 0) return;
    
    const now = Date.now();
    await Promise.all(unreadIds.map(id => db.notifications.update(id, { isRead: 1, lastModified: now })));
  }, [notifications]);

  const deleteNotification = useCallback(async (localId: number) => {
    await db.notifications.update(localId, {
      isDeleted: 1,
      lastModified: Date.now()
    });
  }, []);

  const clearAll = useCallback(async () => {
    const ids = notifications.map(n => n.localId).filter((id): id is number => id !== undefined);
    if (ids.length === 0) return;
    
    const now = Date.now();
    await Promise.all(ids.map(id => db.notifications.update(id, { isDeleted: 1, lastModified: now })));
  }, [notifications]);

  const contextValue = useMemo(() => ({
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll
  }), [notifications, unreadCount, addNotification, markAsRead, markAllAsRead, deleteNotification, clearAll]);

  // Seed some initial notifications if empty
  useEffect(() => {
    const seedNotifications = async () => {
      const count = await db.notifications.count();
      if (count === 0) {
        const now = Date.now();
        await db.notifications.bulkAdd([
          {
            title: "Welcome to MedicalApp",
            message: "Your clinical dashboard is ready. Start by registering a new patient.",
            type: "success",
            category: "system",
            isRead: 0,
            createdAt: now - 3600000,
            lastModified: now,
            isDeleted: 0,
            isSynced: 0
          },
          {
            title: "Lab Results Pending",
            message: "Lab results for Sarah Johnson (P-1001) are expected by tomorrow.",
            type: "info",
            category: "lab",
            isRead: 0,
            createdAt: now - 7200000,
            lastModified: now,
            isDeleted: 0,
            isSynced: 0
          }
        ]);
      }
    };
    seedNotifications();
  }, []);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
