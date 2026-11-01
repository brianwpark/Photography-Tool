import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import BottomNav from './components/BottomNav.jsx';
import ArViewfinderModal from './components/ArViewfinderModal.jsx';

import DashboardView from './views/DashboardView.jsx';
import DofView from './views/DofView.jsx';
import DofTableView from './views/DofTableView.jsx';
import NdTimerView from './views/NdTimerView.jsx';
import SpotStarsView from './views/SpotStarsView.jsx';
import TimelapseView from './views/TimelapseView.jsx';
import StarTrailsView from './views/StarTrailsView.jsx';
import FovView from './views/FovView.jsx';
import MoonTransitView from './views/MoonTransitView.jsx';
import SunView from './views/SunView.jsx';
import MeteorShowersView from './views/MeteorShowersView.jsx';
import SubjectDistanceView from './views/SubjectDistanceView.jsx';

import { getSunAndMoonData } from './services/ephemeris.js';
import { predictUpcomingTransits } from './services/transitChaser.js';

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
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

  // Render view by id
  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <DashboardView
            ephemData={ephemData}
            transits={transits}
            onSelectView={setActiveView}
            onOpenAR={() => setIsAROpen(true)}
          />
        );
      case 'dof':
        return <DofView onSelectView={setActiveView} />;
      case 'dof-table':
        return <DofTableView onSelectView={setActiveView} />;
      case 'nd-timer':
        return <NdTimerView />;
      case 'spot-stars':
        return <SpotStarsView onSelectView={setActiveView} />;
      case 'timelapse':
        return <TimelapseView onSelectView={setActiveView} />;
      case 'star-trails':
        return <StarTrailsView />;
      case 'fov':
        return <FovView />;
      case 'moon-transit':
        return (
          <MoonTransitView
            ephemData={ephemData}
            transits={transits}
            onOpenAR={() => setIsAROpen(true)}
            userLocation={location}
          />
        );
      case 'sun':
        return <SunView ephemData={ephemData} />;
      case 'meteor-showers':
        return <MeteorShowersView />;
      case 'subject-distance':
        return <SubjectDistanceView onSelectView={setActiveView} />;
      default:
        return (
          <DashboardView
            ephemData={ephemData}
            transits={transits}
            onSelectView={setActiveView}
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
        onSelectView={setActiveView}
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
          onSelectView={setActiveView}
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
        onSelectView={setActiveView}
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
