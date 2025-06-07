import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  MenuItem,
  Tooltip,
  Button,
  Chip,
  Stack,
  Divider,
  Badge,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GroupIcon from '@mui/icons-material/Group';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PaymentIcon from '@mui/icons-material/Payment';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';

import MenuIcon from '@mui/icons-material/Menu';

interface LayoutProps {
  children: ReactNode;
}

const getInitials = (name: string) => {
  return name
    ?.split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2) || '?';
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [anchorElNotifications, setAnchorElNotifications] = useState<null | HTMLElement>(null);
  const [anchorElNavigation, setAnchorElNavigation] = useState<null | HTMLElement>(null);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleOpenNotifications = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNotifications(event.currentTarget);
  };

  const handleCloseNotifications = () => {
    setAnchorElNotifications(null);
  };

  const handleOpenNavigation = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNavigation(event.currentTarget);
  };

  const handleCloseNavigation = () => {
    setAnchorElNavigation(null);
  };

  const handleLogout = async () => {
    handleCloseUserMenu();
    await logout();
    navigate('/signin');
  };

  const handleProfile = () => {
    handleCloseUserMenu();
    navigate('/profile');
  };

  const handleSubscription = () => {
    handleCloseUserMenu();
    if (user?.role === 'creator') {
      navigate('/creator/subscription/plans');
    }
  };

  // Define navigation items based on user role
  const getNavigationItems = () => {
    if (!user) return [];

    if (user.role === 'creator') {
      return [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/creator/dashboard' },
        { text: 'Exams', icon: <AssignmentIcon />, path: '/creator/exams' },
        { text: 'Student Groups', icon: <GroupIcon />, path: '/creator/groups' },
        { text: 'Subscription', icon: <PaymentIcon />, path: '/creator/subscription/plans' },
        { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
      ];
    } else if (user.role === 'student') {
      return [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/student/dashboard' },
        { text: 'Available Exams', icon: <AssignmentIcon />, path: '/student/exams' },
        { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
      ];
    } else if (user.role === 'admin') {
      return [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
        { text: 'Users', icon: <GroupIcon />, path: '/admin/users' },
        { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
      ];
    }

    return [];
  };

  // If not logged in, don't show the navigation
  if (!user) {
    return <>{children}</>;
  }

  const navigationItems = getNavigationItems();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          backgroundColor: 'white',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
          zIndex: 1200
        }}
      >
        <Container maxWidth={false}>
          <Toolbar disableGutters sx={{ height: 72, px: 2 }}>
            {/* Logo and Brand */}
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
              <SchoolIcon sx={{ fontSize: 32, mr: 1.5, color: 'primary.main' }} />
              <Typography
                variant="h5"
                noWrap
                component={Link}
                to="/"
                sx={{
                  fontWeight: 700,
                  color: 'primary.main',
                  textDecoration: 'none',
                  letterSpacing: '-0.02em'
                }}
              >
                BrainTime
              </Typography>
            </Box>

            {/* Desktop Navigation */}
            <Box sx={{ 
              display: { xs: 'none', md: 'flex' }, 
              alignItems: 'center', 
              gap: 1,
              mr: 'auto'
            }}>
              {navigationItems.slice(0, 4).map((item) => (
                <Button
                  key={item.text}
                  component={Link}
                  to={item.path}
                  startIcon={item.icon}
                  sx={{
                    color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                    fontWeight: location.pathname === item.path ? 600 : 500,
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    textTransform: 'none',
                    backgroundColor: location.pathname === item.path ? 'primary.50' : 'transparent',
                    '&:hover': {
                      backgroundColor: location.pathname === item.path ? 'primary.100' : 'action.hover',
                    }
                  }}
                >
                  {item.text}
                  {item.text === 'Subscription' && user.role === 'creator' && !user.subscriptionPlan && (
                    <Chip 
                      label="Free" 
                      size="small" 
                      sx={{ 
                        ml: 1,
                        height: 18, 
                        fontSize: '0.625rem',
                        fontWeight: 500,
                        bgcolor: 'primary.100',
                        color: 'primary.700',
                        border: 'none'
                      }} 
                    />
                  )}
                </Button>
              ))}
            </Box>

            {/* Mobile Navigation Menu */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, mr: 'auto' }}>
              <IconButton
                onClick={handleOpenNavigation}
                sx={{ 
                  color: 'text.secondary',
                  borderRadius: 2,
                  '&:hover': { bgcolor: 'action.hover' }
                }}
              >
                <MenuIcon />
              </IconButton>
              
              <Menu
                anchorEl={anchorElNavigation}
                open={Boolean(anchorElNavigation)}
                onClose={handleCloseNavigation}
                PaperProps={{
                  sx: { 
                    width: 280,
                    mt: 1,
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    border: '1px solid',
                    borderColor: 'divider'
                  }
                }}
              >
                {navigationItems.map((item) => (
                  <MenuItem 
                    key={item.text}
                    component={Link}
                    to={item.path}
                    onClick={handleCloseNavigation}
                    selected={location.pathname === item.path}
                    sx={{ 
                      mx: 1,
                      borderRadius: 2,
                      '&.Mui-selected': {
                        backgroundColor: 'primary.50',
                        color: 'primary.main',
                      }
                    }}
                  >
                    <ListItemIcon sx={{ color: 'inherit' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} />
                    {item.text === 'Subscription' && user.role === 'creator' && !user.subscriptionPlan && (
                      <Chip 
                        label="Free" 
                        size="small" 
                        sx={{ 
                          height: 18, 
                          fontSize: '0.625rem',
                          fontWeight: 500,
                          bgcolor: 'primary.100',
                          color: 'primary.700',
                          border: 'none'
                        }} 
                      />
                    )}
                  </MenuItem>
                ))}
              </Menu>
            </Box>

            {/* Action Buttons */}
            <Stack direction="row" spacing={1} alignItems="center">
              {/* Create New Exam Button - Only for creators */}
              {user.role === 'creator' && (
                <Button
                  variant="contained"
                  size="medium"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/creator/exams/create')}
                  sx={{ 
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    fontWeight: 600,
                    boxShadow: 1,
                    mr: 1,
                    display: { xs: 'none', sm: 'flex' },
                    '&:hover': { boxShadow: 2 }
                  }}
                >
                  Create Exam
                </Button>
              )}

              {/* Mobile Create Button */}
              {user.role === 'creator' && (
                <IconButton
                  onClick={() => navigate('/creator/exams/create')}
                  sx={{ 
                    display: { xs: 'flex', sm: 'none' },
                    color: 'primary.main',
                    bgcolor: 'primary.50',
                    '&:hover': { bgcolor: 'primary.100' }
                  }}
                >
                  <AddIcon />
                </IconButton>
              )}

              {/* Search Button */}
              <IconButton
                sx={{ 
                  color: 'text.secondary',
                  borderRadius: 2,
                  '&:hover': { bgcolor: 'action.hover' }
                }}
              >
                <SearchIcon />
              </IconButton>

              {/* Notifications */}
              <IconButton
                onClick={handleOpenNotifications}
                sx={{ 
                  color: 'text.secondary',
                  borderRadius: 2,
                  '&:hover': { bgcolor: 'action.hover' }
                }}
              >
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>

              {/* User Menu */}
              <Tooltip title="Account settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0, ml: 1 }}>
                  <Avatar 
                    sx={{ 
                      width: 40, 
                      height: 40, 
                      bgcolor: 'primary.main',
                      fontSize: '0.875rem',
                      fontWeight: 600
                    }}
                  >
                    {getInitials(user?.name || user?.email || '')}
                  </Avatar>
                </IconButton>
              </Tooltip>
            </Stack>

            {/* User Menu */}
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
              PaperProps={{
                sx: { 
                  width: 240,
                  mt: 1,
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  border: '1px solid',
                  borderColor: 'divider'
                }
              }}
            >
              <Box sx={{ px: 3, py: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {user.name || user.email?.split('@')[0]}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
                {user.role === 'creator' && (
                  <Chip 
                    label="Free Plan" 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                    sx={{ mt: 1, fontSize: '0.75rem' }}
                  />
                )}
              </Box>
              
              <Divider />
              
              <Box sx={{ py: 1 }}>
                <MenuItem 
                  onClick={handleProfile} 
                  sx={{ 
                    mx: 1, 
                    borderRadius: 2,
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Profile" />
                </MenuItem>
                
                {user.role === 'creator' && (
                  <MenuItem 
                    onClick={handleSubscription} 
                    sx={{ 
                      mx: 1, 
                      borderRadius: 2,
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <ListItemIcon>
                      <PaymentIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Subscription" />
                  </MenuItem>
                )}
                
                <Divider sx={{ my: 1 }} />
                
                <MenuItem 
                  onClick={handleLogout} 
                  sx={{ 
                    mx: 1, 
                    borderRadius: 2,
                    color: 'error.main',
                    '&:hover': { 
                      bgcolor: 'error.50',
                      color: 'error.main'
                    }
                  }}
                >
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" color="error" />
                  </ListItemIcon>
                  <ListItemText primary="Logout" />
                </MenuItem>
              </Box>
            </Menu>

            {/* Notifications Menu */}
            <Menu
              sx={{ mt: '45px' }}
              id="menu-notifications"
              anchorEl={anchorElNotifications}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElNotifications)}
              onClose={handleCloseNotifications}
              PaperProps={{
                sx: { 
                  width: 320,
                  mt: 1,
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  border: '1px solid',
                  borderColor: 'divider'
                }
              }}
            >
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Notifications
                </Typography>
              </Box>
              <Divider />
              <Box sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  No new notifications
                </Typography>
              </Box>
            </Menu>
          </Toolbar>
        </Container>
      </AppBar>
      
      {/* Main Content */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          pt: '72px', // Account for fixed navbar height
          backgroundColor: '#fafafa',
          minHeight: '100vh'
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 