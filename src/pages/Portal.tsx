import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HomePage } from 'impact-ui';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../types';
import './Portal.css';

export const Portal: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Remove padding from the shared main layout body for this page only
  useEffect(() => {
    const body = document.querySelector('.main-layout-body') as HTMLElement | null;
    const main = document.querySelector('.main-layout-main') as HTMLElement | null;
    if (body) body.classList.add('portal-no-pad');
    if (main) main.classList.add('portal-no-pad');
    return () => {
      if (body) body.classList.remove('portal-no-pad');
      if (main) main.classList.remove('portal-no-pad');
    };
  }, []);

  const toolKitItems = [
    {
      name: 'StoreHub',
      description: 'AI-powered store execution & district intelligence platform.',
      details:
        'StoreHub gives district managers a unified command center for planogram execution, VoC insights, OOS monitoring, and task orchestration — all powered by agentic AI.',
      cta: 'Launch',
      folderContent: [
        'District Intelligence & Store Leaderboard',
        'Master POG & Localization Engine',
        'Operations Queue & Task Center',
        'Communications & Broadcast',
        'Ask Alan',
      ],
    },
  ];

  const smartAiItems = [
    {
      name: 'InventorySmart',
      description: 'AI-Native End-to-End Inventory Management & Planning',
      details: 'InventorySmart is an AI-native platform that automates allocation and replenishment, delivering precise forecasts and streamlining inventory planning. It reduces manual effort, accelerates execution, and optimizes inventory across the product lifecycle.',
      cta: 'Book demo',
      folderContent: [
        'AI-Native Allocation Engine',
        'Automate DC Replenishment',
        'Dynamic Best-Fit Pre-Pack Optimization',
        'Manage Exceptions Efficiency',
      ],
    },
    {
      name: 'PlanSmart',
      description: 'AI-Native Merchandise Financial Planning Solution',
      details: 'PlanSmart is an AI-native merchandise financial planning tool that creates forecast-driven budgets, optimizes open-to-buy spend, and enhances visibility. PlanSmart simplifies workflows, boosts planner productivity, and drives financial precision.',
      cta: 'Book demo',
      folderContent: [
        'Forecast-Driven Budgeting',
        'Scenario-Based Plan Simulations',
        'Hierarchy-Level Planning Flexibility',
      ],
    },
    {
      name: 'SizeSmart',
      description: 'AI-Native Size Curve Optimization Solution',
      details: 'SizeSmart is an AI-native size curve and pack optimization engine that automates planning, aligns buys and allocations with precise forecasts, and maximizes profitability. It delivers real-time, demand-driven size curves and prepack configurations that adapt across regions, clusters, channels, and categories.',
      cta: 'Book demo',
      folderContent: [
        'Current Size Curve Review',
        'Dynamic Hierarchy Escalations',
        'Auto-Generate Future Curves',
        'Prepack Configuration Recommendations',
      ],
    },
    {
      name: 'AssortSmart',
      description: 'AI-Native Assortment Planning Solution',
      details: 'AssortSmart is an AI-native assortment planning solution that delivers localized assortments through smart clustering, forecasting, and SKU rationalization. It reduces markdowns and increases margins by aligning demand and supply.',
      cta: 'Book demo',
      folderContent: [
        'Smart Clustering by Demand',
        'AI/ML Forecasting Powering Assortment Optimization',
        'Choice Count Rationalization',
        'PLM Integration',
      ],
    },
    {
      name: 'ItemSmart',
      description: 'AI-Native Item Planning Solution',
      details: 'ItemSmart is an AI-native item planning solution that revolutionizes SKU-level forecasting with unmatched demand accuracy, simplified workflows, and precise inventory alignment. It empowers smarter, faster decisions across SKUs, classes, and channels to boost efficiency.',
      cta: 'Book demo',
      folderContent: [
        'AI-Powered Demand Accuracy',
        'Streamlined SKU-Level Planning',
        'Discount & Promo Planning',
        'Seamless Approval Workflow',
      ],
    },
    {
      name: 'PromoSmart',
      description: 'AI-Native Promotion Planning Solution',
      details: 'PromoSmart empowers businesses to plan, simulate, and optimize promotions using AI, enabling seamless collaboration across marketing, planning, and execution teams while streamlining approvals for faster decisions.',
      cta: 'Book demo',
      folderContent: [
        'AI-Native Promo Optimization',
        'Product x Store-Level Performance Analytics',
        'Configurable Approval Workflows',
        'Comprehensive Offer Type Support',
      ],
    },
    {
      name: 'MarkSmart',
      description: 'AI-Native Markdown Optimization Solution',
      details: 'MarkSmart is an AI-native clearance optimization solution that helps retailers maximize margins while clearing inventory. It leverages data-driven strategies, elasticity models, and business rules to recommend the right timing and depth of markdowns, ensuring higher sell-through with minimal margin loss.',
      cta: 'Book demo',
      folderContent: [
        'AI-Native Markdown Optimization',
        'Scenario Simulation & What-If Analysis',
        'Real-Time Dashboards & Monitoring',
        'Automated Clearance Strategy',
      ],
    },
    {
      name: 'SpaceSmart',
      description: 'AI-Native Space Planning & Optimization Solution',
      details: 'SpaceSmart is an AI-native optimization engine for macro and micro space planning. It uses elasticity models, clustering, and adjacency analytics to maximize ROI per square foot and create layouts that drive store performance.',
      cta: 'Book demo',
      folderContent: [
        'AI-Native Space Elasticity',
        'Macro & Micro Floor Planning',
        'Space-Aware Store Clustering',
      ],
    },
    {
      name: 'Forecast Configurator',
      description: 'AI-Native Forecast Generation Module',
      details: 'Forecast Configurator is a forecast generation engine that enables model selection, AI/ML model building, and forecast tuning to suit specific business contexts and improve forecast precision.',
      cta: 'Book demo',
      folderContent: [
        'Custom Forecast Model Selection',
        'Driver-Level Variable Control',
        'Built-In Bias Corrections',
        'Automated Model Refreshes',
      ],
    },
    {
      name: 'ADA Configurator',
      description: 'Automated Business Intelligence Platform',
      details: 'ADA Configurator makes Business Intelligence for retail easy through automated insights based on your data sources. It provides instant insight into critical drivers affecting your business with streamlined configuration and deployment.',
      cta: 'Book demo',
      folderContent: [
        'Automated Data Insights',
        'Critical Driver Analysis',
        'Business Intelligence Automation',
        'Real-Time Configuration',
      ],
    },
    {
      name: 'ADA Visual',
      description: 'AI-Native Forecast Visualization Engine',
      details: 'ADA Visual is the visual interface of our AI-native forecasting engine that helps users to view and edit forecasts and convert them into intuitive, actionable visuals. It enables users to monitor forecasts, understand drivers of forecasts, compare forecasts for scenarios, and apply business edits seamlessly.',
      cta: 'Book demo',
      folderContent: [
        'Real-Time Forecast Monitoring',
        'Understand Key Drivers of Forecasts',
        'Forecast Comparison for Multiple Scenarios',
        'Easy Human Forecast Overrides',
      ],
    },
  ];

  const handleLaunchClick = () => {
    if (user?.role === 'SM') {
      navigate('/store-operations/store-deep-dive');
    } else {
      navigate(ROUTES.STORE_OPS_HOME);
    }
  };

  return (
    <div className="portal-wrap">
      <HomePage
        clientName="StoreHub"
        userName={user?.name?.split(' ')[0] || 'there'}
        toolKitItems={toolKitItems}
        smartAiItems={smartAiItems}
        showConfigurationsButton={false}
        onLaunchClick={handleLaunchClick}
        onBookDemoClick={() => window.open('https://www.impactanalytics.ai/contact-us', '_blank')}
        onViewReleasedNotesClick={() => {}}
        onConfigurationsClick={() => {}}
        onKnowMoreClick={() => {}}
      />
    </div>
  );
};
