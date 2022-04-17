import { useNavigate, Outlet, Link } from "react-router-dom";
import { Modal } from "antd";

export const UserDetails = ({ state }) => {
  const { data, status, props } = state;
  const navigate = useNavigate();

  let name = data?.name ?? props?.payload?.id;
  return (
    <Modal
      width="1000px"
      onCancel={() => navigate("/users")}
      visible
      title={`User ${name} details`}
    >
      <div style={{ display: "flex" }}>
        <div>
          {status === "initial" || status === "pending" ? "Loading..." : null}
          {status === "error"
            ? `Error occurred... ${state.data?.toString()}`
            : null}
          {status === "aborted" ? "You aborted" : null}
          {status === "success" ? (
            <span style={{ display: "flex", flexDirection: "column" }}>
              <span>Id :{data.id}</span>
              <span>Name :{data.name}</span>
              <span>Username :{data.username}</span>
              <span>Email :{data.email}</span>
              <hr />
              <Link to="posts">User {data.username} posts</Link>
            </span>
          ) : null}
        </div>
        <div>
          <Outlet />
        </div>
      </div>
    </Modal>
  );
};

function timeout(delay) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, delay);
  });
}

export const getUser = ({ payload: { id } }) =>
  timeout(1000).then(() =>
    fetch(`https://jsonplaceholder.typicode.com/users/${id}`).then((r) =>
      r.json()
    )
  );
