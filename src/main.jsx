import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import "./index.css";
import App from "./App.jsx";
import store from "./store/store";
import { BrowserRouter } from "react-router";
import { I18nProvider } from "./providers/I18nProvider";

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<Provider store={store}>
			<I18nProvider>
				<App />
			</I18nProvider>
		</Provider>
	</StrictMode>
);
