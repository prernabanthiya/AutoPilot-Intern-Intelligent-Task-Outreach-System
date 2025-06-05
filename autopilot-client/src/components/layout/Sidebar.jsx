import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  styled,
  ListItemButton,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Email as EmailIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { NavLink } from 'react-router-dom';

const drawerWidth = 240;

const StyledDrawer = styled(Drawer)({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    backgroundColor: '#1a237e',
    color: 'white',
  },
});

const StyledListItem = styled(ListItem)(({ active }) => ({
  backgroundColor: active ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  margin: '4px 0',
  borderRadius: '8px',
}));

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Members', icon: <PeopleIcon />, path: '/members' },
  { text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  { text: 'Send Email', icon: <EmailIcon />, path: '/send-email' },
];

const Sidebar = () => {
  const location = useLocation();
  const theme = useTheme();

  return (
    <StyledDrawer variant="permanent">
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          AutoPilot
        </Typography>
      </Box>
      <List>
        {menuItems.map((item) => (
          <Link
            to={item.path}
            key={item.text}
            style={{
              textDecoration: 'none',
              color: 'inherit',
              '&.active': {
                bgcolor: theme.palette.action.selected,
              },
            }}
          >
            <StyledListItem
              button
              active={location.pathname === item.path ? 1 : 0}
            >
              <ListItemIcon sx={{ color: 'white' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </StyledListItem>
          </Link>
        ))}
      </List>
    </StyledDrawer>
  );
};

export default Sidebar; 