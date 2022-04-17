import React from "react";
import {
  Routes as RRoutes,
  Route as RRoute,
  useLocation
} from "react-router-dom";
import { createSource, useRunAsyncState } from "react-async-states";
import { RoutesContext } from "./context";
import { RouteComponent } from "./Route";

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
  }, [location, run]); // run is safe

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

function wrapProducer(path, producer, routesSelf) {
  return async function realProducer(props) {
    // run original producer with received payload and args
    const ownPromise = props.runp(
      producer,
      { payload: props.payload },
      ...(props.args ?? [])
    );
    // mark as pending
    routesSelf.pendingPromises[path] = ownPromise;
    // wait for own resolve
    const result = await ownPromise;
    // remove from pending promises
    delete routesSelf.pendingPromises[path];
    if (Object.values(routesSelf.pendingPromises).length > 0) {
      console.log(
        "found something pending, will wait",
        routesSelf.pendingPromises
      );
      // wait all other pending promises before resolve
      await Promise.all(Object.values(routesSelf.pendingPromises));
    }

    // depending on the initial
    if (result.status === "success") {
      return result.data;
    }
    throw result.data;
  };
}

function hasNestedRoutes(route) {
  return Array.isArray(route.nestedRoutes) && route.nestedRoutes.length > 0;
}
