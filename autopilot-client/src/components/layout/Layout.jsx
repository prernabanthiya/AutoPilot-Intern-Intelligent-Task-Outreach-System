import React from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton, styled } from '@mui/material';
import { Notifications as NotificationsIcon, AccountCircle } from '@mui/icons-material';
import Sidebar from './Sidebar';

const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  backgroundColor: '#f5f5f5',
  minHeight: '100vh',
}));

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: 'white',
  color: 'black',
  boxShadow: 'none',
  borderBottom: '1px solid #e0e0e0',
  marginLeft: 240, // Same as drawer width
  width: `calc(100% - 240px)`,
}));

const Layout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <MainContent>
        <StyledAppBar position="fixed">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Welcome, Admin
            </Typography>
            <IconButton color="inherit">
              <NotificationsIcon />
            </IconButton>
            <IconButton color="inherit">
              <AccountCircle />
            </IconButton>
          </Toolbar>
        </StyledAppBar>
        <Box sx={{ mt: 8, p: 3 }}>
          {children}
        </Box>
      </MainContent>
    </Box>
  );
};

export default Layout; 