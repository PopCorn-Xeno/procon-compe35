!function(n,e){"object"==typeof exports&&"undefined"!=typeof module?e(exports,require("preact"),require("preact/hooks")):"function"==typeof define&&define.amd?define(["exports","preact","preact/hooks"],e):e((n||self).preactCompat={},n.preact,n.preactHooks)}(this,function(n,e,t){function r(n,e){for(var t in n)if("__source"!==t&&!(t in e))return!0;for(var r in e)if("__source"!==r&&n[r]!==e[r])return!0;return!1}function u(n,e){this.props=n,this.context=e}function o(n,t){function u(n){var e=this.props.ref,u=e==n.ref;return!u&&e&&(e.call?e(null):e.current=null),t?!t(this.props,n)||!u:r(this.props,n)}function o(t){return this.shouldComponentUpdate=u,e.createElement(n,t)}return o.displayName="Memo("+(n.displayName||n.name)+")",o.prototype.isReactComponent=!0,o.__f=!0,o}(u.prototype=new e.Component).isPureReactComponent=!0,u.prototype.shouldComponentUpdate=function(n,e){return r(this.props,n)||r(this.state,e)};var i=e.options.__b;e.options.__b=function(n){n.type&&n.type.__f&&n.ref&&(n.props.ref=n.ref,n.ref=null),i&&i(n)};var c="undefined"!=typeof Symbol&&Symbol.for&&Symbol.for("react.forward_ref")||3911;function f(n){function e(e){if(!("ref"in e))return n(e,null);var t=e.ref;delete e.ref;var r=n(e,t);return e.ref=t,r}return e.$$typeof=c,e.render=e,e.prototype.isReactComponent=e.__f=!0,e.displayName="ForwardRef("+(n.displayName||n.name)+")",e}var l=function(n,t){return null==n?null:e.toChildArray(e.toChildArray(n).map(t))},a={map:l,forEach:l,count:function(n){return n?e.toChildArray(n).length:0},only:function(n){var t=e.toChildArray(n);if(1!==t.length)throw"Children.only";return t[0]},toArray:e.toChildArray},s=e.options.__e;e.options.__e=function(n,e,t,r){if(n.then)for(var u,o=e;o=o.__;)if((u=o.__c)&&u.__c)return null==e.__e&&(e.__e=t.__e,e.__k=t.__k),u.__c(n,e);s(n,e,t,r)};var h=e.options.unmount;function d(n,e,t){return n&&(n.__c&&n.__c.__H&&(n.__c.__H.__.forEach(function(n){"function"==typeof n.__c&&n.__c()}),n.__c.__H=null),null!=(n=function(n,e){for(var t in e)n[t]=e[t];return n}({},n)).__c&&(n.__c.__P===t&&(n.__c.__P=e),n.__c=null),n.__k=n.__k&&n.__k.map(function(n){return d(n,e,t)})),n}function v(n,e,t){return n&&t&&(n.__v=null,n.__k=n.__k&&n.__k.map(function(n){return v(n,e,t)}),n.__c&&n.__c.__P===e&&(n.__e&&t.appendChild(n.__e),n.__c.__e=!0,n.__c.__P=t)),n}function p(){this.__u=0,this.t=null,this.__b=null}function m(n){var e=n.__.__c;return e&&e.__a&&e.__a(n)}function b(n){var t,r,u;function o(o){if(t||(t=n()).then(function(n){r=n.default||n},function(n){u=n}),u)throw u;if(!r)throw t;return e.createElement(r,o)}return o.displayName="Lazy",o.__f=!0,o}function y(){this.u=null,this.o=null}e.options.unmount=function(n){var e=n.__c;e&&e.__R&&e.__R(),e&&32&n.__u&&(n.type=null),h&&h(n)},(p.prototype=new e.Component).__c=function(n,e){var t=e.__c,r=this;null==r.t&&(r.t=[]),r.t.push(t);var u=m(r.__v),o=!1,i=function(){o||(o=!0,t.__R=null,u?u(c):c())};t.__R=i;var c=function(){if(!--r.__u){if(r.state.__a){var n=r.state.__a;r.__v.__k[0]=v(n,n.__c.__P,n.__c.__O)}var e;for(r.setState({__a:r.__b=null});e=r.t.pop();)e.forceUpdate()}};r.__u++||32&e.__u||r.setState({__a:r.__b=r.__v.__k[0]}),n.then(i,i)},p.prototype.componentWillUnmount=function(){this.t=[]},p.prototype.render=function(n,t){if(this.__b){if(this.__v.__k){var r=document.createElement("div"),u=this.__v.__k[0].__c;this.__v.__k[0]=d(this.__b,r,u.__O=u.__P)}this.__b=null}var o=t.__a&&e.createElement(e.Fragment,null,n.fallback);return o&&(o.__u&=-33),[e.createElement(e.Fragment,null,t.__a?null:n.children),o]};var _=function(n,e,t){if(++t[1]===t[0]&&n.o.delete(e),n.props.revealOrder&&("t"!==n.props.revealOrder[0]||!n.o.size))for(t=n.u;t;){for(;t.length>3;)t.pop()();if(t[1]<t[0])break;n.u=t=t[2]}};function g(n){return this.getChildContext=function(){return n.context},n.children}function S(n){var t=this,r=n.i;t.componentWillUnmount=function(){e.render(null,t.l),t.l=null,t.i=null},t.i&&t.i!==r&&t.componentWillUnmount(),t.l||(t.i=r,t.l={nodeType:1,parentNode:r,childNodes:[],contains:function(){return!0},appendChild:function(n){this.childNodes.push(n),t.i.appendChild(n)},insertBefore:function(n,e){this.childNodes.push(n),t.i.appendChild(n)},removeChild:function(n){this.childNodes.splice(this.childNodes.indexOf(n)>>>1,1),t.i.removeChild(n)}}),e.render(e.createElement(g,{context:t.context},n.__v),t.l)}function E(n,t){var r=e.createElement(S,{__v:n,i:t});return r.containerInfo=t,r}(y.prototype=new e.Component).__a=function(n){var e=this,t=m(e.__v),r=e.o.get(n);return r[0]++,function(u){var o=function(){e.props.revealOrder?(r.push(u),_(e,n,r)):u()};t?t(o):o()}},y.prototype.render=function(n){this.u=null,this.o=new Map;var t=e.toChildArray(n.children);n.revealOrder&&"b"===n.revealOrder[0]&&t.reverse();for(var r=t.length;r--;)this.o.set(t[r],this.u=[1,0,this.u]);return n.children},y.prototype.componentDidUpdate=y.prototype.componentDidMount=function(){var n=this;this.o.forEach(function(e,t){_(n,t,e)})};var C="undefined"!=typeof Symbol&&Symbol.for&&Symbol.for("react.element")||60103,x=/^(?:accent|alignment|arabic|baseline|cap|clip(?!PathU)|color|dominant|fill|flood|font|glyph(?!R)|horiz|image(!S)|letter|lighting|marker(?!H|W|U)|overline|paint|pointer|shape|stop|strikethrough|stroke|text(?!L)|transform|underline|unicode|units|v|vector|vert|word|writing|x(?!C))[A-Z]/,O=/^on(Ani|Tra|Tou|BeforeInp|Compo)/,R=/[A-Z0-9]/g,w="undefined"!=typeof document,j=function(n){return("undefined"!=typeof Symbol&&"symbol"==typeof Symbol()?/fil|che|rad/:/fil|che|ra/).test(n)};function T(n,t,r){return null==t.__k&&(t.textContent=""),e.render(n,t),"function"==typeof r&&r(),n?n.__c:null}function k(n,t,r){return e.hydrate(n,t),"function"==typeof r&&r(),n?n.__c:null}e.Component.prototype.isReactComponent={},["componentWillMount","componentWillReceiveProps","componentWillUpdate"].forEach(function(n){Object.defineProperty(e.Component.prototype,n,{configurable:!0,get:function(){return this["UNSAFE_"+n]},set:function(e){Object.defineProperty(this,n,{configurable:!0,writable:!0,value:e})}})});var I=e.options.event;function N(){}function M(){return this.cancelBubble}function A(){return this.defaultPrevented}e.options.event=function(n){return I&&(n=I(n)),n.persist=N,n.isPropagationStopped=M,n.isDefaultPrevented=A,n.nativeEvent=n};var D,L={enumerable:!1,configurable:!0,get:function(){return this.class}},F=e.options.vnode;e.options.vnode=function(n){"string"==typeof n.type&&function(n){var t=n.props,r=n.type,u={},o=-1===r.indexOf("-");for(var i in t){var c=t[i];if(!("value"===i&&"defaultValue"in t&&null==c||w&&"children"===i&&"noscript"===r||"class"===i||"className"===i)){var f=i.toLowerCase();"defaultValue"===i&&"value"in t&&null==t.value?i="value":"download"===i&&!0===c?c="":"translate"===f&&"no"===c?c=!1:"o"===f[0]&&"n"===f[1]?"ondoubleclick"===f?i="ondblclick":"onchange"!==f||"input"!==r&&"textarea"!==r||j(t.type)?"onfocus"===f?i="onfocusin":"onblur"===f?i="onfocusout":O.test(i)&&(i=f):f=i="oninput":o&&x.test(i)?i=i.replace(R,"-$&").toLowerCase():null===c&&(c=void 0),"oninput"===f&&u[i=f]&&(i="oninputCapture"),u[i]=c}}"select"==r&&u.multiple&&Array.isArray(u.value)&&(u.value=e.toChildArray(t.children).forEach(function(n){n.props.selected=-1!=u.value.indexOf(n.props.value)})),"select"==r&&null!=u.defaultValue&&(u.value=e.toChildArray(t.children).forEach(function(n){n.props.selected=u.multiple?-1!=u.defaultValue.indexOf(n.props.value):u.defaultValue==n.props.value})),t.class&&!t.className?(u.class=t.class,Object.defineProperty(u,"className",L)):(t.className&&!t.class||t.class&&t.className)&&(u.class=u.className=t.className),n.props=u}(n),n.$$typeof=C,F&&F(n)};var U=e.options.__r;e.options.__r=function(n){U&&U(n),D=n.__c};var V=e.options.diffed;e.options.diffed=function(n){V&&V(n);var e=n.props,t=n.__e;null!=t&&"textarea"===n.type&&"value"in e&&e.value!==t.value&&(t.value=null==e.value?"":e.value),D=null};var W={ReactCurrentDispatcher:{current:{readContext:function(n){return D.__n[n.__c].props.value},useCallback:t.useCallback,useContext:t.useContext,useDebugValue:t.useDebugValue,useDeferredValue:X,useEffect:t.useEffect,useId:t.useId,useImperativeHandle:t.useImperativeHandle,useInsertionEffect:en,useLayoutEffect:t.useLayoutEffect,useMemo:t.useMemo,useReducer:t.useReducer,useRef:t.useRef,useState:t.useState,useSyncExternalStore:rn,useTransition:nn}}},P="18.3.1";function z(n){return e.createElement.bind(null,n)}function B(n){return!!n&&n.$$typeof===C}function H(n){return B(n)&&n.type===e.Fragment}function q(n){return!!n&&!!n.displayName&&("string"==typeof n.displayName||n.displayName instanceof String)&&n.displayName.startsWith("Memo(")}function Z(n){return B(n)?e.cloneElement.apply(null,arguments):n}function Y(n){return!!n.__k&&(e.render(null,n),!0)}function $(n){return n&&(n.base||1===n.nodeType&&n)||null}var G=function(n,e){return n(e)},J=function(n,e){return n(e)},K=e.Fragment;function Q(n){n()}function X(n){return n}function nn(){return[!1,Q]}var en=t.useLayoutEffect,tn=B;function rn(n,e){var r=e(),u=t.useState({h:{__:r,v:e}}),o=u[0].h,i=u[1];return t.useLayoutEffect(function(){o.__=r,o.v=e,un(o)&&i({h:o})},[n,r,e]),t.useEffect(function(){return un(o)&&i({h:o}),n(function(){un(o)&&i({h:o})})},[n]),r}function un(n){var e,t,r=n.v,u=n.__;try{var o=r();return!((e=u)===(t=o)&&(0!==e||1/e==1/t)||e!=e&&t!=t)}catch(n){return!0}}var on={useState:t.useState,useId:t.useId,useReducer:t.useReducer,useEffect:t.useEffect,useLayoutEffect:t.useLayoutEffect,useInsertionEffect:en,useTransition:nn,useDeferredValue:X,useSyncExternalStore:rn,startTransition:Q,useRef:t.useRef,useImperativeHandle:t.useImperativeHandle,useMemo:t.useMemo,useCallback:t.useCallback,useContext:t.useContext,useDebugValue:t.useDebugValue,version:P,Children:a,render:T,hydrate:k,unmountComponentAtNode:Y,createPortal:E,createElement:e.createElement,createContext:e.createContext,createFactory:z,cloneElement:Z,createRef:e.createRef,Fragment:e.Fragment,isValidElement:B,isElement:tn,isFragment:H,isMemo:q,findDOMNode:$,Component:e.Component,PureComponent:u,memo:o,forwardRef:f,flushSync:J,unstable_batchedUpdates:G,StrictMode:K,Suspense:p,SuspenseList:y,lazy:b,__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED:W};Object.defineProperty(n,"Component",{enumerable:!0,get:function(){return e.Component}}),Object.defineProperty(n,"Fragment",{enumerable:!0,get:function(){return e.Fragment}}),Object.defineProperty(n,"createContext",{enumerable:!0,get:function(){return e.createContext}}),Object.defineProperty(n,"createElement",{enumerable:!0,get:function(){return e.createElement}}),Object.defineProperty(n,"createRef",{enumerable:!0,get:function(){return e.createRef}}),n.Children=a,n.PureComponent=u,n.StrictMode=K,n.Suspense=p,n.SuspenseList=y,n.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=W,n.cloneElement=Z,n.createFactory=z,n.createPortal=E,n.default=on,n.findDOMNode=$,n.flushSync=J,n.forwardRef=f,n.hydrate=k,n.isElement=tn,n.isFragment=H,n.isMemo=q,n.isValidElement=B,n.lazy=b,n.memo=o,n.render=T,n.startTransition=Q,n.unmountComponentAtNode=Y,n.unstable_batchedUpdates=G,n.useDeferredValue=X,n.useInsertionEffect=en,n.useSyncExternalStore=rn,n.useTransition=nn,n.version=P,Object.keys(t).forEach(function(e){"default"===e||n.hasOwnProperty(e)||Object.defineProperty(n,e,{enumerable:!0,get:function(){return t[e]}})})});
//# sourceMappingURL=compat.umd.js.map