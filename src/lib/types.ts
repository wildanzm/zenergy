// API types for the chat functionality

export interface ChatMessage {
	id: string;
	content: string;
	isUser: boolean;
	timestamp: Date;
	animate?: boolean;
}

export interface ChatRequest {
	message: string;
	history?: Partial<ChatMessage>[];
	model?: string;
}

export interface ChatResponse {
	response: string;
	model: string;
	timestamp: string;
}

export interface ErrorResponse {
	error: string;
}

// Rate limiting types
export interface RateLimitData {
	count: number;
	resetTime: number;
}

// Component event types
export interface SendMessageEvent {
	message: string;
}

export interface ModelChangeEvent {
	model: string;
}

// AI Model types
export interface AIModel {
	id: string;
	name: string;
	description: string;
}
