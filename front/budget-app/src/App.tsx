import { BrowserRouter } from "react-router-dom";
import AppRouter from "./routes/AppRouter";
import TopBar from "./component/TopBar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={1500} />
      <TopBar />
      <AppRouter />
    </BrowserRouter>
  );
}

export default App;
