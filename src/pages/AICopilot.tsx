import React, { useState, useRef, useEffect, useMemo } from 'react';
import { flushSync } from 'react-dom';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import PsychologyOutlined from '@mui/icons-material/PsychologyOutlined';
import BarChartOutlined from '@mui/icons-material/BarChartOutlined';
import ImageOutlined from '@mui/icons-material/ImageOutlined';
import BoltOutlined from '@mui/icons-material/BoltOutlined';
import SendOutlined from '@mui/icons-material/SendOutlined';
import SmartToyOutlined from '@mui/icons-material/SmartToyOutlined';
import PersonOutlined from '@mui/icons-material/PersonOutlined';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import FileUploadOutlined from '@mui/icons-material/FileUploadOutlined';
import TaskAltOutlined from '@mui/icons-material/TaskAltOutlined';
import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined';
import ErrorOutlined from '@mui/icons-material/ErrorOutlined';
import TrendingUpOutlined from '@mui/icons-material/TrendingUpOutlined';
import TrendingDownOutlined from '@mui/icons-material/TrendingDownOutlined';
import AutoAwesomeOutlined from '@mui/icons-material/AutoAwesomeOutlined';
import MenuBookOutlined from '@mui/icons-material/MenuBookOutlined';
import AssignmentOutlined from '@mui/icons-material/AssignmentOutlined';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import RefreshOutlined from '@mui/icons-material/RefreshOutlined';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import AccessTimeOutlined from '@mui/icons-material/AccessTimeOutlined';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import BuildOutlined from '@mui/icons-material/BuildOutlined';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import StoreOutlined from '@mui/icons-material/StoreOutlined';
import HeadphonesOutlined from '@mui/icons-material/HeadphonesOutlined';
import { Button, Card, Chips, Tabs, Badge, ChatBotComponent } from 'impact-ui';
import { useAuth } from '../context/AuthContext';
import type { StorehubOpenAlanDetail } from '../types';
import { STOREHUB_OPEN_ALAN } from '../utils/openAskAlan';
import { AudioPlayer } from '../components/common/AudioPlayer';
import '../components/common/AudioPlayer.css';
import './AICopilot.css';

// ── Types ──
type SkillMode = 'knowledge' | 'analytics' | 'pog' | 'actions';

interface ComplianceAuditReport {
  overallScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  planogramName: string;
  storeInfo: string;
  auditDate: string;
  categories: {
    name: string;
    score: number;
    maxScore: number;
    status: 'pass' | 'warning' | 'fail';
    findings: string[];
  }[];
  deviations: {
    item: string;
    expected: string;
    actual: string;
    severity: 'critical' | 'warning' | 'info';
    impact: string;
  }[];
  recommendations: string[];
  comparisonImages: {
    expected: string;
    actual: string;
  };
}

interface OosItem {
  name: string;
  shelf: string;
  position: string;
}

interface ProcessingStep {
  step: string;
  status: 'pending' | 'active' | 'completed';
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  skill: SkillMode;
  // Rich content
  sources?: { doc: string; section: string; page: string; tag?: 'primary' | 'supporting' | 'regulatory'; updated?: string; excerpt?: string }[];
  confidenceBreakdown?: { sourceContribution: number; coverage: number; lastUpdated: string };
  nextActions?: { learnMore?: string[]; takeAction?: string[] };
  kpiCards?: { label: string; value: string; delta: string; direction: 'up' | 'down' }[];
  chartData?: { type: 'bar' | 'line' | 'horizontal-bar'; title: string; labels: string[]; values: number[]; color?: string; secondaryValues?: number[]; secondaryLabel?: string }[];
  pogResults?: { status: 'pass' | 'fail'; item: string; detail: string }[];
  taskCreated?: { title: string; assignee: string; priority: string; due: string; stores?: { name: string; manager: string }[] };
  pogRuleCreated?: { name: string; type: string; description: string; status: 'Active' | 'Warning'; category: string };
  isTyping?: boolean;
  imageUrl?: string;
  suggestedQueries?: string[];
  followUpQuestions?: string[];
  confidence?: number; // 0-100
  // ShelfIQ-style rich content
  complianceReport?: ComplianceAuditReport;
  oosItems?: OosItem[];
  oosImage?: string;
  processingSteps?: ProcessingStep[];
  isProcessing?: boolean;
  // POG planogram list
  pogPlanogramList?: { name: string; store: string; lastAudit: string; score: number; status: 'pass' | 'warning' | 'fail' }[];
}

// ── Shared Types ──

// ── Mock Knowledge Base ──
const knowledgeResponses: Record<string, { answer: string; sources: { doc: string; section: string; page: string }[]; followUpQuestions?: string[] }> = {
  'fire exit': {
    answer: '## 🔥 Fire Exit Blockage — Standard Operating Procedure\n\n**Classification:** Critical Safety Protocol · **SLA:** Immediate Response Required\n\n---\n\n### 1. Immediate Response (0–15 Minutes)\n\n| Step | Action | Owner |\n|------|--------|-------|\n| 1.1 | Identify and assess the blockage — determine if it can be safely removed by on-site personnel | Discovering Associate |\n| 1.2 | If removable, clear the obstruction immediately and restore full egress path width (minimum 44 inches per NFPA 101) | Floor Lead |\n| 1.3 | Log the incident in the **Safety Incident Tracker** with timestamp, location, blockage type, and photos | Discovering Associate |\n| 1.4 | Notify the Store Manager via radio and incident alert within **15 minutes** of discovery | Discovering Associate |\n\n### 2. Escalation Protocol (If Unresolvable On-Site)\n\n- **Escalate to Regional Safety Officer (RSO)** within 30 minutes if the blockage involves structural elements, locked fixtures, or requires equipment\n- RSO will initiate an **Emergency Evacuation Route Assessment** and may authorize temporary alternate egress\n- If the exit remains blocked beyond **1 hour**, the RSO must notify the **District Operations Director** and file a regulatory incident report\n\n### 3. Post-Incident Requirements\n\n- **Root Cause Analysis** — Store Manager must complete within 24 hours and submit via the Safety Portal\n- **Corrective Action Plan** — Must be documented and implemented within 48 hours\n- **Staff Re-briefing** — All associates on shift must be briefed on the incident and prevention measures\n\n### 4. Training & Prevention\n\n- All staff must complete **fire exit protocol training** during quarterly safety drills (Q1, Q2, Q3, Q4)\n- Monthly **walkthrough audits** must verify all emergency exits are clear, illuminated, and properly signposted\n- Exit route maps must be updated and posted within **72 hours** of any store layout change\n\n> ⚠️ **Compliance Note:** Failure to maintain clear fire exits is a **zero-tolerance violation** per OSHA 29 CFR 1910.37 and may result in regulatory penalties up to $15,625 per violation.',
    sources: [
      { doc: 'Store Operations SOP v4.2', section: 'Section 4.2 — Fire Safety Protocols', page: 'Pages 18–21' },
      { doc: 'Emergency Procedures Manual', section: 'Section 2.1 — Evacuation Routes', page: 'Pages 7–9' },
      { doc: 'OSHA Compliance Reference', section: '29 CFR 1910.37 — Means of Egress', page: 'Federal Register' },
    ],
    followUpQuestions: [
      'What are the OSHA penalties for blocked fire exits?',
      'How often should fire drills be conducted?',
      'What is the emergency evacuation route protocol?',
    ],
  },
  'planogram notice': {
    answer: '## 📋 Planogram Change Management — Notice Period & Implementation Protocol\n\n**Classification:** Visual Merchandising Compliance · **Effective:** All Store Formats\n\n---\n\n### 1. Notice Period & Acknowledgment\n\n| Milestone | Timeline | Responsible Party |\n|-----------|----------|-------------------|\n| Planogram change notice issued | **T-14 business days** before effective date | Category Manager / VM Team |\n| Store Manager acknowledgment required | Within **48 hours** of receipt | Store Manager |\n| Implementation materials & fixtures shipped | **T-7 business days** | Supply Chain |\n| Full implementation completed | Within **5 business days** of effective date | Store Team |\n| Post-implementation compliance photo uploaded | Within **24 hours** of completion | Department Lead |\n\n### 2. Change Classification & SLA Matrix\n\n- **Major Reset** (full aisle/department): 14 business days notice, dedicated reset crew required\n- **Minor Adjustment** (shelf/facing changes): 7 business days notice, in-store team execution\n- **Emergency Change** (recall/safety): Immediate execution, no notice period, override authorization from Regional VP\n\n### 3. Deviation Management\n\nAny deviation from the authorized planogram requires:\n1. **Written justification** submitted via the Planogram Exception Portal\n2. **Category Manager approval** — must be obtained before the deviation is implemented\n3. **Time-bound exception** — maximum 30 days, after which the standard planogram must be restored\n4. **Performance tracking** — deviated sections must be monitored for sales impact weekly\n\n### 4. Compliance Verification\n\n- **AI Vision Audit** — automated compliance check within 48 hours of implementation deadline\n- **Score Threshold** — minimum **85% planogram compliance** required to pass\n- **Non-compliance escalation** — scores below 70% auto-escalate to District Manager with 48-hour remediation SLA\n\n> 📌 **Key Policy:** Unauthorized planogram deviations are tracked as compliance violations and impact the store\'s DPI (District Performance Index) score.',
    sources: [
      { doc: 'Planogram Compliance SOP v3.1', section: 'Section 3.1 — Change Management', page: 'Pages 12–16' },
      { doc: 'Visual Merchandising Standards', section: 'Section 1.4 — Implementation Timelines', page: 'Pages 5–8' },
      { doc: 'Category Management Guidelines', section: 'Section 2.3 — Exception Handling', page: 'Page 22' },
    ],
    followUpQuestions: [
      'What happens if planogram compliance falls below 70%?',
      'How do I submit a planogram deviation request?',
      'What is the AI Vision Audit compliance check process?',
    ],
  },
  'product recall': {
    answer: '## ⚠️ Product Recall Execution — Step-by-Step Protocol\n\n**Classification:** Critical Compliance Action · **SLA:** Complete within 24 Hours of Notification\n\n---\n\n### Phase 1 — Immediate Containment (0–2 Hours)\n\n| Step | Action | Timeline | Owner |\n|------|--------|----------|-------|\n| 1.1 | **Stop Sale** — Disable affected SKUs at POS immediately upon recall notification | 0–15 min | Store Manager |\n| 1.2 | **Shelf Pull** — Remove all affected products from sales floor (all locations including endcaps, clip strips, impulse zones) | 0–30 min | Department Lead |\n| 1.3 | **Backroom Sweep** — Locate and pull all affected inventory from backroom, receiving area, and returns staging | 0–45 min | Inventory Associate |\n| 1.4 | **Quarantine** — Move all pulled units to the designated Recall Holding Area with recall tag and chain-of-custody log | 0–1 hr | Department Lead |\n| 1.5 | **Notification** — Alert District Manager via escalation hotline; confirm store-level containment status | Within 1 hr | Store Manager |\n\n### Phase 2 — Documentation & Reporting (2–8 Hours)\n\n| Step | Action | Timeline | Owner |\n|------|--------|----------|-------|\n| 2.1 | Log all affected SKUs with **batch numbers, quantities, and shelf locations** in the Recall Tracker system | 2 hr | Inventory Associate |\n| 2.2 | Upload photographic evidence of cleared shelf locations and quarantined inventory | 4 hr | Department Lead |\n| 2.3 | Place official **recall signage** at each former shelf location with customer information and return instructions | 4 hr | Floor Lead |\n| 2.4 | Notify Customer Service desk — enable **full refund processing** for affected items (no receipt required) | 2 hr | Store Manager |\n\n### Phase 3 — Verification & Closure (8–24 Hours)\n\n| Step | Action | Timeline | Owner |\n|------|--------|----------|-------|\n| 3.1 | Complete the **Recall Verification Checklist** — all 12 items must be marked complete | 24 hr | Store Manager |\n| 3.2 | Submit final recall report to **Regional Compliance Office** via the Safety Portal | 24 hr | Store Manager |\n| 3.3 | Coordinate with **Supply Chain** for return shipment or destruction of quarantined units | 48 hr | District Manager |\n| 3.4 | Conduct staff debrief on recall execution and document lessons learned | 72 hr | Store Manager |\n\n### Customer Communication Script\n\n> *"We have voluntarily recalled [Product Name] as a precautionary measure. If you purchased this item, please return it to any store location for a full refund. We apologize for any inconvenience and appreciate your understanding."*\n\n> 🔴 **Regulatory Note:** Product recall non-compliance may result in FDA/CPSC enforcement action. All recall actions are auditable and must maintain a complete chain-of-custody record.',
    sources: [
      { doc: 'Product Safety & Recall SOP v6.1', section: 'Section 6.1 — Recall Execution Protocol', page: 'Pages 31–38' },
      { doc: 'Quality Assurance Manual', section: 'Section 8.3 — Product Withdrawal Procedures', page: 'Pages 44–47' },
      { doc: 'Customer Service Standards', section: 'Section 5.2 — Recall & Return Handling', page: 'Page 19' },
      { doc: 'FDA Recall Guidance', section: 'Industry Guidance — Voluntary Recalls', page: 'Regulatory Reference' },
    ],
    followUpQuestions: [
      'What is the customer communication protocol during a recall?',
      'How do I handle a Class I vs Class II recall differently?',
      'What are the documentation requirements for FDA audit trail?',
    ],
  },
  'safety audit': {
    answer: '## 🛡️ Safety Audit Program — Comprehensive Guidelines\n\n**Classification:** Regulatory Compliance · **Frequency:** Weekly · **Owner:** Designated Safety Champion\n\n---\n\n### 1. Audit Schedule & Governance\n\n| Parameter | Requirement |\n|-----------|-------------|\n| **Frequency** | Weekly — must be completed between Monday 6:00 AM and Wednesday 11:59 PM |\n| **Auditor** | Designated Safety Champion (certified via Safety Champion Training Program) |\n| **Duration** | 60–90 minutes for standard format stores; 90–120 minutes for large format |\n| **Tool** | Digital Safety Audit Checklist via the Store Operations Mobile App |\n| **Submission Deadline** | Within 4 hours of audit completion |\n\n### 2. Audit Categories & Scoring Weights\n\n| Category | Weight | Key Inspection Points |\n|----------|--------|----------------------|\n| 🔥 **Fire Safety** | 20% | Exit clearance, extinguisher access/expiry, suppression systems, signage illumination |\n| ⚡ **Electrical Safety** | 15% | Exposed wiring, overloaded outlets, equipment grounding, panel access clearance |\n| 🦺 **Slip/Trip/Fall Hazards** | 15% | Floor condition, wet floor signs, cable management, mat placement, lighting levels |\n| 🧪 **Chemical Storage** | 15% | SDS availability, proper labeling, ventilation, secondary containment, PPE access |\n| 🧯 **Emergency Equipment** | 10% | First aid kits stocked, AED functional, eyewash stations operational, spill kits available |\n| 🥽 **PPE Compliance** | 10% | Correct PPE worn for task, PPE condition/replacement schedule, training verification |\n| 🧹 **General Housekeeping** | 15% | Aisle clearance, storage organization, waste management, restroom standards |\n\n### 3. Scoring & Pass/Fail Criteria\n\n| Score Range | Rating | Required Action |\n|-------------|--------|-----------------|\n| **90–100%** | ✅ Excellent | No action — share best practices with district |\n| **85–89%** | ✅ Pass | Minor findings — correct within 7 days |\n| **70–84%** | ⚠️ Conditional | Corrective Action Plan required within **48 hours** — re-audit in 7 days |\n| **Below 70%** | 🔴 Fail | **Immediate escalation** to District Manager — corrective action within **24 hours** — mandatory re-audit within 72 hours |\n\n### 4. Escalation Matrix\n\n- **Score 70–84%** → Store Manager owns CAP, District Manager notified\n- **Score 50–69%** → District Manager leads intervention, Regional Safety Officer notified\n- **Score below 50%** → Regional Safety Officer takes ownership, VP Operations notified, store may face **operational restrictions**\n- **3 consecutive failures** → Triggers **Safety Improvement Program** — 90-day intensive monitoring\n\n> 📊 **Performance Tracking:** Safety audit scores feed directly into the store\'s DPI composite and are weighted at 15% of the overall execution score.',
    sources: [
      { doc: 'Health & Safety Compliance Guide v5.2', section: 'Section 5.2 — Audit Schedule & Scoring', page: 'Pages 22–28' },
      { doc: 'Safety Champion Certification Manual', section: 'Section 1.1 — Roles & Responsibilities', page: 'Pages 3–5' },
      { doc: 'Escalation Framework', section: 'Section 3.4 — Safety Incidents', page: 'Page 14' },
    ],
    followUpQuestions: [
      'What happens if a store misses two consecutive weekly audits?',
      'How is the safety audit score calculated by category?',
      'What are the Safety Champion certification requirements?',
    ],
  },
  'store opening': {
    answer: '## 🏪 Store Opening Procedures — Daily Operations Protocol\n\n**Classification:** Standard Operating Procedure · **SLA:** Complete 30 Minutes Before Scheduled Open\n\n---\n\n### Pre-Opening Sequence (T-30 to T-0 Minutes)\n\n| Step | Time | Action | Owner | Verification |\n|------|------|--------|-------|--------------|\n| 1 | T-30 | **Arrival & Entry** — Arrive at store, disarm security system using authorized credentials, log entry time in the Workforce Management system | Opening Manager | Time-stamped entry log |\n| 2 | T-28 | **Security Walkthrough** — Complete perimeter check: verify no signs of forced entry, check all emergency exits are secure, review overnight security footage flags | Opening Manager | Security checklist |\n| 3 | T-25 | **Environment Check** — Verify HVAC is operational (target: 68–72°F), all lighting zones are functional, music system is active at correct volume level | Opening Manager | Environment checklist |\n| 4 | T-20 | **Floor Readiness** — Walk all aisles: check cleanliness standards, verify overnight stocking is complete, ensure no safety hazards (spills, boxes, loose fixtures) | Floor Lead | Morning walkthrough form |\n| 5 | T-15 | **POS & Systems** — Power on all POS terminals, verify network connectivity, confirm payment processing is active (test transaction), check self-checkout units | Cash Office Lead | System readiness report |\n| 6 | T-12 | **Cash Management** — Count and verify all cash drawer floats against closing report, load registers, prepare change fund | Cash Office Lead | Float verification form |\n| 7 | T-10 | **Receiving & Inventory** — Review overnight delivery receipts, prioritize stocking of high-velocity and promotional items, update inventory exceptions | Inventory Lead | Delivery reconciliation |\n| 8 | T-5 | **Team Briefing** — Conduct daily huddle: share sales targets, active promotions, staffing updates, safety reminders, and any operational alerts or broadcasts | Opening Manager | Huddle completion log |\n| 9 | T-0 | **Doors Open** — Unlock all customer entrances at the scheduled opening time, greet early customers, ensure all departments are staffed and ready | Opening Manager | Opening confirmation |\n\n### Critical Compliance Requirements\n\n- **Minimum staffing** must meet the published labor model before doors open — no exceptions\n- **Food safety** (if applicable): verify cold chain temperatures logged and within range before opening fresh departments\n- **Promotional signage** must be verified against the current promotional calendar — no expired offers displayed\n- **Opening Manager** must confirm readiness via the **Store Ops App** before unlocking doors\n\n### Contingency Protocols\n\n| Scenario | Action |\n|----------|--------|\n| POS system failure | Switch to backup registers; if total failure, delay opening and escalate to IT Helpdesk (SLA: 30 min response) |\n| Insufficient staff | Contact on-call associates; escalate to District Manager if below minimum threshold |\n| Security concern | Do not enter store — contact Security Operations Center and local authorities |\n| Utility outage | Assess safety; if lighting/HVAC non-functional, delay opening and notify District Manager |\n\n> 📌 **Accountability:** The Opening Manager is fully responsible for store readiness. Opening procedure compliance is audited monthly and contributes to the store\'s operational excellence score.',
    sources: [
      { doc: 'Daily Operations Manual v2.4', section: 'Section 1.1 — Opening Procedures', page: 'Pages 3–8' },
      { doc: 'Cash Handling & Reconciliation SOP', section: 'Section 2.1 — Float Procedures', page: 'Page 11' },
      { doc: 'Workforce Management Guidelines', section: 'Section 4.3 — Minimum Staffing Standards', page: 'Page 27' },
    ],
    followUpQuestions: [
      'What is the store closing procedure?',
      'What are the minimum staffing requirements for opening?',
      'How should the daily team huddle be structured?',
    ],
  },
  'miss': {
    answer: '## 🚫 Missed Consecutive Audits — Escalation & Remediation Protocol\n\n**Classification:** Compliance Escalation · **Trigger:** 2+ Consecutive Weekly Audit Misses\n\n---\n\n### 1. Escalation Framework\n\nMissing weekly audits triggers a progressive escalation process. The severity increases with each consecutive miss:\n\n| Consecutive Misses | Escalation Level | Notification | Required Action | Timeline |\n|--------------------|-----------------|--------------|-----------------|----------|\n| **1 miss** | ⚠️ Level 1 — Warning | Store Manager auto-notified via Operations App | Complete overdue audit within **24 hours** + submit written explanation | 24 hours |\n| **2 consecutive** | 🔴 Level 2 — Formal Escalation | District Manager notified · Store flagged in Compliance Dashboard | District Manager must conduct **on-site review** within 48 hours · Corrective Action Plan (CAP) required | 48 hours |\n| **3 consecutive** | 🔴 Level 3 — Critical | Regional Operations Director notified · Store placed on **Compliance Watch List** | Mandatory **Performance Improvement Plan (PIP)** · Bi-weekly executive reviews initiated · Safety Champion role reassigned | Immediate |\n| **4+ consecutive** | 🚨 Level 4 — Executive | VP Operations notified · Regulatory risk assessment triggered | Store may face **operational restrictions** · External audit commissioned · Store Manager placed on formal performance review | Immediate |\n\n### 2. Immediate Consequences (After 2nd Miss)\n\n| Consequence | Detail |\n|-------------|--------|\n| **DPI Impact** | Store DPI receives automatic **-10 point penalty** per missed audit — reflected in weekly district rankings |\n| **Compliance Flag** | Store appears in **red status** on the Regional Compliance Dashboard until 3 consecutive passing audits are completed |\n| **Insurance Implication** | Insurer is notified of audit gap — may trigger **premium review** or coverage conditions |\n| **Regulatory Exposure** | Missed safety audits create a documentation gap that could result in **OSHA penalties** ($15,625+ per violation) during any external inspection |\n\n### 3. Corrective Action Plan (CAP) Requirements\n\nThe District Manager must submit a CAP within 48 hours covering:\n\n| CAP Element | Requirement |\n|-------------|-------------|\n| **Root Cause Analysis** | Why were audits missed? (staffing, training, negligence, system issues) |\n| **Immediate Remediation** | Complete all overdue audits within 24 hours of CAP submission |\n| **Accountability** | Identify responsible individuals and corrective measures (retraining, reassignment, formal warning) |\n| **Prevention Plan** | Systemic changes to prevent recurrence (backup auditors, calendar alerts, manager oversight) |\n| **Monitoring Schedule** | Weekly check-ins with District Manager for minimum 30 days |\n\n### 4. Recovery Path\n\n| Milestone | Requirement | DPI Recovery |\n|-----------|-------------|-------------|\n| Complete overdue audits | All missed audits backdated and submitted with explanations | No recovery yet |\n| 2 consecutive on-time audits | Both scoring ≥ 70% | -5 point penalty restored |\n| 4 consecutive on-time audits | All scoring ≥ 85% | Full penalty restored · Compliance Watch removed |\n| 8 consecutive on-time audits | Sustained compliance | Store eligible for **Good Standing** certification |\n\n> ⚠️ **Critical Note:** There is **zero tolerance** for falsified or backdated audits. Any attempt to fabricate audit data is a **terminable offense** and may trigger regulatory reporting obligations.',
    sources: [
      { doc: 'Health & Safety Compliance Guide v5.2', section: 'Section 5.4 — Missed Audit Escalation', page: 'Pages 30–34' },
      { doc: 'Escalation Framework', section: 'Section 3.2 — Compliance Escalation Matrix', page: 'Pages 10–12' },
      { doc: 'Store Performance Management Policy', section: 'Section 7.1 — Corrective Action Plans', page: 'Pages 41–44' },
      { doc: 'OSHA Compliance Reference', section: '29 CFR 1903 — Inspections & Citations', page: 'Federal Register' },
    ],
    followUpQuestions: [
      'How do safety audits work and what is the scoring?',
      'What is the DPI penalty for missed audits?',
      'How do I create a Corrective Action Plan for audit gaps?',
    ],
  },
};

// ── Mock Analytics Responses ──
type AnalyticsChart = { type: 'bar' | 'line' | 'horizontal-bar'; title: string; labels: string[]; values: number[]; color?: string; secondaryValues?: number[]; secondaryLabel?: string };
const analyticsResponses: Record<string, { answer: string; kpiCards: { label: string; value: string; delta: string; direction: 'up' | 'down' }[]; chartData?: AnalyticsChart[]; followUpQuestions?: string[] }> = {
  'sales down': {
    answer: '## 📉 District Sales Performance — Weekly Decline Analysis\n\n**Report Period:** Week of Apr 21 vs Apr 14, 2025 · **Scope:** All 8 District Stores\n\n---\n\n### Executive Summary\n\nDistrict-wide sales declined **-3.2%** this week ($1.26M vs $1.30M prior week), driven primarily by underperformance at 3 stores. The decline is attributable to reduced weekend foot traffic, lower conversion rates, and smaller basket sizes.\n\n### Root Cause Breakdown\n\n| Factor | Impact | Affected Stores | Detail |\n|--------|--------|-----------------|--------|\n| Weekend Foot Traffic | **-12%** | All stores | Local events competition diverted weekend shoppers |\n| Conversion Rate | **-2.8pp** (34% → 31.2%) | Harbor View, Oak Street | Insufficient floor coverage during peak hours |\n| Average Basket Size | **-8%** ($41.70 → $38.40) | District-wide | Fewer promotional items in baskets — end-of-promo cycle effect |\n| Product Availability | **-4.2%** | Pine Grove, Maple Heights | OOS on 12 high-velocity SKUs across health & beauty |\n\n### Store-Level Performance\n\n| Store | Sales | vs Plan | vs LW | Status |\n|-------|-------|---------|-------|--------|\n| Downtown Plaza #2034 | $218K | +8.2% | +2.1% | ✅ On Track |\n| Riverside Mall #1876 | $195K | +5.4% | +1.8% | ✅ On Track |\n| Central Station #3421 | $172K | +2.1% | -0.4% | ✅ On Track |\n| Westfield Center #2198 | $164K | -1.2% | -3.1% | ⚠️ Watch |\n| Harbor View #4532 | $148K | -4.8% | -6.2% | 🔴 Below |\n| Oak Street #1234 | $132K | -6.8% | -8.4% | 🔴 Below |\n| Pine Grove #5678 | $118K | -9.2% | -11.1% | 🔴 Critical |\n| Maple Heights #9012 | $113K | -12.4% | -14.2% | 🔴 Critical |\n\n### Recommended Actions\n\n| Priority | Action | Owner | Timeline |\n|----------|--------|-------|----------|\n| 🔴 High | Deploy weekend promotional blitz — targeted offers at Harbor View & Oak Street | Marketing Manager | This weekend |\n| 🔴 High | Add 2 floor associates during Sat/Sun peak hours (11am–4pm) at underperforming stores | District Manager | This weekend |\n| ⚠️ Medium | Replenish 12 OOS high-velocity SKUs at Pine Grove & Maple Heights | Supply Chain | Within 48 hours |\n| ⚠️ Medium | Review end-of-promo transition plan — ensure new promotions launch by Wednesday | Category Manager | This week |\n\n> 📊 **Forecast:** If corrective actions are implemented, projected recovery of +1.5–2.0% by next week. Without intervention, the decline trend is expected to continue at -1.5% per week.',
    kpiCards: [
      { label: 'District Sales', value: '$1.26M', delta: '-3.2%', direction: 'down' },
      { label: 'Foot Traffic', value: '42.1K', delta: '-12%', direction: 'down' },
      { label: 'Conversion', value: '31.2%', delta: '-2.8pp', direction: 'down' },
      { label: 'Avg Basket', value: '$38.40', delta: '-8%', direction: 'down' },
    ],
    chartData: [
      { type: 'bar', title: 'Sales by Store ($K)', labels: ['Plaza', 'Riverside', 'Central', 'Westfield', 'Harbor', 'Oak St', 'Pine Gr', 'Maple'], values: [218, 195, 172, 164, 148, 132, 118, 113], color: 'var(--ia-color-primary)' },
      { type: 'line', title: 'Weekly Sales Trend ($K)', labels: ['Mar 2', 'Mar 9', 'Mar 16', 'Mar 23', 'Mar 30', 'Apr 6', 'Apr 13', 'Apr 20'], values: [1280, 1310, 1295, 1340, 1320, 1300, 1280, 1260], color: 'var(--ia-color-error)' },
    ],
    followUpQuestions: [
      'Which stores are underperforming vs target this week?',
      'What is the gross margin % trend over the last 13 weeks?',
      'Show me the weekend foot traffic breakdown by store',
    ],
  },
  'underperforming': {
    answer: '## 🔴 Underperforming Stores — Intervention Report\n\n**Report Period:** As of Apr 27, 2025 · **Classification:** Escalation Required · **Stores Flagged:** 3 of 8\n\n---\n\n### Executive Summary\n\nThree stores are currently operating significantly below target thresholds. Combined, these stores represent a **$94K sales gap** vs plan and have declining DPI scores. All three have been escalated to the Escalation Command Center for intensive monitoring.\n\n### Store Performance Dashboard\n\n| Store | DPI | Sales vs Plan | Key Issue | Weeks Below Target | Escalation Level |\n|-------|-----|---------------|-----------|--------------------|-----------------|\n| Maple Heights #9012 | **58** 🔴 | -12.4% | Safety & Cleanliness critical — 4 audit categories below 40% | 6 weeks | **Level 3** — Regional VP notified |\n| Pine Grove #5678 | **65** 🔴 | -9.2% | Safety audit failed 3 consecutive weeks. Staff turnover at 34% | 4 weeks | **Level 2** — DM intervention |\n| Oak Street #1234 | **72** ⚠️ | -6.8% | Planogram compliance below 60%. Peak-hour understaffing | 3 weeks | **Level 2** — DM intervention |\n\n### Detailed Breakdown — Maple Heights #9012 (Most Critical)\n\n| Audit Category | Score | Target | Gap | Trend |\n|----------------|-------|--------|-----|-------|\n| Safety | 32% | 85% | -53pp | 📉 Declining 4 weeks |\n| Cleanliness | 38% | 85% | -47pp | 📉 Declining 3 weeks |\n| Product Availability | 41% | 90% | -49pp | ➡️ Flat |\n| Planogram Compliance | 44% | 85% | -41pp | 📉 Declining 2 weeks |\n| Customer Experience | 52% | 80% | -28pp | 📉 Declining 2 weeks |\n| Staff Execution | 61% | 80% | -19pp | ➡️ Flat |\n\n### Intervention Plan\n\n| Store | Action | Owner | Start Date | Review Date |\n|-------|--------|-------|------------|------------|\n| Maple Heights | Deploy safety task force — 3-day intensive remediation | Regional Safety Officer | Immediate | +72 hours |\n| Maple Heights | Emergency cleaning crew — daily deep clean for 2 weeks | Facilities Manager | Immediate | +14 days |\n| Pine Grove | Replace Safety Champion — retrain team on safety protocols | District Manager | This week | +7 days |\n| Pine Grove | Launch retention program — address 34% turnover | HR Business Partner | This week | +30 days |\n| Oak Street | Schedule planogram reset crew — full compliance reset | VM Team Lead | Within 48 hours | +5 days |\n| Oak Street | Adjust peak-hour staffing model — add 3 FTEs | Workforce Planning | This week | +7 days |\n\n> ⚠️ **Escalation Note:** Maple Heights has been in decline for 6 consecutive weeks. If DPI does not improve above 65 within 14 days, the store will be placed on the **Performance Improvement Program (PIP)** with bi-weekly executive reviews.',
    kpiCards: [
      { label: 'At-Risk Stores', value: '3', delta: '+1', direction: 'down' },
      { label: 'Avg DPI (Bottom 3)', value: '65', delta: '-8.4', direction: 'down' },
      { label: 'Sales Gap', value: '-$94K', delta: 'vs plan', direction: 'down' },
      { label: 'Escalations', value: '3', delta: 'active', direction: 'down' },
    ],
    chartData: [
      { type: 'horizontal-bar', title: 'DPI Score by Store', labels: ['Plaza #2034', 'Riverside #1876', 'Central #3421', 'Westfield #2198', 'Harbor #4532', 'Oak St #1234', 'Pine Gr #5678', 'Maple #9012'], values: [94, 91, 85, 79, 76, 72, 65, 58], color: 'var(--ia-color-primary)' },
      { type: 'line', title: 'Bottom 3 — DPI Trend (8 Weeks)', labels: ['Mar 2', 'Mar 9', 'Mar 16', 'Mar 23', 'Mar 30', 'Apr 6', 'Apr 13', 'Apr 20'], values: [78, 76, 74, 72, 70, 68, 66, 65], color: 'var(--ia-color-error)', secondaryValues: [85, 85, 85, 85, 85, 85, 85, 85], secondaryLabel: 'Target' },
    ],
    followUpQuestions: [
      'Show total sales in the last 4 weeks for Maple Heights',
      'What are the VoC trends for underperforming stores?',
      'Which SKUs are likely to go out of stock at Pine Grove?',
    ],
  },
  'best performing': {
    answer: '## 🏆 Top Performing Stores — Excellence Report\n\n**Report Period:** As of Apr 27, 2025 · **Classification:** Best-in-Class · **Stores Recognized:** 3 of 8\n\n---\n\n### Executive Summary\n\nThree stores are significantly outperforming district targets, contributing a combined **+$132K sales surplus** vs plan. These stores demonstrate consistent execution excellence and provide best-practice models for the district.\n\n### Performance Leaders\n\n| Rank | Store | DPI | Sales vs Plan | VoC Score | Key Strength |\n|------|-------|-----|---------------|-----------|-------------|\n| 🥇 | Downtown Plaza #2034 | **94** | +8.2% (+$218K) | 92% | Perfect cleanliness scores · 98% planogram compliance |\n| 🥈 | Riverside Mall #1876 | **91** | +5.4% (+$195K) | 89% | Best product availability · Highest weekend conversion |\n| 🥉 | Central Station #3421 | **85** | +2.1% (+$172K) | 84% | Most consistent execution · No audit failures in 12 weeks |\n\n### Success Factor Analysis\n\n| Factor | Plaza #2034 | Riverside #1876 | Central #3421 | District Avg |\n|--------|-------------|-----------------|---------------|--------------|\n| Planogram Compliance | 98% | 94% | 91% | 78% |\n| Safety Audit Score | 96% | 93% | 90% | 82% |\n| Staff Availability | 99% | 97% | 95% | 88% |\n| OOS Rate | 1.2% | 1.8% | 2.4% | 4.8% |\n| Customer Wait Time | 2.1 min | 2.4 min | 2.8 min | 3.6 min |\n| Weekend Conversion | 41% | 38% | 35% | 31% |\n\n### Best Practices to Scale\n\n| Practice | Origin Store | Impact | Scalability |\n|----------|-------------|--------|-------------|\n| **Pre-shift planogram walkthrough** — 10-min compliance check before store open | Plaza #2034 | +12pp compliance | High — zero cost |\n| **Weekend warrior staffing** — dedicated weekend team with incentive bonus | Riverside #1876 | +7pp weekend conversion | Medium — requires budget |\n| **Real-time OOS alerts** — 30-min replenishment SLA on flagged items | Plaza #2034 | -3.6pp OOS rate | High — process change only |\n| **Daily safety micro-audits** — 5-min focused check per zone, rotating daily | Central #3421 | +8pp safety score | High — zero cost |\n\n> 🌟 **Recognition:** Downtown Plaza #2034 has maintained DPI above 90 for **12 consecutive weeks** — qualifying for the **District Excellence Award**. Recommend formal recognition at the next regional meeting.',
    kpiCards: [
      { label: 'Excellence Stores', value: '3', delta: 'stable', direction: 'up' },
      { label: 'Avg DPI (Top 3)', value: '90', delta: '+2.1', direction: 'up' },
      { label: 'Sales Surplus', value: '+$132K', delta: 'vs plan', direction: 'up' },
      { label: 'Avg VoC', value: '88.7%', delta: '+3.2pp', direction: 'up' },
    ],
    chartData: [
      { type: 'bar', title: 'DPI Scores — All Stores', labels: ['Plaza', 'Riverside', 'Central', 'Westfield', 'Harbor', 'Oak St', 'Pine Gr', 'Maple'], values: [94, 91, 85, 79, 76, 72, 65, 58], color: 'var(--ia-color-success)' },
      { type: 'bar', title: 'Sales vs Plan (%)', labels: ['Plaza', 'Riverside', 'Central', 'Westfield', 'Harbor', 'Oak St', 'Pine Gr', 'Maple'], values: [108, 105, 102, 99, 95, 93, 91, 88], color: 'var(--ia-color-primary)' },
    ],
    followUpQuestions: [
      'What is the gross margin % trend for Downtown Plaza?',
      'Show total sales in the last 4 weeks for top 3 stores',
      'What best practices can be scaled from Plaza to other stores?',
    ],
  },
  'voc trend': {
    answer: '## 💬 Voice of Customer (VoC) — Trend Analysis Report\n\n**Report Period:** Last 4 Weeks · **Data Source:** Customer Feedback Platform · **Total Responses:** 2,847\n\n---\n\n### Executive Summary\n\nOverall customer satisfaction has declined from **82% → 79%** over the past 4 weeks, a **-3 percentage point** drop. The primary driver is a surge in "messy aisles" complaints (+28%), concentrated in Pine Grove and Maple Heights. Checkout speed continues to improve as a bright spot.\n\n### Satisfaction Trend (4-Week View)\n\n| Week | Score | Change | Volume | Key Theme |\n|------|-------|--------|--------|-----------|\n| Apr 6 | 82% | — | 684 responses | Baseline period |\n| Apr 13 | 81% | -1pp | 712 responses | Early cleanliness complaints emerging |\n| Apr 20 | 80% | -1pp | 738 responses | "Messy aisles" becomes top theme |\n| Apr 27 (Current) | 79% | -1pp | 713 responses | Decline continues — intervention needed |\n\n### Theme Analysis — Top Issues\n\n| Rank | Theme | Mentions | Trend | Affected Stores | Severity |\n|------|-------|----------|-------|-----------------|----------|\n| 1 | 🧹 **Messy Aisles** | 134 | 📈 +28% | Pine Grove, Maple Heights, Oak Street | 🔴 Critical |\n| 2 | 📦 **Product Availability** | 76 | 📈 +15% | Pine Grove, Maple Heights | ⚠️ High |\n| 3 | ⏱️ **Wait Times** | 42 | 📉 -18% | Improving district-wide | ✅ Improving |\n| 4 | 👤 **Staff Helpfulness** | 38 | ➡️ Flat | Harbor View | ⚠️ Monitor |\n| 5 | 💲 **Pricing Concerns** | 29 | ➡️ Flat | District-wide | ℹ️ Low |\n\n### Store-Level VoC Breakdown\n\n| Store | VoC Score | vs LW | Top Complaint | Positive Feedback |\n|-------|-----------|-------|---------------|-------------------|\n| Downtown Plaza #2034 | 92% | +1pp | None significant | "Always clean and organized" |\n| Riverside Mall #1876 | 89% | +0pp | Minor wait times | "Great product selection" |\n| Central Station #3421 | 84% | -1pp | Product availability | "Friendly staff" |\n| Westfield Center #2198 | 80% | -2pp | Messy aisles | Checkout speed |\n| Harbor View #4532 | 76% | -1pp | Staff helpfulness | Product quality |\n| Oak Street #1234 | 72% | -3pp | Messy aisles | Pricing |\n| Pine Grove #5678 | 65% | -4pp | Messy aisles + OOS | None this period |\n| Maple Heights #9012 | 58% | -5pp | All categories declining | None this period |\n\n### Recommended Actions\n\n| Priority | Action | Target Stores | Owner | Impact Estimate |\n|----------|--------|---------------|-------|-----------------|\n| 🔴 Immediate | Deploy targeted cleaning protocol — hourly aisle walks during peak | Pine Grove, Maple Heights | Store Managers | +4–6pp VoC |\n| 🔴 Immediate | Increase stock-check frequency — every 2 hours on high-velocity SKUs | Pine Grove, Maple Heights | Inventory Leads | +2–3pp VoC |\n| ⚠️ This Week | Share Downtown Plaza cleaning SOP as best practice to all stores | District-wide | District Manager | +1–2pp VoC |\n| ⚠️ This Week | Customer recovery outreach — contact top 20 negative reviewers | Oak Street, Harbor View | CX Manager | Retention |\n\n> 📈 **Positive Signal:** Checkout speed improvements are driven by the new self-checkout rollout at 5 stores. Recommend accelerating rollout to remaining 3 stores to build on this momentum.',
    kpiCards: [
      { label: 'VoC Score', value: '79%', delta: '-3pp', direction: 'down' },
      { label: 'Top Issue', value: 'Cleanliness', delta: '+28%', direction: 'down' },
      { label: 'Positive Theme', value: 'Checkout', delta: 'improving', direction: 'up' },
      { label: 'Response Rate', value: '67%', delta: '+5%', direction: 'up' },
    ],
    chartData: [
      { type: 'line', title: 'VoC Score Trend (4 Weeks)', labels: ['Apr 6', 'Apr 13', 'Apr 20', 'Apr 27'], values: [82, 81, 80, 79], color: 'var(--ia-color-warning)', secondaryValues: [85, 85, 85, 85], secondaryLabel: 'Target' },
      { type: 'horizontal-bar', title: 'VoC by Store', labels: ['Plaza', 'Riverside', 'Central', 'Westfield', 'Harbor', 'Oak St', 'Pine Gr', 'Maple'], values: [92, 89, 84, 80, 76, 72, 65, 58], color: 'var(--ia-color-primary)' },
    ],
    followUpQuestions: [
      'Which stores are driving the cleanliness complaints?',
      'Show me the VoC breakdown for Pine Grove specifically',
      'What are the product availability issues at Maple Heights?',
    ],
  },
  'total sales': {
    answer: '## 💰 Store Sales Report — 4-Week Rolling Analysis\n\n**Report Period:** Mar 30 – Apr 27, 2025 · **Store:** Downtown Plaza #2034 · **District:** 14\n\n---\n\n### Executive Summary\n\nDowntown Plaza #2034 generated **$872K** in total sales over the last 4 weeks, performing **+8.2% above plan** ($806K target). The store ranks **#1 in the district** and has exceeded target in all 4 weeks. Growth is driven by strong weekend conversion and effective promotional execution.\n\n### Weekly Sales Breakdown\n\n| Week | Sales | vs Plan | vs LY | Transactions | Avg Basket | Conversion |\n|------|-------|---------|-------|-------------|------------|------------|\n| Mar 30 | $208K | +6.1% | +4.2% | 5,420 | $38.40 | 38% |\n| Apr 6 | $215K | +7.8% | +5.1% | 5,580 | $38.50 | 39% |\n| Apr 13 | $221K | +9.4% | +6.8% | 5,710 | $38.70 | 40% |\n| Apr 20 | $228K | +9.6% | +7.2% | 5,860 | $38.90 | 41% |\n| **Total** | **$872K** | **+8.2%** | **+5.8%** | **22,570** | **$38.63** | **39.5%** |\n\n### Sales by Department\n\n| Department | 4-Week Sales | % of Total | vs Plan | Trend |\n|-----------|-------------|-----------|---------|-------|\n| Grocery & Staples | $314K | 36.0% | +5.2% | 📈 Growing |\n| Fresh & Produce | $183K | 21.0% | +12.4% | 📈 Strong |\n| Health & Beauty | $131K | 15.0% | +9.8% | 📈 Growing |\n| Household & Cleaning | $96K | 11.0% | +4.1% | ➡️ Stable |\n| Beverages | $79K | 9.1% | +7.3% | 📈 Growing |\n| Other | $69K | 7.9% | +3.6% | ➡️ Stable |\n\n### District Comparison (4-Week Total)\n\n| Rank | Store | 4-Week Sales | vs Plan | vs LY |\n|------|-------|-------------|---------|-------|\n| 🥇 | Downtown Plaza #2034 | $872K | +8.2% | +5.8% |\n| 🥈 | Riverside Mall #1876 | $784K | +5.4% | +3.9% |\n| 🥉 | Central Station #3421 | $692K | +2.1% | +1.4% |\n| 4 | Westfield Center #2198 | $648K | -1.2% | -0.8% |\n| 5 | Harbor View #4532 | $596K | -4.8% | -3.2% |\n| 6 | Oak Street #1234 | $532K | -6.8% | -5.1% |\n| 7 | Pine Grove #5678 | $476K | -9.2% | -7.8% |\n| 8 | Maple Heights #9012 | $448K | -12.4% | -10.1% |\n\n> 📈 **Growth Driver:** Fresh & Produce department is outperforming at +12.4% vs plan — driven by the new local sourcing initiative launched 6 weeks ago. This practice is a candidate for district-wide rollout.',
    kpiCards: [
      { label: '4-Week Sales', value: '$872K', delta: '+8.2%', direction: 'up' },
      { label: 'Avg Weekly', value: '$218K', delta: '+$16K', direction: 'up' },
      { label: 'Transactions', value: '22.6K', delta: '+6.4%', direction: 'up' },
      { label: 'Avg Basket', value: '$38.63', delta: '+2.1%', direction: 'up' },
    ],
    chartData: [
      { type: 'bar', title: 'Weekly Sales ($K)', labels: ['Apr 6', 'Apr 13', 'Apr 20', 'Apr 27'], values: [208, 215, 221, 228], color: 'var(--ia-color-success)' },
      { type: 'bar', title: '4-Week Sales by Store ($K)', labels: ['Plaza', 'Riverside', 'Central', 'Westfield', 'Harbor', 'Oak St', 'Pine Gr', 'Maple'], values: [872, 784, 692, 648, 596, 532, 476, 448], color: 'var(--ia-color-primary)' },
    ],
    followUpQuestions: [
      'What is the gross margin % trend for this store?',
      'Which departments are driving the sales growth?',
      'How does this store compare to the district average?',
    ],
  },
  'margin': {
    answer: '## 📊 Gross Margin Trend — 13-Week Analysis\n\n**Report Period:** Jan 27 – Apr 21, 2025 · **Store:** Downtown Plaza #2034 · **District:** 14\n\n---\n\n### Executive Summary\n\nGross margin has trended from **28.4% → 31.2%** over the past 13 weeks, a **+2.8 percentage point improvement**. This outperforms the district average of 27.8% and puts the store in the **top quartile** nationally. The improvement is driven by reduced shrinkage, better promotional mix optimization, and improved fresh department waste management.\n\n### 13-Week Gross Margin Trend\n\n| Week | Gross Margin % | vs District Avg | vs Target (30%) | Key Event |\n|------|---------------|-----------------|-----------------|----------|\n| Jan 27 | 28.4% | +0.2pp | -1.6pp | Baseline period |\n| Feb 3 | 28.6% | +0.3pp | -1.4pp | — |\n| Feb 10 | 28.9% | +0.5pp | -1.1pp | Shrink reduction program launched |\n| Feb 17 | 29.1% | +0.7pp | -0.9pp | — |\n| Feb 24 | 29.3% | +0.8pp | -0.7pp | Fresh waste protocol v2 deployed |\n| Mar 3 | 29.6% | +1.0pp | -0.4pp | — |\n| Mar 10 | 29.8% | +1.2pp | -0.2pp | Promo mix optimization started |\n| Mar 17 | 30.0% | +1.3pp | 0.0pp | **Target achieved** |\n| Mar 24 | 30.2% | +1.5pp | +0.2pp | — |\n| Mar 31 | 30.5% | +1.7pp | +0.5pp | — |\n| Apr 7 | 30.8% | +1.9pp | +0.8pp | Vendor rebate negotiation completed |\n| Apr 14 | 31.0% | +2.1pp | +1.0pp | — |\n| Apr 21 (Current) | **31.2%** | **+2.4pp** | **+1.2pp** | Sustained above target |\n\n### Margin by Department\n\n| Department | Current GM% | 13W Ago | Change | vs District |\n|-----------|------------|---------|--------|-------------|\n| Fresh & Produce | 34.8% | 30.2% | +4.6pp | +3.1pp above |\n| Health & Beauty | 38.2% | 37.1% | +1.1pp | +0.8pp above |\n| Grocery & Staples | 24.6% | 23.8% | +0.8pp | +0.4pp above |\n| Beverages | 29.4% | 28.2% | +1.2pp | +0.6pp above |\n| Household | 26.8% | 26.1% | +0.7pp | +0.2pp above |\n\n### Key Margin Drivers\n\n| Driver | Impact | Detail |\n|--------|--------|--------|\n| **Shrink Reduction** | +1.2pp | Shrinkage reduced from 2.8% → 1.6% through improved receiving verification and loss prevention |\n| **Fresh Waste Management** | +0.8pp | Produce waste cut by 34% through dynamic markdown and donation partnerships |\n| **Promo Mix Optimization** | +0.5pp | Shifted promotional spend toward higher-margin categories; maintained traffic |\n| **Vendor Rebate Negotiation** | +0.3pp | Secured improved terms on top 50 SKUs; effective Week 11 |\n\n> 🎯 **Outlook:** If current trajectory holds, projected to reach **32.0% GM** by end of Q4 — which would qualify for the **Margin Excellence Tier** and associated team bonus.',
    kpiCards: [
      { label: 'Current GM%', value: '31.2%', delta: '+2.8pp', direction: 'up' },
      { label: 'vs District', value: '+2.4pp', delta: 'above avg', direction: 'up' },
      { label: 'Shrink Rate', value: '1.6%', delta: '-1.2pp', direction: 'up' },
      { label: 'Shrink Reduction', value: '-34%', delta: 'improved', direction: 'up' },
    ],
    chartData: [
      { type: 'line', title: 'Gross Margin % Trend (13 Weeks)', labels: ['Jan 27', 'Feb 3', 'Feb 10', 'Feb 17', 'Feb 24', 'Mar 3', 'Mar 10', 'Mar 17', 'Mar 24', 'Mar 31', 'Apr 7', 'Apr 14', 'Apr 21'], values: [28.4, 28.6, 28.9, 29.1, 29.3, 29.6, 29.8, 30.0, 30.2, 30.5, 30.8, 31.0, 31.2], color: 'var(--ia-color-success)', secondaryValues: [30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30], secondaryLabel: 'Target' },
      { type: 'horizontal-bar', title: "GM% by Department", labels: ["Women's", "Men's", 'Accessories', 'Footwear', 'Kids', 'Seasonal'], values: [38.2, 34.8, 32.1, 29.4, 26.8, 24.6], color: 'var(--ia-color-primary)' },
    ],
    followUpQuestions: [
      'What is the shrink rate trend for bottom 3 stores?',
      'Show me the fresh department waste analysis',
      'Which vendor rebates are expiring this quarter?',
    ],
  },
  'out of stock': {
    answer: "## 🔮 Predictive OOS Risk — 7-Day Forecast\n\n**Report Period:** Next 7 Days · **Model:** AI Demand Forecasting v3.2 · **Confidence:** 87%\n\n---\n\n### Executive Summary\n\nBased on current inventory levels, sales velocity, replenishment schedules, and seasonal demand patterns, **18 SKUs** across 5 stores are predicted to go **out of stock within the next 7 days** if no intervention is taken. Estimated revenue at risk: **$42K**.\n\n### High-Risk SKUs — Immediate Action Required\n\n| Risk | SKU | Product | Store | Days to OOS | Current Stock | Daily Velocity | Revenue at Risk |\n|------|-----|---------|-------|-------------|---------------|----------------|----------------|\n| 🔴 | WOM-TOP-014 | Women's V-Neck Basics | Pine Grove #5678 | **1.2 days** | 8 units | 6.5/day | $980 |\n| 🔴 | WOM-DRS-014 | Floral Midi Dress — Navy | Maple Heights #9012 | **1.5 days** | 12 units | 8.2/day | $1,440 |\n| 🔴 | MEN-DNM-003 | Slim Fit Denim — Dark Wash | Oak Street #1234 | **1.8 days** | 6 units | 3.4/day | $720 |\n| 🔴 | SEA-JKT-004 | Seasonal Rain Jacket | Pine Grove #5678 | **2.0 days** | 24 units | 12.1/day | $540 |\n| 🟡 | ACC-BAG-005 | Canvas Tote Bag | Harbor View #4532 | **3.2 days** | 15 units | 4.7/day | $620 |\n| 🟡 | KID-TSH-012 | Kids Color Block Tee | Maple Heights #9012 | **3.5 days** | 18 units | 5.2/day | $890 |\n| 🟡 | MEN-OUT-006 | Puffer Jacket | Oak Street #1234 | **3.8 days** | 9 units | 2.4/day | $480 |\n| 🟡 | WOM-ACT-002 | Athletic Leggings | Central Station #3421 | **4.1 days** | 22 units | 5.4/day | $660 |\n\n### Store-Level Risk Summary\n\n| Store | SKUs at Risk | Revenue at Risk | Avg Days to OOS | Primary Category |\n|-------|-------------|-----------------|-----------------|------------------|\n| Pine Grove #5678 | 6 SKUs | $14.2K | 2.4 days | Women's Apparel |\n| Maple Heights #9012 | 5 SKUs | $11.8K | 3.1 days | Women's & Kids |\n| Oak Street #1234 | 4 SKUs | $8.4K | 3.6 days | Men's Apparel |\n| Harbor View #4532 | 2 SKUs | $4.8K | 4.2 days | Accessories |\n| Central Station #3421 | 1 SKU | $2.8K | 4.1 days | Activewear |\n\n### Root Cause Analysis\n\n| Factor | Affected SKUs | Detail |\n|--------|--------------|--------|\n| **Delayed DC shipment** | 8 SKUs | Distribution center backlog — next scheduled delivery pushed 2 days |\n| **Demand spike (seasonal)** | 5 SKUs | Summer fashion uplift on Dresses and Outerwear not reflected in auto-replenishment model |\n| **Vendor supply constraint** | 3 SKUs | Supplier allocation reduced 20% due to fabric shortage |\n| **Safety stock too low** | 2 SKUs | Safety stock parameters not updated after last demand review |\n\n> ⚠️ **Revenue Impact:** If all 18 SKUs go OOS for their predicted duration, estimated lost sales total **$42K** across 5 stores. Early intervention can prevent 80%+ of this loss.",
    kpiCards: [
      { label: 'At-Risk SKUs', value: '18', delta: '+5 vs LW', direction: 'down' },
      { label: 'Revenue at Risk', value: '$42K', delta: '7-day', direction: 'down' },
      { label: 'Stores Affected', value: '5 of 8', delta: '62.5%', direction: 'down' },
      { label: 'Avg Days to OOS', value: '3.1', delta: 'days', direction: 'down' },
    ],
    chartData: [
      { type: 'horizontal-bar', title: 'Revenue at Risk by Store ($K)', labels: ['Pine Grove', 'Maple Heights', 'Oak Street', 'Harbor View', 'Central Stn'], values: [14.2, 11.8, 8.4, 4.8, 2.8], color: 'var(--ia-color-error)' },
      { type: 'bar', title: 'At-Risk SKUs by Category', labels: ['Denim', 'Tops', 'Dresses', 'Outerwear', 'Accessories', 'Activewear', 'Kids', 'Footwear'], values: [4, 3, 3, 2, 2, 1, 2, 1], color: 'var(--ia-color-warning)' },
    ],
    followUpQuestions: [
      'Show total sales impact of OOS items last week',
      'Which stores have the highest shrink rate?',
      'What is the replenishment SLA performance by store?',
    ],
  },
};


// ── Skill Config (full catalogue — filtered per role inside the component) ──
type SkillDef = { id: SkillMode; label: string; icon: React.ReactNode; description: string; placeholder: string; suggestions: string[] };

const ALL_SKILLS: SkillDef[] = [
  {
    id: 'knowledge',
    label: 'Knowledge Center',
    icon: <PsychologyOutlined sx={{ fontSize: 16 }}/>,
    description: 'Ask SOP & policy questions — get cited answers',
    placeholder: 'Ask about SOPs, policies, procedures...',
    suggestions: ['What is the exact procedure if a fire exit is blocked?', 'How many days notice is required before a planogram change?', 'What steps should a store manager follow for a product recall?', 'What happens if a store misses two consecutive weekly audits?'],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: <BarChartOutlined sx={{ fontSize: 16 }}/>,
    description: 'Ask performance questions — get KPI insights',
    placeholder: 'Ask about sales, performance, trends...',
    suggestions: ['Show total sales in the last 4 weeks for Downtown Plaza', 'Which stores are underperforming vs target this week?', 'What is the gross margin % trend over the last 13 weeks?', 'Which SKUs are likely to go out of stock in the next 7 days?'],
  },
  {
    id: 'pog',
    label: 'POG Audit',
    icon: <ImageOutlined sx={{ fontSize: 16 }}/>,
    description: 'Upload shelf images — detect OOS, check compliance, or create tasks',
    placeholder: 'Upload a shelf image to detect OOS, check compliance, or create tasks',
    suggestions: ['Detect OOS items', 'Check compliance'],
  },
  {
    id: 'actions',
    label: 'Actions',
    icon: <BoltOutlined sx={{ fontSize: 16 }}/>,
    description: 'Create tasks & assignments via natural language',
    placeholder: 'Tell me what task to create...',
    // Default suggestions (ADMIN / HQ) — overridden per role below
    suggestions: ['Create a planogram rule for brand blocking in Apparel', 'Create a planogram rule for price tier adjacency', 'Schedule planogram reset for next Monday', 'Create urgent task for fire exit clearance'],
  },
];

// Per-role Actions suggestions
const ACTIONS_SUGGESTIONS_SM = [
  'Create urgent task for fire exit clearance',
  'Schedule a stock count for this weekend',
  'Assign a cleaning task to the overnight team',
  'Create a product recall follow-up task',
];
const ACTIONS_SUGGESTIONS_DM = [
  'Create a localization task for Women\'s Wall planogram',
  'Schedule planogram localization reset for District 14',
  'Create urgent task for fire exit clearance',
  'Assign a compliance follow-up task to store managers',
];



function timeOfDayPeriod(): 'Morning' | 'Afternoon' | 'Evening' {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}

function firstNameFromDisplayName(name: string | undefined | null): string {
  const t = name?.trim();
  if (!t) return 'there';
  return t.split(/\s+/)[0] ?? 'there';
}

// ── Helper: match query to response ──
const findKnowledgeResponse = (query: string) => {
  const q = query.toLowerCase();
  for (const [key, val] of Object.entries(knowledgeResponses)) {
    if (q.includes(key)) return val;
  }
  return {
    answer: '## 📄 Knowledge Center — Policy Reference\n\n**Classification:** General Operations · **Confidence:** High — Multiple Sources Found\n\n---\n\n### Standard Operating Procedure\n\nBased on the current store operations policy framework, the applicable procedure is as follows:\n\n| Step | Action | Owner | SLA |\n|------|--------|-------|-----|\n| 1 | **Identify & Document** — Log the issue in the Incident Management System with full details (time, location, description, photos if applicable) | Discovering Associate | Immediate |\n| 2 | **Notify Management** — Escalate to the Store Manager via the standard notification channel | Discovering Associate | Within 15 minutes |\n| 3 | **Assess & Classify** — Store Manager reviews the issue, assigns severity level (Critical / High / Medium / Low) | Store Manager | Within 1 hour |\n| 4 | **Execute Resolution** — Follow the relevant SOP checklist for the classified issue type | Assigned Owner | Per SLA matrix |\n| 5 | **Verify & Close** — Confirm resolution, update the incident log, and obtain sign-off | Store Manager | Within 24 hours |\n\n### Escalation Matrix\n\n- **Not resolved within SLA** → Auto-escalates to District Manager\n- **Repeated occurrence (3+ in 30 days)** → Root Cause Analysis required, Regional Ops notified\n- **Safety or compliance impact** → Immediate escalation to Safety Officer / Compliance Team\n\n> 💡 **Tip:** For more specific guidance, try asking about a particular topic such as "fire exit rules", "product recall steps", "safety audit process", or "planogram change notice period".',
    sources: [
      { doc: 'General Store Operations SOP v2.4', section: 'Section 1.1 — General Procedures', page: 'Pages 2–4' },
      { doc: 'Escalation Framework', section: 'Section 2.1 — Standard Escalation Matrix', page: 'Page 8' },
    ],
    followUpQuestions: [
      'What is the fire exit blockage procedure?',
      'How many days notice is required before a planogram change?',
      'What are the weekly safety audit requirements?',
    ],
  };
};

const findAnalyticsResponse = (query: string) => {
  const q = query.toLowerCase();
  for (const [key, val] of Object.entries(analyticsResponses)) {
    if (q.includes(key)) return val;
  }
  return {
    answer: '## 📊 District Performance Overview — Executive Summary\n\n**Report Period:** Current Period · **Scope:** District 14 — All 8 Stores\n\n---\n\n### Key Performance Indicators\n\nThe district is operating within the **"Performing"** tier with a composite DPI of **81.2** (+0.8 vs prior period). Five of eight stores are meeting or exceeding their targets.\n\n### Store Performance Summary\n\n| Store | DPI | Sales vs Plan | Status |\n|-------|-----|---------------|--------|\n| Downtown Plaza #2034 | 94 | +8.2% | ✅ Exceeding |\n| Riverside Mall #1876 | 91 | +5.4% | ✅ Exceeding |\n| Central Station #3421 | 85 | +2.1% | ✅ On Target |\n| Westfield Center #2198 | 79 | -1.2% | ✅ On Target |\n| Harbor View #4532 | 76 | -4.8% | ✅ On Target |\n| Oak Street #1234 | 72 | -6.8% | ⚠️ Below |\n| Pine Grove #5678 | 65 | -9.2% | 🔴 At Risk |\n| Maple Heights #9012 | 58 | -12.4% | 🔴 Critical |\n\n### Opportunity Areas\n\n| Area | Current | Target | Gap | Recommendation |\n|------|---------|--------|-----|----------------|\n| Weekend Conversion | 31.2% | 36% | -4.8pp | Add floor associates during Sat/Sun peak |\n| Product Availability | 95.2% | 98% | -2.8pp | Increase stock-check frequency at bottom 3 stores |\n| VoC Satisfaction | 79% | 85% | -6pp | Deploy targeted cleaning protocol at Pine Grove & Maple Heights |\n\n> 💡 **Insight:** The district is trending positively overall. Focus intervention on the bottom 3 stores to close the performance gap. Would you like me to drill deeper into any specific metric or store?',
    kpiCards: [
      { label: 'District DPI', value: '81.2', delta: '+0.8', direction: 'up' as const },
      { label: 'On-Target Stores', value: '5/8', delta: '62.5%', direction: 'up' as const },
    ],
    chartData: [
      { type: 'bar' as const, title: 'DPI by Store', labels: ['Plaza', 'Riverside', 'Central', 'Westfield', 'Harbor', 'Oak St', 'Pine Gr', 'Maple'], values: [94, 91, 85, 79, 76, 72, 65, 58], color: 'var(--ia-color-primary)' },
    ],
    followUpQuestions: [
      'Which stores are underperforming vs target this week?',
      'What are the VoC trends across the district?',
      'Show me the best performing stores',
    ],
  };
};

// ── VoC Action Plan Response ──
const vocActionPlanResponse = {
  content: '**Action Plan: "Messy Aisles" — VoC Rising Theme**\n\nBased on analysis of 134 customer mentions (+34% over 2 weeks) across 3 stores, here\'s the recommended action plan:\n\n**Root Cause Analysis:**\n• Reduced cleaning staff during peak hours (Hamburg South, Cologne East)\n• Delayed restocking creating aisle clutter (Brussels Nord)\n• Insufficient aisle-clear protocols during promotional resets\n\n**Recommended Actions:**',
  taskCreated: {
    title: 'Deploy Targeted Aisle Cleanliness Protocol — 3 Stores',
    assignee: '',
    priority: 'High',
    stores: [
      { name: 'Hamburg South #2041', manager: 'Anna Becker' },
      { name: 'Cologne East #2034', manager: 'Thomas Richter' },
      { name: 'Brussels Nord #2038', manager: 'Marie Laurent' },
    ],
    due: 'This Week',
  },
  suggestedQueries: ['Create follow-up audit task', 'View affected store details', 'Schedule team briefing'],
};

// ── HQ District Gaps Action Plan Response ──
const districtGapsActionPlanResponse = {
  content: '**Action Plan: Execution Gaps Widening in 2 Districts**\n\nBased on analysis of compliance scores, audit data, and broadcast acknowledgements across District 11 and District 22:\n\n**Root Cause Analysis:**\n• District 11: 3 stores missed Monday audit window — revenue impact est. $18K\n• District 22: Broadcast acknowledgement rate dropped to 56% — 4 stores non-responsive\n• Both districts show correlation between late audit completion and declining DPI scores\n\n**Recommended Actions:**\n\n| Priority | Action | Owner | Timeline |\n|----------|--------|-------|----------|\n| 🔴 Critical | Deploy compliance correction protocol in District 11 — 3 stores | DM Lisa Nguyen | 24 hours |\n| 🔴 Critical | Escalate broadcast non-compliance in District 22 — follow up with 4 non-responsive stores | DM Marcus Reed | 48 hours |\n| 🟡 High | Schedule re-audit for all flagged stores in both districts | Regional Ops | This week |\n| 🟡 High | Review and update broadcast acknowledgement SLA for both districts | HQ Operations | This week |\n\n**Expected Impact:**\n• Compliance recovery to 85%+ within 2 weeks\n• Broadcast acknowledgement rate improvement to 90%+\n• Estimated revenue recovery: $42K across both districts',
  taskCreated: {
    title: 'Compliance Recovery Plan — District 11 & 22',
    assignee: '',
    priority: 'Critical',
    due: 'This Week',
  },
  suggestedQueries: ['Create follow-up audit tasks for District 11', 'Draft escalation broadcast for District 22', 'Show compliance trend for both districts', 'Schedule DM review meetings'],
};

// ── Component ──
export const AICopilot: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role ?? 'SM';

  // ── Role-filtered skill list ─────────────────────────────────────────────
  // Rules:
  //   POG Audit  — hidden for SM
  //   Actions    — shown to all, but suggestions differ; planogram creation guarded
  const visibleSkills = useMemo((): SkillDef[] => {
    return ALL_SKILLS
      .filter(s => !(s.id === 'pog' && role === 'SM'))
      .map(s => {
        if (s.id === 'actions') {
          if (role === 'SM') return { ...s, suggestions: ACTIONS_SUGGESTIONS_SM };
          if (role === 'DM') return { ...s, suggestions: ACTIONS_SUGGESTIONS_DM };
        }
        return s;
      });
  }, [role]);

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSkill, setActiveSkill] = useState<SkillMode>('knowledge');
  const activeSkillRef = useRef<SkillMode>(activeSkill);
  activeSkillRef.current = activeSkill;
  const [pogRuleSent, setPogRuleSent] = useState<Set<string>>(new Set());
  /** Dedupe deep-link runs (same URL) while allowing repeats when `alan` nonce changes */
  const processedDeepLinkKeysRef = useRef<Set<string>>(new Set());
  const [isInitializing, setIsInitializing] = useState(false);
  const [initStep, setInitStep] = useState(0);
  const [initMode, setInitMode] = useState<SkillMode | null>(null);
  const [initStepLabels, setInitStepLabels] = useState<string[]>([]);
  const [messages, setMessages] = useState<Record<SkillMode, ChatMessage[]>>({
    knowledge: [],
    analytics: [],
    pog: [],
    actions: [],
  });
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [pendingPogAction, setPendingPogAction] = useState<string | null>(null);
  // Add to Operations Queue state
  const [taskPushOpen, setTaskPushOpen] = useState<string | null>(null); // message ID
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskPriority, setTaskPriority] = useState('High');
  const [taskPushed, setTaskPushed] = useState<Set<string>>(new Set());
  const [taskPushing, setTaskPushing] = useState<string | null>(null); // loading state
  const [assigneeDropdownOpen, setAssigneeDropdownOpen] = useState(false);
  const [copilotTab, setCopilotTab] = useState<'steps' | 'response'>('steps');
  const [openSource, setOpenSource] = useState<{ doc: string; section: string; page: string; tag?: string; updated?: string; excerpt?: string } | null>(null);
  const [sourcesPanelMsgId, setSourcesPanelMsgId] = useState<string | null>(null);
  const [isChatBotOpen, setIsChatBotOpen] = useState(false);
  const [listeningMsgId, setListeningMsgId] = useState<string | null>(null);

  // ── Conversation history (session-scoped) ──────────────────────────────────
  interface SavedConversation {
    id: string;
    title: string;
    skill: SkillMode;
    skillLabel: string;
    messages: ChatMessage[];
    savedAt: Date;
    isPinned?: boolean;
  }
  const [savedConversations, setSavedConversations] = useState<SavedConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentMessages = messages[activeSkill];
  const currentSkill = (visibleSkills.find(s => s.id === activeSkill) ?? visibleSkills[0])!;

  const greetingFirstName = firstNameFromDisplayName(user?.name);
  const timePeriod = timeOfDayPeriod();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeSkill]);

  // If the currently active skill is not available for this role (e.g. SM opened POG
  // via deep-link before role resolved), fall back to knowledge.
  useEffect(() => {
    if (!visibleSkills.find(s => s.id === activeSkill)) {
      setActiveSkill('knowledge');
    }
  }, [visibleSkills, activeSkill]);

  // ── History helpers ─────────────────────────────────────────────────────────

  /** Snapshot current skill's messages into savedConversations and clear the thread. */
  const saveCurrentAndClear = (skillToClear: SkillMode = activeSkill) => {
    const msgs = messages[skillToClear];
    if (msgs.length === 0) return;
    const firstUser = msgs.find(m => m.role === 'user');
    const title = firstUser
      ? firstUser.content.slice(0, 70) + (firstUser.content.length > 70 ? '…' : '')
      : 'Conversation';
    const skill = ALL_SKILLS.find(s => s.id === skillToClear)!;
    setSavedConversations(prev => [{
      id: `conv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title,
      skill: skillToClear,
      skillLabel: skill.label,
      messages: [...msgs],
      savedAt: new Date(),
    }, ...prev]);
    setMessages(prev => ({ ...prev, [skillToClear]: [] }));
    setActiveConversationId(null);
  };
  const historyPanelData = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);

    const bucket = (d: Date): string => {
      if (d >= todayStart) return 'Today';
      if (d >= yesterdayStart) return 'Yesterday';
      return 'Earlier';
    };

    const groups: Record<string, SavedConversation[]> = {};
    savedConversations.forEach(c => {
      const b = bucket(c.savedAt);
      (groups[b] ??= []).push(c);
    });

    return ['Today', 'Yesterday', 'Earlier']
      .filter(b => groups[b]?.length)
      .map(b => ({
        group_name: b,
        conversation_list: groups[b].map(c => ({
          conversation_id: c.id,   // library uses conversation_id for menu state tracking
          id: c.id,
          name: c.title,
          module_name: c.skillLabel,
          pinned: !!c.isPinned,
        })),
      }));
  }, [savedConversations]);

  /** Restore a saved conversation when user clicks it in the History panel. */
  const handleHistorySelect = (item: { id?: string; conversation_id?: string; name: string; module_name?: string }) => {
    const saved = savedConversations.find(c => c.id === (item.conversation_id ?? item.id));
    if (!saved) return;
    setActiveSkill(saved.skill);
    setMessages(prev => ({ ...prev, [saved.skill]: saved.messages }));
    setActiveConversationId(saved.id);
  };

  /**
   * Handle history panel context menu actions.
   * Rename callback signature from library: (action, item, newName)
   * Pin/Unpin/Delete: (action, item)
   */
  const handleHistoryMenuAction = (
    action: string,
    item: { id?: string; conversation_id?: string; name?: string },
    newName?: string,
  ) => {
    const convId = (item as { conversation_id?: string; id?: string }).conversation_id ?? item.id;
    switch (action) {
      case 'delete':
        setSavedConversations(prev => prev.filter(c => c.id !== convId));
        if (activeConversationId === convId) setActiveConversationId(null);
        break;
      case 'rename':
        if (newName?.trim()) {
          setSavedConversations(prev =>
            prev.map(c => c.id === convId ? { ...c, title: newName.trim() } : c),
          );
        }
        break;
      case 'pin':
        setSavedConversations(prev =>
          prev.map(c => c.id === convId ? { ...c, isPinned: true } : c),
        );
        break;
      case 'unpin':
        setSavedConversations(prev =>
          prev.map(c => c.id === convId ? { ...c, isPinned: false } : c),
        );
        break;
      default:
        break;
    }
  };


  /** Header "Ask Alan" / chat icon: navigate here with `{ openAlan: true }` in location state */
  useEffect(() => {
    const st = location.state as { openAlan?: boolean } | null | undefined;
    if (st?.openAlan) {
      setIsChatBotOpen(true);
      navigate(`${location.pathname}${location.search}${location.hash}`, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, location.search, location.hash, navigate]);

  // Agentic action processing — animated step-by-step
  const runAgenticActionFlow = async (
    processingId: string,
    steps: ProcessingStep[],
    finalResponse: ChatMessage,
  ) => {
    // Add processing message with steps
    const processingMsg: ChatMessage = {
      id: processingId,
      role: 'assistant',
      content: 'Analyzing request...',
      timestamp: new Date(),
      skill: 'actions',
      isProcessing: true,
      processingSteps: [...steps],
    };
    setMessages(prev => {
      if (prev.actions.some(m => m.id === processingId)) return prev;
      return { ...prev, actions: [...prev.actions, processingMsg] };
    });

    // Animate steps one by one — slow enough for demo impact
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1300 + Math.random() * 700));
      setMessages(prev => ({
        ...prev,
        actions: prev.actions.map(m =>
          m.id === processingId ? {
            ...m,
            processingSteps: m.processingSteps?.map((s, idx) => ({
              ...s,
              status: idx <= i ? 'completed' as const : idx === i + 1 ? 'active' as const : 'pending' as const,
            })),
          } : m
        ),
      }));
    }

    // Pause after all steps complete, then show final response
    await new Promise(resolve => setTimeout(resolve, 1400));
    setMessages(prev => ({
      ...prev,
      actions: prev.actions.filter(m => m.id !== processingId).concat(finalResponse),
    }));
    setIsProcessing(false);
  };

  // Auto-trigger from Home Screen VoC "Ask Alan" (query params; `alan` nonce allows repeat opens)
  useEffect(() => {
    const mode = searchParams.get('mode');
    const context = searchParams.get('context');
    const alanNonce = searchParams.get('alan') || 'legacy';

    if (mode === 'actions' && context === 'voc-messy-aisles') {
      const deepKey = `voc|${alanNonce}`;
      if (processedDeepLinkKeysRef.current.has(deepKey)) return;
      processedDeepLinkKeysRef.current.add(deepKey);
      setActiveSkill('actions');
      setInitMode('actions');
      setSearchParams({}, { replace: true });

      // Phase 1: Show initializing screen for 2 seconds with animated steps
      setIsInitializing(true);
      setInitStep(0);
      setTimeout(() => setInitStep(1), 600);
      setTimeout(() => setInitStep(2), 1200);
      setTimeout(() => setInitStep(3), 1800);
      setTimeout(() => {
        setIsInitializing(false);
        setInitStep(0);

        // Phase 2: Show user message
        const userMsg: ChatMessage = {
          id: 'msg-auto-voc',
          role: 'user',
          content: 'Create an action plan for the "Messy Aisles" VoC theme trending across Hamburg South #2041, Cologne East #2034, and Brussels Nord #2038',
          timestamp: new Date(),
          skill: 'actions',
        };
        setMessages(prev => {
          if (prev.actions.some(m => m.id === 'msg-auto-voc')) return prev;
          return { ...prev, actions: [...prev.actions, userMsg] };
        });
        setIsProcessing(true);

        // Phase 3: After short pause, run agentic processing steps
        setTimeout(() => {
          const vocSteps: ProcessingStep[] = [
            { step: 'Receiving VoC theme context...', status: 'active' },
            { step: 'Analyzing 134 customer mentions across 3 stores...', status: 'pending' },
            { step: 'Cross-referencing with SEA Cleanliness scores...', status: 'pending' },
            { step: 'Identifying root causes and correlations...', status: 'pending' },
            { step: 'Generating action plan recommendations...', status: 'pending' },
            { step: 'Creating action item for Operations Queue...', status: 'pending' },
          ];

          const finalResponse: ChatMessage = {
            id: 'msg-resp-voc',
            role: 'assistant',
            content: vocActionPlanResponse.content,
            timestamp: new Date(),
            skill: 'actions',
            taskCreated: vocActionPlanResponse.taskCreated,
            suggestedQueries: vocActionPlanResponse.suggestedQueries,
          };

          runAgenticActionFlow('msg-processing-voc', vocSteps, finalResponse);
        }, 500);
      }, 2000);
    }

    // Deep-link: HQ Home — District Gaps via Ask Alan
    if (mode === 'actions' && context === 'district-gaps') {
      const deepKey = `dg|${alanNonce}`;
      if (processedDeepLinkKeysRef.current.has(deepKey)) return;
      processedDeepLinkKeysRef.current.add(deepKey);
      setActiveSkill('actions');
      setInitMode('actions');
      setSearchParams({}, { replace: true });

      setIsInitializing(true);
      setInitStep(0);
      setTimeout(() => setInitStep(1), 600);
      setTimeout(() => setInitStep(2), 1200);
      setTimeout(() => setInitStep(3), 1800);
      setTimeout(() => {
        setIsInitializing(false);
        setInitStep(0);

        const userMsg: ChatMessage = {
          id: 'msg-auto-district-gaps',
          role: 'user',
          content: 'Create an action plan for execution gaps widening in District 11 and District 22 — compliance scores declining, correlated with audit misses and late broadcast acknowledgements',
          timestamp: new Date(),
          skill: 'actions',
        };
        setMessages(prev => {
          if (prev.actions.some(m => m.id === 'msg-auto-district-gaps')) return prev;
          return { ...prev, actions: [...prev.actions, userMsg] };
        });
        setIsProcessing(true);

        setTimeout(() => {
          const gapSteps: ProcessingStep[] = [
            { step: 'Receiving HQ district context...', status: 'active' },
            { step: 'Analyzing compliance data across District 11 & 22...', status: 'pending' },
            { step: 'Cross-referencing audit completion and broadcast acknowledgements...', status: 'pending' },
            { step: 'Identifying root causes and revenue impact...', status: 'pending' },
            { step: 'Generating action plan with task assignments...', status: 'pending' },
            { step: 'Publishing task to Operations Queue...', status: 'pending' },
          ];

          const finalResponse: ChatMessage = {
            id: 'msg-resp-district-gaps',
            role: 'assistant',
            content: districtGapsActionPlanResponse.content,
            timestamp: new Date(),
            skill: 'actions',
            taskCreated: districtGapsActionPlanResponse.taskCreated,
            suggestedQueries: districtGapsActionPlanResponse.suggestedQueries,
          };

          runAgenticActionFlow('msg-processing-district-gaps', gapSteps, finalResponse);
        }, 500);
      }, 2000);
    }

    // Deep-link: POG Self Audit from District Broadcasting
    if (mode === 'pog' && context === 'pog-self-audit') {
      const deepKey = `psa|${alanNonce}`;
      if (processedDeepLinkKeysRef.current.has(deepKey)) return;
      processedDeepLinkKeysRef.current.add(deepKey);
      setActiveSkill('pog');
      setInitMode('pog');
      setSearchParams({}, { replace: true });

      setIsInitializing(true);
      setInitStep(0);
      setTimeout(() => setInitStep(1), 600);
      setTimeout(() => setInitStep(2), 1200);
      setTimeout(() => setInitStep(3), 1800);
      setTimeout(() => {
        setIsInitializing(false);
        setInitStep(0);
        setInitMode(null);

        const pogListMsg: ChatMessage = {
          id: 'msg-pog-list',
          role: 'assistant',
          content: '**POG Self Audit — District 14 Planograms**\n\nI\'ve loaded all active planograms for your district. Select a planogram to begin the self-audit, or upload a shelf image to check compliance.',
          timestamp: new Date(),
          skill: 'pog',
          pogPlanogramList: [
            { name: 'Accessories Endcap — Localized v2.1', store: 'Downtown Plaza #2034', lastAudit: '5 days ago', score: 76, status: 'warning' },
            { name: 'Seasonal Display — Summer Collection v1.3', store: 'Harbor View #3021', lastAudit: '12 days ago', score: 84, status: 'pass' },
            { name: 'Checkout Impulse Bay — Standard v4.0', store: 'Riverside Mall #1876', lastAudit: '3 days ago', score: 91, status: 'pass' },
            { name: 'Beverage Cooler Endcap — Promo Q2', store: 'Oak Street #1234', lastAudit: '8 days ago', score: 68, status: 'fail' },
            { name: "Women's Wall — Spring Reset v2.0",  store: 'Central Station #3421', lastAudit: '1 day ago', score: 88, status: 'pass' },
            { name: "Men's Denim Wall — Localized v3.1", store: 'Maple Heights #9012', lastAudit: '14 days ago', score: 72, status: 'warning' },
          ],
          suggestedQueries: ['Audit Accessories Endcap', 'Audit Seasonal Promo Table', 'Detect OOS items', 'Check compliance'],
        };
        setMessages(prev => {
          if (prev.pog.some(m => m.id === 'msg-pog-list')) return prev;
          return { ...prev, pog: [...prev.pog, pogListMsg] };
        });
      }, 2200);
    }

    // Deep-link: Generic audit dimension from Heatmap
    if (context?.startsWith('audit-')) {
      const skill = mode as SkillMode;
      const storeNum = searchParams.get('store') || '';
      const storeName = decodeURIComponent(searchParams.get('storeName') || '');
      const score = parseInt(searchParams.get('score') || '0');
      const dimension = context.replace('audit-', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

      if (['pog', 'knowledge', 'actions', 'analytics'].includes(skill)) {
        const deepKey = `audit|${skill}|${context}|${storeNum}|${alanNonce}`;
        if (processedDeepLinkKeysRef.current.has(deepKey)) return;
        processedDeepLinkKeysRef.current.add(deepKey);
        setActiveSkill(skill);
        setInitMode(skill === 'pog' ? 'pog' : skill === 'actions' ? 'actions' : null);
        setSearchParams({}, { replace: true });

        // Skill-specific init overlay steps
        const initStepsMap: Record<string, string[]> = {
          pog: ['Loading planogram data for store #' + storeNum, 'Connecting to AI Vision engine', 'Preparing compliance workspace'],
          knowledge: ['Loading SOPs and guidelines for ' + dimension, 'Indexing knowledge base documents', 'Preparing contextual answers'],
          actions: ['Analyzing ' + dimension.toLowerCase() + ' audit findings', 'Loading execution playbooks', 'Generating action recommendations'],
          analytics: ['Pulling ' + dimension.toLowerCase() + ' metrics for store #' + storeNum, 'Running trend analysis', 'Computing benchmark comparisons'],
        };
        const steps = initStepsMap[skill] || initStepsMap['analytics'];
        setInitStepLabels(steps);

        setIsInitializing(true);
        setInitStep(0);
        setTimeout(() => setInitStep(1), 600);
        setTimeout(() => setInitStep(2), 1200);
        setTimeout(() => setInitStep(3), 1800);
        setTimeout(() => {
          setIsInitializing(false);
          setInitStep(0);
          setInitMode(null);

          // Build skill-specific contextual response
          const msgId = `msg-audit-${storeNum}-${dimension.toLowerCase().replace(/ /g, '-')}`;
          const scoreLabel = score >= 90 ? 'Excellent' : score >= 75 ? 'Good' : score >= 50 ? 'Needs Improvement' : 'Critical';
          const scoreEmoji = score >= 90 ? '🟢' : score >= 75 ? '🟡' : score >= 50 ? '🟠' : '🔴';

          const contentMap: Record<string, string> = {
            pog: `**📋 Planogram Compliance — Store #${storeNum} (${storeName})**\n\nCurrent Score: ${scoreEmoji} **${score}%** (${scoreLabel})\n\nI've loaded the planogram compliance data for this store. Here's what I found:\n\n**Key Findings:**\n- ${score < 75 ? 'Shelf facings deviate significantly from authorized planogram layout' : 'Most shelf sections align with planogram specifications'}\n- ${score < 60 ? 'Promotional endcap not set up per current cycle guidelines' : 'Promotional displays are mostly compliant'}\n- ${score < 50 ? 'Category flow disruptions detected in multiple aisles' : 'Category adjacency rules are being followed'}\n\n**Recommended Actions:**\n1. ${score < 75 ? 'Schedule immediate planogram reset for non-compliant sections' : 'Maintain current planogram adherence'}\n2. Upload a shelf photo for real-time compliance check\n3. Review specific aisle compliance breakdown`,
            knowledge: `**📖 ${dimension} Guidelines — Store #${storeNum} (${storeName})**\n\nCurrent Score: ${scoreEmoji} **${score}%** (${scoreLabel})\n\nI've loaded the relevant SOPs and guidelines for ${dimension.toLowerCase()} compliance.\n\n**Applicable Standards:**\n- **SOP-${dimension.replace(/ /g, '')}-001**: ${dimension} audit checklist and procedures\n- **Policy Ref**: District 14 ${dimension.toLowerCase()} compliance standards v2.3\n- **Last Updated**: 2 weeks ago\n\n**Key Gaps vs. Standards:**\n- ${score < 75 ? `Store is ${100 - score}% below target compliance for ${dimension.toLowerCase()}` : `Store meets most ${dimension.toLowerCase()} standards`}\n- ${score < 60 ? 'Multiple policy violations detected during last audit' : 'Minor deviations noted in last audit cycle'}\n\nAsk me about specific ${dimension.toLowerCase()} procedures, escalation protocols, or corrective action guidelines.`,
            actions: `**⚡ ${dimension} Action Plan — Store #${storeNum} (${storeName})**\n\nCurrent Score: ${scoreEmoji} **${score}%** (${scoreLabel})\n\nBased on the audit findings, here are the recommended actions:\n\n**Priority Actions:**\n${score < 50 ? `\n🔴 **CRITICAL — Immediate Intervention Required**\n1. Deploy ${dimension.toLowerCase()} correction team within 24 hours\n2. Escalate to Area Manager for oversight\n3. Schedule re-audit within 48 hours\n4. Document all corrective actions taken` : score < 75 ? `\n🟠 **HIGH — Action Required This Week**\n1. Review ${dimension.toLowerCase()} audit findings with store manager\n2. Create corrective action checklist\n3. Assign specific tasks to department leads\n4. Schedule follow-up audit in 5 days` : `\n🟢 **MAINTENANCE — Continue Monitoring**\n1. Acknowledge positive performance in ${dimension.toLowerCase()}\n2. Share best practices with underperforming stores\n3. Maintain current operational routines`}\n\nWould you like me to create tasks for the store manager or generate a detailed action plan?`,
            analytics: `**📊 ${dimension} Analytics — Store #${storeNum} (${storeName})**\n\nCurrent Score: ${scoreEmoji} **${score}%** (${scoreLabel})\n\n**Trend Analysis (12 weeks):**\n- Current: **${score}%** ${score < 75 ? '📉 Declining' : score < 90 ? '➡️ Stable' : '📈 Improving'}\n- District Avg: **79%**\n- ${score >= 79 ? `Store is **${score - 79}pts above** district average` : `Store is **${79 - score}pts below** district average`}\n\n**Benchmark Comparison:**\n- Best in District: **98%** (Downtown Plaza #2034)\n- Worst in District: **${Math.min(score, 28)}%** (Maple Heights #9012)\n- This Store Rank: **${score >= 90 ? 'Top 25%' : score >= 75 ? 'Mid 50%' : score >= 50 ? 'Bottom 25%' : 'Bottom 10%'}**\n\n**Key Metrics:**\n- Audit frequency: Weekly\n- Consecutive ${score >= 75 ? 'pass' : 'miss'} streak: ${score >= 75 ? Math.floor(score / 20) : Math.floor((100 - score) / 25)} weeks\n- Correlation with DPI: ${score >= 75 ? 'Positive' : 'Negative'} impact\n\nWould you like a deeper drill-down on specific sub-categories or week-over-week trends?`,
          };

          const suggestedMap: Record<string, string[]> = {
            pog: ['Check shelf compliance for Aisle 3', 'Upload shelf photo', `Compare with best store`, 'View planogram reset schedule'],
            knowledge: [`Show ${dimension} SOP`, `Escalation protocol for ${dimension.toLowerCase()}`, 'Corrective action guidelines', 'Audit checklist'],
            actions: [`Create action plan for store #${storeNum}`, 'Assign tasks to store manager', `Schedule re-audit`, 'Escalate to Area Manager'],
            analytics: [`Show ${dimension.toLowerCase()} trend chart`, `Compare store #${storeNum} vs district`, 'Week-over-week breakdown', 'Correlation analysis'],
          };

          const auditMsg: ChatMessage = {
            id: msgId,
            role: 'assistant',
            content: contentMap[skill] || contentMap['analytics'],
            timestamp: new Date(),
            skill: skill,
            suggestedQueries: suggestedMap[skill] || suggestedMap['analytics'],
          };

          setMessages(prev => {
            if (prev[skill].some(m => m.id === msgId)) return prev;
            return { ...prev, [skill]: [...prev[skill], auditMsg] };
          });
        }, 2200);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const addMessage = (msg: ChatMessage) => {
    const sk = msg.skill;
    setMessages(prev => ({
      ...prev,
      [sk]: [...prev[sk], msg],
    }));
  };

  const generateId = () => `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  const simulateResponse = async (userQuery: string) => {
    const skill = activeSkillRef.current;
    setIsProcessing(true);

    // Build skill-specific agentic processing steps
    const stepsBySkill: Record<'knowledge' | 'analytics', ProcessingStep[]> = {
      knowledge: [
        { step: 'Parsing your question…', status: 'active' },
        { step: 'Searching SOPs & policy knowledge base…', status: 'pending' },
        { step: 'Retrieving top-ranked source documents…', status: 'pending' },
        { step: 'Synthesizing cited answer…', status: 'pending' },
      ],
      analytics: [
        { step: 'Parsing your question…', status: 'active' },
        { step: 'Querying district metrics warehouse…', status: 'pending' },
        { step: 'Running trend & benchmark analysis…', status: 'pending' },
        { step: 'Generating KPI cards and charts…', status: 'pending' },
      ],
    };
    const steps = stepsBySkill[skill as 'knowledge' | 'analytics'];

    // Add processing message
    const processingId = generateId();
    const processingMsg: ChatMessage = {
      id: processingId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      skill,
      isProcessing: true,
      processingSteps: [...steps],
    };
    setMessages(prev => ({
      ...prev,
      [skill]: [...prev[skill], processingMsg],
    }));

    // Animate steps — slow for impressive demo feel
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 600));
      setMessages(prev => ({
        ...prev,
        [skill]: prev[skill].map(m =>
          m.id === processingId ? {
            ...m,
            processingSteps: m.processingSteps?.map((s, idx) => ({
              ...s,
              status: idx <= i ? 'completed' as const : idx === i + 1 ? 'active' as const : 'pending' as const,
            })),
          } : m
        ),
      }));
    }

    // Pause after all steps, then show final response
    await new Promise(resolve => setTimeout(resolve, 1200));
    const randConfidence = () => Math.round(86 + Math.random() * 11); // 86-97

    // ── Helpers: enrich sources with tag + last-updated; build confidence breakdown; split follow-ups into Learn/Take ──
    const tagForSource = (
      src: { doc: string; section: string; page: string },
      idx: number,
    ): 'primary' | 'supporting' | 'regulatory' => {
      const blob = `${src.doc} ${src.section} ${src.page}`.toLowerCase();
      if (/osha|fda|cfr|federal|regulatory|compliance reference|industry guidance/.test(blob)) return 'regulatory';
      if (idx === 0) return 'primary';
      return 'supporting';
    };
    const updatedForSource = (idx: number) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const now = new Date();
      const offset = idx * 4 + Math.floor(Math.random() * 6);
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset);
      return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    };
    const enrichSources = (
      sources?: { doc: string; section: string; page: string }[],
    ) => sources?.map((s, i) => ({ ...s, tag: tagForSource(s, i), updated: updatedForSource(i) }));
    const buildBreakdown = (conf: number, sources?: unknown[]) => ({
      sourceContribution: Math.min(100, Math.round((sources?.length || 1) * 22 + conf / 5)),
      coverage: Math.max(60, Math.min(99, conf - 4 + Math.floor(Math.random() * 6))),
      lastUpdated: updatedForSource(0),
    });
    const ACTION_VERBS = /^(create|schedule|notify|generate|audit|push|assign|send|escalate|file|open|trigger|run|launch|draft|publish|export|email)\b/i;
    const splitNextActions = (followUps?: string[]) => {
      if (!followUps || followUps.length === 0) return undefined;
      const learnMore: string[] = [];
      const takeAction: string[] = [];
      followUps.forEach(q => (ACTION_VERBS.test(q.trim()) ? takeAction : learnMore).push(q));
      // Synthesize at least one Take action item from a knowledge query
      if (takeAction.length === 0 && learnMore.length > 0) {
        const first = learnMore[0];
        takeAction.push(`Create a task to address: ${first.replace(/\?$/, '').replace(/^(what|how|why|when|where)\s+/i, '')}`);
      }
      return { learnMore, takeAction };
    };

    setMessages(prev => {
      const filtered = prev[skill].filter(m => m.id !== processingId);
      let response: ChatMessage;

      if (skill === 'knowledge') {
        const result = findKnowledgeResponse(userQuery);
        const conf = randConfidence();
        const enrichedSources = enrichSources(result.sources);
        response = {
          id: generateId(),
          role: 'assistant',
          content: result.answer,
          timestamp: new Date(),
          skill: 'knowledge',
          sources: enrichedSources,
          followUpQuestions: result.followUpQuestions,
          nextActions: splitNextActions(result.followUpQuestions),
          confidence: conf,
          confidenceBreakdown: buildBreakdown(conf, enrichedSources),
        };
      } else if (skill === 'analytics') {
        const result = findAnalyticsResponse(userQuery);
        const conf = randConfidence();
        response = {
          id: generateId(),
          role: 'assistant',
          content: result.answer,
          timestamp: new Date(),
          skill: 'analytics',
          kpiCards: result.kpiCards,
          chartData: result.chartData,
          followUpQuestions: result.followUpQuestions,
          nextActions: splitNextActions(result.followUpQuestions),
          confidence: conf,
          confidenceBreakdown: buildBreakdown(conf, result.kpiCards),
        };
      } else if (skill === 'pog') {
        response = { id: generateId(), role: 'assistant', content: '', timestamp: new Date(), skill: 'pog' };
      } else {
        response = { id: generateId(), role: 'assistant', content: '', timestamp: new Date(), skill: 'actions' };
      }

      return { ...prev, [skill]: [...filtered, response] };
    });

    setIsProcessing(false);
  };

  // Agentic flow for regular Actions skill user queries
  const simulateActionAgentic = (userQuery: string) => {
    setIsProcessing(true);
    const q = userQuery.toLowerCase();

    // ── Role-based planogram task guards ────────────────────────────────────
    const isPlanogramQuery = q.includes('planogram') || q.includes('pog rule') || q.includes('pog reset');
    const isLocalizationQuery = q.includes('locali');

    if (role === 'SM' && isPlanogramQuery) {
      const blockedMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: '⚠️ **Access Restricted** — Planogram task creation is not available to Store Managers.\n\nPlanogram-related tasks (rule creation, resets, and compliance actions) are managed by District Managers and HQ. If you have a store-level concern, please reach out to your District Manager or raise it via the Operations Queue.',
        timestamp: new Date(),
        skill: 'actions',
      };
      setMessages(prev => ({ ...prev, actions: [...prev.actions, blockedMsg] }));
      setIsProcessing(false);
      return;
    }

    if (role === 'DM' && isPlanogramQuery && !isLocalizationQuery) {
      const restrictedMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: '⚠️ **Limited Access** — As a District Manager you can create Planogram tasks only when they relate to **Planogram Localization**.\n\nOther planogram task types (master resets, rule creation for brand blocking, price tier adjacency, etc.) are managed by HQ. To create a localization task, try: _"Create a localization task for Women\'s Wall planogram"_.',
        timestamp: new Date(),
        skill: 'actions',
      };
      setMessages(prev => ({ ...prev, actions: [...prev.actions, restrictedMsg] }));
      setIsProcessing(false);
      return;
    }
    // ── end guards ──────────────────────────────────────────────────────────

    // POG Rule creation flow
    if (q.includes('planogram rule') || q.includes('pog rule')) {
      const ruleNameMatch = q.match(/(?:for|about|on)\s+(.+?)(?:\s+rule)?$/i);
      const ruleName = ruleNameMatch
        ? ruleNameMatch[1].replace(/\b\w/g, l => l.toUpperCase())
        : 'Custom Planogram Rule';

      const ruleType = q.includes('color') ? 'Visual'
        : q.includes('size') || q.includes('fit') ? 'Product Fit & Placement'
        : q.includes('price') ? 'Price Tier'
        : q.includes('season') ? 'Compliance'
        : q.includes('adjacency') || q.includes('adjacent') ? 'Adjacency'
        : q.includes('facing') ? 'Facing'
        : q.includes('brand') ? 'Brand Blocking'
        : 'Visual';

      const ruleSteps: ProcessingStep[] = [
        { step: 'Parsing rule definition...', status: 'active' },
        { step: 'Identifying rule type and category...', status: 'pending' },
        { step: 'Validating against existing POG rules...', status: 'pending' },
        { step: 'Generating rule configuration...', status: 'pending' },
      ];

      const ruleCategory = q.includes('apparel') ? 'Apparel'
        : q.includes('denim') ? 'Denim'
        : q.includes('electronics') ? 'Electronics'
        : q.includes('women') ? "Women's"
        : q.includes('men') ? "Men's"
        : q.includes('accessori') ? 'Accessories'
        : 'Apparel';

      const finalMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: 'Planogram rule created successfully. You can review the details below and send it to the POG Localization Engine.',
        timestamp: new Date(),
        skill: 'actions',
        pogRuleCreated: {
          name: ruleName,
          type: ruleType,
          description: `${ruleName} — automatically generated from natural language input. Applies ${ruleType.toLowerCase()} constraints to planogram layouts.`,
          status: 'Active',
          category: ruleCategory,
        },
        followUpQuestions: ['Create another planogram rule', 'Send to POG Localization Engine', 'Schedule a planogram reset'],
        nextActions: {
          learnMore: ['What planogram rules are currently active?', 'How does the POG Localization Engine apply rules?'],
          takeAction: ['Send this rule to the POG Localization Engine', 'Schedule a planogram reset for next week'],
        },
      };

      runAgenticActionFlow(`proc-${Date.now()}`, ruleSteps, finalMsg);
      return;
    }

    const taskTitle = userQuery.replace(/^(create|assign|schedule)\s+(a\s+)?/i, '').replace(/\s+task\s+/i, ' ');
    const actionSteps: ProcessingStep[] = [
      { step: 'Parsing task request...', status: 'active' },
      { step: 'Identifying assignee and priority...', status: 'pending' },
      { step: 'Validating against Operations Queue...', status: 'pending' },
      { step: 'Creating action item...', status: 'pending' },
    ];

    const finalMsg: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: 'Action item created successfully. You can assign it and push to the Operations Queue below.',
      timestamp: new Date(),
      skill: 'actions',
      taskCreated: {
        title: taskTitle.charAt(0).toUpperCase() + taskTitle.slice(1),
        assignee: '',
        priority: userQuery.toLowerCase().includes('urgent') || userQuery.toLowerCase().includes('fire') ? 'Critical' : 'Medium',
        due: userQuery.toLowerCase().includes('monday') ? 'Next Monday' : userQuery.toLowerCase().includes('today') ? 'Today' : 'Tomorrow',
      },
      followUpQuestions: ['Create another task', 'View all active tasks', 'Add a due date reminder'],
      nextActions: {
        learnMore: ['What tasks are currently in the Operations Queue?', 'What is the SLA for this priority level?'],
        takeAction: ['Push task to Operations Queue', 'Create a follow-up audit task', 'Assign to team member'],
      },
    };

    runAgenticActionFlow(`proc-${Date.now()}`, actionSteps, finalMsg);
  };

  const simulatePogAgentic = async (userQuery: string, userImage?: string) => {
    setIsProcessing(true);
    const q = userQuery.toLowerCase();
    const isOos = q.includes('oos') || q.includes('out of stock') || q.includes('detect oos');

    // Define processing steps based on type
    const steps: ProcessingStep[] = isOos ? [
      { step: 'Receiving shelf image...', status: 'active' },
      { step: 'AI Agent reviewing image...', status: 'pending' },
      { step: 'Scanning for empty shelf positions...', status: 'pending' },
      { step: 'Cross-referencing with store planogram...', status: 'pending' },
      { step: 'Identifying out-of-stock products...', status: 'pending' },
      { step: 'Generating OOS detection report...', status: 'pending' },
    ] : [
      { step: 'Receiving store shelf capture...', status: 'active' },
      { step: 'Loading reference planogram (Accessories Endcap)...', status: 'pending' },
      { step: 'AI Vision analyzing product positions...', status: 'pending' },
      { step: 'Comparing facings and placement accuracy...', status: 'pending' },
      { step: 'Evaluating category adjacency rules...', status: 'pending' },
      { step: 'Checking price label alignment...', status: 'pending' },
      { step: 'Calculating compliance metrics...', status: 'pending' },
      { step: 'Generating audit report...', status: 'pending' },
    ];

    // Add processing message
    const processingId = generateId();
    const processingMsg: ChatMessage = {
      id: processingId,
      role: 'assistant',
      content: isOos ? 'Analyzing shelf for out-of-stock items...' : 'Running compliance audit...',
      timestamp: new Date(),
      skill: 'pog',
      isProcessing: true,
      processingSteps: [...steps],
    };
    setMessages(prev => ({ ...prev, pog: [...prev.pog, processingMsg] }));

    // Animate steps one by one — slow enough for the agent to feel deliberate
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1100 + Math.random() * 700));
      setMessages(prev => ({
        ...prev,
        pog: prev.pog.map(m =>
          m.id === processingId ? {
            ...m,
            processingSteps: m.processingSteps?.map((s, idx) => ({
              ...s,
              status: idx <= i ? 'completed' as const : idx === i + 1 ? 'active' as const : 'pending' as const,
            })),
          } : m
        ),
      }));
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    // ── Helpers (mirror Knowledge/Analytics enrichment) ──
    const updatedForSource = (idx: number) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const now = new Date();
      const offset = idx * 4 + Math.floor(Math.random() * 6);
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset);
      return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    };
    const tagFor = (
      src: { doc: string; section: string; page: string },
      idx: number,
    ): 'primary' | 'supporting' | 'regulatory' => {
      const blob = `${src.doc} ${src.section} ${src.page}`.toLowerCase();
      if (/osha|fda|cfr|federal|regulatory|compliance reference/.test(blob)) return 'regulatory';
      if (idx === 0) return 'primary';
      return 'supporting';
    };
    const enrichSources = (
      sources: { doc: string; section: string; page: string }[],
    ) => sources.map((s, i) => ({ ...s, tag: tagFor(s, i), updated: updatedForSource(i) }));
    const buildBreakdown = (conf: number, count: number) => ({
      sourceContribution: Math.min(100, Math.round(count * 22 + conf / 5)),
      coverage: Math.max(60, Math.min(99, conf - 4 + Math.floor(Math.random() * 6))),
      lastUpdated: updatedForSource(0),
    });
    const ACTION_VERBS = /^(create|schedule|notify|generate|audit|push|assign|send|escalate|file|open|trigger|run|launch|draft|publish|export|email|reposition|reinstall|realign|replace|submit|request|restock|reorder|reset)\b/i;
    const splitNextActions = (followUps: string[]) => {
      const learnMore: string[] = [];
      const takeAction: string[] = [];
      followUps.forEach(q => (ACTION_VERBS.test(q.trim()) ? takeAction : learnMore).push(q));
      return { learnMore, takeAction };
    };
    const conf = Math.round(86 + Math.random() * 11);

    // Remove processing message and add Knowledge/Analytics-style result
    if (isOos) {
      const oosSources = enrichSources([
        { doc: 'Replenishment SOP v3.4', section: 'Section 2.1 — OOS Detection & Recovery', page: 'Pages 9–12' },
        { doc: 'Backroom Inventory Procedures', section: 'Section 1.2 — On-Hand Reconciliation', page: 'Pages 4–6' },
        { doc: 'AI Vision OOS Reference', section: 'Detection Confidence Thresholds', page: 'Technical Reference' },
      ]);
      const oosFollowUps = [
        'Create replenishment task for these 4 positions',
        'Check backroom on-hand inventory for these SKUs',
        'Schedule end-of-day shelf restocking',
        'What is the OOS escalation protocol when backroom is empty?',
      ];
      const oosContent = [
        '## Out-of-Stock Detection Complete',
        '',
        'I analyzed the shelf capture and detected **4 out-of-stock positions** that need immediate replenishment.',
        '',
        '| # | Product | Section | Position |',
        '|---|---------|---------|----------|',
        '| 1 | **V-Neck Basic Tee — White (M)** | Section A | Rail 2, Position 3–4 |',
        '| 2 | **Floral Print Dress — Navy (S)** | Section B | Rail 1, Position 5–6 |',
        '| 3 | **Slim Fit Denim — Dark Wash (L)** | Section C | Rail 3, Position 1–2 |',
        '| 4 | **Classic Fit Blouse — Cream (M)** | Section A | Rail 1, Position 7–8 |',
        '',
        '### Recommended next steps',
        '- Pull on-hand units from the backroom for the 4 SKUs above',
        '- File a replenishment task and assign to the floor associate',
        '- Re-audit the endcap after restocking to confirm zero OOS',
      ].join('\n');

      const oosResult: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: oosContent,
        timestamp: new Date(),
        skill: 'pog',
        imageUrl: userImage || '/oos-case-1-detected.png',
        sources: oosSources,
        followUpQuestions: oosFollowUps,
        nextActions: splitNextActions(oosFollowUps),
        confidence: conf,
        confidenceBreakdown: buildBreakdown(conf, oosSources.length),
      };
      setMessages(prev => ({ ...prev, pog: [...prev.pog.filter(m => m.id !== processingId), oosResult] }));
    } else {
      const complianceSources = enrichSources([
        { doc: 'Planogram Compliance SOP v3.1', section: 'Section 3.1 — Audit Scoring & Tolerances', page: 'Pages 12–16' },
        { doc: 'Accessories Endcap — Localized v2.1', section: 'Reference Planogram', page: 'Page 1' },
        { doc: 'Visual Merchandising Standards', section: 'Section 1.4 — Implementation Timelines', page: 'Pages 5–8' },
        { doc: 'Category Management Guidelines', section: 'Section 2.3 — Adjacency & Eye-Level Rules', page: 'Page 22' },
      ]);
      const complianceFollowUps = [
        'How is the compliance score weighted across categories?',
        'What is the SLA for fixing critical deviations?',
        'Reposition sunglasses to eye-level per planogram',
        'Reinstall leather belt display on Hook Panel A',
        'Replace missing price labels in jewelry section',
        'Schedule a re-audit after corrections are complete',
      ];
      const auditDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      const complianceContent = [
        '## Compliance Audit — Grade C (76.4%)',
        '',
        `**Planogram:** Accessories Endcap — Localized v2.1  `,
        `**Store:** Downtown Plaza #2034 — Urban Flagship Cluster  `,
        `**Audit date:** ${auditDate}`,
        '',
        '### Category breakdown',
        '| Category | Score | Status |',
        '|----------|-------|--------|',
        '| Product Placement Accuracy | 18 / 25 | Warning |',
        '| Facing Count Compliance | 15 / 20 | Warning |',
        '| Category Adjacency | 20 / 20 | Pass |',
        '| Price Label Alignment | 12 / 15 | Warning |',
        '| Fixture & Signage | 11.4 / 20 | Fail |',
        '',
        '### Top deviations',
        '- **Leather Belt Display** — Missing from fixture (Hook Panel A). Estimated **$340/week** lost sales.',
        '- **Designer Sunglasses** — Off eye-level center, rotated 15°. Premium visibility down ~12%.',
        '- **Hair Accessories Rack** — 4 facings vs. required 6 (-33%). Pull from backroom.',
        '- **Silk Scarves Collection** — Shifted 2 positions right of planogram.',
        '- **Statement Jewelry** — 2 facings short of planogram.',
        '',
        '### Recommendations',
        '1. **IMMEDIATE** — Reinstall leather belt display on Hook Panel A.',
        '2. **HIGH** — Reposition sunglasses to center eye-level.',
        '3. **HIGH** — Add 2 facings to hair accessories rack.',
        '4. **MEDIUM** — Realign scarves section 2 positions left.',
        '5. **MEDIUM** — Replace 3 missing price labels in jewelry section.',
        '6. **LOW** — Submit maintenance ticket for LED strip on shelf 2.',
      ].join('\n');

      const complianceResult: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: complianceContent,
        timestamp: new Date(),
        skill: 'pog',
        imageUrl: userImage || '/compliance-usecase.png',
        sources: complianceSources,
        followUpQuestions: complianceFollowUps,
        nextActions: splitNextActions(complianceFollowUps),
        confidence: conf,
        confidenceBreakdown: buildBreakdown(conf, complianceSources.length),
      };
      setMessages(prev => ({ ...prev, pog: [...prev.pog.filter(m => m.id !== processingId), complianceResult] }));
    }

    setIsProcessing(false);
  };

  const handleSend = (overrideText?: string) => {
    const skill = activeSkillRef.current;
    const text = (overrideText ?? inputValue).trim();
    if (!text && !uploadedImage) return;
    if (isProcessing) return;

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: text || 'Audit this shelf image',
      timestamp: new Date(),
      skill,
      imageUrl: uploadedImage || undefined,
    };

    addMessage(userMsg);
    const currentImage = uploadedImage;
    setInputValue('');
    setUploadedImage(null);

    if (skill === 'pog') {
      simulatePogAgentic(text || 'audit shelf', currentImage || undefined);
    } else if (skill === 'actions') {
      simulateActionAgentic(text || 'create task');
    } else {
      simulateResponse(text || 'audit shelf');
    }
  };

  const openAlanDetailHandlerRef = useRef<(d: StorehubOpenAlanDetail) => void>(() => {});
  openAlanDetailHandlerRef.current = (detail: StorehubOpenAlanDetail) => {
    setIsChatBotOpen(true);
    if (detail.preset === 'district-gaps' || detail.preset === 'voc-messy-aisles') {
      const qs = new URLSearchParams();
      qs.set('mode', 'actions');
      qs.set('context', detail.preset === 'district-gaps' ? 'district-gaps' : 'voc-messy-aisles');
      qs.set('alan', String(Date.now()));
      navigate(
        { pathname: location.pathname, search: `?${qs.toString()}`, hash: location.hash || '' },
        { replace: true },
      );
      return;
    }
    if (detail.heatmapAudit) {
      const h = detail.heatmapAudit;
      const qs = new URLSearchParams();
      qs.set('mode', h.skill);
      qs.set('context', h.context);
      qs.set('store', h.storeNumber);
      qs.set('storeName', h.storeName);
      qs.set('score', String(h.score));
      qs.set('alan', String(Date.now()));
      navigate(
        { pathname: location.pathname, search: `?${qs.toString()}`, hash: location.hash || '' },
        { replace: true },
      );
      return;
    }
    if (detail.skill != null && detail.initialMessage != null) {
      flushSync(() => {
        setActiveSkill(detail.skill!);
      });
      if (detail.autoSend) {
        queueMicrotask(() => handleSend(detail.initialMessage!));
      } else {
        setInputValue(detail.initialMessage!);
      }
    }
  };

  useEffect(() => {
    const onOpenAlan = (e: Event) => {
      openAlanDetailHandlerRef.current((e as CustomEvent<StorehubOpenAlanDetail>).detail ?? {});
    };
    window.addEventListener(STOREHUB_OPEN_ALAN, onOpenAlan);
    return () => window.removeEventListener(STOREHUB_OPEN_ALAN, onOpenAlan);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (query: string) => {
    // For POG skill — "Detect OOS items" and "Check compliance" should trigger image upload first
    if (activeSkill === 'pog' && (query === 'Detect OOS items' || query === 'Check compliance')) {
      setPendingPogAction(query);
      fileInputRef.current?.click();
      return;
    }

    setInputValue(query);
    setTimeout(() => {
      const userMsg: ChatMessage = {
        id: generateId(),
        role: 'user',
        content: query,
        timestamp: new Date(),
        skill: activeSkill,
      };
      addMessage(userMsg);
      setInputValue('');
      if (activeSkill === 'actions') {
        simulateActionAgentic(query);
      } else if (activeSkill === 'pog') {
        simulatePogAgentic(query);
      } else {
        simulateResponse(query);
      }
    }, 100);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const imageData = ev.target?.result as string;

        // If there's a pending POG action, auto-send with the image
        if (pendingPogAction) {
          const action = pendingPogAction;
          setPendingPogAction(null);
          const userMsg: ChatMessage = {
            id: generateId(),
            role: 'user',
            content: action,
            timestamp: new Date(),
            skill: activeSkill,
            imageUrl: imageData,
          };
          addMessage(userMsg);
          simulatePogAgentic(action, imageData);
        } else {
          setUploadedImage(imageData);
        }
      };
      reader.readAsDataURL(file);
    }
    // Reset file input so same file can be re-selected
    e.target.value = '';
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getSkillLabel = (skill: SkillMode) => {
    const map: Record<SkillMode, string> = { knowledge: 'Searching knowledge base...', analytics: 'Analyzing performance data...', pog: 'Running planogram audit...', actions: 'Creating task...' };
    return map[skill];
  };

  const renderMessageContent = (msg: ChatMessage) => {
    if (msg.isTyping) {
      return (
        <div className="cop-thinking">
          <div className="cop-thinking-bar">
            <div className="cop-thinking-pulse" />
            <span>{getSkillLabel(msg.skill)}</span>
          </div>
          <div className="cop-typing-indicator">
            <span /><span /><span />
          </div>
        </div>
      );
    }

    // Agentic processing steps — tabbed card
    if (msg.isProcessing && msg.processingSteps) {
      const completedCount = msg.processingSteps.filter(s => s.status === 'completed').length;
      const activeStep = msg.processingSteps.find(s => s.status === 'active');
      return (
        <div className="cop-agentic-card">
          <div className="cop-agentic-planning">
            <AutoAwesomeOutlined sx={{ fontSize: 16 }} className="cop-agentic-planning-icon"/>
            <span>{activeStep ? activeStep.step.replace(/\.{3}$/, '') : 'Planning next moves'}.....</span>
            <KeyboardArrowDown sx={{ fontSize: 14 }}/>
          </div>
          <div className="cop-agentic-tabbed">
            <Tabs
              tabNames={[
                { value: 'steps', label: 'Steps', icon: <AssignmentOutlined sx={{ fontSize: 14 }}/> },
                { value: 'response', label: 'Agent Response', icon: <AutoAwesomeOutlined sx={{ fontSize: 14 }}/> },
              ]}
              tabPanels={[
                <div className="cop-agentic-tab-content">
                  <div className="cop-agentic-section">
                    <div className="cop-agentic-section-header">
                      <KeyboardArrowRight sx={{ fontSize: 16 }}/>
                      <span>Processing Request</span>
                      <span className="cop-agentic-step-count">{completedCount}/{msg.processingSteps.length}</span>
                    </div>
                    <div className="cop-agentic-step-list">
                      {msg.processingSteps.map((step, idx) => (
                        <div key={idx} className={`cop-agentic-step cop-agentic-step--${step.status}`}>
                          <div className="cop-agentic-step-icon">
                            {step.status === 'completed' && <CheckCircleOutlined sx={{ fontSize: 16 }} className="cop-agentic-check"/>}
                            {step.status === 'active' && <div className="cop-agentic-spinner" />}
                            {step.status === 'pending' && <div className="cop-agentic-pending-dot" />}
                          </div>
                          <div className="cop-agentic-step-content">
                            <span className={`cop-agentic-step-title ${step.status === 'active' ? 'active' : ''}`}>{step.step}</span>
                            {step.status === 'active' && (
                              <span className="cop-agentic-step-desc">AI is processing this step...</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>,
                <div className="cop-agentic-tab-content">
                  <div className="cop-agentic-section">
                    <div className="cop-agentic-section-header">
                      <AutoAwesomeOutlined sx={{ fontSize: 16 }}/>
                      <span>Agent Response</span>
                    </div>
                    <p className="cop-agentic-step-desc">Agent response will appear here once processing completes.</p>
                  </div>
                </div>,
              ]}
              value={copilotTab}
              onChange={(_, val) => setCopilotTab(val as 'steps' | 'response')}
            />
          </div>
        </div>
      );
    }

    return (
      <>
        {msg.content && (
          <div className="cop-msg-text" dangerouslySetInnerHTML={{
            __html: (() => {
              let text = msg.content;
              // Replace medal/rank emojis with text before general emoji strip
              text = text.replace(/🥇/g, '#1').replace(/🥈/g, '#2').replace(/🥉/g, '#3');
              // Strip remaining emoji characters for clean professional output (preserve newlines)
              text = text.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1FA00}-\u{1FAFF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu, '').replace(/ {2,}/g, ' ');
              // Hide "Recommended Actions:" section once task is pushed
              if (msg.taskCreated && taskPushed.has(msg.id)) {
                text = text.split(/\*\*Recommended Actions:\*\*/)[0].trimEnd();
              }
              // Markdown-to-HTML conversion
              const lines = text.split('\n');
              const htmlParts: string[] = [];
              let inTable = false;
              let tableRows: string[] = [];

              const fmtCell = (c: string) => c.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/`(.*?)`/g, '<code class="cop-md-code">$1</code>');
              const isSeparatorRow = (row: string) => /^\|[\s\-:|]+\|$/.test(row);
              const flushTable = () => {
                if (tableRows.length < 2) { htmlParts.push(...tableRows.map(r => `<p class="cop-md-p">${fmtCell(r)}</p>`)); tableRows = []; inTable = false; return; }
                // Find the separator row (usually row index 1)
                let sepIdx = tableRows.findIndex(r => isSeparatorRow(r));
                if (sepIdx < 0) sepIdx = 1; // fallback
                const headerCells = tableRows[sepIdx > 0 ? 0 : 0].split('|').map(c => c.trim()).filter(Boolean);
                const dataRows = tableRows.filter((_, idx) => idx !== 0 && idx !== sepIdx);
                let t = '<div class="cop-md-table-wrap wow-table-wrap"><table class="cop-md-table wow-table"><thead><tr>';
                headerCells.forEach(c => { t += `<th>${fmtCell(c)}</th>`; });
                t += '</tr></thead><tbody>';
                dataRows.forEach(row => {
                  const cells = row.split('|').map(c => c.trim()).filter(Boolean);
                  t += '<tr>';
                  // Pad or trim cells to match header count
                  for (let ci = 0; ci < headerCells.length; ci++) {
                    t += `<td>${ci < cells.length ? fmtCell(cells[ci]) : ''}</td>`;
                  }
                  t += '</tr>';
                });
                t += '</tbody></table></div>';
                htmlParts.push(t);
                tableRows = [];
                inTable = false;
              };

              for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const trimmed = line.trim();

                // Detect table rows (lines containing pipes)
                if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
                  if (!inTable) inTable = true;
                  tableRows.push(trimmed);
                  continue;
                } else if (inTable) {
                  flushTable();
                }

                // Horizontal rule
                if (/^-{3,}$/.test(trimmed) || /^\*{3,}$/.test(trimmed)) {
                  htmlParts.push('<hr class="cop-md-hr" />');
                  continue;
                }
                // H2
                if (trimmed.startsWith('## ')) {
                  htmlParts.push(`<h2 class="cop-md-h2">${trimmed.slice(3).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</h2>`);
                  continue;
                }
                // H3
                if (trimmed.startsWith('### ')) {
                  htmlParts.push(`<h3 class="cop-md-h3">${trimmed.slice(4).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</h3>`);
                  continue;
                }
                // Blockquote
                if (trimmed.startsWith('> ')) {
                  htmlParts.push(`<blockquote class="cop-md-bq">${trimmed.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</blockquote>`);
                  continue;
                }
                // Unordered list
                if (/^[-•] /.test(trimmed)) {
                  htmlParts.push(`<div class="cop-md-li">• ${trimmed.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</div>`);
                  continue;
                }
                // Ordered list
                if (/^\d+\.\s/.test(trimmed)) {
                  const match = trimmed.match(/^(\d+)\.\s(.*)/);
                  if (match) {
                    htmlParts.push(`<div class="cop-md-li"><span class="cop-md-li-num">${match[1]}.</span> ${match[2].replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</div>`);
                    continue;
                  }
                }
                // Empty line
                if (trimmed === '') {
                  htmlParts.push('<div class="cop-md-spacer"></div>');
                  continue;
                }
                // Regular text with bold
                htmlParts.push(`<p class="cop-md-p">${trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/`(.*?)`/g, '<code class="cop-md-code">$1</code>')}</p>`);
              }
              if (inTable) flushTable();
              return htmlParts.join('');
            })()
          }} />
        )}

        {msg.imageUrl && (
          <div className="cop-msg-image">
            <img src={msg.imageUrl} alt="Uploaded" />
          </div>
        )}

        {/* Knowledge Sources — single-line inline link, opens right-side panel */}
        {msg.sources && msg.sources.length > 0 && (
          <div className="cop-sources-inline">
            <MenuBookOutlined sx={{ fontSize: 12 }} className="cop-sources-inline-icon"/>
            <span className="cop-sources-inline-summary">
              Based on {msg.sources.length} source{msg.sources.length === 1 ? '' : 's'}: {msg.sources.slice(0, 2).map(s => s.doc).join(' · ')}
              {msg.sources.length > 2 && ` · +${msg.sources.length - 2} more`}
            </span>
            <Button variant="text" color="primary" size="small" className="cop-sources-inline-link" onClick={() => setSourcesPanelMsgId(msg.id)}>
              View sources
            </Button>
          </div>
        )}

        {/* Analytics KPI Cards */}
        {msg.kpiCards && msg.kpiCards.length > 0 && (
          <div className="cop-kpi-grid">
            {msg.kpiCards.map((kpi, i) => (
              <Card
                key={i}
                className={`cop-kpi--${kpi.direction}`}
                sx={{
                  maxWidth: '100%',
                  minHeight: 'unset',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid var(--ia-color-border)',
                  background: 'var(--ia-color-surface)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' },
                }}
              >
                <span className="cop-kpi-label">{kpi.label}</span>
                <span className="cop-kpi-value">{kpi.value}</span>
                <span className={`cop-kpi-delta cop-kpi-delta--${kpi.direction}`}>
                  {kpi.direction === 'up' ? <TrendingUpOutlined sx={{ fontSize: 12 }}/> : <TrendingDownOutlined sx={{ fontSize: 12 }}/>}
                  {kpi.delta}
                </span>
              </Card>
            ))}
          </div>
        )}

        {/* Analytics Charts */}
        {msg.chartData && msg.chartData.length > 0 && (
          <div className="cop-charts-grid">
            {msg.chartData.map((chart, ci) => {
              const maxVal = Math.max(...chart.values, ...(chart.secondaryValues || []));
              const W = 320;
              const H = 160;
              const pad = { top: 10, right: 12, bottom: 28, left: 8 };
              const cw = W - pad.left - pad.right;
              const ch = H - pad.top - pad.bottom;
              const color = chart.color || 'var(--ia-color-primary)';

              return (
                <Card key={ci} size="extraSmall" sx={{ maxWidth: '100%', minHeight: 0, padding: '10px 12px 6px' }}>
                  <div className="cop-chart-title">{chart.title}</div>
                  <svg viewBox={`0 0 ${W} ${H}`} className="cop-chart-svg">
                    {/* Grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((f, gi) => (
                      <line key={gi} x1={pad.left} y1={pad.top + ch * (1 - f)} x2={W - pad.right} y2={pad.top + ch * (1 - f)} stroke="#f1f5f9" strokeWidth="0.5" />
                    ))}

                    {chart.type === 'bar' && chart.values.map((v, i) => {
                      const barW = cw / chart.values.length * 0.6;
                      const gap = cw / chart.values.length;
                      const x = pad.left + gap * i + (gap - barW) / 2;
                      const barH = (v / maxVal) * ch;
                      const y = pad.top + ch - barH;
                      const barColor = v >= maxVal * 0.8 ? color : v >= maxVal * 0.5 ? color + 'bb' : color + '77';
                      return (
                        <g key={i}>
                          <rect x={x} y={y} width={barW} height={barH} rx={2} fill={barColor} />
                          <text x={x + barW / 2} y={y - 3} textAnchor="middle" fontSize="7" fill="#64748b" fontWeight="600">{v}</text>
                          <text x={x + barW / 2} y={H - 4} textAnchor="middle" fontSize="6.5" fill="#94a3b8">{chart.labels[i]}</text>
                        </g>
                      );
                    })}

                    {chart.type === 'line' && (() => {
                      const points = chart.values.map((v, i) => {
                        const x = pad.left + (cw / (chart.values.length - 1)) * i;
                        const y = pad.top + ch - (v / maxVal) * ch;
                        return { x, y, v };
                      });
                      const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
                      const areaPath = linePath + ` L${points[points.length - 1].x},${pad.top + ch} L${points[0].x},${pad.top + ch} Z`;
                      return (
                        <g>
                          <path d={areaPath} fill={color} opacity="0.08" />
                          <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          {chart.secondaryValues && (() => {
                            const secPoints = chart.secondaryValues.map((v, i) => {
                              const x = pad.left + (cw / (chart.secondaryValues!.length - 1)) * i;
                              const y = pad.top + ch - (v / maxVal) * ch;
                              return { x, y };
                            });
                            const secPath = secPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
                            return (
                              <>
                                <path d={secPath} fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 3" />
                                <text x={W - pad.right} y={secPoints[secPoints.length - 1].y - 4} textAnchor="end" fontSize="6.5" fill="#94a3b8">{chart.secondaryLabel}</text>
                              </>
                            );
                          })()}
                          {points.map((p, i) => (
                            <g key={i}>
                              <circle cx={p.x} cy={p.y} r="3" fill="#fff" stroke={color} strokeWidth="1.5" />
                              <text x={p.x} y={p.y - 7} textAnchor="middle" fontSize="7" fill="#475569" fontWeight="600">{p.v}</text>
                              <text x={p.x} y={H - 4} textAnchor="middle" fontSize="6.5" fill="#94a3b8">{chart.labels[i]}</text>
                            </g>
                          ))}
                        </g>
                      );
                    })()}

                    {chart.type === 'horizontal-bar' && chart.values.map((v, i) => {
                      const rowH = ch / chart.values.length;
                      const barH = rowH * 0.55;
                      const y = pad.top + rowH * i + (rowH - barH) / 2;
                      const barW = (v / maxVal) * (cw * 0.6);
                      const labelX = pad.left;
                      const barX = pad.left + cw * 0.35;
                      const barColor = v >= 85 ? 'var(--ia-color-success)' : v >= 70 ? 'var(--ia-color-warning)' : 'var(--ia-color-error)';
                      return (
                        <g key={i}>
                          <text x={labelX} y={y + barH / 2 + 1} dominantBaseline="middle" fontSize="6.5" fill="#475569" fontWeight="500">{chart.labels[i]}</text>
                          <rect x={barX} y={y} width={barW} height={barH} rx={2} fill={barColor} opacity="0.85" />
                          <text x={barX + barW + 4} y={y + barH / 2 + 1} dominantBaseline="middle" fontSize="7" fill="#334155" fontWeight="700">{v}</text>
                        </g>
                      );
                    })}
                  </svg>
                </Card>
              );
            })}
          </div>
        )}

        {/* Answer Confidence — inline label with tooltip */}
        {msg.role === 'assistant' && typeof msg.confidence === 'number' && !msg.isProcessing && !msg.isTyping && (() => {
          const conf = msg.confidence;
          const level = conf >= 90 ? 'high' : conf >= 75 ? 'medium' : 'low';
          const levelLabel = level === 'high' ? 'High' : level === 'medium' ? 'Medium' : 'Low';
          const bd = msg.confidenceBreakdown;
          const tooltip = bd
            ? `Confidence reflects how well this answer is grounded in available sources.\nSource contribution: ${bd.sourceContribution}%\nCoverage: ${bd.coverage}%\nLast updated: ${bd.lastUpdated}`
            : `Confidence reflects how well this answer is grounded in available sources.`;
          return (
            <div className="cop-confidence-inline" title={tooltip}>
              <span className="cop-confidence-inline-label">Confidence:</span>
              <strong className={`cop-confidence-inline-value cop-confidence-inline-value--${level}`}>
                {levelLabel} ({conf}%)
              </strong>
            </div>
          );
        })()}

        {/* OOS Alert — ShelfIQ Style */}
        {msg.oosItems && msg.oosItems.length > 0 && (
          <div className="cop-oos-alert">
            <div className="cop-oos-header">
              <div className="cop-oos-badge">
                <span className="cop-oos-pulse" />
                Critical Alert
              </div>
              <span className="cop-oos-count">{msg.oosItems.length} Items Detected</span>
            </div>
            <h3 className="cop-oos-title">Out-of-Stock Detection Complete</h3>
            {msg.oosImage && (
              <div className="cop-oos-image">
                <img src={msg.oosImage} alt="Analyzed shelf" />
                <div className="cop-oos-image-overlay">
                  <VisibilityOutlined sx={{ fontSize: 20 }}/>
                  <span>Analyzed Image</span>
                </div>
              </div>
            )}
            <div className="cop-oos-items">
              {msg.oosItems.map((item, idx) => (
                <div key={idx} className="cop-oos-item">
                  <div className="cop-oos-item-num">{idx + 1}</div>
                  <div className="cop-oos-item-info">
                    <strong>{item.name}</strong>
                    <span>{item.shelf} • {item.position}</span>
                  </div>
                  <span className="cop-oos-item-badge">OOS</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* POG Planogram List — Executive WOW Report Style */}
        {msg.pogPlanogramList && msg.pogPlanogramList.length > 0 && (
          <div className="cop-pog-report">
            <div className="cop-pog-report-header">
              <div className="cop-pog-report-badge">
                <AssignmentOutlined sx={{ fontSize: 16 }}/>
                <span>District Planogram Catalog</span>
              </div>
              <span className="cop-pog-report-count">{msg.pogPlanogramList.length} Active Planograms</span>
            </div>
            <div className="cop-pog-report-summary">
              <div className="cop-pog-stat">
                <span className="cop-pog-stat-value">{msg.pogPlanogramList.filter(p => p.status === 'pass').length}</span>
                <span className="cop-pog-stat-label cop-pog-stat--pass">Compliant</span>
              </div>
              <div className="cop-pog-stat">
                <span className="cop-pog-stat-value">{msg.pogPlanogramList.filter(p => p.status === 'warning').length}</span>
                <span className="cop-pog-stat-label cop-pog-stat--warning">Needs Review</span>
              </div>
              <div className="cop-pog-stat">
                <span className="cop-pog-stat-value">{msg.pogPlanogramList.filter(p => p.status === 'fail').length}</span>
                <span className="cop-pog-stat-label cop-pog-stat--fail">Critical</span>
              </div>
              <div className="cop-pog-stat">
                <span className="cop-pog-stat-value">{Math.round(msg.pogPlanogramList.reduce((a, p) => a + p.score, 0) / msg.pogPlanogramList.length)}%</span>
                <span className="cop-pog-stat-label">Avg Score</span>
              </div>
            </div>
            <div className="cop-pog-list">
              {msg.pogPlanogramList.map((pog, idx) => (
                <div
                  key={idx}
                  className={`cop-pog-card cop-pog-card--${pog.status}`}
                  onClick={() => handleSuggestionClick(`Audit ${pog.name.split(' — ')[0]}`)}
                >
                  <div className="cop-pog-card-left">
                    <div className="cop-pog-card-rank">{idx + 1}</div>
                    <div className="cop-pog-card-info">
                      <span className="cop-pog-card-name">{pog.name}</span>
                      <span className="cop-pog-card-store">{pog.store} · Last audit: {pog.lastAudit}</span>
                    </div>
                  </div>
                  <div className="cop-pog-card-right">
                    <div className={`cop-pog-score-ring cop-pog-score--${pog.status}`}>
                      <span>{pog.score}%</span>
                    </div>
                    <span className={`cop-pog-status-badge cop-pog-badge--${pog.status}`}>
                      {pog.status === 'pass' ? 'Compliant' : pog.status === 'warning' ? 'Review' : 'Critical'}
                    </span>
                  </div>
                  <KeyboardArrowRight sx={{ fontSize: 14 }} className="cop-pog-card-arrow"/>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Compliance Audit Report — ShelfIQ Style */}
        {msg.complianceReport && (
          <div className="cop-audit-report">
            {/* Report Header */}
            <div className="cop-audit-header">
              <div className="cop-audit-header-top">
                <div className="cop-audit-badge">
                  <DescriptionOutlined sx={{ fontSize: 16 }}/>
                  <span>Compliance Audit Report</span>
                </div>
                <span className="cop-audit-date">{msg.complianceReport.auditDate}</span>
              </div>
              <h2 className="cop-audit-pog-name">{msg.complianceReport.planogramName}</h2>
              <p className="cop-audit-store">{msg.complianceReport.storeInfo}</p>
            </div>

            {/* Score Card */}
            <div className="cop-audit-score-card">
              <div className="cop-audit-score-main">
                <div className={`cop-audit-score-circle cop-grade-${msg.complianceReport.grade.toLowerCase()}`}>
                  <span className="cop-score-value">{msg.complianceReport.overallScore}</span>
                  <span className="cop-score-max">/100</span>
                </div>
                <div className="cop-audit-grade-info">
                  <span className={`cop-grade-badge cop-grade-${msg.complianceReport.grade.toLowerCase()}`}>
                    Grade {msg.complianceReport.grade}
                  </span>
                  <span className="cop-grade-label">
                    {msg.complianceReport.grade === 'A' ? 'Excellent' :
                     msg.complianceReport.grade === 'B' ? 'Good' :
                     msg.complianceReport.grade === 'C' ? 'Needs Improvement' :
                     msg.complianceReport.grade === 'D' ? 'Poor' : 'Critical'}
                  </span>
                </div>
              </div>
              <div className="cop-audit-score-breakdown">
                {msg.complianceReport.categories.map((cat, idx) => (
                  <div key={idx} className={`cop-category-bar-item cop-cat--${cat.status}`}>
                    <div className="cop-category-bar-info">
                      <span className="cop-category-bar-name">{cat.name}</span>
                      <span className="cop-category-bar-score">{cat.score}/{cat.maxScore}</span>
                    </div>
                    <div className="cop-category-bar">
                      <div className="cop-category-bar-fill" style={{ width: `${(cat.score / cat.maxScore) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Comparison */}
            <div className="cop-audit-comparison">
              <h3 className="cop-audit-section-title">
                <VisibilityOutlined sx={{ fontSize: 16 }}/>
                Visual Comparison
              </h3>
              <div className="cop-audit-comparison-grid">
                <div className="cop-audit-comparison-item">
                  <span className="cop-comparison-label">Reference Planogram</span>
                  <div className="cop-comparison-img-wrap">
                    <img src={msg.complianceReport.comparisonImages.expected} alt="Expected" />
                  </div>
                </div>
                <div className="cop-audit-comparison-arrow">
                  <KeyboardArrowRight sx={{ fontSize: 24 }}/>
                </div>
                <div className="cop-audit-comparison-item">
                  <span className="cop-comparison-label">Actual Store Capture</span>
                  <div className="cop-comparison-img-wrap">
                    <img src={msg.complianceReport.comparisonImages.actual} alt="Actual" />
                  </div>
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="cop-audit-categories">
              <h3 className="cop-audit-section-title">
                <BarChartOutlined sx={{ fontSize: 16 }}/>
                Category Breakdown
              </h3>
              <div className="cop-audit-categories-grid">
                {msg.complianceReport.categories.map((cat, idx) => (
                  <div key={idx} className={`cop-audit-cat-card cop-cat--${cat.status}`}>
                    <div className="cop-cat-card-header">
                      <span className="cop-cat-card-name">{cat.name}</span>
                      <span className={`cop-cat-status-badge cop-cat-status--${cat.status}`}>
                        {cat.status === 'pass' ? '✓ Pass' : cat.status === 'warning' ? '⚠ Warning' : '✗ Fail'}
                      </span>
                    </div>
                    <div className="cop-cat-card-score">
                      <span className="cop-cat-score-num">{cat.score}</span>
                      <span className="cop-cat-score-denom">/{cat.maxScore} pts</span>
                    </div>
                    <ul className="cop-cat-findings">
                      {cat.findings.map((f, fIdx) => (
                        <li key={fIdx}>{f}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Deviations Table */}
            <div className="cop-audit-deviations">
              <h3 className="cop-audit-section-title">
                <ErrorOutlined sx={{ fontSize: 16 }}/>
                Identified Deviations
              </h3>
              <div className="cop-audit-dev-table">
                <div className="cop-dev-table-header">
                  <span>Item</span>
                  <span>Expected</span>
                  <span>Actual</span>
                  <span>Impact</span>
                </div>
                {msg.complianceReport.deviations.map((dev, idx) => (
                  <div key={idx} className={`cop-dev-row cop-dev--${dev.severity}`}>
                    <div className="cop-dev-item-cell">
                      <span className={`cop-dev-severity cop-dev-sev--${dev.severity}`}>
                        {dev.severity === 'critical' ? <CloseOutlined sx={{ fontSize: 14 }}/> :
                         dev.severity === 'warning' ? <WarningAmberOutlined sx={{ fontSize: 14 }}/> :
                         <CheckCircleOutlined sx={{ fontSize: 14 }}/>}
                      </span>
                      <span>{dev.item}</span>
                    </div>
                    <div className="cop-dev-cell">{dev.expected}</div>
                    <div className="cop-dev-cell">{dev.actual}</div>
                    <div className="cop-dev-cell">{dev.impact}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="cop-audit-recs">
              <h3 className="cop-audit-section-title">
                <BuildOutlined sx={{ fontSize: 16 }}/>
                Recommended Actions
              </h3>
              <div className="cop-audit-recs-list">
                {msg.complianceReport.recommendations.map((rec, idx) => {
                  const priority = rec.startsWith('IMMEDIATE') ? 'critical' :
                                   rec.startsWith('HIGH') ? 'high' :
                                   rec.startsWith('MEDIUM') ? 'medium' : 'low';
                  return (
                    <div key={idx} className={`cop-audit-rec-item cop-rec--${priority}`}>
                      <span className="cop-rec-num">{idx + 1}</span>
                      <span className="cop-rec-text">{rec}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Action Item Card — Add to Operations Queue */}
        {msg.taskCreated && (
          <div className={`cop-outcome-card cop-task-card ${taskPushed.has(msg.id) ? 'cop-task-pushed' : ''}`}>
            <div className="cop-outcome-card__header cop-task-header">
              <AssignmentOutlined sx={{ fontSize: 15 }}/>
              <span>{taskPushed.has(msg.id) ? 'Added to Operations Queue' : 'Action Item Created'}</span>
              {taskPushed.has(msg.id) && <TaskAltOutlined sx={{ fontSize: 14 }} className="cop-task-check"/>}
            </div>
            <div className="cop-task-body cop-outcome-card__body">
              <div className="cop-task-row"><span className="cop-task-label">Title</span><span className="cop-task-value">{msg.taskCreated.title}</span></div>
              <div className="cop-task-row"><span className="cop-task-label">Due</span><span className="cop-task-value">{msg.taskCreated.due}</span></div>
              {!taskPushed.has(msg.id) && (
                <div className="cop-outcome-card__hint">Assign an owner and push to Operations Queue to track execution across StoreHub.</div>
              )}
              {msg.taskCreated.stores && msg.taskCreated.stores.length > 0 && (
                <div className="cop-task-stores">
                  <div className="cop-task-stores-label">
                    <StoreOutlined sx={{ fontSize: 11 }}/>
                    <span>{msg.taskCreated.stores.length} stores · auto-tagged to store manager</span>
                  </div>
                  <div className="cop-task-stores-list">
                    {msg.taskCreated.stores.map(s => (
                      <div key={s.name} className="cop-task-store-row">
                        <div className="cop-task-store-info">
                          <span className="cop-task-store-name">{s.name}</span>
                          <span className="cop-task-store-manager">{s.manager} · Store Manager</span>
                        </div>
                        {taskPushed.has(msg.id) && <TaskAltOutlined sx={{ fontSize: 13 }} className="cop-task-check"/>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {taskPushed.has(msg.id) && !msg.taskCreated.stores && (
                <>
                  <div className="cop-task-row"><span className="cop-task-label">Assigned To</span><span className="cop-task-value">{taskAssignee}</span></div>
                  <div className="cop-task-row"><span className="cop-task-label">Priority</span><span className={`cop-task-priority cop-pri--${taskPriority.toLowerCase()}`}>{taskPriority}</span></div>
                </>
              )}
              {taskPushed.has(msg.id) && msg.taskCreated.stores && (
                <div className="cop-task-row"><span className="cop-task-label">Priority</span><span className={`cop-task-priority cop-pri--${taskPriority.toLowerCase()}`}>{taskPriority}</span></div>
              )}
            </div>

            {/* Multi-store: one-click push, no dropdown */}
            {!taskPushed.has(msg.id) && msg.taskCreated.stores && msg.taskCreated.stores.length > 0 && (
              <Button
                className="cop-task-push-btn"
                fullWidth
                disabled={taskPushing === msg.id}
                isLoading={taskPushing === msg.id}
                onClick={() => {
                  setTaskPushing(msg.id);
                  setTaskPriority(msg.taskCreated?.priority || 'High');
                  setTimeout(() => {
                    setTaskPushed(prev => new Set(prev).add(msg.id));
                    setTaskPushing(null);
                  }, 1200);
                }}
                startIcon={taskPushing === msg.id ? undefined : <BoltOutlined sx={{ fontSize: 14 }}/>}
              >
                {taskPushing === msg.id
                  ? `Adding ${msg.taskCreated.stores.length} tasks…`
                  : `Add ${msg.taskCreated.stores.length} tasks to Operations Queue`}
              </Button>
            )}

            {/* Add to Operations Queue — inline panel (single-task) */}
            {!taskPushed.has(msg.id) && !msg.taskCreated.stores && (
              <>
                {taskPushOpen === msg.id ? (
                  <div className="cop-task-push-panel">
                    <div className="cop-task-push-field">
                      <label>Assign To</label>
                      <div className="cop-custom-dropdown" onClick={() => setAssigneeDropdownOpen(!assigneeDropdownOpen)}>
                        <div className={`cop-dropdown-trigger ${taskAssignee ? 'has-value' : ''}`}>
                          {taskAssignee ? (
                            <div className="cop-dropdown-selected">
                              <div className="cop-dropdown-avatar">{taskAssignee.split(' ').map(n => n[0]).join('')}</div>
                              <div className="cop-dropdown-selected-info">
                                <span className="cop-dropdown-name">{taskAssignee}</span>
                                <span className="cop-dropdown-role">
                                  {taskAssignee === 'Sarah Chen' ? 'Store Manager' :
                                   taskAssignee === 'John Martinez' ? 'Ops Lead' :
                                   taskAssignee === 'Emily Davis' ? 'Area Supervisor' : 'Floor Manager'}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="cop-dropdown-placeholder">Select team member...</span>
                          )}
                          <KeyboardArrowDown sx={{ fontSize: 14 }} className={`cop-dropdown-chevron ${assigneeDropdownOpen ? 'open' : ''}`}/>
                        </div>
                        {assigneeDropdownOpen && (
                          <div className="cop-dropdown-menu">
                            {[
                              { name: 'Sarah Chen', role: 'Store Manager', initials: 'SC' },
                              { name: 'John Martinez', role: 'Ops Lead', initials: 'JM' },
                              { name: 'Emily Davis', role: 'Area Supervisor', initials: 'ED' },
                              { name: 'James Wilson', role: 'Floor Manager', initials: 'JW' },
                            ].map(person => (
                              <div
                                key={person.name}
                                className={`cop-dropdown-option ${taskAssignee === person.name ? 'selected' : ''}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTaskAssignee(person.name);
                                  setAssigneeDropdownOpen(false);
                                }}
                              >
                                <div className="cop-dropdown-avatar">{person.initials}</div>
                                <div className="cop-dropdown-option-info">
                                  <span className="cop-dropdown-option-name">{person.name}</span>
                                  <span className="cop-dropdown-option-role">{person.role}</span>
                                </div>
                                {taskAssignee === person.name && <CheckCircleOutlined sx={{ fontSize: 14 }} className="cop-dropdown-check"/>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="cop-task-push-field">
                      <label>Priority</label>
                      <div className="cop-task-priority-pills">
                        {['Critical', 'High', 'Medium', 'Low'].map(p => (
                          <Button
                            key={p}
                            type="button"
                            variant={taskPriority === p ? 'contained' : 'outlined'}
                            color="primary"
                            size="small"
                            className={`cop-priority-pill cop-pri--${p.toLowerCase()} ${taskPriority === p ? 'active' : ''}`}
                            onClick={() => setTaskPriority(p)}
                          >
                            {p}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="cop-task-push-actions">
                      <Button
                        className="cop-task-push-confirm"
                        variant="contained"
                        color="primary"
                        disabled={!taskAssignee || taskPushing === msg.id}
                        isLoading={taskPushing === msg.id}
                        onClick={() => {
                          setTaskPushing(msg.id);
                          setAssigneeDropdownOpen(false);
                          setTimeout(() => {
                            setTaskPushed(prev => new Set(prev).add(msg.id));
                            setTaskPushOpen(null);
                            setTaskPushing(null);
                          }, 1200);
                        }}
                        startIcon={taskPushing === msg.id ? undefined : <SendOutlined sx={{ fontSize: 13 }}/>}
                      >
                        {taskPushing === msg.id ? 'Adding...' : 'Add to Operations Queue'}
                      </Button>
                      {taskPushing !== msg.id && (
                        <Button variant="outlined" color="inherit" className="cop-task-push-cancel" onClick={() => { setTaskPushOpen(null); setAssigneeDropdownOpen(false); }}>
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <Button
                    className="cop-task-push-btn"
                    fullWidth
                    onClick={() => {
                      setTaskPushOpen(msg.id);
                      setTaskAssignee('');
                      setTaskPriority(msg.taskCreated?.priority || 'High');
                      setAssigneeDropdownOpen(false);
                    }}
                    startIcon={<BoltOutlined sx={{ fontSize: 14 }}/>}
                  >
                    Add to Operations Queue
                  </Button>
                )}
              </>
            )}

            {taskPushed.has(msg.id) && (
              <div className="cop-task-pushed-banner">
                <TaskAltOutlined sx={{ fontSize: 14 }}/>
                <span>
                  {msg.taskCreated.stores && msg.taskCreated.stores.length > 0
                    ? `${msg.taskCreated.stores.length} tasks added to Operations Queue — assigned to ${msg.taskCreated.stores.map(s => s.manager).join(', ')}`
                    : `Added to Operations Queue — assigned to ${taskAssignee}`}
                </span>
              </div>
            )}
          </div>
        )}

        {/* POG Rule Created Card */}
        {msg.pogRuleCreated && (
          <div className={`cop-outcome-card cop-pog-rule-card ${pogRuleSent.has(msg.id) ? 'cop-pog-rule-sent' : ''}`}>
            <div className="cop-outcome-card__header cop-pog-rule-header">
              <DescriptionOutlined sx={{ fontSize: 15 }}/>
              <span>{pogRuleSent.has(msg.id) ? 'Rule Sent to POG Engine' : 'Planogram Rule Created'}</span>
              {pogRuleSent.has(msg.id) && <TaskAltOutlined sx={{ fontSize: 14 }} className="cop-task-check"/>}
            </div>
            <div className="cop-pog-rule-body cop-outcome-card__body">
              <div className="cop-task-row"><span className="cop-task-label">Rule Name</span><span className="cop-task-value">{msg.pogRuleCreated.name}</span></div>
              <div className="cop-task-row"><span className="cop-task-label">Type</span><span className="cop-task-value">{msg.pogRuleCreated.type}</span></div>
              <div className="cop-task-row"><span className="cop-task-label">Category</span><span className="cop-task-value">{msg.pogRuleCreated.category}</span></div>
              <div className="cop-task-row"><span className="cop-task-label">Status</span><span className={`cop-task-priority cop-pri--${msg.pogRuleCreated.status === 'Active' ? 'medium' : 'high'}`}>{msg.pogRuleCreated.status}</span></div>
              {msg.pogRuleCreated.description && (
                <div className="cop-outcome-card__hint cop-pog-rule-desc">{msg.pogRuleCreated.description}</div>
              )}
            </div>
            {!pogRuleSent.has(msg.id) ? (
              <Button
                className="cop-pog-rule-send-btn"
                fullWidth
                variant="contained"
                color="primary"
                onClick={() => {
                  setPogRuleSent(prev => new Set(prev).add(msg.id));
                  setTimeout(() => {
                    const params = new URLSearchParams({
                      newRuleName: msg.pogRuleCreated!.name,
                      newRuleType: msg.pogRuleCreated!.type,
                      newRuleCategory: msg.pogRuleCreated!.category,
                    });
                    navigate(`/planogram/rule-management?${params.toString()}`);
                  }, 1500);
                }}
                startIcon={<SendOutlined sx={{ fontSize: 13 }}/>}
                endIcon={<KeyboardArrowRight sx={{ fontSize: 14 }}/>}
              >
                Send to POG Rules
              </Button>
            ) : (
              <div className="cop-pog-rule-sent-banner">
                <TaskAltOutlined sx={{ fontSize: 14 }}/>
                <span>Sent to POG Localization Engine — redirecting...</span>
              </div>
            )}
          </div>
        )}

        {/* Follow-up questions — below outcome cards (task / planogram rule) so the created entity reads first */}
        {msg.nextActions && ((msg.nextActions.learnMore?.length || 0) + (msg.nextActions.takeAction?.length || 0)) > 0 && (() => {
          const all = [...(msg.nextActions.learnMore || []), ...(msg.nextActions.takeAction || [])];
          return (
            <div className={`cop-followups-inline ${msg.taskCreated || msg.pogRuleCreated ? 'cop-followups-inline--after-outcome' : ''}`}>
              <div className="cop-followups-inline-label">Follow-up questions</div>
              <ul className="cop-followups-inline-list">
                {all.map((q, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      className="cop-followup-prompt"
                      onClick={() => { setInputValue(''); handleSend(q); }}
                    >
                      {q}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })()}

        {/* Suggested Follow-ups — hidden once task is pushed to Operations Queue */}
        {msg.suggestedQueries && msg.suggestedQueries.length > 0
          && !(msg.taskCreated && taskPushed.has(msg.id))
          && !(msg.pogRuleCreated && pogRuleSent.has(msg.id))
          && !(((msg.nextActions?.learnMore?.length || 0) + (msg.nextActions?.takeAction?.length || 0)) > 0)
          && (
          <div className="cop-suggestions-inline">
            {msg.suggestedQueries.map((q, i) => (
              <Chips key={i} label={q} variant="outlined" size="small" className="cop-suggestion-chip" onClick={() => handleSuggestionClick(q)} />
            ))}
          </div>
        )}
      </>
    );
  };


  return (
    <div className="cop-container">
      {/* Initializing overlay — shown for 2s when navigating from deep-links */}
      {isInitializing && (
        <div className="cop-initializing-overlay">
          <div className="cop-init-content">
            <div className="cop-init-spinner" />
            <h3>Ask Alan</h3>
            <p>
              {initMode === 'pog' ? 'Initializing POG Audit Mode...'
                : initMode === 'actions' ? 'Initializing Action Mode...'
                : initMode === 'knowledge' ? 'Initializing Knowledge Mode...'
                : initMode === 'analytics' ? 'Initializing Analytics Mode...'
                : 'Initializing...'}
            </p>
            <div className="cop-init-steps">
              {(initStepLabels.length > 0 ? initStepLabels : [
                initMode === 'pog' ? 'Loading district planogram catalog' : 'Loading VoC theme context',
                initMode === 'pog' ? 'Connecting to AI Vision engine' : 'Connecting to analytics engine',
                initMode === 'pog' ? 'Preparing compliance audit workspace' : 'Connect to Ask Alan Action Engine',
              ]).map((label, idx) => (
                <div key={idx} className={`cop-init-step ${initStep >= idx + 1 ? 'active' : ''}`}>
                  <span className="cop-init-dot" />
                  <span>{label}</span>
                  {initStep >= idx + 1 && <span className="cop-init-check">✓</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Ask Alan — Impact UI ChatBotComponent as right-panel overlay */}
      <ChatBotComponent
        userName={user?.name ?? 'User'}
        isChatBotOpen={isChatBotOpen}
        setIsChatBotOpen={setIsChatBotOpen}
        onClose={() => {
          // Auto-save current thread when panel is closed
          if (currentMessages.length > 0) saveCurrentAndClear();
          setIsChatBotOpen(false);
        }}
        tabList={[]}
        isCustomScreen
        showSuggestionBanner={false}
        showHistoryPanel
        footerText=""
        isStopIcon={false}
        onSendIconClick={() => handleSend()}
        isAssistantThinking={isProcessing}
        historyPanelData={historyPanelData}
        activeConversationId={activeConversationId ?? undefined}
        onHistorySelectConversation={handleHistorySelect}
        onHistoryMenuAction={handleHistoryMenuAction}
        handleNewChatClick={() => {
          saveCurrentAndClear();
          return { isInitialClickPresent: false };
        }}
        customScreenJsx={
          <div className="cop-panel-inner">
            {/* Panel header — title + skill context + close */}
            <div className="cop-panel-header">
              <div className="cop-panel-header-left">
                <span className="cop-panel-title-icon" aria-hidden="true">
                  <AutoAwesomeOutlined sx={{ fontSize: 18 }} />
                </span>
                <span className="cop-panel-title-text">Ask Alan</span>
                <Badge
                  label={currentMessages.length > 0
                    ? `${currentMessages.length} msg${currentMessages.length === 1 ? '' : 's'}`
                    : 'Ready to chat'}
                  size="small"
                  color={currentMessages.length > 0 ? 'primary' : 'success'}
                />
              </div>
              <div className="cop-panel-header-right">
                <Button variant="text" color="inherit" size="small"
                  onClick={() => setMessages(prev => ({ ...prev, [activeSkill]: [] }))}
                  startIcon={<RefreshOutlined sx={{ fontSize: 14 }}/>}
                >Clear</Button>
                <button type="button" className="cop-panel-close-btn" aria-label="Close Ask Alan" onClick={() => {
                  if (currentMessages.length > 0) saveCurrentAndClear();
                  setIsChatBotOpen(false);
                }}>
                  <CloseOutlined sx={{ fontSize: 18 }}/>
                </button>
              </div>
            </div>
            <div className="cop-skill-row cop-skill-row--panel">
              {/* Premium skill cards — replaces plain Select dropdown */}
              <div className="cop-skill-cards">
                {visibleSkills.map(skill => (
                  <button
                    key={skill.id}
                    type="button"
                    className={`cop-skill-card${activeSkill === skill.id ? ' active' : ''}`}
                    onClick={() => setActiveSkill(skill.id)}
                    title={skill.description}
                  >
                    <span className="cop-skill-card-icon">{skill.icon}</span>
                    <span className="cop-skill-card-label">{skill.label}</span>
                  </button>
                ))}
              </div>
            </div>
            {/* Messages area — all existing render logic is 100% preserved */}
            <div className="cop-messages">
              {currentMessages.length === 0 ? (
                <div className="cop-panel-welcome">
                  {/* Hero: gradient star + personalised greeting */}
                  <div className="cop-panel-welcome-hero">
                    {/* Inline SVG gradient definition — referenced by fill="url(#cop-alan-grad)" */}
                    <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute', pointerEvents: 'none' }}>
                      <defs>
                        <linearGradient id="cop-alan-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%"   stopColor="#4259EE" />
                          <stop offset="50%"  stopColor="#7c5cb1" />
                          <stop offset="100%" stopColor="#ec7550" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="cop-panel-welcome-star">
                      <AutoAwesomeOutlined sx={{ fontSize: 52, fill: 'url(#cop-alan-grad)' }} />
                    </div>
                    <h2 className="cop-panel-welcome-greeting">
                      Good {timePeriod},{' '}
                      <span className="cop-panel-welcome-name">{greetingFirstName}!</span>
                      {' '}{timePeriod === 'Morning' ? '🌅' : timePeriod === 'Evening' ? '🌙' : '☀️'}
                    </h2>
                    <p className="cop-panel-welcome-sub">I am Alan, how can I help you today?</p>
                  </div>

                  {/* Suggestion cards */}
                  <div className="cop-panel-suggestions">
                    <p className="cop-panel-suggestions-label">Suggested questions</p>
                    {currentSkill.suggestions.map((q, i) => (
                      <button
                        key={i}
                        type="button"
                        className="cop-panel-suggestion-card"
                        onClick={() => handleSuggestionClick(q)}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                currentMessages.map(msg => (
                  <div key={msg.id} className={`cop-msg cop-msg--${msg.role}`}>
                    <div className="cop-msg-inner">
                      <div className="cop-msg-avatar">
                        {msg.role === 'user' ? <PersonOutlined sx={{ fontSize: 16 }}/> : <SmartToyOutlined sx={{ fontSize: 16 }}/>}
                      </div>
                      <div className="cop-msg-content">
                        <div className="cop-msg-meta">
                          <span className="cop-msg-sender">{msg.role === 'user' ? 'You' : 'Ask Alan'}</span>
                          <span className="cop-msg-time">{formatTime(msg.timestamp)}</span>
                          {msg.role === 'assistant' && !msg.isTyping && !msg.isProcessing && msg.content && (
                            <button
                              className={`aup-listen-btn cop-listen-btn${listeningMsgId === msg.id ? ' aup-listen-btn--active' : ''}`}
                              onClick={() => setListeningMsgId(id => id === msg.id ? null : msg.id)}
                              title="Listen to this response"
                            >
                              <span className="aup-listen-btn-icon">
                                {listeningMsgId === msg.id
                                  ? <span className="aup-soundwave aup-soundwave--sm"><span/><span/><span/><span/></span>
                                  : <HeadphonesOutlined sx={{ fontSize: 13 }} />
                                }
                              </span>
                              {listeningMsgId === msg.id ? 'Playing…' : 'Listen'}
                            </button>
                          )}
                        </div>
                        {renderMessageContent(msg)}
                        {listeningMsgId === msg.id && (
                          <div className="cop-audio-player-wrap">
                            <AudioPlayer
                              text={msg.content}
                              title="Ask Alan"
                              variant="card"
                              onClose={() => setListeningMsgId(null)}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>
          </div>
          }
          customInputComponent={
            /* Input area — POG upload, textarea, send button all unchanged */
            <div className="cop-input-area">
              <div className="cop-input-inner">
                {uploadedImage && (
                  <div className="cop-upload-preview">
                    <img src={uploadedImage} alt="Upload preview" />
                    <Button variant="text" color="inherit" size="small" className="cop-upload-remove" aria-label="Remove image" onClick={() => setUploadedImage(null)}>
                      <CloseOutlined sx={{ fontSize: 14 }}/>
                    </Button>
                  </div>
                )}
                <div className="cop-input-row">
                  {activeSkill === 'pog' && (
                    <>
                      <Button variant="outlined" color="primary" className="cop-upload-btn" aria-label="Upload image" onClick={() => fileInputRef.current?.click()}>
                        <FileUploadOutlined sx={{ fontSize: 18 }}/>
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleImageUpload}
                      />
                    </>
                  )}
                  <textarea
                    ref={inputRef}
                    className="cop-input"
                    placeholder={currentSkill.placeholder}
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    className={`cop-send-btn ${(inputValue.trim() || uploadedImage) && !isProcessing ? 'cop-send-btn--active' : ''}`}
                    onClick={() => handleSend()}
                    disabled={(!inputValue.trim() && !uploadedImage) || isProcessing}
                    aria-label="Send message"
                  >
                    <SendOutlined sx={{ fontSize: 18 }}/>
                  </Button>
                </div>
                <div className="cop-input-footer">
                  Ask Alan uses retrieval-augmented generation. Responses are sourced from your organization's knowledge base.
                </div>
              </div>
            </div>
          }
        />

      {/* Right-side Sources Panel — opens from inline "View sources" link */}
      {sourcesPanelMsgId && (() => {
        const msg = currentMessages.find(m => m.id === sourcesPanelMsgId);
        if (!msg || !msg.sources) { return null; }
        return (
          <div className="cop-sources-panel-overlay" onClick={() => setSourcesPanelMsgId(null)}>
            <aside className="cop-sources-panel" onClick={(e) => e.stopPropagation()}>
              <div className="cop-sources-panel-header">
                <div className="cop-sources-panel-title">
                  <MenuBookOutlined sx={{ fontSize: 15 }}/>
                  <h3>Sources</h3>
                  <span className="cop-sources-panel-count">{msg.sources.length}</span>
                </div>
                <Button variant="text" color="inherit" className="cop-sources-panel-close" aria-label="Close sources" onClick={() => setSourcesPanelMsgId(null)}>
                  <CloseOutlined sx={{ fontSize: 18 }}/>
                </Button>
              </div>
              <div className="cop-sources-panel-body">
                <p className="cop-sources-panel-intro">
                  This answer is grounded in {msg.sources.length} source{msg.sources.length === 1 ? '' : 's'}. Click any item to view details.
                </p>
                <ul className="cop-sources-panel-list">
                  {msg.sources.map((src, i) => {
                    const tag = src.tag || (i === 0 ? 'primary' : 'supporting');
                    const tagLabel = tag === 'primary' ? 'Primary' : tag === 'regulatory' ? 'Regulatory' : 'Supporting';
                    const badgeColor: 'primary' | 'warning' | 'default' = tag === 'primary' ? 'primary' : tag === 'regulatory' ? 'warning' : 'default';
                    return (
                      <li key={i}>
                        <button
                          type="button"
                          className="cop-sources-panel-row"
                          onClick={() => setOpenSource(src)}
                        >
                          <span className="cop-sources-panel-num">{i + 1}</span>
                          <div className="cop-sources-panel-main">
                            <div className="cop-sources-panel-title-row">
                              <span className="cop-sources-panel-doc">{src.doc}</span>
                              <Badge label={tagLabel} size="small" color={badgeColor} />
                            </div>
                            <div className="cop-sources-panel-meta">
                              <span>{src.section}</span>
                              <span className="cop-source-meta-sep">·</span>
                              <span>{src.page}</span>
                              {src.updated && (
                                <>
                                  <span className="cop-source-meta-sep">·</span>
                                  <span>Updated {src.updated}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <KeyboardArrowRight sx={{ fontSize: 16 }} className="cop-sources-panel-arrow"/>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </aside>
          </div>
        );
      })()}

      {/* Source Detail Modal — opens when a source row is clicked */}
      {openSource && (() => {
        const tag = (openSource.tag as 'primary' | 'supporting' | 'regulatory') || 'supporting';
        const tagLabel = tag === 'primary' ? 'Primary' : tag === 'regulatory' ? 'Regulatory' : 'Supporting';
        return (
          <div className="cop-source-modal-overlay" onClick={() => setOpenSource(null)}>
            <div className="cop-source-modal" onClick={(e) => e.stopPropagation()}>
              <div className="cop-source-modal-header">
                <div className="cop-source-modal-title">
                  <MenuBookOutlined sx={{ fontSize: 16 }}/>
                  <h3>Source Detail</h3>
                </div>
                <Button variant="text" color="inherit" className="cop-source-modal-close" aria-label="Close" onClick={() => setOpenSource(null)}>
                  <CloseOutlined sx={{ fontSize: 18 }}/>
                </Button>
              </div>
              <div className="cop-source-modal-body">
                <div className="cop-source-modal-tagrow">
                  <span className={`cop-source-tag cop-source-tag--${tag}`}>{tagLabel}</span>
                  {openSource.updated && (
                    <span className="cop-source-modal-updated">
                      <AccessTimeOutlined sx={{ fontSize: 11 }}/>
                      Updated {openSource.updated}
                    </span>
                  )}
                </div>
                <h2 className="cop-source-modal-doc">{openSource.doc}</h2>
                <div className="cop-source-modal-meta">
                  <div className="cop-source-modal-meta-row">
                    <span className="cop-source-modal-meta-label">Section</span>
                    <span className="cop-source-modal-meta-value">{openSource.section}</span>
                  </div>
                  <div className="cop-source-modal-meta-row">
                    <span className="cop-source-modal-meta-label">Reference</span>
                    <span className="cop-source-modal-meta-value">{openSource.page}</span>
                  </div>
                </div>
                <div className="cop-source-modal-excerpt">
                  <div className="cop-source-modal-excerpt-label">Relevant excerpt</div>
                  <p>
                    {openSource.excerpt
                      || `This source contributed key context to the answer above. Open the full document to review ${openSource.section} on ${openSource.page} for the complete policy text, definitions, and procedural steps.`}
                  </p>
                </div>
              </div>
              <div className="cop-source-modal-footer">
                <Button variant="outlined" color="primary" className="cop-source-modal-secondary" onClick={() => setOpenSource(null)}>Close</Button>
                <Button variant="contained" color="primary" className="cop-source-modal-primary" startIcon={<DescriptionOutlined sx={{ fontSize: 13 }}/>}>
                  Open Full Document
                </Button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
