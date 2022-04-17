import { useNavigate } from "react-router-dom";

export const UserPosts = ({ state }) => {
  const { data, status } = state;
  const navigate = useNavigate();

  return (
    <span>
      <button onClick={() => navigate("..")}>Back</button>
      {status === "initial" || status === "pending" ? "Loading..." : null}
      {status === "error"
        ? `Error occurred... ${state.data?.toString()}`
        : null}
      {status === "aborted" ? "You aborted" : null}
      {status === "success" ? (
        <ul>
          {data.map((p) => (
            <li key={p.id}>{p.title}</li>
          ))}
        </ul>
      ) : null}
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
