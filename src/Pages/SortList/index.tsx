import { Button } from "@mui/material";
import type { RoutePageProps } from "@src/Api";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
	MenuButtonBold,
	MenuButtonItalic,
	MenuControlsContainer,
	MenuDivider,
	MenuSelectHeading,
	RichTextEditorProvider,
	RichTextField,
	type RichTextEditorRef,
} from "mui-tiptap";
import { useEffect, useRef, useState } from "react";

const SortListPage = () => {
	const rteRef = useRef<RichTextEditorRef>(null);
	const [list, setList] = useState<string>(() => window.localStorage.getItem("getSortList") || "");
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
		extensions: [StarterKit],
		content: list,
		onUpdate: ({ editor }) => {
			const html = editor.getHTML();
			setList(html);
		},
	});
	const sortList = () => {
		if (!editor) return;
		const dom = document.createElement("div");
		dom.innerHTML = list;
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
		console.log(sortedHtml);
		setList(sortedHtml);
	};
	return (
		<>
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
						</MenuControlsContainer>
					}
				/>
			</RichTextEditorProvider>

			<Button onClick={sortList}>Sort List</Button>
		</>
	);
};

export const GetModulePages = (): RoutePageProps[] => [
	{
		path: "/EditList",
		name: "Edit List",
		element: <SortListPage />,
		description: <>Make and sort a list (not really part of the site, just tool I needed)</>,
		requires: "false",
	},
];
