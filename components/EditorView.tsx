
import React from 'react';
import { Chapter, ChapterStatus } from '../types';
import { SparklesIcon, CheckCircleIcon } from './Icons';
import Spinner from './Spinner';

interface EditorViewProps {
    chapter: Chapter;
    onCorrect: () => void;
    onAccept: () => void;
    improveStyle: boolean;
    onToggleImproveStyle: () => void;
}

const EditorView: React.FC<EditorViewProps> = ({ chapter, onCorrect, onAccept, improveStyle, onToggleImproveStyle }) => {
    const renderControls = () => {
        switch (chapter.status) {
            case ChapterStatus.PENDING:
                return (
                    <div className="flex items-center gap-4">
                        <div className="flex items-center group cursor-pointer" onClick={onToggleImproveStyle}>
                            <input
                                id="improve-style-checkbox"
                                type="checkbox"
                                checked={improveStyle}
                                readOnly
                                className="w-4 h-4 text-sky-600 bg-slate-700 border-slate-500 rounded focus:ring-sky-500 focus:ring-offset-slate-800"
                            />
                            <label htmlFor="improve-style-checkbox" className="ml-2 text-sm font-medium text-slate-300 group-hover:text-sky-400 transition-colors cursor-pointer">
                                Mejorar estilo
                            </label>
                        </div>
                        <button onClick={onCorrect} className="px-6 py-2.5 font-bold text-white bg-gradient-to-r from-sky-500 to-blue-600 rounded-lg hover:from-sky-600 hover:to-blue-700 transition-all duration-300 shadow-lg shadow-blue-500/20 flex items-center gap-2">
                            <SparklesIcon />
                            Corregir capítulo
                        </button>
                    </div>
                );
            case ChapterStatus.PROCESSING:
                 return (
                    <div className="flex items-center gap-3 text-slate-400">
                        <Spinner />
                        <span>Corrigiendo con IA...</span>
                    </div>
                 );
            case ChapterStatus.REVIEWING:
                return (
                    <button onClick={onAccept} className="px-6 py-2.5 font-bold text-white bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all duration-300 shadow-lg shadow-green-500/20 flex items-center gap-2">
                       <CheckCircleIcon />
                       Aceptar y Marcar como Hecho
                    </button>
                );
            case ChapterStatus.DONE:
                return (
                    <div className="px-6 py-2.5 font-bold text-green-400 border border-green-600/50 bg-green-900/30 rounded-lg flex items-center gap-2">
                        <CheckCircleIcon />
                        Corrección completada
                    </div>
                );
            default:
                return null;
        }
    };
    
    return (
        <div className="bg-slate-800/50 rounded-xl h-full flex flex-col">
            <header className="p-4 border-b border-slate-700 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-100">{chapter.title}</h3>
                <div className="flex items-center">
                    {renderControls()}
                </div>
            </header>
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-px bg-slate-700 overflow-y-auto">
                <div className="bg-slate-800 p-4 sm:p-6 overflow-y-auto">
                    <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Original</h4>
                    <pre className="text-slate-300 whitespace-pre-wrap font-sans text-base leading-relaxed">{chapter.originalContent}</pre>
                </div>
                <div className="bg-slate-900 p-4 sm:p-6 overflow-y-auto">
                    <h4 className="text-sm font-semibold text-sky-400 uppercase tracking-wider mb-4">Sugerencia IA</h4>
                    <div className="text-slate-200 whitespace-pre-wrap font-sans text-base leading-relaxed">
                        {chapter.status === ChapterStatus.REVIEWING || chapter.status === ChapterStatus.DONE ? (
                            <pre className="whitespace-pre-wrap font-sans">{chapter.correctedContent}</pre>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-500">
                                <p>Presiona "Corregir" para generar la sugerencia de la IA.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditorView;
