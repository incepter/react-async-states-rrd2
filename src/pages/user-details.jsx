import { useNavigate } from "react-router-dom";
import { Modal } from "antd";

export const UserDetails = ({ state }) => {
  const { data, status, props } = state;
  const navigate = useNavigate();
  console.log("UserDetails", status);

  console.log("payload", props?.payload?.id);
  let name = data?.name ?? props?.payload?.id;
  return (
    <Modal
      onCancel={() => navigate("/users")}
      visible
      title={`User ${name} details`}
    >
      {status === "initial" || status === "pending" ? "Loading..." : null}
      {status === "error"
        ? `Error occurred... ${state.data?.toString()}`
        : null}
      {status === "aborted" ? "You aborted" : null}
      {status === "success" ? <pre>{JSON.stringify(data, null, 4)}</pre> : null}
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
