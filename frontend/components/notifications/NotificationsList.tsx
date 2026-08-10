import React from 'react';
import { 
  BellRing, CheckCircle2, AlertTriangle, Info, Gift, 
  ShieldAlert, UserCheck, Banknote, CreditCard, Send, MoreVertical, Check
} from 'lucide-react';

export interface Notification {
  id: string;
  type: 'transaction' | 'approval' | 'security' | 'update' | 'offer';
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  dateGroup: 'Today' | 'Yesterday' | 'This Week' | 'Earlier';
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationsListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const getIconForType = (type: string) => {
  switch (type) {
    case 'transaction': return <Banknote size={20} className="text-error" />;
    case 'approval': return <CheckCircle2 size={20} className="text-tertiary" />;
    case 'security': return <ShieldAlert size={20} className="text-secondary" />;
    case 'offer': return <Gift size={20} className="text-primary" />;
    case 'update': default: return <Info size={20} className="text-[#3cddc7]" />;
  }
};

const getIconBgForType = (type: string) => {
  switch (type) {
    case 'transaction': return 'bg-error/10';
    case 'approval': return 'bg-tertiary/10';
    case 'security': return 'bg-secondary/10';
    case 'offer': return 'bg-primary/10';
    case 'update': default: return 'bg-[#3cddc7]/10';
  }
};

export default function NotificationsList({ notifications, onMarkAsRead, onDelete }: NotificationsListProps) {
  const groupedNotifications = notifications.reduce((acc, notification) => {
    if (!acc[notification.dateGroup]) {
      acc[notification.dateGroup] = [];
    }
    acc[notification.dateGroup].push(notification);
    return acc;
  }, {} as Record<string, Notification[]>);

  const groups = ['Today', 'Yesterday', 'This Week', 'Earlier'].filter(group => groupedNotifications[group] && groupedNotifications[group].length > 0);

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center bg-surface-container-low rounded-xl border border-white/5 h-full">
        <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center mb-6 shadow-inner">
          <CheckCircle2 size={40} className="text-tertiary/80" />
        </div>
        <h3 className="text-xl font-headline-lg text-on-surface mb-2">You're all caught up!</h3>
        <p className="text-[14px] text-on-surface-variant max-w-[300px]">
          There are no new notifications to display for this category. We'll alert you when something happens.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {groups.map(group => (
        <div key={group} className="flex flex-col gap-3">
          <h4 className="text-[13px] font-semibold text-on-surface-variant uppercase tracking-wider pl-1">{group}</h4>
          <div className="bg-surface-container-low rounded-xl border border-white/5 overflow-hidden shadow-sm">
            {groupedNotifications[group].map((notification, index) => (
              <div 
                key={notification.id}
                className={`
                  relative flex flex-col sm:flex-row gap-4 p-5 transition-all
                  ${!notification.isRead ? 'bg-primary/5' : 'bg-transparent'}
                  ${index !== groupedNotifications[group].length - 1 ? 'border-b border-white/5' : ''}
                  hover:bg-surface-container-high/40 group
                `}
              >
                {!notification.isRead && (
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary rounded-r-full" />
                )}
                
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${getIconBgForType(notification.type)}`}>
                    {getIconForType(notification.type)}
                  </div>
                  <div className="flex flex-col gap-1.5 flex-1 pt-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h5 className={`text-[15px] ${!notification.isRead ? 'font-semibold text-on-surface' : 'font-medium text-on-surface/90'}`}>
                        {notification.title}
                      </h5>
                      <span className="text-[12px] text-on-surface-variant font-medium sm:hidden">
                        {notification.timestamp}
                      </span>
                    </div>
                    <p className={`text-[14px] ${!notification.isRead ? 'text-on-surface-variant' : 'text-on-surface-variant/70'}`}>
                      {notification.description}
                    </p>
                    
                    {notification.action && (
                      <div className="mt-3">
                        <button 
                          onClick={notification.action.onClick}
                          className="px-4 py-2 bg-primary text-on-primary text-[13px] font-semibold rounded-lg shadow-[0_0_15px_rgba(240,180,41,0.2)] hover:shadow-[0_0_20px_rgba(240,180,41,0.4)] transition-all inline-flex items-center"
                        >
                          {notification.action.label}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="hidden sm:flex flex-col items-end justify-between shrink-0 pl-4 border-l border-white/5">
                  <span className="text-[12px] text-on-surface-variant font-medium whitespace-nowrap">
                    {notification.timestamp}
                  </span>
                  
                  <div className="flex items-center gap-2 mt-auto">
                    {!notification.isRead && (
                      <button 
                        onClick={() => onMarkAsRead(notification.id)}
                        className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Mark as Read"
                      >
                        <Check size={16} />
                      </button>
                    )}
                    <button className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-lg transition-all opacity-0 group-hover:opacity-100">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
