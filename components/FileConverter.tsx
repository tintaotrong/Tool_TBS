
import React, { useState } from 'react';
import { Upload, FileText, FileSpreadsheet, Presentation, Check, Download, AlertCircle, FileType, CheckCircle } from 'lucide-react';
import Button from './Button';
import { analyzeDocument } from '../services/geminiService';
import { blobToBase64 } from '../utils/audioUtils';
import { UILang, TRANSLATIONS } from '../types';

type TargetFormat = 'word' | 'excel' | 'ppt';
interface Props { lang: UILang }

const FileConverter: React.FC<Props> = ({ lang }) => {
  const [file, setFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<TargetFormat>('word');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const t = TRANSLATIONS[lang];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult('');
      setError(null);
    }
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsLoading(true);
    setError(null);
    setResult('');
    try {
      const base64 = await blobToBase64(file);
      const convertedText = await analyzeDocument(base64, file.type, targetFormat);
      setResult(convertedText);
    } catch (err: any) {
      setError(err.message || "Conversion failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    let mimeType = 'text/plain';
    let extension = 'txt';
    let content = result;

    if (targetFormat === 'excel') {
      mimeType = 'application/vnd.ms-excel';
      extension = 'xls';
      content = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><body>${result}</body></html>`;
    } else if (targetFormat === 'word') {
      mimeType = 'application/msword';
      extension = 'doc';
      content = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'></head><body>${result}</body></html>`;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `VPTX_AI_Converted_${Date.now()}.${extension}`;
    link.click();
  };

  return (
    <div className="max-w-screen-xl mx-auto space-y-12 animate-fade-in px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="card-premium p-10 rounded-[2.5rem] flex flex-col">
          <h3 className="text-lg font-black text-gray-900 mb-10 flex items-center gap-4 uppercase tracking-tighter">
            <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-900 shadow-sm border border-primary-100">
              <Upload size={24} />
            </div>
            {t.labels.convStep1}
          </h3>
          <div className="relative flex-grow">
            <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
            <div className={`border-2 border-dashed rounded-[2rem] p-10 text-center transition-all h-full flex flex-col items-center justify-center min-h-[300px] ${file ? 'border-primary-900 bg-primary-50/20 shadow-inner' : 'border-gray-200 hover:border-primary-200 hover:bg-primary-50/10'}`}>
              {file ? (
                 <div className="text-primary-900 flex flex-col items-center animate-fade-in">
                   <FileType size={64} className="mb-4 text-primary-900" />
                   <span className="truncate max-w-[240px] font-black text-base">{file.name}</span>
                   <span className="text-[10px] uppercase font-bold text-gray-400 mt-2">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                 </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100"><Upload size={24} className="text-gray-300" /></div>
                  <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">{t.labels.uploadArea}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card-premium p-10 rounded-[2.5rem] flex flex-col">
          <h3 className="text-lg font-black text-gray-900 mb-10 flex items-center gap-4 uppercase tracking-tighter">
            <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-900 shadow-sm border border-primary-100">
              <FileType size={24} />
            </div>
            {t.labels.convStep2}
          </h3>
          <div className="space-y-5 flex-grow">
            {[
              { id: 'word', icon: <FileText />, label: 'Microsoft Word', desc: 'Preserve tables & layout', color: 'blue' },
              { id: 'excel', icon: <FileSpreadsheet />, label: 'Microsoft Excel', desc: 'Extract data grid', color: 'emerald' },
              { id: 'ppt', icon: <Presentation />, label: 'PowerPoint Outline', desc: 'Generate slide deck ideas', color: 'orange' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setTargetFormat(f.id as TargetFormat)}
                className={`w-full p-6 rounded-3xl border-2 flex items-center gap-6 transition-all duration-300 ${
                  targetFormat === f.id ? 'border-primary-900 bg-primary-50 shadow-md scale-105' : 'border-gray-50 hover:bg-gray-50'
                }`}
              >
                <div className="p-4 rounded-2xl bg-white shadow-sm border border-gray-100 text-primary-900">{f.icon}</div>
                <div className="text-left">
                  <div className="font-black text-gray-800 text-lg">{f.label}</div>
                  <div className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">{f.desc}</div>
                </div>
                {targetFormat === f.id && <Check size={24} className="ml-auto text-primary-900" />}
              </button>
            ))}
          </div>
          <button 
            onClick={handleConvert} 
            disabled={!file || isLoading} 
            className={`mt-10 h-16 w-full rounded-2xl font-black text-base shadow-xl transition-all flex items-center justify-center gap-3 ${
              !file || isLoading ? 'bg-gray-200 text-gray-400' : 'bg-primary-900 text-white hover:bg-primary-800 shadow-primary-900/10'
            }`}
          >
            {isLoading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : null}
            <span>{t.labels.startBtn.toUpperCase()}</span>
          </button>
        </div>
      </div>

      {result && (
        <div className="bg-white rounded-[3rem] shadow-2xl border border-primary-100 p-12 text-center max-w-2xl mx-auto animate-slide-up">
          <div className="w-24 h-24 bg-primary-50 text-primary-900 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner ring-4 ring-primary-100">
            <CheckCircle size={56} />
          </div>
          <h3 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter">{t.labels.complete}</h3>
          <p className="text-gray-500 font-medium mb-10">Your document has been processed successfully.</p>
          <button 
            onClick={handleDownload} 
            className="w-full h-16 bg-primary-900 text-white rounded-3xl text-base font-black shadow-2xl hover:bg-primary-800 flex items-center justify-center gap-3 transition-all"
          >
            <Download size={24} />
            <span>{t.labels.downloadBtn.toUpperCase()}</span>
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 p-8 rounded-3xl flex items-center gap-6 border border-red-100 animate-fade-in max-w-2xl mx-auto">
          <AlertCircle size={28} />
          <p className="text-base font-bold uppercase tracking-tight">{error}</p>
        </div>
      )}
    </div>
  );
};

export default FileConverter;
