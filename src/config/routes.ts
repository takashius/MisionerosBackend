import user from "../components/user/network";
import participant from "../components/participant/network";
import scan from "../components/scan/network";
import schedule from "../components/schedule/network";
import contact from "../components/contact/network";

const urlApi = "";

const routes = function (server: any) {
  server.use(urlApi + "/user", user);
  server.use(urlApi + "/participant", participant);
  server.use(urlApi + "/scan", scan);
  server.use(urlApi + "/schedule", schedule);
  server.use(urlApi + "/contact", contact);
};

export default routes;
