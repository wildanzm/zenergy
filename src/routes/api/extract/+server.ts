import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfParseModule = require('pdf-parse');
const officeParser = require('officeparser');

const pdfParse = typeof pdfParseModule === 'function' 
	? pdfParseModule 
	: pdfParseModule.default || pdfParseModule.PDFParse || pdfParseModule;

export const POST = async ({ request }: RequestEvent) => {
	try {
		const data = await request.formData();
		const file = data.get('file') as File | null;

		if (!file) {
			return json({ error: 'No file provided' }, { status: 400 });
		}

		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		const fileName = file.name.toLowerCase();

		// Check if PDF
		if (file.type === 'application/pdf' || fileName.endsWith('.pdf')) {
			try {
				// Try modern class-based API first
				const parser = new (pdfParse as any)(new Uint8Array(buffer));
				await parser.load();
				const text = await parser.getText();
				return json({ 
					text: text,
					pages: parser.doc ? parser.doc.numPages : undefined,
					type: 'pdf'
				});
			} catch (fallbackError: any) {
				if (fallbackError.message?.includes('is not a constructor') || fallbackError instanceof TypeError) {
					// Fallback to legacy function API if not a class
					const pdfData = await (pdfParse as any)(buffer);
					return json({ 
						text: pdfData.text,
						info: pdfData.info,
						pages: pdfData.numpages,
						type: 'pdf'
					});
				}
				throw fallbackError;
			}
		}

		// Check if Office Document
		const isOfficeDoc = fileName.match(/\.(docx|pptx|xlsx|doc|ppt|xls|odt|odp|ods)$/i);
		if (isOfficeDoc) {
			const text = await officeParser.parseOffice(buffer);
			return json({ 
				text: text,
				type: 'office'
			});
		}

		return json({ error: 'Unsupported file type for extraction endpoint' }, { status: 400 });

	} catch (error: any) {
		console.error('Error extracting document:', error);
		return json({ error: error.message || 'Failed to extract document content' }, { status: 500 });
	}
};
