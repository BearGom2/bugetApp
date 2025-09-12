import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import MainPage from "../pages/MainPage";
import HistoryPage from "../pages/history/HistoryPage";
import CategoryPage from "../pages/categoty/CategoryPage";
import CategoryAddPage from "../pages/categoty/CategoryAddPage";
import CategoryEditPage from "../pages/categoty/CategoryEditPage";
import WhoAddPage from "../pages/who/WhoAddPage";
import WhoPage from "../pages/who/WhoPage";
import WhoEditPage from "../pages/who/WhoEditPage";
import HistoryAddPage from "../pages/history/HistoryAddPage";
import HistoryEditPage from "../pages/history/HistoryEdit";

const PUBLIC_PATHS = ["/login", "/signup"];

const AppRouter = () => {
  const user = localStorage.getItem("user");
  const location = useLocation();

  const isPublic = PUBLIC_PATHS.includes(location.pathname);

  if (!user && !isPublic) {
    return <Navigate to="/login" replace />;
  }

  if (user && isPublic) {
    return <Navigate to="/main" replace />;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/main" element={<MainPage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/history/add" element={<HistoryAddPage />} />
      <Route path="/history/edit/:id" element={<HistoryEditPage />} />
      <Route path="/category" element={<CategoryPage />} />
      <Route path="/category/add" element={<CategoryAddPage />} />
      <Route path="/category/edit/:id" element={<CategoryEditPage />} />
      <Route path="/who" element={<WhoPage />} />
      <Route path="/who/add" element={<WhoAddPage />} />
      <Route path="/who/edit/:id" element={<WhoEditPage />} />
      <Route path="*" element={<Navigate to="/main" replace />} />
    </Routes>
  );
};

export default AppRouter;
