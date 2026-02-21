
import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, RefreshCcw } from 'lucide-react';
import Button from './Button';
import { TRANSLATIONS, UILang } from '../types';

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  disabled?: boolean;
  lang: UILang;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onRecordingComplete, disabled, lang }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  
  const t = TRANSLATIONS[lang];
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (audioURL) URL.revokeObjectURL(audioURL);
    };
  }, [audioURL]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        onRecordingComplete(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const resetRecording = () => {
    setAudioURL(null);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (audioURL) {
    return (
      <div className="flex flex-col items-center gap-6 p-8 bg-gray-50/50 rounded-3xl border border-gray-100 w-full shadow-inner animate-fade-in h-full justify-center">
        <audio src={audioURL} controls className="w-full h-12 invert brightness-0" />
        <button onClick={resetRecording} className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-primary-900 hover:text-black transition-colors">
          <RefreshCcw size={14} />
          <span>{t.labels.reRecord}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 h-full min-h-[160px]">
       {isRecording ? (
         <div className="text-center animate-fade-in flex flex-col items-center">
            <div className="flex items-center justify-center gap-2.5 mb-6">
              <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse shadow-lg shadow-red-200"></span>
              <div className="text-4xl font-black text-gray-900 font-mono tracking-tighter">
                {formatTime(recordingTime)}
              </div>
            </div>
            <button 
              onClick={stopRecording} 
              className="h-14 px-10 rounded-2xl shadow-xl shadow-red-100 font-black text-xs uppercase tracking-widest bg-red-600 hover:bg-red-700 text-white flex items-center gap-2.5 transition-all"
            >
              <Square size={16} />
              <span>{t.labels.stopSave.split(' ')[0]}</span>
            </button>
         </div>
       ) : (
         <div className="text-center animate-fade-in flex flex-col items-center">
           <button 
             onClick={startRecording} 
             disabled={disabled}
             className="w-20 h-20 rounded-full bg-white border-4 border-primary-50 flex items-center justify-center text-primary-900 shadow-xl transition-all hover:scale-110 active:scale-95 group relative"
           >
             <div className="absolute inset-0 bg-primary-900/5 rounded-full scale-125 group-hover:scale-150 transition-transform duration-500"></div>
             <Mic size={32} className="relative z-10" />
           </button>
           <p className="mt-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">TAP TO RECORD</p>
         </div>
       )}
    </div>
  );
};

export default AudioRecorder;
