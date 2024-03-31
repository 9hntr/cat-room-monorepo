import ReactDOM from "react-dom/client";

// components
import Room from "@/components/room";

// layouts
import MainLayout from "./layouts/Main.layout";

// styles
import "./index.css";

// state management
import { store } from "./store";
import { Provider } from "react-redux";

import SocketHandler from "./components/wsHandler";

const Main = () => {
  return (
    <Provider store={store}>
      <SocketHandler />
      <MainLayout>
        <Room />
      </MainLayout>
    </Provider>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(<Main />);
