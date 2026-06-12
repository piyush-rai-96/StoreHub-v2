import React from 'react';
import { Panel } from 'impact-ui';

interface ImDrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  width?: number;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export const ImDrawer: React.FC<ImDrawerProps> = ({
  open,
  onClose,
  title,
  subtitle,
  width = 600,
  footer,
  children,
}) => {
  return (
    <Panel
      open={open}
      setIsOpen={(v) => { if (!v) onClose(); }}
      onClose={onClose}
      anchor="right"
      size="large"
      title={subtitle ? <>{title}<span className="ia-drawer-sub">{subtitle}</span></> : title}
      width={width}
      customFooterContent={footer}
      zIndex={1400}
    >
      {children}
    </Panel>
  );
};
