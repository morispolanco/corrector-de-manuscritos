
import React from 'react';
import { Chapter, ChapterStatus } from '../types';
import { CheckIcon, ClockIcon, SparklesIcon, DocumentIcon } from './Icons';
import Spinner from './Spinner';

interface ChapterListProps {
    chapters: Chapter[];
    currentChapterIndex: number | null;
    onSelectChapter: (index: number) => void;
}

const StatusIcon: React.FC<{ status: ChapterStatus }> = ({ status }) => {
    switch (status) {
        case ChapterStatus.PENDING:
            return <ClockIcon className="w-5 h-5 text-slate-500" />;
        case ChapterStatus.PROCESSING:
            return <Spinner size="small" />;
        case ChapterStatus.REVIEWING:
            return <SparklesIcon className="w-5 h-5 text-yellow-400" />;
        case ChapterStatus.DONE:
            return <CheckIcon className="w-5 h-5 text-green-500" />;
        default:
            return <DocumentIcon className="w-5 h-5 text-slate-500" />;
    }
};

const ChapterList: React.FC<ChapterListProps> = ({ chapters, currentChapterIndex, onSelectChapter }) => {
    return (
        <nav>
            <h2 className="text-lg font-semibold mb-4 text-slate-300 px-2">Capítulos</h2>
            <ul className="space-y-1">
                {chapters.map((chapter, index) => (
                    <li key={chapter.id}>
                        <button
                            onClick={() => onSelectChapter(index)}
                            className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors duration-200 ${
                                index === currentChapterIndex
                                    ? 'bg-sky-600/20 text-sky-300'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                            }`}
                        >
                            <StatusIcon status={chapter.status} />
                            <span className="flex-grow font-medium truncate">{chapter.title}</span>
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default ChapterList;
