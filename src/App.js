// src/App.js
import { Switch, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Products from "./components/Products";
import ipConfig from "./ipConfig.json";
import Checkout from "./components/Checkout";
import Thanks from "./components/Thanks";

export const config = {
  endpoint: `https://qkart-rwel.onrender.com/api/v1`,
};

function App() {
  return (
    <div className="App">
      <Switch>
        <Route path="/" exact component={Products} />
        <Route path="/products" component={Products} />
        <Route path="/register" component={Register} />
        <Route path="/login" component={Login} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/thanks" component={Thanks} />
      </Switch>
    </div>
  );
}

export default App;
