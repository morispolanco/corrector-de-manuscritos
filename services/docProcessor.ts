import { Chapter, ChapterStatus } from '../types';
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from 'docx';

// This function will be called in the browser, where 'mammoth' is available globally from the script tag
declare const mammoth: any;

export const parseDocument = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (event) => {
            if (!event.target?.result) {
                return reject(new Error("Failed to read file."));
            }

            try {
                if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
                    const result = await mammoth.extractRawText({ arrayBuffer: event.target.result });
                    resolve(result.value);
                } else if (file.type === "text/plain") {
                    resolve(event.target.result as string);
                } else {
                    reject(new Error("Tipo de archivo no soportado. Por favor, sube un .docx o .txt"));
                }
            } catch (err) {
                reject(err);
            }
        };

        reader.onerror = (error) => reject(error);
        
        if (file.type.startsWith('text/')) {
            reader.readAsText(file);
        } else {
            reader.readAsArrayBuffer(file);
        }
    });
};

const formatChapterTitle = (title: string): string => {
    // This function formats the chapter title to a consistent "Sentence case".
    // e.g., "CAPÍTULO 1: LA GRAN AVENTURA" becomes "Capítulo 1: La gran aventura".
    // This provides a professional and consistent look, though it doesn't preserve
    // capitalization for proper nouns within the subtitle.
    const titleParts = title.split(':');
    const mainPart = titleParts[0].trim();
    
    const formattedMainPart = mainPart.charAt(0).toUpperCase() + mainPart.slice(1).toLowerCase();

    if (titleParts.length > 1) {
        const subtitlePart = titleParts.slice(1).join(':').trim();
        const formattedSubtitlePart = subtitlePart.charAt(0).toUpperCase() + subtitlePart.slice(1).toLowerCase();
        return `${formattedMainPart}: ${formattedSubtitlePart}`;
    }

    return formattedMainPart;
};


export const splitIntoChapters = (text: string): Chapter[] => {
    // This regex captures the entire line starting with "Capítulo" or "Chapter" as the title.
    const chapterRegex = /^(Cap[íi]tulo\s+\d+.*|Chapter\s+\d+.*)/gim;
    const parts = text.split(chapterRegex);

    if (parts.length <= 1) {
        // No chapters found, treat the whole document as one chapter
        return [{
            id: 'full_doc',
            title: 'Documento Completo',
            originalContent: text.trim(),
            correctedContent: '',
            status: ChapterStatus.PENDING
        }];
    }
    
    const chapters: Chapter[] = [];
    // The split results in an array like: [content_before_first_chapter, chapter_1_title, chapter_1_content, ...]
    for (let i = 1; i < parts.length; i += 2) {
        const rawTitle = parts[i].trim();
        const content = parts[i + 1] ? parts[i + 1].trim() : '';

        if (rawTitle && content) {
            chapters.push({
                id: `chapter_${i}`,
                title: formatChapterTitle(rawTitle),
                originalContent: content,
                correctedContent: '',
                status: ChapterStatus.PENDING
            });
        }
    }
    return chapters;
};

const sanitizeTextForDocx = (text: string): string => {
    if (!text) return '';
    // OpenXML spec doesn't allow most control characters.
    // This regex removes control characters but keeps tab, newline, and carriage return.
    // eslint-disable-next-line no-control-regex
    return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');
};

export const exportToDocx = (chapters: { title: string; content: string }[], fileName: string) => {
    const docChildren = chapters.flatMap(chapter => {
        const title = new Paragraph({
            children: [new TextRun(sanitizeTextForDocx(chapter.title))],
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 200 },
        });

        const contentParagraphs = sanitizeTextForDocx(chapter.content).split('\n').filter(p => p.trim() !== '').map(paragraphText =>
            new Paragraph({
                children: [new TextRun(paragraphText)],
                spacing: { after: 150 },
            })
        );
        
        return [title, ...contentParagraphs];
    });

    const doc = new Document({
        sections: [{
            properties: {},
            children: docChildren,
        }],
    });

    Packer.toBlob(doc).then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        document.body.appendChild(a);
        a.style.display = "none";
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    }).catch(error => {
        console.error("Error exporting to .docx file:", error);
        alert("Ocurrió un error al crear el archivo .docx. Por favor, revisa la consola del navegador para más detalles.");
    });
};