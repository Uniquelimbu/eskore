import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

export const formatNotificationTime = (timestamp) => {
  const date = new Date(timestamp);
  
  if (isToday(date)) {
    return formatDistanceToNow(date, { addSuffix: true });
  } else if (isYesterday(date)) {
    return 'Yesterday';
  } else {
    return format(date, 'MMM d, yyyy');
  }
};

export const getNotificationActionText = (notification) => {
  if (!notification) return {};
  
  switch (notification.type) {
    case 'invitation':
      return {
        acceptText: 'Accept Invitation',
        rejectText: 'Decline',
      };
    case 'join_request':
      return {
        acceptText: 'Approve Request',
        rejectText: 'Decline',
      };
    default:
      return {
        acceptText: 'Accept',
        rejectText: 'Reject',
      };
  }
};

export const getNotificationIcon = (type) => {
  switch (type) {
    case 'invitation':
      return '✉️';
    case 'join_request':
      return '👥';
    case 'request_accepted':
      return '✓';
    case 'request_denied':
      return '✕';
    case 'team_announcement':
      return '📢';
    default:
      return 'ℹ️';
  }
};

export const getNotificationRoute = (notification) => {
  if (!notification) return '/dashboard';
  
  switch (notification.type) {
    case 'invitation':
      return `/invitations/${notification.id}`;
    case 'join_request':
      return `/teams/${notification.teamId}/space/squad`;
    case 'request_accepted':
      return `/teams/${notification.teamId}/space`;
    case 'team_announcement':
      return `/teams/${notification.teamId}/space/announcements`;
    default:
      return '/dashboard';
  }
};
