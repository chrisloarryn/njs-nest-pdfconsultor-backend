declare module 'pdf-to-base64' {
	export default function pdfToBase64(pdfUrl: string): Promise<string>;
}
