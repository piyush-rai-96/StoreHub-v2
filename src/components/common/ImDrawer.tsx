import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'impact-ui';
import Close from '@mui/icons-material/Close';
import './ImDrawer.css';

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
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return ReactDOM.createPortal(
    <div className="ia-drawer-overlay" onClick={onClose} role="presentation">
      <aside
        className="ia-drawer"
        style={{ width: `min(${width}px, 100vw)` }}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ia-drawer-title"
      >
        {title && (
          <header className="ia-drawer-header">
            <div>
              <h3 id="ia-drawer-title">{title}</h3>
              {subtitle && <p className="ia-drawer-sub">{subtitle}</p>}
            </div>
            <Button
              variant="text"
              size="small"
              onClick={onClose}
              aria-label="Close"
              className="ia-drawer-close-btn"
            >
              <Close sx={{ fontSize: 20 }} />
            </Button>
          </header>
        )}
        <div className="ia-drawer-body">{children}</div>
        {footer && <footer className="ia-drawer-footer">{footer}</footer>}
      </aside>
    </div>,
    document.body,
  );
};
