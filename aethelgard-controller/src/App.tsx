import React, { useState } from 'react';
import { NavigationHeader } from './components/NavigationHeader';
import { Sidebar } from './components/Sidebar';
import { PlatformOverview } from './components/screens/PlatformOverview';
import { RuleMatchingScreen } from './components/screens/RuleMatchingScreen';
import { ProcessingRunScreen } from './components/screens/ProcessingRunScreen';
import { RunHistoryScreen } from './components/screens/RunHistoryScreen';
import { ExceptionsScreen } from './components/screens/ExceptionsScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { NewIngestionModal } from './components/modals/NewIngestionModal';
import { BatchDetailModal } from './components/modals/BatchDetailModal';
import { TerminalConsoleModal } from './components/modals/TerminalConsoleModal';
import { DocumentationModal } from './components/modals/DocumentationModal';
import { ScreenId, HistoricalBatch, UploadedFile } from './types';

export function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Active run configuration state for live reconciliation
  const [activeRunConfig, setActiveRunConfig] = useState<{
    tolerance?: number;
    strictZeroPenny?: boolean;
    sourceA?: string;
    sourceB?: string;
    batchName?: string;
    uploadedFiles?: UploadedFile[];
  } | null>(null);

  // Modals state
  const [isNewIngestionOpen, setIsNewIngestionOpen] = useState<boolean>(false);
  const [selectedBatch, setSelectedBatch] = useState<HistoricalBatch | null>(null);
  const [isTerminalOpen, setIsTerminalOpen] = useState<boolean>(false);
  const [isDocsOpen, setIsDocsOpen] = useState<boolean>(false);

  const handleNavigate = (screen: ScreenId) => {
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartReconciliation = (config: {
    tolerance: number;
    strictZeroPenny: boolean;
    uploadedFiles?: UploadedFile[];
    sourceA?: string;
    sourceB?: string;
    batchName?: string;
  }) => {
    const files = config.uploadedFiles || activeRunConfig?.uploadedFiles || [];
    const fileA = files[0]?.name || config.sourceA || activeRunConfig?.sourceA || 'Oracle NetSuite ERP (US-EAST)';
    const fileB = files[1]?.name || config.sourceB || (files.length > 1 ? files[1].name : (activeRunConfig?.sourceB || 'Stripe Payments Settlement (BATCH_#8842)'));

    setActiveRunConfig({
      tolerance: config.tolerance,
      strictZeroPenny: config.strictZeroPenny,
      sourceA: fileA,
      sourceB: fileB,
      batchName: config.batchName || activeRunConfig?.batchName || 'BATCH_#8842-QC-RULESET',
      uploadedFiles: files,
    });
    setCurrentScreen('processing-run');
  };

  const handleLaunchNewIngestion = (batchConfig: {
    batchName: string;
    tolerance: number;
    uploadedFiles: UploadedFile[];
    sourceA?: string;
    sourceB?: string;
    sourceSummary?: string;
  }) => {
    const fileA = batchConfig.uploadedFiles[0]?.name || batchConfig.sourceA || 'Ledger Export 1';
    const fileB = batchConfig.uploadedFiles[1]?.name || batchConfig.sourceB || (batchConfig.uploadedFiles.length > 1 ? batchConfig.uploadedFiles[1].name : 'Direct Clearing Baseline');

    setActiveRunConfig({
      tolerance: batchConfig.tolerance,
      strictZeroPenny: batchConfig.tolerance === 0,
      sourceA: fileA,
      sourceB: fileB,
      batchName: batchConfig.batchName,
      uploadedFiles: batchConfig.uploadedFiles,
    });
    setCurrentScreen('processing-run');
  };

  return (
    <div className="min-h-screen bg-[#0e0e10] text-[#e5e1e4] flex flex-col font-sans selection:bg-[#f3be67] selection:text-[#0e0e10]">
      {/* Top Main Navigation Header */}
      <NavigationHeader
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        onOpenNewIngestion={() => setIsNewIngestionOpen(true)}
        onOpenTerminal={() => setIsTerminalOpen(true)}
        onOpenDocs={() => setIsDocsOpen(true)}
        isProcessingActive={currentScreen === 'processing-run'}
      />

      {/* Main Body Shell (Sidebar + Screen View) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Persistent Desktop Sidebar */}
        <Sidebar
          currentScreen={currentScreen}
          onNavigate={handleNavigate}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onOpenNewIngestion={() => setIsNewIngestionOpen(true)}
          onOpenTerminal={() => setIsTerminalOpen(true)}
          onOpenDocs={() => setIsDocsOpen(true)}
          isProcessingActive={currentScreen === 'processing-run'}
        />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-y-auto min-w-0">
          {currentScreen === 'overview' && (
            <PlatformOverview
              onNavigate={handleNavigate}
              onOpenNewIngestion={() => setIsNewIngestionOpen(true)}
              onOpenTerminal={() => setIsTerminalOpen(true)}
            />
          )}

          {currentScreen === 'rule-matching' && (
            <RuleMatchingScreen
              onNavigate={handleNavigate}
              onStartReconciliation={handleStartReconciliation}
              activeFiles={activeRunConfig?.uploadedFiles || []}
              onUpdateUploadedFiles={(files) => {
                setActiveRunConfig(prev => ({
                  tolerance: prev?.tolerance ?? 50,
                  strictZeroPenny: prev?.strictZeroPenny ?? false,
                  sourceA: files[0]?.name || prev?.sourceA || 'Ledger File 1',
                  sourceB: files[1]?.name || prev?.sourceB || 'Ledger File 2',
                  batchName: prev?.batchName || 'CUSTOM-CONCORDANCE-RUN',
                  uploadedFiles: files,
                }));
              }}
            />
          )}

          {currentScreen === 'processing-run' && (
            <ProcessingRunScreen
              onNavigate={handleNavigate}
              onOpenTerminal={() => setIsTerminalOpen(true)}
              activeBatchConfig={activeRunConfig}
            />
          )}

          {currentScreen === 'run-history' && (
            <RunHistoryScreen
              onNavigate={handleNavigate}
              onSelectBatch={(batch) => setSelectedBatch(batch)}
            />
          )}

          {currentScreen === 'exceptions' && (
            <ExceptionsScreen
              onNavigate={handleNavigate}
              onOpenTerminal={() => setIsTerminalOpen(true)}
            />
          )}

          {currentScreen === 'settings' && (
            <SettingsScreen
              onNavigate={handleNavigate}
              onOpenTerminal={() => setIsTerminalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* MODALS */}
      <NewIngestionModal
        isOpen={isNewIngestionOpen}
        onClose={() => setIsNewIngestionOpen(false)}
        onLaunch={handleLaunchNewIngestion}
      />

      <BatchDetailModal
        batch={selectedBatch}
        onClose={() => setSelectedBatch(null)}
        onViewExceptions={() => {
          setSelectedBatch(null);
          setCurrentScreen('exceptions');
        }}
      />

      <TerminalConsoleModal
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
      />

      <DocumentationModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
        onOpenTerminal={() => setIsTerminalOpen(true)}
      />
    </div>
  );
}

export default App;
