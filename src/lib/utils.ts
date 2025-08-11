/**
 * Utility functions for the Zenergy application
 */

/**
 * Generate a unique ID
 */
export function generateId(): string {
	return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Format timestamp for display
 */
export function formatTime(date: Date): string {
	return date.toLocaleTimeString([], { 
		hour: '2-digit', 
		minute: '2-digit' 
	});
}

/**
 * Sanitize text input
 */
export function sanitizeText(text: string): string {
	return text
		.trim()
		.replace(/<script[^>]*>.*?<\/script>/gi, '')
		.replace(/<[^>]*>/g, '')
		.slice(0, 2000);
}

/**
 * Debounce function for input handling
 */
export function debounce<T extends (...args: any[]) => any>(
	func: T,
	wait: number
): (...args: Parameters<T>) => void {
	let timeout: NodeJS.Timeout;
	return (...args: Parameters<T>) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
}

/**
 * Check if string is empty or only whitespace
 */
export function isEmpty(str: string): boolean {
	return !str || str.trim().length === 0;
}

/**
 * Truncate text to specified length
 */
export function truncate(text: string, length: number): string {
	if (text.length <= length) return text;
	return text.slice(0, length) + '...';
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch (err) {
		return false;
	}
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number, decimals = 2): string {
	if (bytes === 0) return '0 Bytes';

	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Check if device is mobile
 */
export function isMobile(): boolean {
	return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
		navigator.userAgent
	);
}

/**
 * Scroll element into view smoothly
 */
export function scrollIntoView(element: HTMLElement, behavior: ScrollBehavior = 'smooth'): void {
	element.scrollIntoView({ behavior, block: 'nearest' });
}
