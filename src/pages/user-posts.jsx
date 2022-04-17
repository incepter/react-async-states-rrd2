import { useNavigate } from "react-router-dom";
import { Modal } from "antd";

export const UserPosts = ({ state }) => {
  const { data, status } = state;
  const navigate = useNavigate();
  console.log("UserPosts", status);

  return (
    <span>
      <button onClick={() => navigate("..")}>Back</button>
      {status === "initial" || status === "pending" ? "Loading..." : null}
      {status === "error"
        ? `Error occurred... ${state.data?.toString()}`
        : null}
      {status === "aborted" ? "You aborted" : null}
      {status === "success" ? <pre>{JSON.stringify(data, null, 4)}</pre> : null}
    </span>
  );
};

function timeout(delay) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, delay);
  });
}

export const getUserPosts = ({ payload: { id } }) =>
  timeout(1000).then(() =>
    fetch(`https://jsonplaceholder.typicode.com/users/${id}/posts`).then((r) =>
      r.json()
    )
  );
