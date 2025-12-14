import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Home from "../Routes/Home/Home";
import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
import Login from "../Routes/Login";
import { AuthProvider } from "../contexts/AuthProvider";
import { ProfileProvider } from "../contexts/ProfileProvider";
import MyRoutine from "../Routes/MyRoutine/MyRoutine";
import Routine from "../Routes/Routine/Routine";
import WriteRoutine from "../Routes/Routine/WriteRoutine";
import RoutineDateail from "../Routes/Routine/RoutineDetail";
import EditRoutine from "../Routes/Routine/EditRoutine";
import ExerciseBlock from "../Routes/MyRoutine/Block";
import Community from "../Routes/Community/Community";
import WritePost from "../Routes/Community/WritePost";
import Post from "../Routes/Community/Post";
import EditPost from "../Routes/Community/EditPost";
import Diary from "../Routes/Diary/Diary";
import WriteDiary from "../Routes/Diary/WriteDiary";
import DiaryDetail from "../Routes/Diary/DiaryDetail";
import EditDiary from "../Routes/Diary/EditDiary";
import Highlights from "../Routes/Highlight/Highlights";
import HighlightPlayer from "../Routes/Highlight/HighlightPlayer";
import WriteHighlight from "../Routes/Highlight/WriteHighlight";
import EditHighlight from "../Routes/Highlight/EditHighlight";
import Ranking from "../Routes/Ranking/Ranking";
import SearchResult from "../Routes/SearchResult";
import Setting from "../Routes/Setting/Setting";
import Profile from "../Routes/Profile/Profile";
import PrivateRoute from "./PrivateRoute";
import Dashboard from "../Routes/Admin/Dashboard";
import MobileHighlightPlayer from "../Routes/Highlight/MobileHighlightPlyaer";
import useWindowWidth from "./useWindowWidth";
import Notify from "../Routes/Notify";


const AppRouter = () => {
  const width = useWindowWidth();
  const isMobile = width < 1024;

  return (
    <AuthProvider>
      <ProfileProvider>
        <BrowserRouter>
          <Routes>
            {/* Navbar 포함된 일반 레이아웃 */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/myroutine" element={<PrivateRoute><MyRoutine /></PrivateRoute>} />
              <Route path="/myblock" element={<PrivateRoute><ExerciseBlock /></PrivateRoute>} />
              <Route path="/routine" element={<Routine />} />
              <Route path="/routine/write" element={<PrivateRoute><WriteRoutine /></PrivateRoute>} />
              <Route path="/routine/:postId" element={<PrivateRoute><RoutineDateail /></PrivateRoute>} />
              <Route path="/routine/edit/:postId" element={<PrivateRoute><EditRoutine /></PrivateRoute>} />
              <Route path="/community" element={<Community />} />
              <Route path="/community/:postId" element={<PrivateRoute><Post /></PrivateRoute>} />
              <Route path="/community/write" element={<PrivateRoute><WritePost /></PrivateRoute>} />
              <Route path="/community/edit/:postId" element={<PrivateRoute><EditPost /></PrivateRoute>} />
              <Route path="/diary" element={<Diary />} />
              <Route path="/diary/write" element={<PrivateRoute><WriteDiary /></PrivateRoute>} />
              <Route path="/diary/:postId" element={<PrivateRoute><DiaryDetail /></PrivateRoute>} />
              <Route path="/diary/edit/:postId" element={<PrivateRoute><EditDiary /></PrivateRoute>} />
              <Route path="/highlight" element={<Highlights />} />
              <Route path="/highlight/write" element={<PrivateRoute><WriteHighlight /></PrivateRoute>} />
              <Route path="/highlight/:postId" element={<PrivateRoute>{isMobile ? <MobileHighlightPlayer /> : <HighlightPlayer />}</PrivateRoute>} />
              <Route path="/highlight/edit/:postId" element={<PrivateRoute><EditHighlight /></PrivateRoute>} />
              <Route path="/ranking" element={<PrivateRoute><Ranking /></PrivateRoute>} />
              <Route path="/search" element={<SearchResult />} />
              <Route path="/setting" element={<PrivateRoute><Setting /></PrivateRoute>} />
              <Route path="/profile/:profileId" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/notify" element={<PrivateRoute><Notify /></PrivateRoute>} />
            </Route>
            {/* Navbar 없는 로그인/회원가입 레이아웃 */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ProfileProvider>
    </AuthProvider>
  );
};

export default AppRouter;
