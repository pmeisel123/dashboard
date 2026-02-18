import { Delete } from "@mui/icons-material";
import { Button, InputLabel, TextField } from "@mui/material";
import type { RoutePageProps } from "@src/Api";
import Strike from "@tiptap/extension-strike";
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

const FuzzySearchComponent: FC<{
	listString: string;
	searchTerm: string;
	removeItem: (prevState: string) => void;
}> = ({ listString, searchTerm, removeItem }) => {
	const list = useMemo(() => {
		if (!listString) return [];
		const template = document.createElement("template");
		template.innerHTML = listString.trim();
		return stringHtmlToArrayOfNodes(listString).map((el, index) => ({
			id: index.toString(),
			name: el.textContent?.trim() || "",
			description: el.innerHTML || "",
		}));
	}, [listString]);

	const fuseOptions = {
		keys: ["name"],
		threshold: 0.3, // Match sensitivity (0.0 requires perfect match, 1.0 matches anything)
		ignoreLocation: true,
	};

	const fuse = useMemo(() => new Fuse(list, fuseOptions), [list, fuseOptions]);

	const results = useMemo(() => {
		if (!searchTerm) {
			return list;
		}
		return fuse.search(searchTerm).map((result) => result.item);
	}, [searchTerm, fuse]);

	if (!searchTerm) {
		return null;
	}
	return (
		<div>
			Matches for "<strong>{searchTerm}</strong>":
			<ul>
				{results.map((item) => (
					<li key={item.id}>
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

const stringHtmlToArrayOfNodes = (str: string) => {
	const template = document.createElement("template");
	template.innerHTML = str.trim();
	return Array.from(template.content.children);
};

const SortListPage = () => {
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [size, setSize] = useState<string>("32px");
	const rteRef = useRef<RichTextEditorRef>(null);
	const [list, setList] = useState<string>(() => window.localStorage.getItem("getSortList") || "<p></p>");
	useEffect(() => {
		const handler = setTimeout(() => {
			window.localStorage.setItem("getSortList", list);
		}, 500);
		const newSize = Math.max(1, Math.ceil(Math.log10(stringHtmlToArrayOfNodes(list).length + 1)));
		setSize(newSize * 10 + "px");

		return () => clearTimeout(handler);
	}, [list]);
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
		extensions: [StarterKit, Strike],
		content: list,
		onUpdate: ({ editor }) => {
			const html = editor.getHTML();
			setList(html);
		},
	});
	const updateList = (items: HTMLElement[]) => {
		const newHtml = items.map((item) => item.outerHTML).join("");
		editor.commands.setContent(newHtml);
		setList(newHtml);
	};

	const removeItem = (text: string) => {
		const items = stringHtmlToArrayOfNodes(list).filter(
			(node) => node.textContent && node.textContent.trim() !== "" && node.textContent?.trim() !== text.trim(),
		) as HTMLElement[];
		updateList(items);
	};
	const dedupeAndSortList = (contentToDedupe = list) => {
		if (!contentToDedupe) return;
		const items = stringHtmlToArrayOfNodes(contentToDedupe);
		const uniqueMap = new Map();
		items.forEach((item) => {
			if (!uniqueMap.has(item.textContent || "")) {
				uniqueMap.set(item.textContent || "", item);
			}
			const result = Array.from(uniqueMap.values()).sort((a, b) => {
				const aText = a.textContent || "";
				const bText = b.textContent || "";
				return aText.toLowerCase().localeCompare(bText.toLowerCase());
			});
			updateList(result);
		});
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
			<Button
				disabled={!searchTerm.trim()}
				onClick={() => {
					const newList = list + "<p>" + searchTerm + "</p>";
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
