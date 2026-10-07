import React from "react";
import { LandingTopBar } from "../components/LandingTopBar";
import { LandingHeader } from "../components/LandingHeader";
import { HeroSection } from "../components/HeroSection";
import { ValueHighlights } from "../components/ValueHighlights";
import { AboutEcosystemSection } from "../components/AboutEcosystemSection";
import { HowItWorksSection } from "../components/HowItWorksSection";
import { GisTrackingSection } from "../components/GisTrackingSection";
import { SandBookingSection } from "../components/SandBookingSection";
import { FleetTelematicsSection } from "../components/FleetTelematicsSection";
import { TestimonialCompliance } from "../components/TestimonialCompliance";
import { StakeholdersSection } from "../components/StakeholdersSection";
import { BottomCtaBanner } from "../components/BottomCtaBanner";
import { LandingFooter } from "../components/LandingFooter";
import "../styles/landing.css";

export const LandingPage: React.FC = () => {
  return (
    <div className="landing-container min-h-screen flex flex-col selection:bg-amber-800 selection:text-white">
      {/* Top Utility Bar */}
      <LandingTopBar />

      {/* Main Sticky Header with Login Navigation */}
      <LandingHeader />

      {/* Main Content Sections */}
      <main id="main-content" className="grow">
        {/* Hero Section */}
        <HeroSection />

        {/* 4 Core Pillars Strip */}
        <ValueHighlights />

        {/* About the Ecosystem */}
        <AboutEcosystemSection />

        {/* 6-Step Supply Chain Process Flow */}
        <HowItWorksSection />

        {/* Interactive GIS Map & Monitoring */}
        <GisTrackingSection />

        {/* Citizen Sand Bazaar & Itemized Invoice Breakdown */}
        <SandBookingSection />

        {/* Fleet Telematics & Route Enforcement */}
        <FleetTelematicsSection />

        {/* Citizen Voice & Compliance Matrix */}
        <TestimonialCompliance />

        {/* 9 Stakeholder Roles */}
        <StakeholdersSection />

        {/* Bottom Call to Action Banner */}
        <BottomCtaBanner />
      </main>

      {/* Official Government Footer */}
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
