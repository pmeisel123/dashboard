import type { UserProps, UsersGroupProps } from "@src/Api";

const creatorCache: { [key: string]: UserProps } = {};
export const GetBranchCreator = (creator: string, allJiraUsersGroups: UsersGroupProps) => {
	if (creator in creatorCache) {
		return creatorCache[creator];
	}
	Object.keys(allJiraUsersGroups.users).forEach((user_id) => {
		const user: UserProps = allJiraUsersGroups.users[user_id];
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
