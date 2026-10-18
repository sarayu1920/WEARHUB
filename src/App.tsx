import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UniversityProvider } from './context/UniversityContext';
import { ListingProvider } from './context/ListingContext';
import { RequestProvider } from './context/RequestContext';
import { MessageProvider } from './context/MessageContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
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
                      <Route path="/" element={<HomePage />} />
                      <Route path="/browse" element={<BrowsePage />} />
                      <Route path="/item/:id" element={<ItemDetailPage />} />
                      <Route path="/create-listing" element={<CreateListingPage />} />
                      <Route path="/requests" element={<RequestsPage />} />
                      <Route path="/post-request" element={<PostRequestPage />} />
                      <Route path="/profile" element={<DashboardPage />} />
                      <Route path="/messages" element={<MessagesPage />} />
                      <Route path="/auth" element={<AuthPage />} />
                      <Route path="/setup-guide" element={<SetupGuidePage />} />
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
