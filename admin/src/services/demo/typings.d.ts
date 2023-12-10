/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！

declare namespace API {
  interface PageInfo {
    /** 1 */
    current?: number;
    pageSize?: number;
    total?: number;
    list?: Array<Record<string, any>>;
  }

  interface PageInfo_UserInfo_ {
    /** 1 */
    current?: number;
    pageSize?: number;
    total?: number;
    list?: Array<UserInfo>;
  }

  interface Result {
    success?: boolean;
    errorMessage?: string;
    data?: Record<string, any>;
  }

  interface Result_PageInfo_UserInfo__ {
    success?: boolean;
    errorMessage?: string;
    data?: PageInfo_UserInfo_;
  }

  interface Result_UserInfo_ {
    success?: boolean;
    errorMessage?: string;
    data?: UserInfo;
  }

  interface Result_string_ {
    success?: boolean;
    errorMessage?: string;
    data?: string;
  }

  type UserGenderEnum = 'MALE' | 'FEMALE';

  interface UserInfo {
    id?: string;
    name?: string;
    /** nick */
    nickName?: string;
    /** email */
    email?: string;
    gender?: UserGenderEnum;
  }

  interface UserInfoVO {
    name?: string;
    /** nick */
    nickName?: string;
    /** email */
    email?: string;
  }

  type definitions_0 = null;

  /// custom

  type GetSomeListParams = {
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  };

  type CommonResult = {
    success?: boolean;
    data?: string;
  };

  type OrderList = {
    data?: OrderListItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type OrderListItem = {
    _id?: string;
    createdAt?: string;
    updatedAt?: string;
    userId?: string;
    name?: string;
    description?: string;
    images?: [string],
    cream?: string;
    size?: string;
    sizeExtra?: string;
    price?: string;
    fillings?: [];
    candle?: String,
    candleExtra?: String,
    kindling?: String,
    hat?: String,
    plates?: String,
    pickUpDay?: String,
    pickUpTime?: String,
    pickUpType?: String,
    shop?: String,
    height?: String,
    address?: String,
    pickUpName?: String,
    phoneNumber?: String,
    remarks?: String
  };

  type deleteOneParams = {
    _id?: String;
  };
}
