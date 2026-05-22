import React from 'react';
import { Badge } from 'impact-ui';
import type { OpportunityStatus } from '../../../types/productOpportunity';
import { OPPORTUNITY_STATUS_LABELS } from '../../../types/productOpportunity';

type BadgeColor = 'error' | 'warning' | 'info' | 'success' | 'default';

const STATUS_COLOR_MAP: Record<OpportunityStatus, BadgeColor> = {
  open: 'info',
  in_progress: 'warning',
  pending_approval: 'warning',
  approved: 'success',
  actioned: 'info',
  closed: 'success',
  rejected: 'error',
  unresolved: 'error',
};

interface Props {
  status: OpportunityStatus;
  size?: 'small' | 'medium';
}

export const OpportunityStatusChip: React.FC<Props> = ({ status, size = 'small' }) => (
  <Badge
    label={OPPORTUNITY_STATUS_LABELS[status]}
    color={STATUS_COLOR_MAP[status]}
    variant="subtle"
    size={size}
  />
);
