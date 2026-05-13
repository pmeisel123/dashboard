// Minimal test environment polyfills for vitest/jsdom
// Provide ResizeObserver and localStorage if not present
import React from "react";
import { vi } from "vitest";

// Variables MUST start with the prefix "mock" to be accessible inside vi.mock() factories
const mockEmptyFragment = React.createElement(React.Fragment);
const mockComponent = (props: any) => props.children || null;

if (typeof (globalThis as any).ResizeObserver === "undefined") {
	class ResizeObserverMock {
		observe() {}
		unobserve() {}
		disconnect() {}
	}
	(globalThis as any).ResizeObserver = ResizeObserverMock;
}

if (typeof window !== "undefined") {
	if (!window.localStorage) {
		const store: Record<string, string> = {};
		window.localStorage = {
			getItem(key: string) {
				return store[key] ?? null;
			},
			setItem(key: string, value: string) {
				store[key] = String(value);
			},
			removeItem(key: string) {
				delete store[key];
			},
			clear() {
				Object.keys(store).forEach((k) => delete store[k]);
			},
			get length() {
				return Object.keys(store).length;
			},
			key(index: number) {
				return Object.keys(store)[index] ?? null;
			},
		} as Storage;
	}
}

// Ensure NODE_ENV is test
if (typeof process !== "undefined" && process.env) {
	process.env.NODE_ENV = process.env.NODE_ENV || "test";
}

// --- Mock heavy modules that slow down imports ---

vi.mock("@mui/material", async (importOriginal) => {
	if (process.env.SKIP_TEST_MOCKS === "1") return await importOriginal();

	// Custom dummy styled utility that returns a chainable function to support:
	// const MyComponent = styled(Component)(() => ({}))
	const dummyStyled = (Component: any, options?: any) => {
		return (styles: any) => mockComponent;
	};

	return {
		Box: mockComponent,
		Typography: mockComponent,
		Button: mockComponent,
		Grid: mockComponent,
		FormControl: mockComponent,
		InputLabel: mockComponent,
		MenuItem: mockComponent,
		Select: mockComponent,
		FormControlLabel: mockComponent,
		FormGroup: mockComponent,
		Checkbox: mockComponent,
		Paper: mockComponent,
		Table: mockComponent,
		TableBody: mockComponent,
		TableContainer: mockComponent,
		TableHead: mockComponent,
		TableRow: mockComponent,
		TableCell: mockComponent,
		TextField: mockComponent,
		Alert: mockComponent,
		Tab: mockComponent,
		LinearProgress: mockComponent,
		styled: dummyStyled, // Fixes the "No styled export is defined" error
		__esModule: true,
	};
});

vi.mock("@mui/lab", async (importOriginal) => {
	if (process.env.SKIP_TEST_MOCKS === "1") return await importOriginal();
	return {
		TabContext: mockComponent,
		TabList: mockComponent,
		TabPanel: mockComponent,
		__esModule: true,
	};
});

vi.mock("@mui/icons-material", async (importOriginal) => {
	if (process.env.SKIP_TEST_MOCKS === "1") return await importOriginal();
	return { Delete: mockComponent, __esModule: true };
});

vi.mock("@tiptap/react", async (importOriginal) => {
	if (process.env.SKIP_TEST_MOCKS === "1") return await importOriginal();
	return { useEditor: () => null, EditorContent: mockComponent, __esModule: true };
});

vi.mock("@tiptap/starter-kit", async (importOriginal) => {
	if (process.env.SKIP_TEST_MOCKS === "1") return await importOriginal();
	return {};
});

vi.mock("mui-tiptap", async (importOriginal) => {
	if (process.env.SKIP_TEST_MOCKS === "1") return await importOriginal();
	return {
		MenuButtonBold: mockComponent,
		MenuButtonItalic: mockComponent,
		MenuButtonStrikethrough: mockComponent,
		MenuControlsContainer: mockComponent,
		MenuDivider: mockComponent,
		MenuSelectHeading: mockComponent,
		RichTextEditorProvider: ({ children }: any) => children || null,
		RichTextField: mockComponent,
		__esModule: true,
	};
});

vi.mock("fuse.js", async (importOriginal) => {
	if (process.env.SKIP_TEST_MOCKS === "1") return await importOriginal();

	class FuseMock {
		list: any[];
		constructor(list: any[] = []) {
			this.list = list;
		}
		search(_term: string) {
			return this.list.map((item: any) => ({ item }));
		}
	}

	// Wrapped inside a 'default' export container to resolve the Class crash
	return {
		default: FuseMock,
		__esModule: true,
	};
});

vi.mock("react-textfit", async (importOriginal) => {
	if (process.env.SKIP_TEST_MOCKS === "1") return await importOriginal();
	return { Textfit: mockComponent, __esModule: true };
});

vi.mock("@mui/x-data-grid", async (importOriginal) => {
	if (process.env.SKIP_TEST_MOCKS === "1") return await importOriginal();
	return { DataGrid: (props: any) => null, useGridApiRef: () => null, __esModule: true };
});

vi.mock("@hebcal/core", async (importOriginal) => {
	if (process.env.SKIP_TEST_MOCKS === "1") return await importOriginal();
	return {
		HebrewCalendar: { calendar: (_opts: any) => [] },
		Location: { lookup: (_name: string) => ({}) },
		__esModule: true,
	};
});

vi.mock("date-holidays", async (importOriginal) => {
	if (process.env.SKIP_TEST_MOCKS === "1") return await importOriginal();

	class DateHolidaysMock {
		constructor(_country?: string) {}
		getHolidays(_year?: string) {
			return [];
		}
		init() {}
	}

	// Wrapped inside a 'default' export container to resolve the Class crash
	return {
		default: DateHolidaysMock,
		__esModule: true,
	};
});

vi.mock("@src/Components/Duck/const", async (importOriginal) => {
	if (process.env.SKIP_TEST_MOCKS === "1") return await importOriginal();
	return { cleanHolidayName: (s: string) => s, getHolidayDuck: (_day: string) => ["", null], __esModule: true };
});

vi.mock("@src/Api", async (importOriginal) => {
	if (process.env.SKIP_TEST_MOCKS === "1") return await importOriginal();
	return {
		getAllHolidays: (..._args: any[]) => [],
		getAllUsHolidays: (..._args: any[]) => [],
		getHolidays: (..._args: any[]) => [],
		getDate: (..._args: any[]) => new Date(Date.now()),
		getDateDistance: (..._args: any[]) => "",
		getDateStringWithDayOfWeek: (..._args: any[]) => "",
		fetchBranches: (..._args: any[]) => ({ type: "mock" }),
		fetchConfig: (..._args: any[]) => ({ type: "mock" }),
		fetchLatestRelease: (..._args: any[]) => ({ type: "mock" }),
		fetchReleases: (..._args: any[]) => ({ type: "mock" }),
		fetchTickets: (..._args: any[]) => Promise.resolve({ payload: [] }),
		getBranchesCompare: async (..._args: any[]) => [],
		isSliceRecent: (..._args: any[]) => true,
		GetBranchCreator: (..._args: any[]) => null,
		GetModulePages: () => [],
		__esModule: true,
	};
});

// Global Registry Mock Override
vi.mock("@src/Pages/pageRegistry", async (importOriginal) => {
	if (process.env.SKIP_TEST_MOCKS === "1") return await importOriginal();

	console.log("--- @src/Pages/pageRegistry is successfully mocked globally! ---");

	return {
		getDynamicPages: () => [
			{
				path: "/Branches",
				name: "Branches",
				requires: "GIT_REPOS_PATHS",
				description: mockEmptyFragment,
				element: mockEmptyFragment,
			},
			{
				path: "/BranchesCompare",
				name: "Compare Branches",
				requires: "GIT_REPOS_PATHS",
				description: mockEmptyFragment,
				element: mockEmptyFragment,
			},
			{ path: "/Dashboard", name: "Dashboards", description: mockEmptyFragment, element: mockEmptyFragment },
			{
				path: "/Date",
				name: "Date",
				requires: "false",
				description: mockEmptyFragment,
				element: mockEmptyFragment,
			},
			{
				path: "/ducks",
				name: "Ducks",
				requires: "false",
				description: mockEmptyFragment,
				element: mockEmptyFragment,
			},
			{ path: "/EditConfig", name: "Edit Config", description: mockEmptyFragment, element: mockEmptyFragment },
			{
				path: "/EditList",
				name: "Edit List",
				requires: "false",
				description: mockEmptyFragment,
				element: mockEmptyFragment,
			},
			{
				path: "/Vacations",
				name: "Edit Vacations",
				requires: "ALLOW_VACATION_EDITS",
				description: mockEmptyFragment,
				element: mockEmptyFragment,
			},
			{
				path: "/Estimator",
				name: "Estimator",
				requires: "APIURL",
				description: mockEmptyFragment,
				element: mockEmptyFragment,
			},
			{ path: "/Holidays", name: "Holidays", description: mockEmptyFragment, element: mockEmptyFragment },
			{ path: "/", name: "Home", description: mockEmptyFragment, element: mockEmptyFragment },
			{
				path: "/MyTickets",
				name: "My Tickets",
				requires: "APIURL",
				description: mockEmptyFragment,
				element: mockEmptyFragment,
			},
			{
				path: "/NextHoliday",
				name: "Next Holiday",
				requires: "false",
				description: mockEmptyFragment,
				element: mockEmptyFragment,
			},
			{
				path: "/RecentTickets",
				name: "Recent Tickets",
				requires: "APIURL",
				description: mockEmptyFragment,
				element: mockEmptyFragment,
			},
			{
				path: "/Text",
				name: "Text",
				requires: "false",
				description: mockEmptyFragment,
				element: mockEmptyFragment,
			},
			{
				path: "/Wiki",
				name: "Wiki Page",
				requires: "API_CONFLUENCE_URL",
				description: mockEmptyFragment,
				element: mockEmptyFragment,
			},
		],
		pageTestRequires: (test: string | undefined, config: any): boolean => {
			if (!test) return true;
			if (test === "false") return false;
			if (test === "APIURL") return !!config.API_URL;
			if (test === "ALLOW_VACATION_EDITS") return !!(config.ALLOW_VACATION_EDITS && config.API_URL);
			if (test === "API_CONFLUENCE_URL") return !!config.API_CONFLUENCE_URL;
			if (test === "GIT_REPOS_PATHS")
				return !!(config.GIT_REPOS_PATHS && Object.keys(config.GIT_REPOS_PATHS).length);
			return true;
		},
	};
});
