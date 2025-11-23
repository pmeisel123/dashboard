import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { Link } from 'react-router-dom'; // From react-router-dom
import {SavePageModal} from '@src/Components/SavePage';

interface TopNavBarProps {
	toggleDrawer: () => void; // Function to open/close sidebar
}

const TopNavBar: React.FC<TopNavBarProps> = ({ toggleDrawer }) => {
  return (
<>
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={toggleDrawer}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Validator
        </Typography>
        <SavePageModal />
        <Button color="inherit" component={Link} to="/">Home</Button>
      </Toolbar>
    </AppBar>
    <Toolbar />
    </>
  );
};
export default TopNavBar;