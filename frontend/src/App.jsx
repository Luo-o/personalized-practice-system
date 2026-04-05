import { BrowserRouter } from "react-router-dom";
import { useEffect } from "react";
import AppRouter from "./routes/Router";
import { useAuthStore } from "./store/index";

function App() {
  const restore = useAuthStore((state) => state.restore);

  useEffect(() => {
    restore();
  }, [restore]);

  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}

export default App;
