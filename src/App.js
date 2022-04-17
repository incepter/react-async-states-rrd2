import { BrowserRouter as Router, Link } from "react-router-dom";
import "./styles.css";
import "antd/dist/antd.css";
import { getUsers, UsersList } from "./pages/users";
import { getUser, UserDetails } from "./pages/user-details";
import { getUserPosts, UserPosts } from "./pages/user-posts";
import Routes from "./routes/Routes";
import { useState } from "react";

export default function App() {
  return (
    <Router>
      <NavigationDemo />
      <Routes routes={AppRoutes} />
    </Router>
  );
}

let AppRoutes = [
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
function NavigationDemo() {
  const [id, setId] = useState("1");

  return (
    <div style={{ padding: 16 }}>
      <input
        value={id}
        type="number"
        placeholder="userId"
        onChange={(e) => setId(e.target.value)}
      />
      <span> </span>
      <Link to={`users/${id}`}>User Details</Link>
      <span> </span>
      <Link to={`users/${id}/posts`}>User Posts</Link>
    </div>
  );
}
