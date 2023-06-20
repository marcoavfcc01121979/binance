import React from "react";
import { Route, BrowserRouter, Redirect } from "react-router-dom";

import Login from "./public/Login/Login";
import Settings from "./private/Settings/Settings";

function Routes() {
  function PrivateRoute({ children, ...rest }) {
    // const isAuthenticated = localStorage.getItem("token");

    return (
      <Route
        {...rest}
        render={() => {
          return localStorage.getItem("token") ? children : <Redirect to="/" />;
        }}
      />
    );
  }

  return (
    <BrowserRouter>
      <Route path="/" exact>
        <Login />
      </Route>
      <PrivateRoute path="/settings">
        <Settings />
      </PrivateRoute>
    </BrowserRouter>
  );
}

export default Routes;
