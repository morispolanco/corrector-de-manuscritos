
import React, { useState, useCallback, useMemo } from 'react';
import { Chapter, ChapterStatus, AppState } from './types';
import { parseDocument, splitIntoChapters, exportToDocx } from './services/docProcessor';
import { correctText } from './services/geminiService';
import FileUploader from './components/FileUploader';
import ChapterList from './components/ChapterList';
import EditorView from './components/EditorView';
import { ExportIcon } from './components/Icons';
import Spinner from './components/Spinner';

const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>(AppState.IDLE);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [currentChapterIndex, setCurrentChapterIndex] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [improveStyle, setImproveStyle] = useState<boolean>(true);

    const handleFileProcess = useCallback(async (file: File) => {
        setAppState(AppState.PROCESSING);
        setError(null);
        try {
            const text = await parseDocument(file);
            const chapterData = splitIntoChapters(text);
            
            if (chapterData.length === 0) {
                setError("No se pudieron detectar capítulos. Asegúrese de que el documento use marcadores como 'Capítulo 1'.");
                setAppState(AppState.IDLE);
                return;
            }

            setChapters(chapterData);
            setCurrentChapterIndex(0);
            setAppState(AppState.REVIEWING);
        } catch (err) {
            console.error("Error processing file:", err);
            setError(err instanceof Error ? err.message : "Un error desconocido ocurrió durante el procesamiento del archivo.");
            setAppState(AppState.IDLE);
        }
    }, []);

    const handleCorrectChapter = useCallback(async (chapterIndex: number) => {
        const chapterToCorrect = chapters[chapterIndex];
        if (!chapterToCorrect || chapterToCorrect.status === ChapterStatus.DONE) return;

        setChapters(prev => prev.map((ch, idx) => idx === chapterIndex ? { ...ch, status: ChapterStatus.PROCESSING } : ch));

        try {
            const correctedContent = await correctText(chapterToCorrect.originalContent, improveStyle);
            setChapters(prev => prev.map((ch, idx) => idx === chapterIndex ? { ...ch, correctedContent: correctedContent, status: ChapterStatus.REVIEWING } : ch));
        } catch (err) {
            console.error("Error correcting text:", err);
            setError(err instanceof Error ? err.message : "Error al contactar con la IA.");
            setChapters(prev => prev.map((ch, idx) => idx === chapterIndex ? { ...ch, status: ChapterStatus.PENDING } : ch));
        }
    }, [chapters, improveStyle]);

    const handleAcceptCorrection = (chapterIndex: number) => {
        setChapters(prev => prev.map((ch, idx) => idx === chapterIndex ? { ...ch, status: ChapterStatus.DONE } : ch));
    };

    const handleExport = () => {
        const correctedChapters = chapters.map(ch => ({
            title: ch.title,
            // Use corrected content if available and accepted, otherwise use original
            content: ch.status === ChapterStatus.DONE && ch.correctedContent ? ch.correctedContent : ch.originalContent
        }));
        exportToDocx(correctedChapters, "Manuscrito_Corregido.docx");
    };
    
    const allChaptersDone = useMemo(() => chapters.length > 0 && chapters.every(ch => ch.status === ChapterStatus.DONE), [chapters]);

    const renderContent = () => {
        switch (appState) {
            case AppState.PROCESSING:
                return (
                    <div className="flex flex-col items-center justify-center h-full">
                        <Spinner />
                        <p className="mt-4 text-lg text-slate-400">Procesando documento...</p>
                    </div>
                );
            case AppState.REVIEWING:
                const currentChapter = currentChapterIndex !== null ? chapters[currentChapterIndex] : null;
                return (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 h-full">
                        <div className="md:col-span-1 h-full overflow-y-auto bg-slate-950/50 rounded-lg p-4">
                           <ChapterList
                                chapters={chapters}
                                currentChapterIndex={currentChapterIndex}
                                onSelectChapter={setCurrentChapterIndex}
                           />
                        </div>
                        <div className="md:col-span-3 h-full overflow-y-auto">
                           {currentChapter && currentChapterIndex !== null && (
                                <EditorView
                                    chapter={currentChapter}
                                    onCorrect={() => handleCorrectChapter(currentChapterIndex)}
                                    onAccept={() => handleAcceptCorrection(currentChapterIndex)}
                                    improveStyle={improveStyle}
                                    onToggleImproveStyle={() => setImproveStyle(prev => !prev)}
                                />
                           )}
                        </div>
                    </div>
                );
            case AppState.IDLE:
            default:
                return <FileUploader onFileProcess={handleFileProcess} error={error} />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col p-4 sm:p-6 lg:p-8">
            <header className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700">
                <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
                    Corrector de Manuscritos IA
                </h1>
                {appState === AppState.REVIEWING && (
                    <button
                        onClick={handleExport}
                        disabled={!allChaptersDone}
                        className={`flex items-center gap-2 px-4 py-2 font-semibold rounded-md transition-all duration-300 ${
                            allChaptersDone
                                ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-600/20'
                                : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                        }`}
                    >
                        <ExportIcon />
                        Exportar .docx
                    </button>
                )}
            </header>
            <main className="flex-grow overflow-hidden">
                {renderContent()}
            </main>
        </div>
    );
};

export default App;
