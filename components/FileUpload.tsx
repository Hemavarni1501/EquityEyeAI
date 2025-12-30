import React, { useCallback } from 'react';
import { UploadCloud, FileText, AlertTriangle } from 'lucide-react';
import { UploadedFile } from '../types';

interface FileUploadProps {
  onFileSelect: (file: UploadedFile) => void;
  isLoading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isLoading }) => {
  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate size (max 10MB approx)
    if (file.size > 10 * 1024 * 1024) {
      alert("File is too large. Please upload a document under 10MB.");
      return;
    }

    // Validate type (Images and PDF)
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert("Unsupported file type. Please upload a PDF or Image (PNG/JPG).");
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Extract base64 part
        const base64Data = result.split(',')[1];
        
        onFileSelect({
          name: file.name,
          type: file.type,
          data: base64Data
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error reading file:", error);
      alert("Failed to read file.");
    }
  }, [onFileSelect]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative group cursor-pointer">
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept=".pdf, .png, .jpg, .jpeg"
          onChange={handleFileChange}
          disabled={isLoading}
        />
        <label
          htmlFor="file-upload"
          className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl transition-all duration-300 ${
            isLoading 
              ? 'border-slate-600 bg-slate-800/50 cursor-not-allowed opacity-50' 
              : 'border-slate-600 bg-slate-800/30 hover:bg-slate-800/60 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/10'
          }`}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
            <div className={`p-4 rounded-full mb-4 transition-colors ${isLoading ? 'bg-slate-700' : 'bg-slate-700 group-hover:bg-indigo-900/50 text-indigo-400'}`}>
               <UploadCloud className="w-10 h-10" />
            </div>
            <h3 className="mb-2 text-xl font-serif font-semibold text-white">
              Upload Term Sheet or Agreement
            </h3>
            <p className="mb-4 text-sm text-slate-400 max-w-sm">
              Drag & drop or click to upload. <br/>
              <span className="text-slate-500 text-xs">Supports PDF, PNG, JPG (Max 10MB)</span>
            </p>
            <div className="flex gap-2 text-xs font-medium text-indigo-400 bg-indigo-950/30 px-3 py-1 rounded-full border border-indigo-900/50">
               <FileText size={14} /> 
               <span>Secure Client-Side Processing</span>
            </div>
          </div>
        </label>
      </div>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/40 p-4 rounded-lg border border-slate-700/50">
          <div className="text-indigo-400 mb-2 font-bold text-sm">Step 1</div>
          <div className="text-slate-300 text-sm">Upload your legal document for instant secure analysis.</div>
        </div>
        <div className="bg-slate-800/40 p-4 rounded-lg border border-slate-700/50">
          <div className="text-indigo-400 mb-2 font-bold text-sm">Step 2</div>
          <div className="text-slate-300 text-sm">Gemini 3 Pro identifies "Red Flag" clauses & predatory terms.</div>
        </div>
        <div className="bg-slate-800/40 p-4 rounded-lg border border-slate-700/50">
          <div className="text-indigo-400 mb-2 font-bold text-sm">Step 3</div>
          <div className="text-slate-300 text-sm">Chat live with AI Counsel to redline and negotiate.</div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
