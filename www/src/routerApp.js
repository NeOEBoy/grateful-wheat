import React from "react";
import ProductSale from "./view/productSale";
import ProductDiscard from "./view/productDiscard";
import ProductSaleAndDiscard from "./view/productSaleAndDiscard.js";
import CouponSummary from "./view/couponSummary";
import DIYReserve from "./view/diyReserve";

import {
  BrowserRouter as Router,
  Route,
  useLocation
} from "react-router-dom";
import './routerApp.css';

import {
  ConfigProvider
} from 'antd';
// 在需要用到的 组件文件中引入中文语言包
import zhCN from 'antd/es/locale/zh_CN';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}
function Inside4QueryParams() {
  let query = useQuery();

  return (
    <div>
      <Route exact path="/" children={<ProductSale />} />
      <Route path="/productsale" children={<ProductSale query={query} />} />
      <Route path="/discardsale" children={<ProductDiscard query={query} />} />
      <Route path="/productsaleanddiscard" children={<ProductSaleAndDiscard query={query} />} />
      <Route path="/couponsummary" children={<CouponSummary query={query} />} />
      <Route path="/diyreserve" children={<DIYReserve query={query} />} />
    </div>
  );
}
export default function RouterApp() {
  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <Inside4QueryParams />
      </Router>
    </ConfigProvider>
  );
}
