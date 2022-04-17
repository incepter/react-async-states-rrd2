import React from "react";
import { useParams } from "react-router-dom";
import { useAsyncState } from "react-async-states";
import { RoutesContext } from "./context";

const RouteContext = React.createContext(null);

export function useRouteData() {
  const routeData = React.useContext(RouteContext);
  if (!routeData) {
    throw new Error("You cannot use useRouteData outside a route");
  }
  return routeData;
}

export function RouteComponent({
  path,
  producer,
  children,
  getDeps = () => [],
  getPayload = () => {}
}) {
  const params = useParams();

  const routesContext = React.useContext(RoutesContext);
  const routeContext = React.useContext(RouteContext);
  const isNested = routeContext !== null;

  const self = React.useMemo(() => {
    const output = Object.create(null);

    output.path = path;
    output.params = params;
    output.isNested = isNested;
    output.producer = producer;

    return output;
  }, [path, params, producer, isNested]); // isNested is safe

  const routeSource = React.useMemo(() => routesContext.addRoute(path, self), [
    path,
    self,
    routesContext
  ]);

  React.useEffect(() => () => routesContext.removeRoute(path), [
    routesContext,
    path
  ]);

  const props = useAsyncState(
    { source: routeSource, payload: getPayload(params) },
    getDeps(params)
  );

  React.useEffect(() => {
    return routesContext.dependenciesRun(path);
  }, [path, routesContext, ...getDeps(params)]);

  const renderProps = { ...props, params };
  return (
    <RouteContext.Provider value={props}>
      {render(children, renderProps)}
    </RouteContext.Provider>
  );
}

function render(comp, props) {
  return typeof comp === "function" ? React.createElement(comp, props) : comp;
}
