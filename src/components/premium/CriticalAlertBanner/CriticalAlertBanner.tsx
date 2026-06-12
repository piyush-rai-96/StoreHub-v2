import React from 'react';
import { Alert } from 'impact-ui';
import { CriticalAlert } from '../../../types/home';

interface CriticalAlertBannerProps {
  alert: CriticalAlert;
  onDismiss?: () => void;
}

const SEVERITY_MAP: Record<string, 'error' | 'warning' | 'info' | 'success'> = {
  critical: 'error',
  high: 'error',
  warning: 'warning',
  medium: 'warning',
  info: 'info',
  low: 'info',
  success: 'success',
};

export const CriticalAlertBanner: React.FC<CriticalAlertBannerProps> = ({
  alert,
  onDismiss,
}) => {
  const severity = SEVERITY_MAP[alert.severity] ?? 'warning';
  const firstAction = alert.actions?.[0];

  return (
    <Alert
      severity={severity}
      title={alert.title}
      description={alert.message}
      onClose={onDismiss}
      actionName={firstAction?.label}
      onAction={firstAction?.onClick}
      subtleBackground
    />
  );
};
