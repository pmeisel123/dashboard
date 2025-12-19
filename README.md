Created and Built by Paul Meisel (pmeisel@gmail.com)
[https://github.com/pmeisel123/dashboard](https://github.com/pmeisel123/dashboard)

This is a company Dashboard. It merges data from Jira, Git, and vacations. I built something similar for a company I worked for and it made project planning/reviewing simpler.

## Pages & Features

| Path           | Description                                                                                                                                                                                                           |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| /              | Landing Page for the application.                                                                                                                                                                                     |
| /Estimator     | Calculate approximate project completion dates based on Jira ticket estimates, user selection, upcoming vacations, and holidays. Useful for project planning.                                                         |
| /MyTickets     | View tickets assigned to a specific user. The selected user is saved to local storage for convenience.                                                                                                                |
| /RecentTickets | Find tickets that were recently filed.                                                                                                                                                                                |
| /branches      | List all the git repositories and their respective branches.                                                                                                                                                          |
| /branchesCompare | Show all commits to one branch that is not in another branch
| /holidays      | Display US bank holidays by year. To change the default filters, edit `src/API/holiday.ts` > `getHolidays`.                                                                                                           |
| /whoisout      | Show upcoming vacations. Users are pulled from Jira, and vacation times are sourced from `src/assets/vacation.csv` via `src/API/vacations.tsx`. Need to pull vacations from your HR site.                             |
| /dashboard     | Dashboards are configured within the `globals.ts` file. When a dashboard is loaded, the page will automatically switch between different pages. This is useful for displaying information on internal office screens. |

## Install

1. Clone the repository:

```bash
   git clone https://github.com/pmeisel123/dashboard
   cd dashboard
```

2. Install dependencies

```bash
   npm install
```

3. Configure settings:
   Update `globals.ts` (see instructions in the file).

4. Run the application:

```bash
   npm run dev
```
