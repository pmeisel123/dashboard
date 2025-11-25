import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { Link } from 'react-router-dom'; // From react-router-dom
import {SavePageModal} from '@src/Components';

interface TopNavBarProps {
	toggleLeftNav: () => void; // Function to open/close Left Nav
}

const TopNavBar: React.FC<TopNavBarProps> = ({ toggleLeftNav }) => {
  return (
<>
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={toggleLeftNav}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Dashboard
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