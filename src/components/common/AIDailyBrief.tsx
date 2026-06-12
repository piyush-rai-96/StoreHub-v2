import React, { useState } from 'react';
import AutoAwesomeOutlined from '@mui/icons-material/AutoAwesomeOutlined';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined';
import TrendingUpOutlined from '@mui/icons-material/TrendingUpOutlined';
import TaskAltOutlined from '@mui/icons-material/TaskAltOutlined';
import StarBorderOutlined from '@mui/icons-material/StarBorderOutlined';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import HeadphonesOutlined from '@mui/icons-material/HeadphonesOutlined';
import DirectionsWalkOutlined from '@mui/icons-material/DirectionsWalkOutlined';
import CategoryOutlined from '@mui/icons-material/CategoryOutlined';
import WbSunnyOutlined from '@mui/icons-material/WbSunnyOutlined';
import BusinessOutlined from '@mui/icons-material/BusinessOutlined';
import BarChartOutlined from '@mui/icons-material/BarChart';
import CompareArrowsOutlined from '@mui/icons-material/CompareArrowsOutlined';
import { Accordion } from 'impact-ui';
import { AudioPlayer } from './AudioPlayer';
import './AudioPlayer.css';

export type BriefSectionIcon =
  | 'triage'
  | 'performance'
  | 'ops'
  | 'customer'
  | 'recommendations'
  | 'traffic'
  | 'product'
  | 'external'
  | 'district'
  | 'scorecard'
  | 'drivers';

export interface BriefSection {
  title: string;
  icon: BriefSectionIcon;
  bullets: string[];
}

export interface AIDailyBriefData {
  greeting: string;
  sections: BriefSection[];
  closing: string;
}

interface AIDailyBriefProps {
  brief: AIDailyBriefData;
  userName?: string;
  metaSuffix?: string; // e.g. "3 triage items" or "5 priority actions"
  heightStyle?: React.CSSProperties;
  defaultCollapsed?: boolean;
}

const renderIcon = (icon: BriefSectionIcon) => {
  switch (icon) {
    case 'triage':      return <WarningAmberOutlined sx={{ fontSize: 14 }} />;
    case 'performance': return <TrendingUpOutlined sx={{ fontSize: 14 }} />;
    case 'ops':         return <TaskAltOutlined sx={{ fontSize: 14 }} />;
    case 'customer':    return <StarBorderOutlined sx={{ fontSize: 14 }} />;
    case 'recommendations': return <AutoAwesomeOutlined sx={{ fontSize: 14 }} />;
    case 'traffic':     return <DirectionsWalkOutlined sx={{ fontSize: 14 }} />;
    case 'product':     return <CategoryOutlined sx={{ fontSize: 14 }} />;
    case 'external':    return <WbSunnyOutlined sx={{ fontSize: 14 }} />;
    case 'district':    return <BusinessOutlined sx={{ fontSize: 14 }} />;
    case 'scorecard':   return <BarChartOutlined sx={{ fontSize: 14 }} />;
    case 'drivers':     return <CompareArrowsOutlined sx={{ fontSize: 14 }} />;
    default:            return null;
  }
};

const greetingPrefix = () => {
  const h = new Date().getHours();
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
};

const BriefSummary: React.FC<{ brief: AIDailyBriefData; userName?: string }> = ({ brief, userName }) => (
  <div className="di-brief-summary">
    <p className="di-brief-paragraph">
      Good {greetingPrefix()}, {userName || 'Manager'}. {brief.greeting}
    </p>
    {brief.sections.map((section, idx) => (
      <div key={idx} className={`di-brief-section${section.icon === 'recommendations' ? ' di-brief-section--suggestions' : ''}`}>
        <h3 className="di-brief-section-title">
          {renderIcon(section.icon)}
          {section.title}
        </h3>
        <ul className="di-brief-bullets">
          {section.bullets.map((bullet, bIdx) => (
            <li key={bIdx} dangerouslySetInnerHTML={{ __html: bullet }} />
          ))}
        </ul>
      </div>
    ))}
    <p className="di-brief-closing">{brief.closing}</p>
  </div>
);

// Flatten brief into a readable plain-text string for TTS
function briefToText(brief: AIDailyBriefData, userName?: string): string {
  const greeting = `Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, ${userName || 'Manager'}. ${brief.greeting}`;
  const sections = brief.sections
    .map(s => `${s.title}. ${s.bullets.map(b => b.replace(/<[^>]+>/g, '')).join('. ')}`)
    .join('. ');
  return `${greeting}. ${sections}. ${brief.closing}`;
}

export const AIDailyBrief: React.FC<AIDailyBriefProps> = ({
  brief,
  userName,
  metaSuffix,
  heightStyle,
  defaultCollapsed = false,
}) => {
  const [expanded, setExpanded] = useState<string>(defaultCollapsed ? '' : 'brief');
  const [showModal, setShowModal] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);

  const briefText = briefToText(brief, userName);
  const isExpanded = expanded === 'brief';

  const accordionHeader = (
    <div className="di-brief-header-left">
      <div className="di-brief-header">
        <div className="di-brief-badge">
          <AutoAwesomeOutlined sx={{ fontSize: 16 }} />
          <span>AI Daily Brief</span>
        </div>
      </div>
      {metaSuffix && (
        <div className="di-brief-meta">
          <span>{metaSuffix}</span>
        </div>
      )}
      <button
        className={`aup-listen-btn${showPlayer ? ' aup-listen-btn--active' : ''}`}
        onClick={(e) => { e.stopPropagation(); setShowPlayer(v => !v); if (!isExpanded) setExpanded('brief'); }}
        title="Listen to brief"
      >
        <span className="aup-listen-btn-icon">
          {showPlayer
            ? <span className="aup-soundwave aup-soundwave--sm"><span/><span/><span/><span/></span>
            : <HeadphonesOutlined sx={{ fontSize: 14 }} />
          }
        </span>
        {showPlayer ? 'Playing…' : 'Listen'}
      </button>
    </div>
  );

  const accordionContent = (
    <div className="di-brief-body-wrapper">
      {showPlayer && (
        <div className="di-brief-audio-bar">
          <AudioPlayer
            text={briefText}
            title="AI Daily Brief"
            variant="bar"
            onClose={() => setShowPlayer(false)}
          />
        </div>
      )}
      <div className="di-brief-body">
        <BriefSummary brief={brief} userName={userName} />
      </div>
      <div className="di-brief-scroll-fade" />
      <div className="di-brief-cta-row">
        <button className="di-brief-read-more" onClick={() => setShowModal(true)}>
          <span>Read Full Brief</span>
          <KeyboardArrowRight sx={{ fontSize: 14 }} />
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="di-ai-daily-brief" style={heightStyle}>
        <Accordion
          isSingleItem
          singleData={{ header: accordionHeader, content: accordionContent, value: 'brief' }}
          expanded={expanded}
          setExpanded={(v) => setExpanded(v as string)}
        />
      </div>

      {showModal && (
        <div className="di-brief-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="di-brief-modal" onClick={(e) => e.stopPropagation()}>
            <div className="di-brief-modal-header">
              <div className="di-brief-modal-title">
                <AutoAwesomeOutlined sx={{ fontSize: 18 }} />
                <h2>AI Daily Brief</h2>
              </div>
              <div className="di-brief-modal-header-actions">
                <button
                  className={`aup-listen-btn${showPlayer ? ' aup-listen-btn--active' : ''}`}
                  onClick={() => setShowPlayer(v => !v)}
                  title="Listen to brief"
                >
                  <span className="aup-listen-btn-icon">
                    {showPlayer
                      ? <span className="aup-soundwave aup-soundwave--sm"><span/><span/><span/><span/></span>
                      : <HeadphonesOutlined sx={{ fontSize: 14 }} />
                    }
                  </span>
                  {showPlayer ? 'Playing…' : 'Listen'}
                </button>
                <button className="di-brief-modal-close" onClick={() => setShowModal(false)}>
                  <CloseOutlined sx={{ fontSize: 20 }} />
                </button>
              </div>
            </div>
            {showPlayer && (
              <div className="di-brief-modal-audio">
                <AudioPlayer
                  text={briefText}
                  title="AI Daily Brief"
                  variant="card"
                  onClose={() => setShowPlayer(false)}
                />
              </div>
            )}
            <div className="di-brief-modal-content">
              <BriefSummary brief={brief} userName={userName} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
