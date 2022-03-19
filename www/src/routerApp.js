import React from "react";
import ProductSale from "./view/productSale";
import ProductDiscard from "./view/productDiscard";
import ProductSaleAndDiscard from "./view/productSaleAndDiscard.js";
import CouponSummary from "./view/couponSummary";
import DIYReserve from "./view/diyReserve";
import OrderManagement from "./view/orderManagement";
import ProductionPlanPrinter from "./view/productionPlanPrinter";
import ProductDistributePrinter from "./view/productDistributePrinter";
import ProductDistributePrinter1 from "./view/productDistributePrinter1";
import ProductDistributeInputer from "./view/productDistributeInputer";
import ProductManagement from "./view/productManagement";
import BirthdayCakeSale from "./view/birthdayCakeSale";
import ProductMenu from "./view/productMenu";
import ProductMenu4Printer from "./view/productMenu4Printer";

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
      <Route path="/productionPlanPrinter" children={<ProductionPlanPrinter query={query} />} />
      <Route path="/orderManagement" children={<OrderManagement query={query} />} />
      <Route path="/productDistributePrinter" children={<ProductDistributePrinter query={query} />} />
      <Route path="/productDistributeInputer" children={<ProductDistributeInputer query={query} />} />
      <Route path="/productManagement" children={<ProductManagement query={query} />} />
      <Route path="/birthdayCakeSale" children={<BirthdayCakeSale query={query} />} />
      <Route path="/productMenu" children={<ProductMenu query={query} />} />
      <Route path="/productMenu4Printer" children={<ProductMenu4Printer query={query} />} />
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
