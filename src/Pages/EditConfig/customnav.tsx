import type { CustomNavLinks } from "@src/Api/Types";
import { EditCustomNavList } from "@src/Components";
import type { Dispatch, FC, SetStateAction } from "react";

export const EditCustonNavTab: FC<{
	links: { [key: string]: CustomNavLinks };
	setLinks: Dispatch<SetStateAction<{ [key: string]: CustomNavLinks }>>;
}> = ({ links, setLinks }) => {
	return <EditCustomNavList links={links} setLinks={setLinks} />;
};
