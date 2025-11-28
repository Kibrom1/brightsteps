# Phase 4 - Complete Implementation Guide

This document contains the complete implementation for Phase 4 features.

## Table of Contents

1. [Backend Endpoint Specifications](#backend-endpoints)
2. [Updated Dashboard with Charts](#updated-dashboard)
3. [Deal Detail with Comps and Projections](#deal-detail-enhancements)
4. [Notifications System](#notifications-system)
5. [Profile Settings](#profile-settings)
6. [Export Functionality](#export-functionality)
7. [Toast/Error Handling](#toast-error-handling)

---

## Backend Endpoint Specifications

### 1. Deals with Filters

**Endpoint:** `GET /api/v1/deals`

**Query Parameters:**
```typescript
{
  search?: string;              // Search in address, city, zip, notes
  property_type?: string;       // Comma-separated: "single_family,condo"
  city?: string;
  state?: string;
  zip_code?: string;
  min_cap_rate?: number;
  min_monthly_cash_flow?: number;
  min_dscr?: number;
  skip?: number;
  limit?: number;
}
```

**Response:** `{ data: Deal[] }`

### 2. Comparable Properties

**Endpoint:** `GET /api/v1/deals/{id}/comps`

**Response:**
```typescript
{
  data: Deal[]  // Deals with same zip_code, similar property_type, excluding current deal
}
```

**Backend Implementation Suggestion:**
```python
@router.get("/deals/{deal_id}/comps", response_model=List[DealResponse])
def get_comparable_properties(
    deal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get comparable properties for a deal."""
    deal = db.query(Deal).filter(Deal.id == deal_id, Deal.user_id == current_user.id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    
    # Get comps: same zip_code, similar property_type, exclude current deal
    query = db.query(Deal).filter(
        Deal.id != deal_id,
        Deal.user_id == current_user.id,
    )
    
    if deal.property and deal.property.zip_code:
        query = query.join(Property).filter(Property.zip_code == deal.property.zip_code)
    
    if deal.property:
        query = query.filter(Property.property_type == deal.property.property_type)
    
    comps = query.limit(10).all()
    return comps
```

### 3. Notifications

**Endpoints:**

```typescript
// Get notifications
GET /api/v1/notifications
Response: { data: Notification[] }

// Mark as read
POST /api/v1/notifications/{id}/read
Response: { data: Notification }
```

**Backend Model:**
```python
class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String, nullable=False)  # "deal_created", "deal_updated", etc.
    message = Column(String, nullable=False)
    read = Column(Boolean, default=False)
    deal_id = Column(Integer, ForeignKey("deals.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
```

### 4. User Preferences

**Endpoint:** `PUT /api/v1/users/me`

**Request Body:**
```typescript
{
  full_name?: string;
  preferences?: {
    notification_email_enabled: boolean;
    notification_summary_enabled: boolean;
    default_vacancy_percent?: number;
    default_maintenance_percent?: number;
    default_management_percent?: number;
  };
}
```

### 5. Export Endpoints

**CSV Export:**
```
GET /api/v1/deals/export.csv?filters...
Content-Type: text/csv
Content-Disposition: attachment; filename="deals-export.csv"
```

**PDF Export:**
```
GET /api/v1/deals/{id}/export.pdf
Content-Type: application/pdf
Content-Disposition: attachment; filename="deal-{id}-report.pdf"
```

---

## Updated Dashboard with Charts

See `frontend/src/pages/DashboardPage.tsx` (updated version below).

---

## Deal Detail Enhancements

See `frontend/src/pages/DealDetailPage.tsx` (updated version below).

---

## Notifications System

### NotificationBell Component

```typescript
// frontend/src/components/notifications/NotificationBell.tsx
import { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../lib/hooks/useNotifications';

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, isLoading } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500">{unreadCount} unread</p>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No notifications</div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => {
                    if (!notification.read) {
                      markAsRead(notification.id);
                    }
                  }}
                >
                  <p className="text-sm text-gray-900">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

### useNotifications Hook

```typescript
// frontend/src/lib/hooks/useNotifications.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../api/notifications';
import type { Notification } from '../../types';

export function useNotifications() {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getNotifications(),
    refetchInterval: 30000, // Poll every 30 seconds
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead: (id: number) => markAsReadMutation.mutate(id),
  };
}
```

---

## Profile Settings

See updated `frontend/src/pages/ProfilePage.tsx` below.

---

## Export Functionality

### CSV Export

Already implemented in `frontend/src/lib/utils/csv-export.ts`. Usage:

```typescript
import { exportToCSV } from '../lib/utils/csv-export';

const csvData = deals.map((deal) => ({
  'Deal ID': deal.id,
  'Address': deal.property?.address_line1 || 'N/A',
  'Purchase Price': deal.purchase_price,
  'Monthly Rent': deal.monthly_rent,
  'Cap Rate': calculateCapRate(deal),
  'Monthly Cash Flow': deal.snapshot_of_analytics_result?.cash_flow.monthly_cash_flow || 0,
  'DSCR': deal.snapshot_of_analytics_result?.dscr.dscr || 'N/A',
}));

exportToCSV(csvData, { filename: 'deals-export.csv' });
```

### PDF Export

```typescript
// In DealDetailPage
const handleExportPDF = () => {
  const url = `/api/v1/deals/${deal.id}/export.pdf`;
  window.open(url, '_blank');
};
```

---

## Toast/Error Handling

### Toast Context

```typescript
// frontend/src/contexts/ToastContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  toasts: Toast[];
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, toasts, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
```

---

## Complete Updated Files

The following files need to be updated/created:

1. `frontend/src/pages/DashboardPage.tsx` - Add charts, search, filters
2. `frontend/src/pages/DealDetailPage.tsx` - Add comps, projection chart, PDF export
3. `frontend/src/pages/ProfilePage.tsx` - Add preferences form
4. `frontend/src/components/Layout.tsx` - Add NotificationBell
5. `frontend/src/lib/api/notifications.ts` - New file
6. `frontend/src/lib/api/deals.ts` - Add filter support, comps, export
7. `frontend/src/lib/api/users.ts` - Add preferences update

See the next sections for complete code.

