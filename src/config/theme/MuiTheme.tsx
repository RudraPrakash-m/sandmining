import { createTheme } from '@mui/material/styles';

export const getMuiTheme = (mode: 'light' | 'dark') => {
    return createTheme({
        palette: {
            mode,
            primary: {
                main: '#1a5f6a', // Matches --primary
            },
            background: {
                default: mode === 'light' ? '#f8fafc' : '#0f172a',
                paper: mode === 'light' ? '#ffffff' : '#1e293b',
            },
            text: {
                primary: mode === 'light' ? '#0f172a' : '#f8fafc',
                secondary: mode === 'light' ? '#64748b' : '#94a3b8',
            },
        },
        components: {
            MuiTextField: {
                styleOverrides: {
                    root: {
                        '& .MuiOutlinedInput-root': {
                            backgroundColor: 'var(--input-bg)',
                            color: 'var(--input-text)',
                            '& fieldset': {
                                borderColor: 'var(--input-border)',
                            },
                        },
                    },
                },
            },
            MuiSelect: {
                styleOverrides: {
                    root: {
                        backgroundColor: 'var(--input-bg)',
                        color: 'var(--input-text)',
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'var(--input-border)',
                        },
                    },
                },
            },
            MuiPagination: {
                styleOverrides: {
                    root: {
                        '& .MuiPaginationItem-root': {
                            color: 'var(--foreground)',
                            borderColor: 'var(--table-border)',
                        },
                    },
                },
            },
            MuiTableCell: {
                styleOverrides: {
                    root: {
                        color: 'var(--foreground)',
                        borderBottomColor: 'var(--table-border)',
                    },
                    head: {
                        color: 'var(--table-header-text)',
                        backgroundColor: 'var(--table-header-bg)',
                        fontWeight: 'bold',
                    },
                },
            },
        },
    });
};
