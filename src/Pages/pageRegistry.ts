import type { ConfigProps } from "@src/Api";

interface PageModule {
	GetModulePages?: () => any[];
}

const modules = import.meta.glob<PageModule>("./*/index.tsx", { eager: true });

export const getDynamicPages = (): any[] => {
	return Object.entries(modules).flatMap(([path, mod]) => {
		if (typeof mod?.GetModulePages === "function") {
			return mod.GetModulePages();
		} else {
			const moduleName = path.split("/")[1];
			console.warn("No GetModulePages found in module: " + moduleName);
		}
		return [];
	});
};

export const pageTestRequires = (test: string, config: ConfigProps): boolean => {
	if (!test) {
		return true;
	}
	if (test == "false") {
		return false;
	}
	if (test == "APIURL") {
		return !!config.API_URL;
	}
	if (test == "ALLOW_VACATION_EDITS") {
		return config.ALLOW_VACATION_EDITS && !!config.API_URL;
	}
	if (test == "API_CONFLUENCE_URL") {
		return !!config.API_CONFLUENCE_URL;
	}
	if (test == "GIT_REPOS_PATHS") {
		return !!Object.keys(config.GIT_REPOS_PATHS).length;
	}
	return true;
};
