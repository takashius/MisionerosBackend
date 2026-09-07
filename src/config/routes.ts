import user from "../components/user/network";

const urlApi = "";

const routes = function (server: any) {
  server.use(urlApi + "/user", user);
};

export default routes;
