// ==========================================
// Error Interfaces
// ==========================================
export interface AiError {
	error: string;
}

// ==========================================
// Release Notes Interfaces
// ==========================================
export interface AiReleaseNoteItem {
	ticket?: string;
	summary: string;
	description?: string;
}

export interface AiReleaseNoteSection {
	title: string;
	items: AiReleaseNoteItem[];
}

export interface AiReleaseNotes {
	version: string;
	date: string;
	sections: AiReleaseNoteSection[];
}

export interface AiReleaseNotesResponse {
	releaseNotes: AiReleaseNotes;
}

// ==========================================
// Estimations Interfaces
// ==========================================
export interface AiWorkPerUser {
	[username: string]: number;
}

export interface AiWeeklyWorkRemaining {
	date: string;
	daysLeft: number;
	howManyDaysOfWorkPerUser: AiWorkPerUser;
}

export interface AiDailyWorkRemaining {
	date: string;
	daysLeft: number;
	whoIsWorking: string[];
}

export interface AiEstimations {
	estimatedCompletionDate: string;
	howManyDaysOfWork: number;
	weeklyWorkRemaining: AiWeeklyWorkRemaining[];
	dailyWorkRemaining: AiDailyWorkRemaining[];
	reasoning: string;
}

// ==========================================
// Slack Summary Interfaces
// ==========================================
export interface AiSlackSummary {
	summary: string;
}

export interface AiSlackSummaryResponseWrapper {
	response: AiSlackSummary;
	modelUsed: string;
}

// ==========================================
// API Response Interfaces
// ==========================================
export interface AiReleaseNotesResponseWrapper {
	response: AiReleaseNotesResponse;
	modelUsed: string;
}

export interface AiEstimationsResponseWrapper {
	response: AiEstimations;
	modelUsed: string;
}

export interface AiApiResponse {
	response: AiReleaseNotesResponse | AiEstimations | AiError;
	modelUsed: string;
}
