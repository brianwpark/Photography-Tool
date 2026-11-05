import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import BottomNav from './components/BottomNav.jsx';
import ArViewfinderModal from './components/ArViewfinderModal.jsx';

import DashboardView from './views/DashboardView.jsx';
import CelestialSuiteView from './views/CelestialSuiteView.jsx';
import DofSuiteView from './views/DofSuiteView.jsx';
import FovSuiteView from './views/FovSuiteView.jsx';
import ExposureSuiteView from './views/ExposureSuiteView.jsx';
import AstroSuiteView from './views/AstroSuiteView.jsx';

import { getSunAndMoonData } from './services/ephemeris.js';
import { predictUpcomingTransits } from './services/transitChaser.js';

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [suiteSubTab, setSuiteSubTab] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAROpen, setIsAROpen] = useState(false);

  // User location (default Atlanta, Georgia)
  const [location, setLocation] = useState({
    lat: 33.749,
    lng: -84.388,
    city: 'Atlanta, GA'
  });
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Live ephemeris & transit calculations
  const [currentDate, setCurrentDate] = useState(new Date());

  // Periodically refresh ephemeris
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const ephemData = useMemo(() => {
    return getSunAndMoonData(currentDate, location.lat, location.lng);
  }, [currentDate, location.lat, location.lng]);

  const transits = useMemo(() => {
    return predictUpcomingTransits(location.lat, location.lng, 14);
  }, [location.lat, location.lng]);

  // Geolocation detector
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLocation({
          lat,
          lng,
          city: `GPS: ${lat.toFixed(2)}°, ${lng.toFixed(2)}°`
        });
        setIsDetectingLocation(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setIsDetectingLocation(false);
      },
      { timeout: 8000 }
    );
  };

  // Unified navigation handler supporting both suites and legacy/sub-tab IDs
  const handleSelectView = (view, subTab = null) => {
    if (view === 'ar-viewfinder') {
      setIsAROpen(true);
      return;
    }

    switch (view) {
      // Celestial & Ephemeris Suite
      case 'celestial':
        setActiveView('celestial');
        setSuiteSubTab(subTab || 'planner');
        break;
      case 'planner':
        setActiveView('celestial');
        setSuiteSubTab('planner');
        break;
      case 'moon-transit':
        setActiveView('celestial');
        setSuiteSubTab('moon');
        break;
      case 'sun':
        setActiveView('celestial');
        setSuiteSubTab('sun');
        break;
      case 'eclipses':
        setActiveView('celestial');
        setSuiteSubTab('eclipses');
        break;

      // Depth of Field Suite
      case 'dof':
        setActiveView('dof');
        setSuiteSubTab(subTab || 'calc');
        break;
      case 'dof-table':
        setActiveView('dof');
        setSuiteSubTab('matrix');
        break;

      // Field of View & Framing Suite
      case 'fov':
        setActiveView('fov');
        setSuiteSubTab(subTab || 'fov');
        break;
      case 'focal-match':
        setActiveView('fov');
        setSuiteSubTab('focal-match');
        break;
      case 'subject-distance':
        setActiveView('fov');
        setSuiteSubTab('subject-distance');
        break;

      // Exposure, ND & Timers Suite
      case 'exposure':
        setActiveView('exposure');
        setSuiteSubTab(subTab || 'nd-timer');
        break;
      case 'nd-timer':
        setActiveView('exposure');
        setSuiteSubTab('nd-timer');
        break;
      case 'timer':
        setActiveView('exposure');
        setSuiteSubTab('timer');
        break;

      // Astrophotography & Night Sky Suite
      case 'astrophotography':
        setActiveView('astrophotography');
        setSuiteSubTab(subTab || 'spot-stars');
        break;
      case 'spot-stars':
        setActiveView('astrophotography');
        setSuiteSubTab('spot-stars');
        break;
      case 'star-trails':
        setActiveView('astrophotography');
        setSuiteSubTab('star-trails');
        break;
      case 'timelapse':
        setActiveView('astrophotography');
        setSuiteSubTab('timelapse');
        break;
      case 'meteor-showers':
        setActiveView('astrophotography');
        setSuiteSubTab('meteor-showers');
        break;

      case 'dashboard':
      default:
        setActiveView('dashboard');
        setSuiteSubTab(null);
        break;
    }
  };

  // Render view by active suite
  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <DashboardView
            ephemData={ephemData}
            transits={transits}
            onSelectView={handleSelectView}
            onOpenAR={() => setIsAROpen(true)}
          />
        );

      case 'celestial':
        return (
          <CelestialSuiteView
            ephemData={ephemData}
            transits={transits}
            onOpenAR={() => setIsAROpen(true)}
            userLocation={location}
            initialTab={suiteSubTab || 'planner'}
          />
        );

      case 'dof':
        return (
          <DofSuiteView
            initialTab={suiteSubTab || 'calc'}
          />
        );

      case 'fov':
        return (
          <FovSuiteView
            initialTab={suiteSubTab || 'fov'}
          />
        );

      case 'exposure':
        return (
          <ExposureSuiteView
            initialTab={suiteSubTab || 'nd-timer'}
          />
        );

      case 'astrophotography':
        return (
          <AstroSuiteView
            initialTab={suiteSubTab || 'spot-stars'}
          />
        );

      default:
        return (
          <DashboardView
            ephemData={ephemData}
            transits={transits}
            onSelectView={handleSelectView}
            onOpenAR={() => setIsAROpen(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#080d16] flex flex-col text-slate-100">
      {/* Top Header */}
      <Header
        activeView={activeView}
        onSelectView={handleSelectView}
        location={location}
        onDetectLocation={handleDetectLocation}
        isDetectingLocation={isDetectingLocation}
        onOpenAR={() => setIsAROpen(true)}
      />

      {/* Main Content Area with Sidebar */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto pb-16 md:pb-8">
        {/* Desktop / Tablet Sidebar Navigation */}
        <Sidebar
          activeView={activeView}
          onSelectView={handleSelectView}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          onOpenAR={() => setIsAROpen(true)}
        />

        {/* View Surface */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Fixed Bottom Navigation */}
      <BottomNav
        activeView={activeView}
        onSelectView={handleSelectView}
        onToggleMenu={() => setIsMobileMenuOpen(true)}
      />

      {/* AR Viewfinder Fullscreen Camera HUD Modal */}
      <ArViewfinderModal
        isOpen={isAROpen}
        onClose={() => setIsAROpen(false)}
        moonData={ephemData.moon}
        sunData={ephemData.sun}
      />
    </div>
  );
}
