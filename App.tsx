import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import AuditReport from './components/AuditReport';
import ChatInterface from './components/ChatInterface';
import { AppState, AuditResult, ChatMessage, UploadedFile } from './types';
import { analyzeDocument, initializeChat, sendMessageToChat } from './services/geminiService';
import { Shield, ChevronLeft, Scale } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatProcessing, setIsChatProcessing] = useState(false);

  const handleFileSelect = async (selectedFile: UploadedFile) => {
    setFile(selectedFile);
    setAppState(AppState.ANALYZING);

    try {
      const reportText = await analyzeDocument(selectedFile);
      setAuditResult({ fullReport: reportText });
      
      // Initialize chat with the file context
      await initializeChat(selectedFile, reportText);
      
      setAppState(AppState.RESULTS);
    } catch (error) {
      console.error("Analysis failed:", error);
      setAppState(AppState.ERROR);
    }
  };

  const handleSendMessage = async (msgText: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: msgText,
      timestamp: Date.now()
    };
    
    setChatMessages(prev => [...prev, newMessage]);
    setIsChatProcessing(true);

    try {
      const responseText = await sendMessageToChat(msgText);
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: responseText,
        timestamp: Date.now()
      };
      
      setChatMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat failed:", error);
      // Ideally handle error in UI
    } finally {
      setIsChatProcessing(false);
    }
  };

  const resetApp = () => {
    setAppState(AppState.IDLE);
    setFile(null);
    setAuditResult(null);
    setChatMessages([]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Scale className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-white tracking-wide">EquityEye AI</h1>
              <p className="text-[10px] text-indigo-400 uppercase tracking-widest font-semibold">Venture Counsel</p>
            </div>
          </div>
          
          {appState === AppState.RESULTS && (
            <button 
              onClick={resetApp}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft size={16} />
              <span>Audit New Document</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {appState === AppState.IDLE && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 animate-in fade-in duration-700">
            <div className="text-center mb-10 max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-white leading-tight">
                Protect Your Cap Table <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">Before You Sign</span>
              </h1>
              <p className="text-lg text-slate-400">
                The world's first AI Senior Associate. <br/>
                Instantly audit term sheets for predatory clauses using Gemini 3 Pro reasoning.
              </p>
            </div>
            <FileUpload onFileSelect={handleFileSelect} isLoading={false} />
          </div>
        )}

        {appState === AppState.ANALYZING && (
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="max-w-md w-full text-center">
              <div className="mb-8 relative mx-auto w-24 h-24">
                 <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                 <div className="absolute inset-0 border-4 border-t-indigo-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                 <div className="absolute inset-0 flex items-center justify-center">
                   <Shield className="w-8 h-8 text-indigo-500 thinking-pulse" />
                 </div>
              </div>
              <h2 className="text-2xl font-serif font-bold mb-2">Auditing Document</h2>
              <p className="text-slate-400 mb-6">Gemini 3 Pro is analyzing clause hierarchies and benchmarking against 2025 Market Standards...</p>
              
              <div className="bg-slate-900 rounded-lg p-4 border border-slate-800 text-left space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-300">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                   <span>OCR Processing & Text Extraction</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse delay-75"></div>
                   <span>Identifying Liquidation Preferences</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse delay-150"></div>
                   <span>Checking Control Provisions</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse delay-300"></div>
                   <span>Generating Negotiation Scripts</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {appState === AppState.RESULTS && auditResult && (
          <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden">
            {/* Report Section */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
               <div className="max-w-4xl mx-auto space-y-8">
                 <AuditReport content={auditResult.fullReport} />
               </div>
            </div>

            {/* Chat Section - Hidden on mobile initially or togglable, simplified here as split view on desktop */}
            <div className="hidden md:flex border-l border-slate-800 shadow-xl z-20">
               <ChatInterface 
                 messages={chatMessages} 
                 onSendMessage={handleSendMessage} 
                 isProcessing={isChatProcessing} 
               />
            </div>
          </div>
        )}

        {appState === AppState.ERROR && (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center max-w-md">
              <div className="bg-red-900/20 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Analysis Failed</h2>
              <p className="text-slate-400 mb-6">There was an issue processing your document. Please ensure you are using a valid API key and the document is clear.</p>
              <button 
                onClick={resetApp}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
