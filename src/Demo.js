import React from "react";
import {
  Routes as RRoutes,
  Route as RRoute,
  useParams,
  useLocation
} from "react-router-dom";
import {
  useAsyncState,
  createSource,
  useRunAsyncState
} from "react-async-states";

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
  getPayload = () => {},
  fallback = null,
  getDeps = () => []
}) {
  const params = useParams();

  const routesContext = React.useContext(RoutesContext);
  const routeContext = React.useContext(RouteContext);
  const isNested = routeContext !== null;

  const self = React.useMemo(() => {
    const output = Object.create(null);

    output.path = path;
    output.isNested = isNested;
    output.producer = producer;

    return output;
  }, [path, params, producer]); // isNested is safe

  self.params = params;

  const routeSource = routesContext.addRoute(path, self);

  React.useEffect(() => {
    return () => routesContext.removeRoute(path);
  }, [path]);

  const props = useAsyncState(
    { source: routeSource, payload: getPayload(params) },
    getDeps(params)
  );

  React.useEffect(() => {
    return routesContext.dependenciesRun(path);
  }, [...getDeps(params)]);

  // console.log("current state", props.state.status, props);

  const renderProps = { ...props, params };
  return (
    <RouteContext.Provider value={props}>
      {render(children, renderProps)}
    </RouteContext.Provider>
  );
}

const RoutesContext = React.createContext(null);

function wrapProducer(path, producer, routesSelf) {
  return async function realProducer(props) {
    const ownPromise = props.runp(
      producer,
      { payload: props.payload },
      ...(props.args ?? [])
    );
    routesSelf.pendingPromises[path] = ownPromise;
    const result = await ownPromise;
    delete routesSelf.pendingPromises[path];
    if (Object.values(routesSelf.pendingPromises).length > 0) {
      console.log(
        "found something pending, will wait",
        routesSelf.pendingPromises
      );
      await Promise.all(Object.values(routesSelf.pendingPromises));
    }

    if (result.status === "success") {
      return result.data;
    }
    throw result.data;
  };
}

export default function Routes({ routes }) {
  if (!Array.isArray(routes) || routes.length === 0) {
    throw new Error(
      "Routes component expects a single prop 'routes': not empty array"
    );
  }
  const run = useRunAsyncState();
  const location = useLocation();

  const ctxValue = React.useMemo(() => {
    const pendingPromises = {};
    const renderedRoutes = {};
    const self = {
      renderedRoutes,
      pendingPromises,
      removeRoute(path) {
        delete renderRoutes[path];
      },
      dependenciesRun(path) {
        // renderedRoutes[path].pendingRun = true;
        // this function is called inside effect and should return cleanup

        const { source } = renderedRoutes[path];
        return run(source);
      }
    };
    function addRoute(path, config) {
      if (renderedRoutes[path]) {
        return renderedRoutes[path].source;
      }
      renderedRoutes[path] = { ...config };
      renderedRoutes[path].source = createSource(
        "route-" + path,
        wrapProducer(path, config.producer, self)
      );
      return renderedRoutes[path].source;
    }

    self.addRoute = addRoute;
    return self;
  }, [location]);

  return (
    <RoutesContext.Provider value={ctxValue}>
      <RRoutes>{renderRoutes(routes)}</RRoutes>
    </RoutesContext.Provider>
  );
}

function renderRoutes(routes) {
  return routes.map((route) => (
    <RRoute
      key={route.path}
      {...route.routeProps}
      path={route.path}
      element={
        <RouteComponent
          path={route.path}
          getDeps={route.getDeps}
          children={route.render}
          fallback={route.fallback}
          producer={route.producer}
          getPayload={route.getPayload}
        />
      }
      children={
        hasNestedRoutes(route) ? renderRoutes(route.nestedRoutes) : null
      }
    />
  ));
}

function hasNestedRoutes(route) {
  return Array.isArray(route.nestedRoutes) && route.nestedRoutes.length > 0;
}

function render(comp, props) {
  return typeof comp === "function" ? React.createElement(comp, props) : comp;
}
