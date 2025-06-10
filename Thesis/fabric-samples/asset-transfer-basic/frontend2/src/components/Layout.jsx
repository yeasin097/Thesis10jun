import { Box, Container, Paper } from '@mui/material';

function Layout({ children, maxWidth = 'lg' }) {
  return (
    <Box 
      sx={{ 
        flex: 1,
        py: 4,
        px: { xs: 2, sm: 3 },
        backgroundColor: 'background.default',
        minHeight: 'calc(100vh - 64px)', // Subtract navbar height
      }}
    >
      <Container maxWidth={maxWidth}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3 },
            borderRadius: 2,
            bgcolor: 'background.paper',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            minHeight: '100%',
          }}
        >
          {children}
        </Paper>
      </Container>
    </Box>
  );
}

export default Layout; 