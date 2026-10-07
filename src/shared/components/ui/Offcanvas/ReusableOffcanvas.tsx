import React from 'react';
import { Box, Drawer, IconButton, Typography } from '@mui/material';
import { X } from 'lucide-react';

interface ReusableOffcanvasProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subTitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  anchor?: 'left' | 'right' | 'top' | 'bottom';
  width?: string | number;
}

const ReusableOffcanvas: React.FC<Readonly<ReusableOffcanvasProps>> = ({
  isOpen,
  onClose,
  title,
  subTitle,
  children,
  footer,
  anchor = 'right',
  width = 450,
}) => {
  return (
    <Drawer
      anchor={anchor}
      open={isOpen}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: { 
            width: { xs: '100%', sm: width }, 
            backgroundColor: 'var(--background)',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          },
        },
      }}
    >
      <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 3, 
            pb: 2, 
            borderBottom: '1px solid var(--color-table-border)' 
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'var(--foreground)', fontSize: '1.2rem', lineHeight: 1.2 }}>
              {title}
            </Typography>
            {subTitle && (
              <Typography variant="body2" sx={{ color: 'var(--foreground)', opacity: 0.7, mt: 0.5 }}>
                {subTitle}
              </Typography>
            )}
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'var(--foreground)' }}>
            <X className="text-danger" size={24} />
          </IconButton>
        </Box>

        {/* Body */}
        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 1 }}>
          {children}
        </Box>

        {/* Footer */}
        {footer && (
          <Box 
            sx={{ 
              pt: 3, 
              mt: 2, 
              borderTop: '1px solid var(--color-table-border)',
              display: 'flex',
              justifyContent: 'center',
              gap: 2
            }}
          >
            {footer}
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default ReusableOffcanvas;
