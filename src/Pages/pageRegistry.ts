import type { ConfigProps } from "@src/Api";

interface PageModule {
	GetModulePages?: () => any[];
}

// Robust test environment flag detection
const isTestEnv =
	(typeof globalThis !== "undefined" && !!(globalThis as any).__vitest__) ||
	(typeof process !== "undefined" &&
		process.env &&
		(process.env.NODE_ENV === "test" || process.env.VITEST === "true"));

export const getDynamicPages = (): any[] => {
	if (isTestEnv) {
		// Return early during tests so that components do not fall into the production block
		return [];
	} else {
		const modules = import.meta.glob<PageModule>("./*/index.tsx", { eager: true });

		return Object.entries(modules).flatMap(([path, mod]) => {
			if (typeof mod?.GetModulePages === "function") {
				return mod.GetModulePages();
			}

			const moduleName = path.split("/")[1];
			console.warn("No GetModulePages found in module: " + moduleName);
			return [];
		});
	}
};

export const pageTestRequires = (test: string | undefined, config: ConfigProps): boolean => {
	if (!test) {
		return true;
	}
	if (test === "false") {
		return false;
	}
	if (test === "APIURL") {
		return !!config.API_URL;
	}
	if (test === "ALLOW_VACATION_EDITS") {
		return !!(config.ALLOW_VACATION_EDITS && config.API_URL);
	}
	if (test === "API_CONFLUENCE_URL") {
		return !!config.API_CONFLUENCE_URL;
	}
	if (test === "GIT_REPOS_PATHS") {
		return !!(config.GIT_REPOS_PATHS && Object.keys(config.GIT_REPOS_PATHS).length);
	}
	return true;
};
