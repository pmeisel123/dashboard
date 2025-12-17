import { writeFileSync } from "node:fs";
import type { IncomingMessage } from "node:http";
import { join } from "node:path";
import { ALLOW_VACATION_EDITS } from "../../globals";
import type { UserEditVacation } from "../Api/Types";

export const VacationServer = (_req: IncomingMessage, requestBody: string | null) => {
	if (requestBody && ALLOW_VACATION_EDITS) {
		try {
			const vacations = JSON.parse(requestBody) as UserEditVacation;
			let output = "";

			Object.keys(vacations).forEach((key) => {
				if (vacations[key]) {
					output += `${key},${vacations[key]}\n`;
				}
			});

			const filePath = join(process.cwd(), "src/assets", "vacation.csv");
			writeFileSync(filePath, output, "utf-8");
			console.log(`File ${filePath} written successfully!`);
			return true;
		} catch (error) {
			console.error("Error processing vacation data:", error);
		}
	}
	return false;
};
