
import React, { useState } from 'react';
import { Mic, Volume2, MonitorPlay, FileInput, Sparkles, Globe, ChevronDown } from 'lucide-react';
import AudioToText from './components/AudioToText';
import TextToAudio from './components/TextToAudio';
import ScreenRecorder from './components/ScreenRecorder';
import FileConverter from './components/FileConverter';
import { AppTab, UILang, TRANSLATIONS } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.AudioToText);
  const [lang, setLang] = useState<UILang>('vi');
  const [showLangMenu, setShowLangMenu] = useState(false);

  const t = TRANSLATIONS[lang];

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 mica border-b border-gray-200">
        <div className="max-w-screen-2xl mx-auto px-8 h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-5">
            <img 
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6xx_-xxD3VLmS5XLZZFmOwh5k2_1MJJVhCw&s" 
              alt="VPTX Logo" 
              className="w-14 h-14 object-contain rounded-xl shadow-sm border border-white/50"
            />
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter text-primary-900 leading-tight">{t.title}</span>
              <span className="text-[11px] font-bold text-primary-600 tracking-widest mt-1 opacity-90">{t.subtitle}</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 p-1 bg-gray-200/40 rounded-2xl">
            {[
              { id: AppTab.AudioToText, icon: <Mic size={18} />, label: t.tabs.stt },
              { id: AppTab.TextToAudio, icon: <Volume2 size={18} />, label: t.tabs.tts },
              { id: AppTab.ScreenRecord, icon: <MonitorPlay size={18} />, label: t.tabs.screen },
              { id: AppTab.Converter, icon: <FileInput size={18} />, label: t.tabs.converter },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-6 h-11 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2.5 ${
                  activeTab === item.id 
                    ? 'bg-primary-900 text-white shadow-lg shadow-primary-900/10 scale-105' 
                    : 'text-gray-500 hover:text-primary-700 hover:bg-white/60'
                }`}
              >
                <span className={activeTab === item.id ? 'text-white' : 'text-gray-400'}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white border border-gray-200 text-gray-700 text-xs font-black transition-all hover:bg-gray-50 hover:border-primary-200 shadow-sm"
              >
                <Globe size={16} className="text-primary-600" />
                <span className="uppercase">{lang}</span>
                <ChevronDown size={14} className={`transition-transform duration-300 ${showLangMenu ? 'rotate-180' : ''}`} />
              </button>
              
              {showLangMenu && (
                <div className="absolute right-0 mt-3 w-48 bg-white/95 backdrop-blur-md rounded-2xl p-2 shadow-2xl border border-gray-100 animate-fade-in origin-top-right">
                  {[
                    { id: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
                    { id: 'en', label: 'English', flag: '🇺🇸' },
                    { id: 'id', label: 'Bahasa Indo', flag: '🇮🇩' },
                  ].map((l) => (
                    <button
                      key={l.id}
                      onClick={() => { setLang(l.id as UILang); setShowLangMenu(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                        lang === l.id ? 'bg-primary-900 text-white' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-xl">{l.flag}</span>
                      <span>{l.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow w-full max-w-screen-2xl mx-auto px-8 py-12 md:py-20">
        {/* Mobile Navigation */}
        <div className="lg:hidden fixed bottom-6 left-6 right-6 z-50 mica rounded-[2.5rem] p-3 shadow-2xl flex justify-around items-center border border-white/50 ring-1 ring-black/5">
           {[
            { id: AppTab.AudioToText, icon: <Mic size={26} /> },
            { id: AppTab.TextToAudio, icon: <Volume2 size={26} /> },
            { id: AppTab.ScreenRecord, icon: <MonitorPlay size={26} /> },
            { id: AppTab.Converter, icon: <FileInput size={26} /> },
          ].map(item => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id)} 
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                activeTab === item.id 
                  ? 'bg-primary-900 text-white shadow-xl scale-110' 
                  : 'text-gray-400 hover:text-primary-600'
              }`}
            >
              {item.icon}
            </button>
          ))}
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16 md:mb-24 animate-fade-in">
          <div className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-primary-50/50 text-primary-900 text-[12px] font-black uppercase tracking-[0.25em] mb-10 border border-primary-100 shadow-sm">
            <Sparkles size={16} className="text-primary-500" /> Professional AI Work Suite
          </div>
          <h1 className="text-4xl md:text-7xl font-black text-gray-900 mb-8 tracking-tighter leading-[1.05]">
            {(t.labels as any)[`heroTitle_${activeTab}`]}
          </h1>
          <p className="text-gray-500 max-w-4xl mx-auto text-lg md:text-2xl leading-relaxed font-normal opacity-90">
            {(t.labels as any)[`heroDesc_${activeTab}`]}
          </p>
        </div>

        {/* Dynamic Component Content */}
        <div className="w-full relative min-h-[600px]">
          {activeTab === AppTab.AudioToText && <AudioToText lang={lang} />}
          {activeTab === AppTab.TextToAudio && <TextToAudio lang={lang} />}
          {activeTab === AppTab.ScreenRecord && <ScreenRecorder lang={lang} />}
          {activeTab === AppTab.Converter && <FileConverter lang={lang} />}
        </div>
      </main>

      <footer className="py-12 border-t border-gray-100 bg-white/40 backdrop-blur-sm text-center">
        <p className="text-gray-400 text-[11px] font-black uppercase tracking-[0.5em] opacity-60">
          © 2026 DATACENTER VPTX • ADVANCED AI SYSTEMS
        </p>
      </footer>
    </div>
  );
};

export default App;
