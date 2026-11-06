import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UniversityProvider } from './context/UniversityContext';
import { ListingProvider } from './context/ListingContext';
import { RequestProvider } from './context/RequestContext';
import { MessageProvider } from './context/MessageContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { BrowsePage } from './pages/BrowsePage';
import { ItemDetailPage } from './pages/ItemDetailPage';
import { CreateListingPage } from './pages/CreateListingPage';
import { RequestsPage } from './pages/RequestsPage';
import { PostRequestPage } from './pages/PostRequestPage';
import { DashboardPage } from './pages/DashboardPage';
import { MessagesPage } from './pages/MessagesPage';
import { AuthPage } from './pages/AuthPage';
import { SetupGuidePage } from './pages/SetupGuidePage';

/**
 * RootRoute enforces login-first navigation:
 * - If user is logged out, redirects to /auth (preserving origin state).
 * - If user is authenticated, directly renders HomePage.
 */
const RootRoute: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-11 h-11 rounded-2xl bg-[#12372A] flex items-center justify-center text-white shadow-md animate-pulse">
          <span className="text-base font-extrabold text-emerald-300">W</span>
        </div>
        <p className="text-xs font-semibold text-neutral-500">Loading WEARHUB...</p>
      </div>
    );
  }

  // When a logged-out user opens the root URL `/`, redirect them to `/auth`
  if (!currentUser) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Authenticated users go directly to the Home page
  return <HomePage />;
};

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UniversityProvider>
          <ListingProvider>
            <RequestProvider>
              <MessageProvider>
                <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
                  <Navbar />
                  <div className="flex-1">
                    <Routes>
                      {/* Root URL `/`: Login-first for logged-out visitors; HomePage for authenticated users */}
                      <Route path="/" element={<RootRoute />} />

                      {/* Public marketplace browsing */}
                      <Route path="/browse" element={<BrowsePage />} />
                      <Route path="/item/:id" element={<ItemDetailPage />} />
                      <Route path="/requests" element={<RequestsPage />} />

                      {/* Protected actions: strictly require authentication */}
                      <Route
                        path="/create-listing"
                        element={
                          <ProtectedRoute>
                            <CreateListingPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/post-request"
                        element={
                          <ProtectedRoute>
                            <PostRequestPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/profile"
                        element={
                          <ProtectedRoute>
                            <DashboardPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/dashboard"
                        element={
                          <ProtectedRoute>
                            <DashboardPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/my-listings"
                        element={
                          <ProtectedRoute>
                            <DashboardPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/messages"
                        element={
                          <ProtectedRoute>
                            <MessagesPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* Authentication page */}
                      <Route path="/auth" element={<AuthPage />} />

                      {/* Setup & deployment documentation */}
                      <Route path="/setup-guide" element={<SetupGuidePage />} />

                      {/* Catch-all redirect to root (which directs to /auth if logged out) */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </div>
                  <Footer />
                </div>
              </MessageProvider>
            </RequestProvider>
          </ListingProvider>
        </UniversityProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
