
import { Chapter, ChapterStatus } from '../types';

// This function will be called in the browser, where 'mammoth' is available globally from the script tag
declare const mammoth: any;
// This function will be called in the browser, where 'docx' is available globally from the script tag
declare const docx: any;

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

export const splitIntoChapters = (text: string): Chapter[] => {
    const chapterRegex = /(Cap[íi]tulo\s+\d+|Chapter\s+\d+)/gi;
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
    // The split results in an array like: [content_before_first_chapter, chapter_1_title, chapter_1_content, chapter_2_title, chapter_2_content, ...]
    // We iterate through this structure to form chapter objects.
    for (let i = 1; i < parts.length; i += 2) {
        const title = parts[i].trim();
        const content = parts[i + 1] ? parts[i + 1].trim() : '';

        if (title && content) {
            chapters.push({
                id: `chapter_${i}`,
                title: title,
                originalContent: content,
                correctedContent: '',
                status: ChapterStatus.PENDING
            });
        }
    }
    return chapters;
};

export const exportToDocx = (chapters: { title: string; content: string }[], fileName: string) => {
    const { Document, Packer, Paragraph, HeadingLevel, TextRun } = docx;

    const docChildren = chapters.flatMap(chapter => {
        const title = new Paragraph({
            text: chapter.title,
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 200 },
        });

        const contentParagraphs = chapter.content.split('\n').filter(p => p.trim() !== '').map(paragraphText =>
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
    });
};
