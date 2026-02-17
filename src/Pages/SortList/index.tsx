import { Button, TextField } from "@mui/material";
import { Delete } from '@mui/icons-material';
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
import Strike from '@tiptap/extension-strike';
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
		return Array.from(template.content.children).map((el, index) => ({
			id: index.toString(),
			name: el.textContent?.trim() || "",
			description: el.innerHTML || "",
		}));
	}, [listString]);

	const fuseOptions = {
		keys: ["name"],
		threshold: 0.2, // Match sensitivity (0.0 requires perfect match, 1.0 matches anything)
		ignoreLocation: true, // Search across the whole string
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
			<ul>
				{results.map((item) => (
					<li key={item.id}>
						<span dangerouslySetInnerHTML={{ __html: item.description }} />
						<Button onClick={() => removeItem(item.name)}><Delete color="error"/></Button>
					</li>
				))}
			</ul>
		</div>
	);
};

const SortListPage = () => {
	const [searchTerm, setSearchTerm] = useState("");
	const rteRef = useRef<RichTextEditorRef>(null);
	const [list, setList] = useState<string>(() => window.localStorage.getItem("getSortList") || "<p></p>");
	useEffect(() => {
		const handler = setTimeout(() => {
			window.localStorage.setItem("getSortList", list);
		}, 500);

		return () => clearTimeout(handler);
	}, [list]);
	const editorStyles = {
		"& .ProseMirror": {
			counterReset: "line",
			paddingLeft: "40px !important",
		},
		"& .ProseMirror > *": {
			position: "relative",
			"&::before": {
				counterIncrement: "line",
				content: "counter(line)",
				position: "absolute",
				left: "-35px",
				color: "#999",
				fontSize: "0.8rem",
				userSelect: "none",
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
	const removeItem = (text: string) => {
		const dom = document.createElement("div");
		dom.innerHTML = list;
		const items = Array.from(dom.childNodes).filter(
			(node) => node.textContent && node.textContent.trim() !== "" && node.textContent?.trim() !== text.trim(),
		) as HTMLElement[];
		const newHtml = items.map((item) => item.outerHTML).join("");
		editor.commands.setContent(newHtml);
		setList(newHtml);
	};
	const sortList = (contentToSort = list) => {
		if (!list) return;
		const dom = document.createElement("div");
		dom.innerHTML = contentToSort;
		const items = Array.from(dom.childNodes).filter(
			(node) => node.textContent && node.textContent.trim() !== "",
		) as HTMLElement[];
		items.sort((a, b) => {
			const aText = a.textContent || "";
			const bText = b.textContent || "";
			return aText.toLowerCase().localeCompare(bText.toLowerCase());
		});
		const sortedHtml = items.map((item) => item.outerHTML).join("");
		editor.commands.setContent(sortedHtml);
		setList(sortedHtml);
	};
	return (
		<>
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
				Add
			</Button>
			<FuzzySearchComponent listString={list} searchTerm={searchTerm} removeItem={removeItem} />
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
