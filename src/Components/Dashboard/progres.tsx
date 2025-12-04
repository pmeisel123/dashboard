import { styled } from '@mui/material/styles';
import { LinearProgress } from '@mui/material'
declare const __DASHBOARD_SPEED_SECONDS__: number;

export const Progress = styled(LinearProgress)(() => ({
	'& .MuiLinearProgress-bar': {
		animationDuration:  __DASHBOARD_SPEED_SECONDS__ + 's',
	},
}))