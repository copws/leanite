import Tag from "../pages/Tag";
import Home from "../pages/Home";
import Article from "../pages/Article";
import Authentication from "../pages/Authentication";
import AdminHome from "../pages/admin/AdminHome";
import ModifyArticle from "../pages/admin/ModifyArticle";
import ModifyTags from "../pages/admin/ModifyTags";
import Settings from "../pages/admin/Settings";
import { Navigate } from "react-router-dom";

const routes = [
  {
    path: "/",
    element: <Navigate to="/home" />,
  },
  {
    path: "/home",
    element: <Home />,
  },
  {
    path: "/tag",
    element: <Tag />,
  },
  {
    path: "/article",
    element: <Article />
  },
  {
    path: "/authentication",
    element: <Authentication />,
  },
  {
    path: "/adminHome",
    element: <AdminHome />,
  },
  {
    path: "/modifyArticle",
    element: <ModifyArticle />,
  },
  {
    path: "/modifyTags",
    element: <ModifyTags />,
  },
  {
    path: "/settings",
    element: <Settings />,
  },
];

export default routes;
