import type { UserProps, UsersGroupProps } from "@src/Api";

const creatorCache: { [key: string]: UserProps } = {};
export const GetBranchCreator = (creator: string, possibleUsersGroups: UsersGroupProps) => {
	if (creator in creatorCache) {
		return creatorCache[creator];
	}
	Object.keys(possibleUsersGroups.users).forEach((user_id) => {
		const user: UserProps = possibleUsersGroups.users[user_id];
		const email = user.email;
		if (!email) {
			return;
		}
		const username = email.replace(/@.*/, "");
		if (username == creator) {
			creatorCache[creator] = user;
		}
	});
	if (creator in creatorCache) {
		return creatorCache[creator];
	}
	return;
};
