import type { FC } from "react";

export const RenderEstimate: FC<{
	value: number | null;
	defaultEstimate: number | null;
}> = ({ value, defaultEstimate }) => {
	if (value != null) {
		return <>{value}</>;
	}
	if (defaultEstimate == null) {
		return <span style={{ color: "red" }}>-</span>;
	}
	return <span style={{ color: "red" }}>{defaultEstimate}</span>;
};
