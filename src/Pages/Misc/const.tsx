import type { ReactNode } from "react";
import { Textfit } from "react-textfit";

export const StyledTextfit = ({ children }: { children: ReactNode }) => {
	return (
		<Textfit min={10} max={200} style={{ height: "100%", width: "100%", textAlign: "center" }}>
			{children}
		</Textfit>
	);
};
