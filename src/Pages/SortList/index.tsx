import { Delete } from "@mui/icons-material";
import { Button, Checkbox, FormControlLabel, InputLabel, TextField } from "@mui/material";
import type { RoutePageProps } from "@src/Api";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Fuse from "fuse.js";
import {
	MenuButtonBold,
	MenuButtonItalic,
	MenuButtonStrikethrough,
	MenuControlsContainer,
	MenuDivider,
	MenuSelectHeading,
	RichTextEditorProvider,
	RichTextField,
	type RichTextEditorRef,
} from "mui-tiptap";
import type { FC } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

const FuzzySearchComponent: FC<{
	listString: string;
	searchTerm: string;
	removeItem: (text: string) => void;
}> = ({ listString, searchTerm, removeItem }) => {
	const [searchParams, setSearchParams] = useSearchParams();
	const [sortDate, setSortDate] = useState<boolean>(searchParams.get("sortDate") === "true");
	useEffect(() => {
		const newSearchParams = new URLSearchParams(searchParams.toString());
		if (sortDate) {
			newSearchParams.set("sortDate", "true");
		} else {
			newSearchParams.delete("sortDate");
		}
		setSearchParams(newSearchParams);
	}, [sortDate]);
	const list = useMemo(() => {
		if (!listString) return [];
		if (typeof document === "undefined") return [];
		return stringHtmlToArrayOfNodes(listString).map((el, index) => ({
			id: index.toString(),
			name: el.textContent?.trim() || "",
			description: el.innerHTML || "",
		}));
	}, [listString]);

	const fuseOptions = useMemo(
		() => ({
			keys: ["name"],
			threshold: 0.3, // Match sensitivity (0.0 requires perfect match, 1.0 matches anything)
			ignoreLocation: true,
		}),
		[],
	);

	const fuse = useMemo(() => new Fuse(list, fuseOptions), [list, fuseOptions]);

	const results = useMemo(() => {
		if (!searchTerm) {
			return list;
		}
		return fuse.search(searchTerm).map((result) => result.item);
	}, [searchTerm, fuse]);

	const dateRegex = /- (\d{4}-\d{2}-\d{2})$/;
	const processedResults = useMemo(() => {
		if (!sortDate) return results;

		return [...results].sort((a, b) => {
			const aDate = new Date(a.name.match(dateRegex)?.[1] || 0);
			const bDate = new Date(b.name.match(dateRegex)?.[1] || 0);
			return bDate.getTime() - aDate.getTime();
		});
	}, [results, sortDate]);

	if (!searchTerm) {
		return null;
	}
	return (
		<div>
			Matches for "<strong>{searchTerm}</strong>":
			<br />
			<FormControlLabel
				control={<Checkbox size="small" checked={sortDate} onChange={(e) => setSortDate(e.target.checked)} />}
				label="Sort By Date"
				slotProps={{ typography: { variant: "body2", fontSize: "0.8rem" } }}
			/>
			<ul>
				{processedResults.map((item) => (
					<li key={sortDate + " " + item.id}>
						<span dangerouslySetInnerHTML={{ __html: item.description }} />
						<Button onClick={() => removeItem(item.name)}>
							<Delete color="error" />
						</Button>
					</li>
				))}
			</ul>
		</div>
	);
};

const stringHtmlToArrayOfNodes = (str: string): HTMLElement[] => {
	if (typeof document === "undefined") return [];
	const template = document.createElement("template");
	template.innerHTML = (str || "").trim();
	return Array.from(template.content.children) as HTMLElement[];
};

const SortListPage = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [addDate, setAddDate] = useState<boolean>(searchParams.get("addDate") === "true");
	const [size, setSize] = useState<string>("32px");
	const rteRef = useRef<RichTextEditorRef>(null);
	const [list, setList] = useState<string>(() =>
		typeof window !== "undefined" ? window.localStorage.getItem("getSortList") || "<p></p>" : "<p></p>",
	);
	useEffect(() => {
		const handler = setTimeout(() => {
			try {
				if (typeof window !== "undefined") {
					window.localStorage.setItem("getSortList", list);
				}
			} catch (_e) {
				// ignore storage errors
			}
		}, 500);
		const newSize = Math.max(1, Math.ceil(Math.log10(stringHtmlToArrayOfNodes(list).length + 1)));
		setSize(newSize * 10 + "px");

		return () => clearTimeout(handler);
	}, [list]);
	useEffect(() => {
		const newSearchParams = new URLSearchParams(searchParams.toString());
		if (addDate) {
			newSearchParams.set("addDate", "true");
		} else {
			newSearchParams.delete("addDate");
		}
		setSearchParams(newSearchParams);
	}, [addDate]);
	const editorStyles = {
		"& .ProseMirror": {
			counterReset: "line",
			paddingLeft: size,
		},
		"& .ProseMirror > *": {
			position: "relative",
			"&::before": {
				backgroundColor: "#eee",
				counterIncrement: "line",
				content: "counter(line)",
				position: "absolute",
				fontSize: "14px",
				left: "-" + size,
				color: "#999",
				userSelect: "none",
				width: size,
				height: "30px",
				padding: "0 5px 0 0",
				margin: "0 0 0 -12px",
				textAlign: "right",
			},
		},
	};
	const editor = useEditor({
		extensions: [StarterKit],
		content: list,
		onUpdate: ({ editor }) => {
			const html = editor.getHTML();
			setList(html);
		},
	});
	const updateList = (items: HTMLElement[]) => {
		const newHtml = items.map((item) => item.outerHTML).join("");
		if (editor && editor.commands) {
			editor.commands.setContent(newHtml);
		}
		setList(newHtml);
	};

	const removeItem = (text: string) => {
		const items = stringHtmlToArrayOfNodes(list).filter((node) => {
			const txt = (node.textContent || "").trim();
			return txt !== "" && txt !== text.trim();
		}) as HTMLElement[];
		updateList(items);
	};
	const dedupeAndSortList = (contentToDedupe = list) => {
		if (!contentToDedupe) return;
		const items = stringHtmlToArrayOfNodes(contentToDedupe).filter((n) => (n.textContent || "").trim() !== "");
		const uniqueMap = new Map<string, HTMLElement>();
		items.forEach((item) => {
			const key = (item.textContent || "").trim();
			if (key && !uniqueMap.has(key)) {
				uniqueMap.set(key, item);
			}
		});
		const result = Array.from(uniqueMap.values()).sort((a, b) => {
			const aText = (a.textContent || "").toLowerCase();
			const bText = (b.textContent || "").toLowerCase();
			return aText.localeCompare(bText);
		});
		updateList(result);
	};
	const sortList = (contentToSort = list) => {
		if (!contentToSort) return;
		const items = stringHtmlToArrayOfNodes(contentToSort).filter(
			(node) => node.textContent && node.textContent.trim() !== "",
		) as HTMLElement[];
		items.sort((a, b) => {
			const aText = a.textContent || "";
			const bText = b.textContent || "";
			return aText.toLowerCase().localeCompare(bText.toLowerCase());
		});
		updateList(items);
	};
	return (
		<>
			<InputLabel id="search">Search</InputLabel>
			<TextField
				type="text"
				placeholder="Search items..."
				value={searchTerm}
				onChange={(e) => setSearchTerm(e.target.value)}
			/>
			<FormControlLabel
				control={<Checkbox checked={addDate} onChange={(e) => setAddDate(e.target.checked)} />}
				label="Add Date"
			/>
			<Button
				disabled={!searchTerm.trim()}
				onClick={() => {
					let newTerm = searchTerm.trim();
					if (addDate) {
						newTerm += " - " + new Date().toISOString().split("T")[0];
					}
					const newList = list + "<p>" + newTerm + "</p>";
					sortList(newList);
					setSearchTerm("");
				}}
			>
				Add & Sort
			</Button>
			<FuzzySearchComponent listString={list} searchTerm={searchTerm} removeItem={removeItem} />
			<InputLabel id="editor">List</InputLabel>
			<RichTextEditorProvider editor={editor}>
				<RichTextField
					sx={editorStyles}
					ref={rteRef}
					controls={
						<MenuControlsContainer>
							<MenuSelectHeading />
							<MenuDivider />
							<MenuButtonBold />
							<MenuButtonItalic />
							<MenuButtonStrikethrough />
						</MenuControlsContainer>
					}
				/>
			</RichTextEditorProvider>

			<Button onClick={() => sortList(list)}>Sort List</Button>
			<Button onClick={() => dedupeAndSortList(list)}>Remove Duplicates and Sort List</Button>
		</>
	);
};

export const GetModulePages = (): RoutePageProps[] => [
	{
		path: "/EditList",
		name: "Edit List",
		element: <SortListPage />,
		description: <>Make, search, and sort a list (not really part of the site, just tool I needed)</>,
		requires: "false",
	},
];
