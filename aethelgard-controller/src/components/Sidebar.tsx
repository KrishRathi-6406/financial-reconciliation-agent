import React from 'react';
import { ScreenId } from '../types';

export interface SidebarProps {
  currentScreen: ScreenId;
  onNavigate?: (screen: ScreenId) => void;
  onSelectScreen?: (screen: ScreenId) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onOpenNewIngestion?: () => void;
  onOpenTerminal?: () => void;
  onOpenDocs?: () => void;
  isProcessingActive?: boolean;
  exceptionCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  onNavigate,
  onSelectScreen,
  isCollapsed = false,
  onToggleCollapse,
  onOpenNewIngestion,
  onOpenTerminal,
  onOpenDocs,
  isProcessingActive = true,
  exceptionCount = 6,
}) => {
  const handleNav = (screen: ScreenId) => {
    if (onNavigate) {
      onNavigate(screen);
    } else if (onSelectScreen) {
      onSelectScreen(screen);
    }
  };

  return (
    <aside
      className={`${
        isCollapsed ? 'w-16' : 'w-64'
      } shrink-0 bg-[#0e0e10] border-r border-[#27272a] flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 select-none transition-all duration-200`}
    >
      <div className="p-3 flex flex-col space-y-4">
        {/* Desk / Controller Identity Card or Mini Header */}
        {!isCollapsed ? (
          <div className="border border-[#27272a] bg-[#131315] p-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 border border-[#4f4537] bg-[#1c1b1d] flex items-center justify-center text-[#f3be67]">
                <span className="material-symbols-outlined text-[18px]">shield_lock</span>
              </div>
              <div>
                <div className="font-serif text-[15px] text-[#f3be67] font-medium leading-tight">
                  Aethelgard
                </div>
                <div className="font-mono text-[10px] text-[#9c8f7e] uppercase tracking-wider">
                  AI Controller v4.2
                </div>
              </div>
            </div>
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                title="Collapse sidebar"
                className="text-[#71717a] hover:text-[#e5e1e4] p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center py-2 space-y-2">
            <div className="w-9 h-9 border border-[#4f4537] bg-[#1c1b1d] flex items-center justify-center text-[#f3be67]">
              <span className="material-symbols-outlined text-[18px]">shield_lock</span>
            </div>
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                title="Expand sidebar"
                className="text-[#71717a] hover:text-[#f3be67] p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            )}
          </div>
        )}

        {/* Action Button: + New Ingestion */}
        {onOpenNewIngestion && (
          !isCollapsed ? (
            <button
              onClick={onOpenNewIngestion}
              className="w-full py-2.5 px-3 border border-[#4f4537] bg-[#18181b] hover:bg-[#201f22] hover:border-[#f3be67] text-[#f3be67] font-mono text-[11px] tracking-wider uppercase flex items-center justify-center space-x-2 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">add</span>
              <span>New Ingestion</span>
            </button>
          ) : (
            <button
              onClick={onOpenNewIngestion}
              title="New Ingestion"
              className="w-10 h-10 mx-auto border border-[#4f4537] bg-[#18181b] hover:bg-[#201f22] hover:border-[#f3be67] text-[#f3be67] flex items-center justify-center transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
            </button>
          )
        )}

        {/* Nav Items */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="font-mono text-[9px] uppercase tracking-widest text-[#71717a] px-3 py-1">
              Navigation
            </div>
          )}

          {/* Overview */}
          <button
            onClick={() => handleNav('overview')}
            title={isCollapsed ? 'Platform Overview' : undefined}
            className={`w-full flex items-center ${
              isCollapsed ? 'justify-center py-2.5' : 'justify-between px-3 py-2'
            } text-[12px] font-sans tracking-wide transition-colors cursor-pointer text-left ${
              currentScreen === 'overview'
                ? 'bg-[#201f22] text-[#f3be67] border-l-2 border-[#f3be67]'
                : 'text-[#a1a1aa] hover:bg-[#131315] hover:text-[#e5e1e4]'
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className="material-symbols-outlined text-[18px]">grid_view</span>
              {!isCollapsed && <span>Overview</span>}
            </div>
          </button>

          {/* Rule Matching */}
          <button
            onClick={() => handleNav('rule-matching')}
            title={isCollapsed ? 'Rule Matching' : undefined}
            className={`w-full flex items-center ${
              isCollapsed ? 'justify-center py-2.5' : 'justify-between px-3 py-2'
            } text-[12px] font-sans tracking-wide transition-colors cursor-pointer text-left ${
              currentScreen === 'rule-matching'
                ? 'bg-[#201f22] text-[#f3be67] border-l-2 border-[#f3be67]'
                : 'text-[#a1a1aa] hover:bg-[#131315] hover:text-[#e5e1e4]'
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className="material-symbols-outlined text-[18px]">tune</span>
              {!isCollapsed && <span>Rule Matching</span>}
            </div>
            {!isCollapsed && <span className="font-mono text-[9px] text-[#71717a]">4 Rules</span>}
          </button>

          {/* Processing / Run */}
          <button
            onClick={() => handleNav('processing-run')}
            title={isCollapsed ? 'Processing / Live Run' : undefined}
            className={`w-full flex items-center ${
              isCollapsed ? 'justify-center py-2.5' : 'justify-between px-3 py-2'
            } text-[12px] font-sans tracking-wide transition-colors cursor-pointer text-left ${
              currentScreen === 'processing-run'
                ? 'bg-[#201f22] text-[#f3be67] border-l-2 border-[#f3be67]'
                : 'text-[#a1a1aa] hover:bg-[#131315] hover:text-[#e5e1e4]'
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className="material-symbols-outlined text-[18px]">sync</span>
              {!isCollapsed && <span>Processing / Run</span>}
            </div>
            {isProcessingActive && (
              <span className="w-2 h-2 rounded-full bg-[#f3be67] animate-pulse"></span>
            )}
          </button>

          {/* Run History */}
          <button
            onClick={() => handleNav('run-history')}
            title={isCollapsed ? 'Run History' : undefined}
            className={`w-full flex items-center ${
              isCollapsed ? 'justify-center py-2.5' : 'justify-between px-3 py-2'
            } text-[12px] font-sans tracking-wide transition-colors cursor-pointer text-left ${
              currentScreen === 'run-history'
                ? 'bg-[#201f22] text-[#f3be67] border-l-2 border-[#f3be67]'
                : 'text-[#a1a1aa] hover:bg-[#131315] hover:text-[#e5e1e4]'
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className="material-symbols-outlined text-[18px]">history</span>
              {!isCollapsed && <span>Run History</span>}
            </div>
            {!isCollapsed && (
              <span className="px-1.5 py-0.5 bg-[#1c1b1d] text-[#d4a24e] border border-[#27272a] text-[10px] font-mono">
                148
              </span>
            )}
          </button>

          {/* Exceptions */}
          <button
            onClick={() => handleNav('exceptions')}
            title={isCollapsed ? `Exceptions (${exceptionCount})` : undefined}
            className={`w-full flex items-center ${
              isCollapsed ? 'justify-center py-2.5' : 'justify-between px-3 py-2'
            } text-[12px] font-sans tracking-wide transition-colors cursor-pointer text-left ${
              currentScreen === 'exceptions'
                ? 'bg-[#201f22] text-[#f3be67] border-l-2 border-[#f3be67]'
                : 'text-[#a1a1aa] hover:bg-[#131315] hover:text-[#e5e1e4]'
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className="material-symbols-outlined text-[18px]">error_outline</span>
              {!isCollapsed && <span>Exceptions</span>}
            </div>
            {!isCollapsed && (
              <span className="px-1.5 py-0.5 bg-[#353437] text-[#f3be67] border border-[#4f4537] text-[10px] font-mono">
                {exceptionCount}
              </span>
            )}
          </button>

          {/* Settings */}
          <button
            onClick={() => handleNav('settings')}
            title={isCollapsed ? 'Settings' : undefined}
            className={`w-full flex items-center ${
              isCollapsed ? 'justify-center py-2.5' : 'justify-between px-3 py-2'
            } text-[12px] font-sans tracking-wide transition-colors cursor-pointer text-left ${
              currentScreen === 'settings'
                ? 'bg-[#201f22] text-[#f3be67] border-l-2 border-[#f3be67]'
                : 'text-[#a1a1aa] hover:bg-[#131315] hover:text-[#e5e1e4]'
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className="material-symbols-outlined text-[18px]">settings</span>
              {!isCollapsed && <span>Settings</span>}
            </div>
          </button>
        </div>
      </div>

      {/* Bottom Auxiliary Tools & Session Stamp */}
      <div className="p-3 border-t border-[#27272a] space-y-1.5 bg-[#0a0a0c]">
        {onOpenDocs && (
          <button
            onClick={onOpenDocs}
            title={isCollapsed ? 'Architecture Documentation' : undefined}
            className={`w-full flex items-center ${
              isCollapsed ? 'justify-center py-2' : 'space-x-3 px-2 py-1.5'
            } text-[11px] text-[#a1a1aa] hover:text-[#f3be67] transition-colors cursor-pointer`}
          >
            <span className="material-symbols-outlined text-[16px]">menu_book</span>
            {!isCollapsed && <span>Documentation</span>}
          </button>
        )}

        {onOpenTerminal && (
          <button
            onClick={onOpenTerminal}
            title={isCollapsed ? 'Enclave Terminal' : undefined}
            className={`w-full flex items-center ${
              isCollapsed ? 'justify-center py-2' : 'space-x-3 px-2 py-1.5'
            } text-[11px] text-[#a1a1aa] hover:text-[#f3be67] transition-colors cursor-pointer`}
          >
            <span className="material-symbols-outlined text-[16px]">terminal</span>
            {!isCollapsed && <span>Terminal</span>}
          </button>
        )}

        {!isCollapsed ? (
          <div className="pt-2 border-t border-[#1c1b1d] flex items-center justify-between font-mono text-[9px] text-[#71717a]">
            <span>SESSION // 0x489F·PROD</span>
            <span>ENC-RSA-4096</span>
          </div>
        ) : (
          <div className="pt-1 text-center font-mono text-[8px] text-[#71717a]">
            0x489F
          </div>
        )}
      </div>
    </aside>
  );
};
