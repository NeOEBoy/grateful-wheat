(this.webpackJsonpwww=this.webpackJsonpwww||[]).push([[0],{143:function(e,t,a){e.exports=a(221)},148:function(e,t,a){},219:function(e,t,a){},221:function(e,t,a){"use strict";a.r(t);var n=a(0),r=a.n(n),i=a(23),c=a.n(i),s=(a(148),a(8)),o=a.n(s),l=a(21),u=a(67),d=a(68),m=a(75),h=a(73),f=a(226),p=a(223),g=a(227),v=a(229),y=a(225),x=a(54),b=a(224),k=a(134);console.log("process.env.NODE_ENV = production");var w="http://gratefulwheat.ruyue.xyz/apis",E=function(){var e=Object(l.a)(o.a.mark((function e(t,a,n,r,i,c){var s,l,u;return o.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return s=w+"/product/saleList",s+="?pageIndex=",s+=r,s+="&pageSize=",s+=i,s+="&userId=",s+=t,s+="&beginDateTime=",s+=a,s+="&endDateTime=",s+=n,s+="&keyword=",s+=c,e.next=15,fetch(s);case 15:return l=e.sent,e.next=18,l.json();case 18:return u=e.sent,e.abrupt("return",u);case 20:case"end":return e.stop()}}),e)})));return function(t,a,n,r,i,c){return e.apply(this,arguments)}}(),D=function(){var e=Object(l.a)(o.a.mark((function e(t,a,n,r){var i,c,s;return o.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return i=w+"/product/discardList",i+="?userId=",i+=t,i+="&beginDateTime=",i+=a,i+="&endDateTime=",i+=n,i+="&keyword=",i+=r,console.log(i),e.next=12,fetch(i);case 12:return c=e.sent,e.next=15,c.json();case 15:return s=e.sent,e.abrupt("return",s);case 17:case"end":return e.stop()}}),e)})));return function(t,a,n,r){return e.apply(this,arguments)}}(),I=function(){var e=Object(l.a)(o.a.mark((function e(t,a,n,r,i){var c,s,l;return o.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return c=w+"/product/saleAndDiscardList",c+="?userId=",c+=t,c+="&categoryId=",c+=a,c+="&beginDateTime=",c+=n,c+="&endDateTime=",c+=r,c+="&keyword=",c+=i,e.next=13,fetch(c);case 13:return s=e.sent,e.next=16,s.json();case 16:return l=e.sent,e.abrupt("return",l);case 18:case"end":return e.stop()}}),e)})));return function(t,a,n,r,i){return e.apply(this,arguments)}}(),Y=a(118),T=a.n(Y),O=a(228),S=(a(98),a(74)),M=a(27),j=a.n(M),H=f.a.Search,z=p.a.RangePicker,P=[{index:0,name:"\u5168\u90e8",userId:""},{index:1,name:"\u6559\u80b2\u5c40\u5e97",userId:"3995767"},{index:2,name:"\u65e7\u9547\u5e97",userId:"3995771"},{index:3,name:"\u6c5f\u6ee8\u5e97",userId:"4061089"},{index:4,name:"\u6c64\u6cc9\u4e16\u7eaa\u5e97",userId:"4061092"}],C=function(e){Object(m.a)(a,e);var t=Object(h.a)(a);function a(e){var n;Object(u.a)(this,a),(n=t.call(this,e)).handleInfiniteOnLoad=Object(l.a)(o.a.mark((function e(){return o.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,n.fetchNextPage();case 2:case"end":return e.stop()}}),e)})));var r=n.props.query,i="",c="";return r&&(i=(i=r.get("beginDateTime")).replace(" ","+"),c=(c=r.get("endDateTime")).replace(" ","+")),n.state={listData:[],loading:!1,hasMore:!0,pageIndex:1,shopIndex:1,userId:"",beginDateTime:i,endDateTime:c,keyword:""},n}return Object(d.a)(a,[{key:"componentDidMount",value:function(){var e=Object(l.a)(o.a.mark((function e(){var t,a;return o.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return t=this.props.query,a="",t&&(a=t.get("id")),e.next=5,this.initFirstPage(a);case 5:case"end":return e.stop()}}),e,this)})));return function(){return e.apply(this,arguments)}}()},{key:"initFirstPage",value:function(){var e=Object(l.a)(o.a.mark((function e(t,a,n,r){var i,c=this;return o.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:i=0;case 1:if(!(i<P.length)){e.next=8;break}if(P[i].userId!==t){e.next=5;break}return this.setState({shopIndex:i}),e.abrupt("break",8);case 5:i++,e.next=1;break;case 8:this.setState({userId:void 0!==t?t:this.state.userId,listData:[],loading:!1,hasMore:!0,pageIndex:1,beginDateTime:void 0!==a?a:this.state.beginDateTime,endDateTime:void 0!==n?n:this.state.endDateTime,keyword:void 0!==r?r:this.state.keyword},Object(l.a)(o.a.mark((function e(){return o.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,c.fetchNextPage();case 2:case"end":return e.stop()}}),e)}))));case 9:case"end":return e.stop()}}),e,this)})));return function(t,a,n,r){return e.apply(this,arguments)}}()},{key:"fetchNextPage",value:function(){var e=Object(l.a)(o.a.mark((function e(){var t,a,n,r,i,c,s,l,u,d,m,h,f;return o.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(t=this.state,a=t.hasMore,n=t.pageIndex,r=t.listData,a){e.next=4;break}return g.b.warning("\u6ca1\u6709\u66f4\u591a\u6570\u636e\u4e86"),e.abrupt("return");case 4:return this.setState({loading:!0}),e.prev=5,i=this.state,c=i.userId,s=i.beginDateTime,l=i.endDateTime,u=i.keyword,d=[],e.next=10,E(c,s,l,n,20,u);case 10:(m=e.sent)&&0===m.errCode&&(d=m.list),h=d.length/20>=1,f=n,h&&f++,r=r.concat(d),this.setState({listData:r,hasMore:h,loading:!1,pageIndex:f}),e.next=22;break;case 19:e.prev=19,e.t0=e.catch(5),this.setState({loading:!1});case 22:case"end":return e.stop()}}),e,this,[[5,19]])})));return function(){return e.apply(this,arguments)}}()},{key:"render",value:function(){var e=this,t=this.state,a=t.shopIndex,n=t.beginDateTime,i=t.endDateTime,c=P[a].name;return r.a.createElement("div",{style:{height:window.innerHeight,overflow:"auto"}},r.a.createElement("div",{style:{textAlign:"center",fontSize:24,fontWeight:"bold"}},"\u70ed\u5356\u5546\u54c1",r.a.createElement("br",null),r.a.createElement(v.a,{overlay:function(){var t=P[0],a=P[1],n=P[2],i=P[3],c=P[4];return r.a.createElement(y.a,{onClick:function(){var t=Object(l.a)(o.a.mark((function t(a){var n,r;return o.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return n=a.key,r=P[n].userId,t.next=4,e.initFirstPage(r);case 4:case"end":return t.stop()}}),t)})));return function(e){return t.apply(this,arguments)}}()},r.a.createElement(y.a.Item,{key:t.index},t.name),r.a.createElement(y.a.Item,{key:a.index},a.name),r.a.createElement(y.a.Item,{key:n.index},n.name),r.a.createElement(y.a.Item,{key:i.index},i.name),r.a.createElement(y.a.Item,{key:c.index},c.name))},trigger:["click"]},r.a.createElement(x.a,{size:"small",style:{width:240},onClick:function(e){return e.preventDefault()}},c,r.a.createElement(O.a,null))),r.a.createElement("br",null),r.a.createElement(z,{size:"small",locale:S.a,bordered:!0,style:{width:320,marginTop:15},placeholder:["\u5f00\u59cb\u65f6\u95f4","\u7ed3\u675f\u65f6\u95f4"],inputReadOnly:!0,defaultValue:[j()(n,"YYYY.MM.DD+HH:mm:ss"),j()(i,"YYYY.MM.DD+HH:mm:ss")],showTime:{hideDisabledOptions:!0,defaultValue:[j()("00:00:00","HH:mm:ss"),j()("23:59:59","HH:mm:ss")],showTime:!0,showHour:!1,showMinute:!1,showSecond:!1},onChange:function(e){e||g.b.warning("\u8bf7\u9009\u62e9\u6b63\u786e\u7684\u65e5\u671f!")},onOk:function(){var t=Object(l.a)(o.a.mark((function t(a){return o.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,e.initFirstPage(void 0,a[0]?a[0].format("YYYY.MM.DD+HH:mm:ss"):void 0,a[1]?a[1].format("YYYY.MM.DD+HH:mm:ss"):void 0);case 2:case"end":return t.stop()}}),t)})));return function(e){return t.apply(this,arguments)}}()}),r.a.createElement("br",null),r.a.createElement(H,{style:{width:280,marginTop:15},size:"small",placeholder:"\u8f93\u5165\u5546\u54c1\u540d\u79f0\u540e\u67e5\u8be2",enterButton:"\u67e5\u8be2",onSearch:function(){var t=Object(l.a)(o.a.mark((function t(a){return o.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,e.initFirstPage(void 0,void 0,void 0,a);case 2:case"end":return t.stop()}}),t)})));return function(e){return t.apply(this,arguments)}}()})),r.a.createElement(T.a,{initialLoad:!1,pageStart:0,loadMore:this.handleInfiniteOnLoad,hasMore:!this.state.loading&&this.state.hasMore,useWindow:!1},r.a.createElement(b.b,{dataSource:this.state.listData,locale:{emptyText:"\u6682\u65f6\u6ca1\u6709\u6570\u636e"},footer:r.a.createElement("div",{style:{height:100,textAlign:"center",fontSize:14,fontWeight:"lighter"}},"\u5f2f\u9ea6--\u5fc3\u91cc\u6ee1\u6ee1\u90fd\u662f\u4f60"),renderItem:function(t){var a=e.state.listData.indexOf(t),n="gray";0===a?n="orange":1===a?n="green":2===a&&(n="red");var i="-"!==t.specification?" | "+t.specification:"",c=""!==t.category?" | "+t.category:"";return r.a.createElement(b.b.Item,null,r.a.createElement("div",{style:{width:30,height:30,backgroundColor:n,color:"white",fontSize:14,fontWeight:"bold",textAlign:"center",marginRight:15,marginLeft:15,borderRadius:10}},r.a.createElement("div",{style:{marginTop:3}},a+1)),r.a.createElement(b.b.Item.Meta,{title:r.a.createElement("div",null,r.a.createElement("span",{style:{fontSize:16}},t.name),r.a.createElement("span",{style:{fontSize:12}},i),r.a.createElement("span",{style:{fontSize:10}},c)),description:"\u9500\u552e\u6570\u91cf\uff1a".concat(t.saleNumber," \u73b0\u6709\u5e93\u5b58\uff1a").concat(t.currentNumber)}),r.a.createElement("span",{style:{marginRight:25,color:"coral",fontSize:18}},"\uffe5".concat(t.realIncome)))}},this.state.loading&&this.state.hasMore&&r.a.createElement("div",null,r.a.createElement(k.a,{style:{position:"absolute",bottom:15,width:"100%",textAlign:"center"}})))))}}]),a}(r.a.Component),F=p.a.RangePicker,R=f.a.Search,L=[{index:0,name:"\u5168\u90e8",userId:""},{index:1,name:"\u6559\u80b2\u5c40\u5e97",userId:"3995767"},{index:2,name:"\u65e7\u9547\u5e97",userId:"3995771"},{index:3,name:"\u6c5f\u6ee8\u5e97",userId:"4061089"},{index:4,name:"\u6c64\u6cc9\u4e16\u7eaa\u5e97",userId:"4061092"}],W=function(e){Object(m.a)(a,e);var t=Object(h.a)(a);function a(e){var n;Object(u.a)(this,a);var r=(n=t.call(this,e)).props.query,i="",c="";return r&&(i=(i=r.get("beginDateTime")).replace(" ","+"),c=(c=r.get("endDateTime")).replace(" ","+")),n.state={userId:"",shopIndex:1,listData:[],loading:!1,beginDateTime:i,endDateTime:c,keyword:""},n}return Object(d.a)(a,[{key:"componentDidMount",value:function(){var e=Object(l.a)(o.a.mark((function e(){var t,a;return o.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return t=this.props.query,a="",t&&(a=t.get("id")),e.next=5,this.initFirstPage(a);case 5:case"end":return e.stop()}}),e,this)})));return function(){return e.apply(this,arguments)}}()},{key:"initFirstPage",value:function(){var e=Object(l.a)(o.a.mark((function e(t,a,n,r){var i,c=this;return o.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:i=0;case 1:if(!(i<L.length)){e.next=8;break}if(L[i].userId!==t){e.next=5;break}return this.setState({shopIndex:i}),e.abrupt("break",8);case 5:i++,e.next=1;break;case 8:this.setState({userId:void 0!==t?t:this.state.userId,listData:[],loading:!1,beginDateTime:void 0!==a?a:this.state.beginDateTime,endDateTime:void 0!==n?n:this.state.endDateTime,keyword:void 0!==r?r:this.state.keyword},Object(l.a)(o.a.mark((function e(){return o.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,c.fetchListData();case 2:case"end":return e.stop()}}),e)}))));case 9:case"end":return e.stop()}}),e,this)})));return function(t,a,n,r){return e.apply(this,arguments)}}()},{key:"fetchListData",value:function(){var e=Object(l.a)(o.a.mark((function e(){var t,a,n,r,i,c,s,l,u;return o.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,t=this.state,a=t.listData,n=t.userId,r=t.beginDateTime,i=t.endDateTime,c=t.keyword,s=[],this.setState({loading:!0}),e.next=6,D(n,r,i,c);case 6:(l=e.sent)&&0===l.errCode&&(s=l.list),u=a.concat(s),this.setState({listData:u,loading:!1}),e.next=15;break;case 12:e.prev=12,e.t0=e.catch(0),this.setState({loading:!1});case 15:case"end":return e.stop()}}),e,this,[[0,12]])})));return function(){return e.apply(this,arguments)}}()},{key:"render",value:function(){var e=this,t=this.state,a=t.shopIndex,n=t.beginDateTime,i=t.endDateTime,c=L[a].name;return r.a.createElement("div",null,r.a.createElement(b.b,{dataSource:this.state.listData,loading:this.state.loading,locale:{emptyText:"\u6682\u65f6\u6ca1\u6709\u6570\u636e"},header:r.a.createElement("div",{style:{textAlign:"center",fontSize:24,fontWeight:"bold"}},"\u62a5\u635f\u5546\u54c1",r.a.createElement("br",null),r.a.createElement(v.a,{overlay:function(){var t=L[0],a=L[1],n=L[2],i=L[3],c=L[4];return r.a.createElement(y.a,{onClick:function(){var t=Object(l.a)(o.a.mark((function t(a){var n,r;return o.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return n=a.key,r=L[n].userId,t.next=4,e.initFirstPage(r);case 4:case"end":return t.stop()}}),t)})));return function(e){return t.apply(this,arguments)}}()},r.a.createElement(y.a.Item,{key:t.index},t.name),r.a.createElement(y.a.Item,{key:a.index},a.name),r.a.createElement(y.a.Item,{key:n.index},n.name),r.a.createElement(y.a.Item,{key:i.index},i.name),r.a.createElement(y.a.Item,{key:c.index},c.name))},trigger:["click"]},r.a.createElement(x.a,{size:"small",style:{width:240},onClick:function(e){return e.preventDefault()}},c,r.a.createElement(O.a,null))),r.a.createElement("br",null),r.a.createElement(F,{size:"small",locale:S.a,bordered:!0,style:{width:320,marginTop:15},placeholder:["\u5f00\u59cb\u65f6\u95f4","\u7ed3\u675f\u65f6\u95f4"],inputReadOnly:!0,defaultValue:[j()(n,"YYYY.MM.DD+HH:mm:ss"),j()(i,"YYYY.MM.DD+HH:mm:ss")],showTime:{hideDisabledOptions:!0,defaultValue:[j()("00:00:00","HH:mm:ss"),j()("23:59:59","HH:mm:ss")],showTime:!0,showHour:!1,showMinute:!1,showSecond:!1},onChange:function(e){e||g.b.warning("\u8bf7\u9009\u62e9\u6b63\u786e\u7684\u65e5\u671f!")},onOk:function(){var t=Object(l.a)(o.a.mark((function t(a){return o.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return console.log(a[0].format("YYYY.MM.DD+HH:mm:ss")),console.log(a[1].format("YYYY.MM.DD+HH:mm:ss")),t.next=4,e.initFirstPage(void 0,a[0]?a[0].format("YYYY.MM.DD+HH:mm:ss"):void 0,a[1]?a[1].format("YYYY.MM.DD+HH:mm:ss"):void 0);case 4:case"end":return t.stop()}}),t)})));return function(e){return t.apply(this,arguments)}}()}),r.a.createElement("br",null),r.a.createElement(R,{style:{width:280,marginTop:15},size:"small",placeholder:"\u8f93\u5165\u5546\u54c1\u540d\u79f0\u540e\u67e5\u8be2",enterButton:"\u67e5\u8be2",onSearch:function(){var t=Object(l.a)(o.a.mark((function t(a){return o.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,e.initFirstPage(void 0,void 0,void 0,a);case 2:case"end":return t.stop()}}),t)})));return function(e){return t.apply(this,arguments)}}()})),footer:r.a.createElement("div",{style:{height:100,textAlign:"center",fontSize:14,fontWeight:"lighter"}},"\u5f2f\u9ea6--\u5fc3\u91cc\u6ee1\u6ee1\u90fd\u662f\u4f60"),renderItem:function(t){var a=e.state.listData.indexOf(t),n="gray";0===a?n="orange":1===a?n="green":2===a&&(n="red");var i="-"!==t.specification?" | "+t.specification:"",c=""!==t.category?" | "+t.category:"";return r.a.createElement(b.b.Item,null,r.a.createElement("div",{style:{width:30,height:30,backgroundColor:n,color:"white",fontSize:14,fontWeight:"bold",textAlign:"center",marginRight:15,marginLeft:15,borderRadius:10}},r.a.createElement("div",{style:{marginTop:3}},a+1)),r.a.createElement(b.b.Item.Meta,{title:r.a.createElement("div",null,r.a.createElement("span",{style:{fontSize:16}},t.name),r.a.createElement("span",{style:{fontSize:12}},i),r.a.createElement("span",{style:{fontSize:10}},c)),description:"\u62a5\u635f\u6570\u91cf\uff1a".concat(t.discardNumber)}),r.a.createElement("span",{style:{marginRight:25,color:"coral",fontSize:18}},"\uffe5".concat(t.diacardMoney)))}}))}}]),a}(r.a.Component),A=f.a.Search,N=p.a.RangePicker,q=[{index:0,name:"\u5168\u90e8\u95e8\u5e97",userId:""},{index:1,name:"\u6559\u80b2\u5c40\u5e97",userId:"3995767"},{index:2,name:"\u65e7\u9547\u5e97",userId:"3995771"},{index:3,name:"\u6c5f\u6ee8\u5e97",userId:"4061089"},{index:4,name:"\u6c64\u6cc9\u4e16\u7eaa\u5e97",userId:"4061092"}],V="%221593049816479739965%22,%221593049854760654816%22,%221592989355905414162%22,%221593049881212199906%22,%221593059349213583584%22",B=[{index:0,name:"\u5168\u90e8\u9762\u5305",categoryId:V},{index:1,name:"\u73b0\u70e4",categoryId:"%221593049816479739965%22"},{index:2,name:"\u5410\u53f8\u9910\u5305",categoryId:"%221593049854760654816%22"},{index:3,name:"\u897f\u70b9\u86cb\u7cd5",categoryId:"%221592989355905414162%22"},{index:4,name:"\u5e38\u6e29\u86cb\u7cd5",categoryId:"%221593049881212199906%22"},{index:5,name:"\u5e72\u70b9",categoryId:"%221593059349213583584%22"}],J=function(e){Object(m.a)(a,e);var t=Object(h.a)(a);function a(e){var n;Object(u.a)(this,a);var r=(n=t.call(this,e)).props.query,i=j()().format("YYYY-MM-DD")+"+00:00:00",c=j()().format("YYYY-MM-DD")+"+23:59:59";return r&&(i=r.get("beginDateTime")?r.get("beginDateTime"):i,c=r.get("endDateTime")?r.get("endDateTime"):c),n.state={userId:"",shopIndex:1,categoryId:V,categoryIndex:0,listData:[],loading:!1,beginDateTime:i,endDateTime:c,keyword:""},n}return Object(d.a)(a,[{key:"componentDidMount",value:function(){var e=Object(l.a)(o.a.mark((function e(){var t,a;return o.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return t=this.props.query,a="",t&&t.get("id")&&(a=t.get("id")),e.next=5,this.initFirstPage(a);case 5:case"end":return e.stop()}}),e,this)})));return function(){return e.apply(this,arguments)}}()},{key:"initFirstPage",value:function(){var e=Object(l.a)(o.a.mark((function e(t,a,n,r,i){var c,s,u=this;return o.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:c=0;case 1:if(!(c<q.length)){e.next=8;break}if(q[c].userId!==t){e.next=5;break}return this.setState({shopIndex:c}),e.abrupt("break",8);case 5:c++,e.next=1;break;case 8:s=0;case 9:if(!(s<B.length)){e.next=16;break}if(B[s].categoryId!==a){e.next=13;break}return this.setState({categoryIndex:s}),e.abrupt("break",16);case 13:s++,e.next=9;break;case 16:this.setState({userId:void 0!==t?t:this.state.userId,categoryId:void 0!==a?a:this.state.categoryId,listData:[],loading:!1,beginDateTime:void 0!==n?n:this.state.beginDateTime,endDateTime:void 0!==r?r:this.state.endDateTime,keyword:void 0!==i?i:""},Object(l.a)(o.a.mark((function e(){return o.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,u.fetchListData();case 2:case"end":return e.stop()}}),e)}))));case 17:case"end":return e.stop()}}),e,this)})));return function(t,a,n,r,i){return e.apply(this,arguments)}}()},{key:"fetchListData",value:function(){var e=Object(l.a)(o.a.mark((function e(){var t,a,n,r,i,c,s,l,u,d,m,h,f,p;return o.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,t=this.state,a=t.listData,n=t.userId,r=t.categoryId,i=t.beginDateTime,c=t.endDateTime,s=t.keyword,l=[],this.setState({loading:!0}),(d=(u=i).indexOf("+"))>=0&&(u=u.substring(0,d)),(h=(m=c).indexOf("+"))>=0&&(m=m.substring(0,h)),e.next=12,I(n,r,u,m,s);case 12:(f=e.sent)&&0===f.errCode&&(l=f.list),p=a.concat(l),this.setState({listData:p,loading:!1}),e.next=21;break;case 18:e.prev=18,e.t0=e.catch(0),this.setState({loading:!1});case 21:case"end":return e.stop()}}),e,this,[[0,18]])})));return function(){return e.apply(this,arguments)}}()},{key:"render",value:function(){var e=this,t=this.state,a=t.shopIndex,n=t.beginDateTime,i=t.endDateTime,c=t.categoryIndex,s=q[a].name,u=B[c].name;return r.a.createElement("div",null,r.a.createElement(b.b,{dataSource:this.state.listData,loading:this.state.loading,locale:{emptyText:"\u6682\u65f6\u6ca1\u6709\u6570\u636e"},header:r.a.createElement("div",{style:{textAlign:"center",fontSize:24,fontWeight:"bold"}},"\u5546\u54c1\u62a5\u635f\u4e0e\u9500\u552e\u5206\u6790",r.a.createElement("br",null),r.a.createElement(v.a,{overlay:function(){var t=q[0],a=q[1],n=q[2],i=q[3],c=q[4];return r.a.createElement(y.a,{onClick:function(){var t=Object(l.a)(o.a.mark((function t(a){var n,r;return o.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return n=a.key,r=q[n].userId,t.next=4,e.initFirstPage(r);case 4:case"end":return t.stop()}}),t)})));return function(e){return t.apply(this,arguments)}}()},r.a.createElement(y.a.Item,{key:t.index},t.name),r.a.createElement(y.a.Item,{key:a.index},a.name),r.a.createElement(y.a.Item,{key:n.index},n.name),r.a.createElement(y.a.Item,{key:i.index},i.name),r.a.createElement(y.a.Item,{key:c.index},c.name))},trigger:["click"]},r.a.createElement(x.a,{size:"small",style:{width:240},onClick:function(e){return e.preventDefault()}},s,r.a.createElement(O.a,null))),r.a.createElement("br",null),r.a.createElement(v.a,{overlay:function(){var t=B[0],a=B[1],n=B[2],i=B[3],c=B[4],s=B[5];return r.a.createElement(y.a,{onClick:function(){var t=Object(l.a)(o.a.mark((function t(a){var n,r;return o.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return n=a.key,r=B[n].categoryId,t.next=4,e.initFirstPage(void 0,r);case 4:case"end":return t.stop()}}),t)})));return function(e){return t.apply(this,arguments)}}()},r.a.createElement(y.a.Item,{key:t.index},t.name),r.a.createElement(y.a.Item,{key:a.index},a.name),r.a.createElement(y.a.Item,{key:n.index},n.name),r.a.createElement(y.a.Item,{key:i.index},i.name),r.a.createElement(y.a.Item,{key:c.index},c.name),r.a.createElement(y.a.Item,{key:s.index},s.name))},trigger:["click"]},r.a.createElement(x.a,{size:"small",style:{width:240},onClick:function(e){return e.preventDefault()}},u,r.a.createElement(O.a,null))),r.a.createElement("br",null),r.a.createElement(N,{size:"small",locale:S.a,bordered:!0,style:{width:320,marginTop:15},placeholder:["\u5f00\u59cb\u65f6\u95f4","\u7ed3\u675f\u65f6\u95f4"],inputReadOnly:!0,defaultValue:[j()(n,"YYYY-MM-DD+HH:mm:ss"),j()(i,"YYYY-MM-DD+HH:mm:ss")],showTime:{hideDisabledOptions:!0,defaultValue:[j()("00:00:00","HH:mm:ss"),j()("23:59:59","HH:mm:ss")],showTime:!1,showHour:!1,showMinute:!1,showSecond:!1},onChange:function(e){e||g.b.warning("\u8bf7\u9009\u62e9\u6b63\u786e\u7684\u65e5\u671f!")},onOk:function(){var t=Object(l.a)(o.a.mark((function t(a){return o.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:if(!(a.length>=2)){t.next=3;break}return t.next=3,e.initFirstPage(void 0,void 0,a[0]?a[0].format("YYYY-MM-DD"):void 0,a[1]?a[1].format("YYYY-MM-DD"):void 0);case 3:case"end":return t.stop()}}),t)})));return function(e){return t.apply(this,arguments)}}()}),r.a.createElement("br",null),r.a.createElement(A,{style:{width:280,marginTop:15},size:"small",placeholder:"\u8f93\u5165\u5546\u54c1\u540d\u79f0\u540e\u67e5\u8be2",enterButton:"\u67e5\u8be2",onSearch:function(){var t=Object(l.a)(o.a.mark((function t(a){return o.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,e.initFirstPage(void 0,void 0,void 0,void 0,a);case 2:case"end":return t.stop()}}),t)})));return function(e){return t.apply(this,arguments)}}(),value:this.state.keyword,onChange:function(t){var a=t.target.value;e.setState({keyword:a})}})),footer:r.a.createElement("div",{style:{height:100,textAlign:"center",fontSize:14,fontWeight:"lighter"}},"\u5f2f\u9ea6--\u5fc3\u91cc\u6ee1\u6ee1\u90fd\u662f\u4f60"),renderItem:function(t){var a=e.state.listData.indexOf(t),n="gray";0===a?n="orange":1===a?n="green":2===a&&(n="red");var i="-"!==t.specification?" | "+t.specification:"",c=""!==t.category?" | "+t.category:"";return r.a.createElement(b.b.Item,null,r.a.createElement("div",{style:{width:30,height:30,backgroundColor:n,color:"white",fontSize:14,fontWeight:"bold",textAlign:"center",marginRight:15,marginLeft:15,borderRadius:10}},r.a.createElement("div",{style:{marginTop:3}},a+1)),r.a.createElement(b.b.Item.Meta,{title:r.a.createElement("div",null,r.a.createElement("span",{style:{fontSize:16}},t.name),r.a.createElement("span",{style:{fontSize:12}},i),r.a.createElement("span",{style:{fontSize:10}},c)),description:r.a.createElement("div",null,r.a.createElement("div",{style:{color:"coral",fontSize:12}},"\u62a5\u635f\u6570\u91cf\uff1a".concat(t.discardNumber,"  \u62a5\u635f\u91d1\u989d\uff1a\uffe5").concat(t.diacardMoney)),r.a.createElement("div",{style:{color:"coral",fontSize:12}},"\u9500\u552e\u6570\u91cf\uff1a".concat(t.saleNumber,"  \u9500\u552e\u91d1\u989d\uff1a\uffe5").concat(t.saleMoney)),r.a.createElement("div",{style:{color:"darkred",fontSize:16}},"\u62a5\u635f\u7387\uff1a".concat(t.discardProportion," %")))}))}}))}}]),a}(r.a.Component),U=a(31),$=a(136);a(219);function _(){var e=new URLSearchParams(Object(U.e)().search);return r.a.createElement("div",null,r.a.createElement(U.a,{exact:!0,path:"/",children:r.a.createElement(C,null)}),r.a.createElement(U.a,{path:"/productsale",children:r.a.createElement(C,{query:e})}),r.a.createElement(U.a,{path:"/discardsale",children:r.a.createElement(W,{query:e})}),r.a.createElement(U.a,{path:"/productsaleanddiscard",children:r.a.createElement(J,{query:e})}))}function G(){return r.a.createElement($.a,null,r.a.createElement(_,null))}Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));c.a.render(r.a.createElement(r.a.StrictMode,null,r.a.createElement(G,null)),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()})).catch((function(e){console.error(e.message)}))}},[[143,1,2]]]);
//# sourceMappingURL=main.ea4fecce.chunk.js.map