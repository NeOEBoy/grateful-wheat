import React from "react";
import ProductSale from "./view/productSale";
import ProductDiscard from "./view/productDiscard";
import ProductSaleAndDiscard from "./view/productSaleAndDiscard.js";
import CouponSummary from "./view/couponSummary";
import DIYReserve from "./view/diyReserve";
import OrderManagement from "./view/orderManagement";
import OrderManagement1 from "./view/orderManagement1";
import ProductionPlanPrinter from "./view/productionPlanPrinter";
import ProductionPlanPrinter1 from "./view/productionPlanPrinter1";
import ProductDistributePrinter from "./view/productDistributePrinter";
import ProductDistributePrinter1 from "./view/productDistributePrinter1";
import ProductDistributeInputer from "./view/productDistributeInputer";
import ProductLabelPrinter from "./view/productLabelPrinter";
import ProductManagement from "./view/productManagement";
import BirthdayCakeSale from "./view/birthdayCakeSale";
import CakeMenu from "./view/cakeMenu";
import ProductMenu from "./view/productMenu";
import ProductMenu4Printer from "./view/productMenu4Printer";
import ProductStockManagement from "./view/productStockManagement";
import BuildingMap from "./view/buildingMap";
import MapContainer from "./view/MapContainer";
import BirthdayCakeOrder from "./view/birthdayCakeOrder";

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
      <Route exact path="/" children={<BirthdayCakeSale query={query} />} />
      <Route path="/productsale" children={<ProductSale query={query} />} />
      <Route path="/discardsale" children={<ProductDiscard query={query} />} />
      <Route path="/productsaleanddiscard" children={<ProductSaleAndDiscard query={query} />} />
      <Route path="/couponsummary" children={<CouponSummary query={query} />} />
      <Route path="/diyreserve" children={<DIYReserve query={query} />} />
      <Route path="/productionPlanPrinter" children={<ProductionPlanPrinter query={query} />} />
      <Route path="/productionPlanPrinter1" children={<ProductionPlanPrinter1 query={query} />} />
      <Route path="/orderManagement" children={<OrderManagement query={query} />} />
      <Route path="/orderManagement1" children={<OrderManagement1 query={query} />} />
      <Route path="/productDistributePrinter" children={<ProductDistributePrinter query={query} />} />
      <Route path="/productDistributePrinter1" children={<ProductDistributePrinter1 query={query} />} />
      <Route path="/productDistributeInputer" children={<ProductDistributeInputer query={query} />} />
      <Route path="/productLabelPrinter" children={<ProductLabelPrinter query={query} />} />
      <Route path="/productManagement" children={<ProductManagement query={query} />} />
      <Route path="/birthdayCakeSale" children={<BirthdayCakeSale query={query} />} />
      <Route path="/cakeMenu" children={<CakeMenu query={query} />} />
      <Route path="/productMenu" children={<ProductMenu query={query} />} />
      <Route path="/productMenu4Printer" children={<ProductMenu4Printer query={query} />} />
      <Route path="/productStockManagement" children={<ProductStockManagement query={query} />} />
      <Route path="/buildingMap" children={<BuildingMap query={query} />} />
      <Route path="/mapContainer" children={<MapContainer query={query} />} />
      <Route path="/birthdayCakeOrder" children={<BirthdayCakeOrder query={query} />} />
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
