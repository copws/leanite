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
    path: "/leanite/",
    element: <Navigate to="/leanite/home" />,
  },
  {
    path: "/leanite/home",
    element: <Home />,
  },
  {
    path: "/leanite/tag",
    element: <Tag />,
  },
  {
    path: "/leanite/article",
    element: <Article />
  },
  {
    path: "/leanite/authentication",
    element: <Authentication />,
  },
  {
    path: "/leanite/adminHome",
    element: <AdminHome />,
  },
  {
    path: "/leanite/modifyArticle",
    element: <ModifyArticle />,
  },
  {
    path: "/leanite/modifyTags",
    element: <ModifyTags />,
  },
  {
    path: "/leanite/settings",
    element: <Settings />,
  },
];

export default routes;
