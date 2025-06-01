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
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  Paper,
  Button,
  Chip
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import MenuIcon from '@mui/icons-material/Menu';
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
import { styled } from '@mui/material/styles';

interface LayoutProps {
  children: ReactNode;
}

const drawerWidth = 260;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  width: '100%',
  maxWidth: '100%',
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: 0,
  backgroundColor: '#f9fafb',
  minHeight: '100vh',
  overflow: 'hidden', // Prevent horizontal scroll
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: `${drawerWidth}px`,
    width: `calc(100% - ${drawerWidth}px)`,
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

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
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [anchorElNotifications, setAnchorElNotifications] = useState<null | HTMLElement>(null);

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

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

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'white',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Container maxWidth={false}>
          <Toolbar disableGutters sx={{ height: 64 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{ mr: 2, ...(drawerOpen && { display: 'none' }) }}
            >
              <MenuIcon />
            </IconButton>
            
            <SchoolIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1, color: 'primary.main' }} />
            <Typography
              variant="h6"
              noWrap
              component={Link}
              to="/"
              sx={{
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                fontWeight: 700,
                color: 'primary.main',
                textDecoration: 'none',
              }}
            >
              BrainTime
            </Typography>

            <Box sx={{ flexGrow: 1 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Notifications */}
              <Tooltip title="Notifications">
                <IconButton 
                  onClick={handleOpenNotifications}
                  size="small"
                  sx={{ 
                    color: 'text.secondary',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: '8px',
                    p: 1
                  }}
                >
                  <Badge badgeContent={3} color="error">
                    <NotificationsIcon fontSize="small" />
                  </Badge>
                </IconButton>
              </Tooltip>
              
              <Menu
                sx={{ mt: '45px' }}
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
              >
                <Paper sx={{ width: 320, maxHeight: 450, overflow: 'auto' }}>
                  <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Notifications
                    </Typography>
                  </Box>
                  
                  <List sx={{ py: 0 }}>
                    <ListItem sx={{ py: 2, px: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            New Exam Submission
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            2h ago
                          </Typography>
                        </Box>
                        <Typography variant="body2">
                          A student has submitted an exam for "Music Theory"
                        </Typography>
                      </Box>
                    </ListItem>
                    
                    <ListItem sx={{ py: 2, px: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            Group Enrollment
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            1d ago
                          </Typography>
                        </Box>
                        <Typography variant="body2">
                          A new student has enrolled in "Music 101"
                        </Typography>
                      </Box>
                    </ListItem>
                    
                    <ListItem sx={{ py: 2, px: 2 }}>
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            System Update
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            3d ago
                          </Typography>
                        </Box>
                        <Typography variant="body2">
                          New features have been added to the platform
                        </Typography>
                      </Box>
                    </ListItem>
                  </List>
                  
                  <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                    <Button variant="text" size="small">
                      View All Notifications
                    </Button>
                  </Box>
                </Paper>
              </Menu>

              {/* User Menu */}
              <Box 
                onClick={handleOpenUserMenu}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: 1.5,
                  cursor: 'pointer',
                  py: 1,
                  px: 1.5,
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
              >
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    bgcolor: 'primary.main',
                    fontSize: '0.875rem',
                    fontWeight: 'bold'
                  }}
                >
                  {getInitials(user.name || user.email || '')}
                </Avatar>
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                  <Typography variant="body2" fontWeight="medium" lineHeight={1.2}>
                    {user.name || user.email?.split('@')[0] || ''}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" lineHeight={1.2} sx={{ textTransform: 'capitalize' }}>
                    {user.role}
                  </Typography>
                </Box>
              </Box>
              
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
                    width: 220,
                    padding: 1,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {user.email}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user.role === 'creator' && 'Free Plan'}
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 1 }} />
                
                <MenuItem onClick={handleProfile} sx={{ borderRadius: 1 }}>
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Profile" />
                </MenuItem>
                
                {user.role === 'creator' && (
                  <MenuItem onClick={handleSubscription} sx={{ borderRadius: 1 }}>
                    <ListItemIcon>
                      <PaymentIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Subscription" />
                  </MenuItem>
                )}
                
                <MenuItem onClick={handleLogout} sx={{ borderRadius: 1 }}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Logout" />
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: 'white',
            borderRight: '1px solid',
            borderColor: 'divider',
            boxShadow: 'none',
          },
        }}
        variant="persistent"
        anchor="left"
        open={drawerOpen}
      >
        <DrawerHeader sx={{ display: 'flex', justifyContent: 'space-between', px: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SchoolIcon sx={{ color: 'primary.main', mr: 1 }} />
            <Typography variant="h6" fontWeight="bold" color="primary.main">
              BrainTime
            </Typography>
          </Box>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </DrawerHeader>
        
        <Divider />
        
        {user.role === 'creator' && (
          <Box sx={{ p: 2 }}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<AddIcon />}
              onClick={() => navigate('/creator/exams/create')}
              sx={{ borderRadius: '8px', textTransform: 'none' }}
            >
              Create New Exam
            </Button>
          </Box>
        )}
        
        <Box sx={{ p: 2, pb: 0 }}>
          <Typography variant="body2" color="text.secondary" fontWeight="medium" sx={{ mb: 1, ml: 2 }}>
            MAIN MENU
          </Typography>
        </Box>
        
        <List sx={{ px: 2 }}>
          {getNavigationItems().map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton 
                component={Link} 
                to={item.path}
                selected={location.pathname === item.path}
                sx={{
                  borderRadius: '8px',
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: location.pathname === item.path ? 'white' : 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontSize: 14,
                    fontWeight: location.pathname === item.path ? 'bold' : 'medium'
                  }}
                />
                {item.text === 'Subscription' && user.role === 'creator' && !user.subscriptionPlan && (
                  <Chip 
                    label="Free" 
                    size="small" 
                    color="primary" 
                    sx={{ 
                      height: 20, 
                      '& .MuiChip-label': { px: 1, fontSize: '0.625rem' },
                      bgcolor: location.pathname === item.path ? 'white' : undefined,
                      color: location.pathname === item.path ? 'primary.main' : undefined
                    }} 
                  />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        
        <Box sx={{ mt: 'auto', p: 2 }}>
          <Divider sx={{ mb: 2 }} />
          <ListItemButton 
            onClick={handleLogout}
            sx={{
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: 'error.main',
                color: 'white',
                '& .MuiListItemIcon-root': {
                  color: 'white',
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Logout" 
              primaryTypographyProps={{ 
                fontSize: 14,
                fontWeight: 'medium'
              }}
            />
          </ListItemButton>
        </Box>
      </Drawer>
      
      <Main open={drawerOpen}>
        <DrawerHeader />
        {children}
      </Main>
    </Box>
  );
};

export default Layout; 