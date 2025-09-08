'use client';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4A7C59',
    },
    secondary: {
      main: '#8B4789',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: 'var(--font-geist-sans)',
  },
});

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Explain', path: '/explain' },
  { label: 'Assess', path: '/assess' },
  { label: 'Analytics', path: '/analytics' },
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            TBAP
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {navItems.map((item) => (
              <Link key={item.path} href={item.path} passHref style={{ textDecoration: 'none' }}>
                <Button
                  color="inherit"
                  sx={{
                    borderBottom: pathname === item.path ? '2px solid white' : 'none',
                    borderRadius: 0,
                  }}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </Box>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {children}
      </Container>
    </ThemeProvider>
  );
}