import type { ReactNode} from "react";
import { Textfit } from 'react-textfit';

export const StyledTextfit = ({ children }: { children: ReactNode }) => {
	return (
		<div style={{ height: '100%', width: '100%' }}>
			<Textfit min={1} max={200}>
				{children}
			</Textfit>
		</div>
	);
};
