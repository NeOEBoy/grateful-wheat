import React from "react";
// import ProductSale from "./view/productSale";
// import ProductDiscard from "./view/productDiscard";
// import ProductSaleAndDiscard from "./view/productSaleAndDiscard.js";
// import CouponSummary from "./view/couponSummary";
// import DIYReserve from "./view/diyReserve";
// import OrderManagement from "./view/orderManagement";
import OrderManagement1 from "./view/orderManagement1";
// import ProductionPlanPrinter from "./view/productionPlanPrinter";
import ProductionPlanPrinter1 from "./view/productionPlanPrinter1";
// import ProductDistributePrinter from "./view/productDistributePrinter";
import ProductDistributePrinter1 from "./view/productDistributePrinter1";
import ProductDistributeInputer from "./view/productDistributeInputer";
import ProductLabelPrinter from "./view/productLabelPrinter";
import ProductManagement from "./view/productManagement";
// import BirthdayCakeSale from "./view/birthdayCakeSale";
import CakeMenu from "./view/cakeMenu";
import CakeOrder from "./view/cakeOrder";
import ProductMenu from "./view/productMenu";
import ProductMenu1 from "./view/productMenu1";
import ProductMenu4Printer from "./view/productMenu4Printer";
import ProductMenu4Printer1 from "./view/productMenu4Printer1";
import ProductStockManagement from "./view/productStockManagement";
import BuildingMap from "./view/buildingMap";
import Building from "./view/building";
// import MapContainer from "./view/MapContainer";
import BirthdayCakeOrder from "./view/birthdayCakeOrder";
import TestVideo from "./view/testVideo";

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
import VConsole from 'vconsole';
// if (process.env.NODE_ENV === 'development') {
  new VConsole();
// }

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function Inside4QueryParams() {
  let query = useQuery();

  return (
    <div>
      <Route exact path="/" children={<CakeMenu query={query} />} />
      <Route path="/productionPlanPrinter1" children={<ProductionPlanPrinter1 query={query} />} />
      <Route path="/orderManagement1" children={<OrderManagement1 query={query} />} />
      <Route path="/productDistributePrinter1" children={<ProductDistributePrinter1 query={query} />} />
      <Route path="/productDistributeInputer" children={<ProductDistributeInputer query={query} />} />
      <Route path="/productLabelPrinter" children={<ProductLabelPrinter query={query} />} />
      <Route path="/productManagement" children={<ProductManagement query={query} />} />
      <Route path="/cakeMenu" children={<CakeMenu query={query} />} />
      <Route path="/cakeOrder" children={<CakeOrder query={query} />} />
      <Route path="/productMenu" children={<ProductMenu query={query} />} />
      <Route path="/productMenu1" children={<ProductMenu1 query={query} />} />
      <Route path="/productMenu4Printer" children={<ProductMenu4Printer query={query} />} />
      <Route path="/productMenu4Printer1" children={<ProductMenu4Printer1 query={query} />} />
      <Route path="/productStockManagement" children={<ProductStockManagement query={query} />} />
      <Route path="/buildingMap" children={<BuildingMap query={query} />} />
      <Route path="/Building" children={<Building query={query} />} />
      <Route path="/birthdayCakeOrder" children={<BirthdayCakeOrder query={query} />} />
      <Route path="/testVideo" children={<TestVideo query={query} />} />
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
