import { Outlet, Link } from "react-router-dom";

export function UsersList(props) {
  const {
    state: { data, status }
  } = props;
  console.log("Users", status);
  return (
    <>
      {status === "pending" || status === "initial" ? (
        <UsersFallback {...props} />
      ) : null}
      {status === "success" ? (
        <ul>
          {data.map((t) => (
            <li key={t.id}>
              <Link to={`${t.id}`}>{t.name}</Link>
            </li>
          ))}
        </ul>
      ) : null}
      <Outlet />
    </>
  );
}
export function UsersFallback({ state }) {
  console.log("UsersFallback", state.status);
  switch (state.status) {
    case "pending":
      return <span>loading...</span>;
    case "error":
      return <span>Error occured: {state.data?.toString()}</span>;
    case "aborted":
      return <span>You aborted the request</span>;
    default:
      return null;
  }
}

function timeout(delay) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, delay);
  });
}

export const getUsers = () =>
  timeout(2000).then(() =>
    fetch("https://jsonplaceholder.typicode.com/users").then((r) => r.json())
  );
