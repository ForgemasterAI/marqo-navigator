import { Refine } from '@refinedev/core';
import { RefineKbar, RefineKbarProvider } from '@refinedev/kbar';

import { ErrorComponent, RefineSnackbarProvider, ThemedLayoutV2, ThemedTitleV2 } from '@refinedev/mui';

import CssBaseline from '@mui/material/CssBaseline';
import GlobalStyles from '@mui/material/GlobalStyles';
import routerBindings, { DocumentTitleHandler, UnsavedChangesNotifier } from '@refinedev/react-router-v6';
import { dataProvider } from './marqo/dataloader';
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom';
import { Header } from './components/header';
import { ColorModeContextProvider } from './contexts/color-mode';
import { IndexesCreate, IndexesEdit, IndexesList, IndexesShow } from './pages/indexes';
import { DashboardOutlined } from '@mui/icons-material';
import Dashboard from './pages/dashboard';

function App() {
    return (
        <BrowserRouter>
            <RefineKbarProvider>
                <ColorModeContextProvider>
                    <CssBaseline />
                    <GlobalStyles styles={{ html: { WebkitFontSmoothing: 'auto' } }} />
                    <RefineSnackbarProvider>
                        <Refine
                            dataProvider={{
                                default: dataProvider(import.meta.env.VITE_BASE_URL),
                            }}
                            routerProvider={routerBindings}
                            resources={[
                                {
                                    name: 'dashboard',
                                    list: '/',
                                    meta: {
                                        label: 'Dashboard',
                                        icon: <DashboardOutlined />,
                                    },
                                },
                                {
                                    name: 'indexes',
                                    list: '/indexes',
                                    create: '/indexes/create',
                                    show: '/indexes/show/:id',
                                    canDelete: true,
                                },
                            ]}
                            options={{
                                syncWithLocation: true,
                                warnWhenUnsavedChanges: true,
                                useNewQueryKeys: true,
                            }}
                        >
                            <Routes>
                                <Route
                                    element={
                                        <ThemedLayoutV2
                                            Header={() => <Header sticky />}
                                            Title={({ collapsed }) => (
                                                <ThemedTitleV2
                                                    // collapsed is a boolean value that indicates whether the <Sidebar> is collapsed or not
                                                    collapsed={collapsed}
                                                    icon={<DashboardOutlined />}
                                                    text="Marqo Navigator"
                                                />
                                            )}
                                        >
                                            <Outlet />
                                        </ThemedLayoutV2>
                                    }
                                >
                                    <Route index element={<Dashboard></Dashboard>} />
                                    <Route path="dashboard" element={<Dashboard />}></Route>

                                    <Route path="indexes">
                                        <Route index element={<IndexesList />} />
                                        <Route path="create" element={<IndexesCreate />} />
                                        <Route path="edit/:id" element={<IndexesEdit />} />
                                        <Route path="show/:id" element={<IndexesShow />} />
                                    </Route>

                                    <Route path="*" element={<ErrorComponent />} />
                                </Route>
                            </Routes>
                            <RefineKbar />
                            <UnsavedChangesNotifier />
                            <DocumentTitleHandler />
                        </Refine>
                    </RefineSnackbarProvider>
                </ColorModeContextProvider>
            </RefineKbarProvider>
        </BrowserRouter>
    );
}

export default App;
