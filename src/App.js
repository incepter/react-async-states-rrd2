import { BrowserRouter as Router } from "react-router-dom";
import Routes from "./Demo";
import "./styles.css";
import "antd/dist/antd.css";
import { getUsers, UsersList } from "./pages/users";
import { getUser, UserDetails } from "./pages/user-details";
import { getUserPosts, UserPosts } from "./pages/user-posts";

export default function App() {
  return (
    <Router>
      <Routes routes={routesProp} />
    </Router>
  );
}

let routesProp = [
  {
    path: "users",
    routeProps: { exact: true }, // <Route from react-router-dom

    render: UsersList,

    producer: getUsers,
    nestedRoutes: [
      {
        path: ":id",
        render: UserDetails,
        routeProps: { exact: true },
        getDeps: (params) => [params.id],
        getPayload: (params) => ({
          id: params.id
        }),
        producer: getUser,
        nestedRoutes: [
          {
            path: "posts",
            render: UserPosts,
            routeProps: { exact: true },
            getDeps: (params) => [params.id],
            getPayload: (params) => ({
              id: params.id
            }),
            producer: getUserPosts
          }
        ]
      }
    ]
  }
];
