import type { AppDispatch, RootState, TicketProps } from "@src/Api";
import { fetchTickets, fetchUsersAndGroups, isUserDataRecent } from "@src/Api";
import {
	allGroups,
	Calendar,
	FormFields,
	TicketTable,
	UsersSelector,
} from "@src/Components";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useOutletContext, useSearchParams } from "react-router-dom";

const defaultDefaultDefaultEstimate = 2;

function DashboardPage() {
	
}

export default DashboardPage;