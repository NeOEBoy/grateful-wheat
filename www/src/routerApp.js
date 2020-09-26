import React from "react";
import ProductSale from "./view/productSale";
import {
  BrowserRouter as Router,
  Route,
  useLocation
} from "react-router-dom";
import './routerApp.css';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}
function Inside4QueryParams() {
  let query = useQuery();
  let id = query.get("id");
  let name = query.get("name");
  let number = query.get('number');
  let date = query.get('date');

  return (
    <div>
      <Route exact path="/" children={<ProductSale />} />
      <Route path="/productsale" children={
        <ProductSale id={id} name={name} number={number} date={date} />
      } />
    </div>
  );
}
export default function RouterApp() {
  return (
    <Router>
      <Inside4QueryParams />
    </Router>
  );
}
