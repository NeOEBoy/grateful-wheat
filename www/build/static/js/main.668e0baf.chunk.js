(this.webpackJsonpwww=this.webpackJsonpwww||[]).push([[0],{115:function(e,t,n){e.exports=n(179)},120:function(e,t,n){},177:function(e,t,n){},179:function(e,t,n){"use strict";n.r(t);var a=n(0),r=n.n(a),i=n(14),o=n.n(i),c=(n(120),n(31)),s=n.n(c),l=n(51),u=n(84),h=n(85),d=n(113),p=n(111),m=n(183),f=n(182),g=n(104),v=function(){var e=Object(l.a)(s.a.mark((function e(t,n,a,r){var i,o,c;return s.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return i="http://localhost:9001/product/saleList",i+="?pageIndex=",i+=a,i+="&pageSize=",i+=r,i+="&userId=",i+=t,i+="&date=",i+=n,e.next=11,fetch(i);case 11:return o=e.sent,e.next=14,o.json();case 14:return c=e.sent,e.abrupt("return",c);case 16:case"end":return e.stop()}}),e)})));return function(t,n,a,r){return e.apply(this,arguments)}}(),w=n(86),b=n.n(w),x=function(e){Object(d.a)(n,e);var t=Object(p.a)(n);function n(e){var a;return Object(u.a)(this,n),(a=t.call(this,e)).handleInfiniteOnLoad=Object(l.a)(s.a.mark((function e(){return s.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,a.fetchNextPage();case 2:case"end":return e.stop()}}),e)}))),a.state={listData:[],loading:!1,hasMore:!0,pageIndex:1},a}return Object(h.a)(n,[{key:"componentDidMount",value:function(){var e=Object(l.a)(s.a.mark((function e(){return s.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,this.fetchNextPage();case 2:case"end":return e.stop()}}),e,this)})));return function(){return e.apply(this,arguments)}}()},{key:"fetchNextPage",value:function(){var e=Object(l.a)(s.a.mark((function e(){var t,n,a,r,i,o,c,l;return s.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(t=this.state,n=t.hasMore,a=t.pageIndex,r=t.listData,n){e.next=4;break}return m.b.warning("Infinite List loaded all"),e.abrupt("return");case 4:return this.setState({loading:!0}),e.prev=5,i=[],e.next=9,v(this.props.id,this.props.date,a,20);case 9:(o=e.sent)&&0===o.errCode&&(i=o.list),c=i.length/20>=1,l=a,c&&l++,r=r.concat(i),this.setState({listData:r,hasMore:c,loading:!1,pageIndex:l}),e.next=21;break;case 18:e.prev=18,e.t0=e.catch(5),this.setState({loading:!1});case 21:case"end":return e.stop()}}),e,this,[[5,18]])})));return function(){return e.apply(this,arguments)}}()},{key:"render",value:function(){var e=this;return r.a.createElement("div",{style:{height:window.innerHeight,overflow:"auto"}},r.a.createElement(b.a,{initialLoad:!1,pageStart:0,loadMore:this.handleInfiniteOnLoad,hasMore:!this.state.loading&&this.state.hasMore,useWindow:!1},r.a.createElement(f.b,{dataSource:this.state.listData,locale:{emptyText:"\u6682\u65f6\u6ca1\u6709\u6570\u636e"},header:r.a.createElement("div",{style:{textAlign:"center",fontSize:24,fontWeight:"bold"}},"\u70ed\u5356\u5546\u54c1",r.a.createElement("span",{style:{textAlign:"center",fontSize:13,fontWeight:"lighter"}},"\u95e8\u5e97\uff1a".concat(this.props.name,", \u603b\u5b9e\u6536\uff1a\xa5 ").concat(this.props.number))),footer:r.a.createElement("div",{style:{height:100,textAlign:"center",fontSize:14,fontWeight:"lighter"}},"\u5f2f\u9ea6--\u5fc3\u91cc\u6ee1\u6ee1\u90fd\u662f\u4f60"),renderItem:function(t){var n=e.state.listData.indexOf(t),a="gray";return 0===n?a="orange":1===n?a="green":2===n&&(a="red"),r.a.createElement(f.b.Item,null,r.a.createElement("div",{style:{width:30,height:30,backgroundColor:a,color:"white",fontSize:14,fontWeight:"bold",textAlign:"center",marginRight:20,marginLeft:25,borderRadius:10}},r.a.createElement("div",{style:{marginTop:3}},n+1)),r.a.createElement(f.b.Item.Meta,{title:r.a.createElement("div",null,r.a.createElement("span",{style:{fontSize:18}},t.name),"-"!==t.specification&&r.a.createElement("span",{style:{fontSize:14}},t.specification)),description:"\u9500\u91cf\uff1a".concat(t.saleNumber," \u5e93\u5b58\uff1a").concat(t.currentNumber)}),r.a.createElement("span",{style:{marginRight:25,color:"coral",fontSize:18}},"\uffe5".concat(t.realIncome)))}},this.state.loading&&this.state.hasMore&&r.a.createElement("div",null,r.a.createElement(g.a,{style:{position:"absolute",bottom:15,width:"100%",textAlign:"center"}})))))}}]),n}(r.a.Component),E=n(8),y=n(107);n(177);function S(){var e=new URLSearchParams(Object(E.e)().search),t=e.get("id"),n=e.get("name"),a=e.get("number"),i=e.get("date");return r.a.createElement("div",null,r.a.createElement(E.a,{exact:!0,path:"/",children:r.a.createElement(x,null)}),r.a.createElement(E.a,{path:"/productsale",children:r.a.createElement(x,{id:t,name:n,number:a,date:i})}))}function k(){return r.a.createElement(y.a,null,r.a.createElement(S,null))}Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));o.a.render(r.a.createElement(r.a.StrictMode,null,r.a.createElement(k,null)),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()})).catch((function(e){console.error(e.message)}))}},[[115,1,2]]]);
//# sourceMappingURL=main.668e0baf.chunk.js.map