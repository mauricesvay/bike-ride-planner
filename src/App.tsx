import { ChakraProvider } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { match } from "ts-pattern";
import Editor from "./editor/Editor";
import en from "./l10n/en.json";
import { Router } from "./router";

import "./App.css";

const queryClient = new QueryClient();

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: en,
    },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

function App() {
  const route = Router.useRoute(["Home", "Editor", "UserList", "UserDetail"]);

  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider>
        {match(route)
          .with({ name: "Home" }, () => (
            <div>
              <a href={Router.Editor()}>Editor</a>
            </div>
          ))
          .with({ name: "Editor" }, () => <Editor />)
          .with({ name: "UserList" }, () => <div>User list</div>)
          .with({ name: "UserDetail" }, ({ params }) => (
            <div>{params.userId}</div>
          ))
          .otherwise(() => (
            <div>404</div>
          ))}
      </ChakraProvider>
    </QueryClientProvider>
  );
}

export default App;
