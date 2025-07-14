
import React, { useCallback, useState } from 'react';
import { UploadIcon, AlertIcon } from './Icons';

interface FileUploaderProps {
    onFileProcess: (file: File) => void;
    error: string | null;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileProcess, error }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleFile = useCallback((file: File | null) => {
        if (file && (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.type === "text/plain")) {
            onFileProcess(file);
        } else {
            alert("Por favor, sube un archivo .docx o .txt válido.");
        }
    }, [onFileProcess]);

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full w-full">
            <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`w-full max-w-2xl p-8 sm:p-12 border-2 border-dashed rounded-xl transition-colors duration-300 ease-in-out ${isDragging ? 'border-sky-400 bg-slate-800/50' : 'border-slate-600 hover:border-sky-500 bg-slate-800/20'}`}
            >
                <div className="flex flex-col items-center text-center">
                    <UploadIcon className="w-16 h-16 text-slate-500 mb-4" />
                    <h2 className="text-xl font-semibold text-slate-200">Arrastra y suelta tu manuscrito</h2>
                    <p className="text-slate-400 mt-2">o</p>
                    <label htmlFor="file-upload" className="mt-4 px-6 py-2 bg-sky-600 text-white font-bold rounded-md cursor-pointer hover:bg-sky-500 transition-colors">
                        Selecciona un archivo
                    </label>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".docx, .txt" onChange={handleFileChange} />
                    <p className="mt-4 text-sm text-slate-500">Soporta archivos .docx y .txt</p>
                </div>
            </div>
            {error && (
                <div className="mt-6 w-full max-w-2xl bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg flex items-center">
                    <AlertIcon className="w-5 h-5 mr-3" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
};

export default FileUploader;
