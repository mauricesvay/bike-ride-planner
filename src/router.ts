import { createRouter } from "@swan-io/chicane/dist/index.js";

export const Router = createRouter({
  Home: "/",
  Editor: "/editor",
  About: "/about",
  UserList: "/users",
  UserDetail: "/users/:userId",
});