import type { SignalType, ExpectedImpact, FieldSignal } from '../types/fieldSignal';

export const SIGNAL_TYPE_CONFIG: Record<
  SignalType,
  { label: string; iconName: string }
> = {
  local_event: { label: 'Local Event', iconName: 'Festival' },
  weather: { label: 'Weather', iconName: 'Cloud' },
  competitor_activity: { label: 'Competitor Activity', iconName: 'Store' },
  road_closure: { label: 'Road Closure / Disruption', iconName: 'Traffic' },
  school_community_event: { label: 'School / Community Event', iconName: 'School' },
  staffing_impact: { label: 'Staffing Impact', iconName: 'Groups' },
  other: { label: 'Other', iconName: 'MoreHoriz' },
};

export const EXPECTED_IMPACT_CONFIG: Record<
  ExpectedImpact,
  { label: string; color: 'success' | 'warning' | 'error' | 'info' }
> = {
  demand_increase: { label: 'Demand Increase', color: 'success' },
  demand_drop: { label: 'Demand Drop', color: 'warning' },
  inventory_risk: { label: 'Inventory Risk', color: 'error' },
  staffing_impact: { label: 'Staffing Impact', color: 'warning' },
  operational_disruption: { label: 'Operational Disruption', color: 'error' },
  awareness_only: { label: 'Awareness Only', color: 'info' },
};

export const SIGNAL_STATUS_CONFIG: Record<
  'new' | 'reviewed' | 'closed',
  { label: string; color: 'warning' | 'info' | 'default' }
> = {
  new: { label: 'New', color: 'warning' },
  reviewed: { label: 'Reviewed', color: 'info' },
  closed: { label: 'Closed', color: 'default' },
};

const now = new Date();
const daysAgo = (n: number) => new Date(now.getTime() - n * 86400000).toISOString();
const daysFromNow = (n: number) => new Date(now.getTime() + n * 86400000).toISOString().slice(0, 10);

export const MOCK_FIELD_SIGNALS: FieldSignal[] = [
  {
    id: 'FS-2401',
    signalType: 'local_event',
    title: 'Nashville Spring Fair — High Foot Traffic',
    description:
      'Annual spring fair at Centennial Park draws heavy weekend foot traffic. Expect increased beverage and snack demand Friday–Sunday. Parking on Main St will be limited.',
    storeId: '2341',
    storeName: 'Store #2341 — Nashville',
    districtId: 'D14',
    districtName: 'District 14 — Tennessee',
    department: 'Front End',
    impactStartDate: daysFromNow(2),
    impactEndDate: daysFromNow(5),
    expectedImpact: 'demand_increase',
    status: 'new',
    createdByUserId: 'u3',
    createdByName: 'Emily Parker',
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
    originalThreadId: 'c2',
    originalMessageId: 'fs-msg-1',
    activityLog: [
      {
        id: 'fsa-1',
        fieldSignalId: 'FS-2401',
        action: 'Field Signal created',
        actorUserId: 'u3',
        actorName: 'Emily Parker',
        timestamp: daysAgo(1),
      },
    ],
  },
  {
    id: 'FS-2402',
    signalType: 'weather',
    title: 'Severe Thunderstorm Watch — Delivery Delays',
    description:
      'National Weather Service issued severe thunderstorm watch through Thursday PM. Regional distribution center may delay morning deliveries by 4–6 hours.',
    storeId: '2034',
    storeName: 'Downtown Plaza #2034',
    districtId: 'D14',
    districtName: 'District 14 — Tennessee',
    impactStartDate: daysFromNow(0),
    impactEndDate: daysFromNow(2),
    expectedImpact: 'operational_disruption',
    status: 'reviewed',
    createdByUserId: 'user-003',
    createdByName: 'Marco Rossi',
    createdAt: daysAgo(2),
    updatedAt: daysAgo(0.5),
    reviewedByUserId: 'user-002',
    reviewedByName: 'John Doe',
    reviewedAt: daysAgo(0.5),
    originalThreadId: 'sm2',
    activityLog: [
      {
        id: 'fsa-2',
        fieldSignalId: 'FS-2402',
        action: 'Field Signal created',
        actorUserId: 'user-003',
        actorName: 'Marco Rossi',
        timestamp: daysAgo(2),
      },
      {
        id: 'fsa-3',
        fieldSignalId: 'FS-2402',
        action: 'Marked as Reviewed',
        actorUserId: 'user-002',
        actorName: 'John Doe',
        timestamp: daysAgo(0.5),
      },
    ],
  },
  {
    id: 'FS-2403',
    signalType: 'road_closure',
    title: 'I-40 East Lane Closure Near Store',
    description:
      'TDOT announced eastbound lane closure on I-40 exit 213 for bridge repair. Customer access via Highway 70 recommended; expect 20% traffic reduction.',
    storeId: '1142',
    storeName: 'Store #1142 — Memphis',
    districtId: 'D14',
    districtName: 'District 14 — Tennessee',
    impactStartDate: daysFromNow(-1),
    impactEndDate: daysFromNow(14),
    expectedImpact: 'demand_drop',
    status: 'new',
    createdByUserId: 'u6',
    createdByName: 'James Wilson',
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
    originalThreadId: 'c5',
    activityLog: [
      {
        id: 'fsa-4',
        fieldSignalId: 'FS-2403',
        action: 'Field Signal created',
        actorUserId: 'u6',
        actorName: 'James Wilson',
        timestamp: daysAgo(3),
      },
    ],
  },
  {
    id: 'FS-2404',
    signalType: 'competitor_activity',
    title: 'New Discount Grocery Opening 0.5 mi Away',
    description:
      'Competitor "ValueMart" grand opening Saturday with 15% off all categories first week. May pull price-sensitive shoppers from our location.',
    storeId: '2341',
    storeName: 'Store #2341 — Nashville',
    districtId: 'D14',
    districtName: 'District 14 — Tennessee',
    impactStartDate: daysFromNow(4),
    impactEndDate: daysFromNow(11),
    expectedImpact: 'demand_drop',
    status: 'closed',
    createdByUserId: 'u3',
    createdByName: 'Emily Parker',
    createdAt: daysAgo(7),
    updatedAt: daysAgo(1),
    reviewedByUserId: 'user-002',
    reviewedByName: 'John Doe',
    reviewedAt: daysAgo(5),
    closedByUserId: 'user-002',
    closedByName: 'John Doe',
    closedAt: daysAgo(1),
    linkedTaskId: 'tc-fs-2404',
    activityLog: [
      {
        id: 'fsa-5',
        fieldSignalId: 'FS-2404',
        action: 'Field Signal created',
        actorUserId: 'u3',
        actorName: 'Emily Parker',
        timestamp: daysAgo(7),
      },
      {
        id: 'fsa-6',
        fieldSignalId: 'FS-2404',
        action: 'Marked as Reviewed',
        actorUserId: 'user-002',
        actorName: 'John Doe',
        timestamp: daysAgo(5),
      },
      {
        id: 'fsa-7',
        fieldSignalId: 'FS-2404',
        action: 'Task created from signal',
        actorUserId: 'user-002',
        actorName: 'John Doe',
        timestamp: daysAgo(4),
        notes: 'Task #tc-fs-2404',
      },
      {
        id: 'fsa-8',
        fieldSignalId: 'FS-2404',
        action: 'Signal closed',
        actorUserId: 'user-002',
        actorName: 'John Doe',
        timestamp: daysAgo(1),
      },
    ],
  },
  {
    id: 'FS-2405',
    signalType: 'school_community_event',
    title: 'High School Graduation Week — Snack Spike',
    description:
      'Local high school graduation ceremonies all week. Families stocking up on party supplies, chips, and beverages. Peak days Wed–Sat.',
    storeId: '2034',
    storeName: 'Downtown Plaza #2034',
    districtId: 'D14',
    districtName: 'District 14 — Tennessee',
    impactStartDate: daysFromNow(1),
    impactEndDate: daysFromNow(6),
    expectedImpact: 'demand_increase',
    status: 'new',
    createdByUserId: 'user-003',
    createdByName: 'Marco Rossi',
    createdAt: daysAgo(0.3),
    updatedAt: daysAgo(0.3),
    originalThreadId: 'sm2',
    activityLog: [
      {
        id: 'fsa-9',
        fieldSignalId: 'FS-2405',
        action: 'Field Signal created',
        actorUserId: 'user-003',
        actorName: 'Marco Rossi',
        timestamp: daysAgo(0.3),
      },
    ],
  },
  {
    id: 'FS-2406',
    signalType: 'staffing_impact',
    title: 'Three Associates Out Sick — Morning Coverage Gap',
    description:
      'Three morning-shift associates called out. Reduced coverage on front end and dairy until replacements arrive ~2 PM.',
    storeId: '2034',
    storeName: 'Downtown Plaza #2034',
    districtId: 'D14',
    districtName: 'District 14 — Tennessee',
    impactStartDate: daysFromNow(0),
    impactEndDate: daysFromNow(0),
    expectedImpact: 'staffing_impact',
    status: 'reviewed',
    createdByUserId: 'user-003',
    createdByName: 'Marco Rossi',
    createdAt: daysAgo(0.1),
    updatedAt: daysAgo(0.05),
    reviewedByUserId: 'user-002',
    reviewedByName: 'John Doe',
    reviewedAt: daysAgo(0.05),
    originalThreadId: 'sm2',
    linkedBroadcastId: 'bc-fs-2406',
    activityLog: [
      {
        id: 'fsa-10',
        fieldSignalId: 'FS-2406',
        action: 'Field Signal created',
        actorUserId: 'user-003',
        actorName: 'Marco Rossi',
        timestamp: daysAgo(0.1),
      },
      {
        id: 'fsa-11',
        fieldSignalId: 'FS-2406',
        action: 'Marked as Reviewed',
        actorUserId: 'user-002',
        actorName: 'John Doe',
        timestamp: daysAgo(0.05),
      },
      {
        id: 'fsa-12',
        fieldSignalId: 'FS-2406',
        action: 'Broadcast created from signal',
        actorUserId: 'user-002',
        actorName: 'John Doe',
        timestamp: daysAgo(0.05),
        notes: 'Broadcast #bc-fs-2406',
      },
    ],
  },
];

export const SIGNAL_TYPE_OPTIONS = (Object.keys(SIGNAL_TYPE_CONFIG) as SignalType[]).map(
  key => ({ value: key, label: SIGNAL_TYPE_CONFIG[key].label })
);

export const EXPECTED_IMPACT_OPTIONS = (Object.keys(EXPECTED_IMPACT_CONFIG) as ExpectedImpact[]).map(
  key => ({ value: key, label: EXPECTED_IMPACT_CONFIG[key].label })
);
