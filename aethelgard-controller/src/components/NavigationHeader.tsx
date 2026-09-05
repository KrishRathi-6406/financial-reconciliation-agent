import React from 'react';
import { ScreenId } from '../types';

export interface NavigationHeaderProps {
  currentScreen: ScreenId;
  onNavigate?: (screen: ScreenId) => void;
  onSelectScreen?: (screen: ScreenId) => void;
  onOpenTerminal: () => void;
  onOpenNewIngestion: () => void;
  onOpenDocs?: () => void;
  isProcessingActive?: boolean;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  currentScreen,
  onNavigate,
  onSelectScreen,
  onOpenTerminal,
  onOpenNewIngestion,
  onOpenDocs,
  isProcessingActive,
}) => {
  const handleNav = (screen: ScreenId) => {
    if (onNavigate) {
      onNavigate(screen);
    } else if (onSelectScreen) {
      onSelectScreen(screen);
    }
  };

  return (
    <header className="w-full h-16 flex items-center justify-between px-4 md:px-8 border-b border-[#27272a] bg-[#131315] sticky top-0 z-50">
      {/* Brand & Status */}
      <div className="flex items-center space-x-6">
        <button
          onClick={() => handleNav('overview')}
          className="flex items-center space-x-3 text-left group focus:outline-none cursor-pointer"
        >
          <div className="w-8 h-8 border border-[#4f4537] flex items-center justify-center bg-[#0e0e10] text-[#f3be67] transition-colors group-hover:border-[#f3be67]">
            <span className="material-symbols-outlined text-[18px]">account_balance</span>
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-[18px] md:text-[20px] text-[#f3be67] tracking-tight font-medium leading-tight">
              Aethelgard
            </span>
            <span className="font-mono text-[9px] text-[#d3c4b2] uppercase tracking-widest -mt-0.5">
              Controller
            </span>
          </div>
        </button>

        <div className="hidden xl:flex items-center h-5 border-l border-[#27272a] pl-6 space-x-2">
          <span className="w-2 h-2 rounded-full bg-[#4eaa78] animate-pulse"></span>
          <span className="font-mono text-[11px] text-[#d3c4b2] uppercase tracking-widest">
            Enclave Status: Synchronized // ISO 20022 Defensible
          </span>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <nav className="hidden md:flex items-center space-x-1 lg:space-x-6">
        <button
          onClick={() => handleNav('overview')}
          className={`px-3 py-5 text-[13px] tracking-wide uppercase transition-colors border-b-2 font-medium cursor-pointer ${
            currentScreen === 'overview'
              ? 'text-[#f3be67] border-[#f3be67]'
              : 'text-[#a1a1aa] border-transparent hover:text-[#f3be67]'
          }`}
        >
          Platform
        </button>

        <button
          onClick={() => handleNav('rule-matching')}
          className={`px-3 py-5 text-[13px] tracking-wide uppercase transition-colors border-b-2 font-medium flex items-center space-x-1.5 cursor-pointer ${
            currentScreen === 'rule-matching'
              ? 'text-[#f3be67] border-[#f3be67]'
              : 'text-[#a1a1aa] border-transparent hover:text-[#f3be67]'
          }`}
        >
          <span>Rule Matching</span>
        </button>

        <button
          onClick={() => handleNav('processing-run')}
          className={`px-3 py-5 text-[13px] tracking-wide uppercase transition-colors border-b-2 font-medium flex items-center space-x-1.5 cursor-pointer ${
            currentScreen === 'processing-run'
              ? 'text-[#f3be67] border-[#f3be67]'
              : 'text-[#a1a1aa] border-transparent hover:text-[#f3be67]'
          }`}
        >
          {isProcessingActive && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#f3be67] animate-ping inline-block mr-1"></span>
          )}
          <span>Batches / Live Run</span>
        </button>

        <button
          onClick={() => handleNav('run-history')}
          className={`px-3 py-5 text-[13px] tracking-wide uppercase transition-colors border-b-2 font-medium cursor-pointer ${
            currentScreen === 'run-history'
              ? 'text-[#f3be67] border-[#f3be67]'
              : 'text-[#a1a1aa] border-transparent hover:text-[#f3be67]'
          }`}
        >
          Run History
        </button>

        <button
          onClick={() => handleNav('exceptions')}
          className={`px-3 py-5 text-[13px] tracking-wide uppercase transition-colors border-b-2 font-medium flex items-center space-x-1.5 cursor-pointer ${
            currentScreen === 'exceptions'
              ? 'text-[#f3be67] border-[#f3be67]'
              : 'text-[#a1a1aa] border-transparent hover:text-[#f3be67]'
          }`}
        >
          <span>Exceptions</span>
          <span className="px-1.5 py-0.2 bg-[#353437] text-[#f3be67] text-[10px] font-mono border border-[#4f4537]">
            6
          </span>
        </button>

        <button
          onClick={() => handleNav('settings')}
          className={`px-3 py-5 text-[13px] tracking-wide uppercase transition-colors border-b-2 font-medium cursor-pointer ${
            currentScreen === 'settings'
              ? 'text-[#f3be67] border-[#f3be67]'
              : 'text-[#a1a1aa] border-transparent hover:text-[#f3be67]'
          }`}
        >
          Settings
        </button>
      </nav>

      {/* Header Actions & Telemetry */}
      <div className="flex items-center space-x-3">
        {/* System Status badge */}
        <div className="hidden lg:flex items-center px-2.5 py-1 border border-[#27272a] bg-[#1c1b1d] space-x-2">
          <span className="w-2 h-2 rounded-full bg-[#f3be67]"></span>
          <span className="font-mono text-[11px] text-[#e5e1e4]">System Status: Operational</span>
        </div>

        {/* Documentation trigger */}
        {onOpenDocs && (
          <button
            onClick={onOpenDocs}
            title="Open Architecture Documentation"
            className="w-8 h-8 flex items-center justify-center border border-[#27272a] bg-[#1c1b1d] text-[#d3c4b2] hover:text-[#f3be67] hover:border-[#4f4537] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">menu_book</span>
          </button>
        )}

        {/* Terminal toggle */}
        <button
          onClick={onOpenTerminal}
          title="Open Enclave Terminal"
          className="w-8 h-8 flex items-center justify-center border border-[#27272a] bg-[#1c1b1d] text-[#d3c4b2] hover:text-[#f3be67] hover:border-[#4f4537] transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">terminal</span>
        </button>

        {/* New Ingestion button */}
        <button
          onClick={onOpenNewIngestion}
          className="inline-flex items-center px-3.5 py-1.5 bg-[#d4a24e] text-[#0e0e10] font-sans text-[12px] font-semibold tracking-wider uppercase transition-colors hover:bg-[#f3be67] cursor-pointer"
        >
          <span>+ Ingest</span>
        </button>
      </div>
    </header>
  );
};
