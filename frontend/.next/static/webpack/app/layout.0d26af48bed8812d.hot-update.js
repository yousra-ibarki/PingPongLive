/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("app/layout",{

/***/ "(app-pages-browser)/./app/components/TranslationsProvider.js":
/*!************************************************!*\
  !*** ./app/components/TranslationsProvider.js ***!
  \************************************************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": function() { return /* binding */ TranslationProvider; }\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"(app-pages-browser)/./node_modules/.pnpm/next@14.2.14_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react/jsx-dev-runtime.js\");\n/* harmony import */ var react_i18next__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-i18next */ \"(app-pages-browser)/./node_modules/.pnpm/react-i18next@14.1.3_i18next@23.16.8_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/react-i18next/dist/es/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react */ \"(app-pages-browser)/./node_modules/.pnpm/next@14.2.14_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/compiled/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _app_i18n__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/app/i18n */ \"(app-pages-browser)/./app/i18n.js\");\n/* harmony import */ var _app_i18n__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_app_i18n__WEBPACK_IMPORTED_MODULE_3__);\n// components/TranslationProvider.js\n/* __next_internal_client_entry_do_not_use__ default auto */ \nvar _s = $RefreshSig$();\n\n\n\nfunction TranslationProvider(param) {\n    let { children, lng, ns = \"common\" } = param;\n    _s();\n    const [i18nInstance, setI18nInstance] = (0,react__WEBPACK_IMPORTED_MODULE_2__.useState)(null);\n    (0,react__WEBPACK_IMPORTED_MODULE_2__.useEffect)(()=>{\n        const instance = _app_i18n__WEBPACK_IMPORTED_MODULE_3___default()(lng, ns);\n        setI18nInstance(instance);\n        return ()=>{\n            instance.off(\"languageChanged\");\n        };\n    }, [\n        lng,\n        ns\n    ]);\n    if (!i18nInstance) {\n        return null;\n    }\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(react_i18next__WEBPACK_IMPORTED_MODULE_1__.I18nextProvider, {\n        lng: [\n            lng\n        ],\n        ns: [\n            ns\n        ],\n        children: children\n    }, void 0, false, {\n        fileName: \"/app/app/components/TranslationsProvider.js\",\n        lineNumber: 29,\n        columnNumber: 5\n    }, this);\n}\n_s(TranslationProvider, \"TkNEiE6q37ZOO/vrSoxnvjFsVic=\");\n_c = TranslationProvider;\nvar _c;\n$RefreshReg$(_c, \"TranslationProvider\");\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwcC1wYWdlcy1icm93c2VyKS8uL2FwcC9jb21wb25lbnRzL1RyYW5zbGF0aW9uc1Byb3ZpZGVyLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxvQ0FBb0M7OztBQUdZO0FBQ0o7QUFDUDtBQUV0QixTQUFTSSxvQkFBb0IsS0FJM0M7UUFKMkMsRUFDMUNDLFFBQVEsRUFDUkMsR0FBRyxFQUNIQyxLQUFLLFFBQVEsRUFDZCxHQUoyQzs7SUFLMUMsTUFBTSxDQUFDQyxjQUFjQyxnQkFBZ0IsR0FBR1IsK0NBQVFBLENBQUM7SUFFakRDLGdEQUFTQSxDQUFDO1FBQ1IsTUFBTVEsV0FBV1AsZ0RBQVdBLENBQUNHLEtBQUtDO1FBQ2xDRSxnQkFBZ0JDO1FBRWhCLE9BQU87WUFDTEEsU0FBU0MsR0FBRyxDQUFDO1FBQ2Y7SUFDRixHQUFHO1FBQUNMO1FBQUtDO0tBQUc7SUFFWixJQUFJLENBQUNDLGNBQWM7UUFDakIsT0FBTztJQUNUO0lBRUEscUJBQ0UsOERBQUNSLDBEQUFlQTtRQUFDTSxLQUFLO1lBQUNBO1NBQUk7UUFBRUMsSUFBSTtZQUFDQTtTQUFHO2tCQUNsQ0Y7Ozs7OztBQUdQO0dBekJ3QkQ7S0FBQUEiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9fTl9FLy4vYXBwL2NvbXBvbmVudHMvVHJhbnNsYXRpb25zUHJvdmlkZXIuanM/MjYwMyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBjb21wb25lbnRzL1RyYW5zbGF0aW9uUHJvdmlkZXIuanNcbid1c2UgY2xpZW50JztcblxuaW1wb3J0IHsgSTE4bmV4dFByb3ZpZGVyIH0gZnJvbSAncmVhY3QtaTE4bmV4dCc7XG5pbXBvcnQgeyB1c2VTdGF0ZSwgdXNlRWZmZWN0IH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IGluaXRJMThuZXh0IGZyb20gJ0AvYXBwL2kxOG4nO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBUcmFuc2xhdGlvblByb3ZpZGVyKHsgXG4gIGNoaWxkcmVuLCBcbiAgbG5nLCBcbiAgbnMgPSAnY29tbW9uJyBcbn0pIHtcbiAgY29uc3QgW2kxOG5JbnN0YW5jZSwgc2V0STE4bkluc3RhbmNlXSA9IHVzZVN0YXRlKG51bGwpO1xuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgaW5zdGFuY2UgPSBpbml0STE4bmV4dChsbmcsIG5zKTtcbiAgICBzZXRJMThuSW5zdGFuY2UoaW5zdGFuY2UpO1xuXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGluc3RhbmNlLm9mZignbGFuZ3VhZ2VDaGFuZ2VkJyk7XG4gICAgfTtcbiAgfSwgW2xuZywgbnNdKTtcblxuICBpZiAoIWkxOG5JbnN0YW5jZSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8STE4bmV4dFByb3ZpZGVyIGxuZz17W2xuZ119IG5zPXtbbnNdfT5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L0kxOG5leHRQcm92aWRlcj5cbiAgKTtcbn0iXSwibmFtZXMiOlsiSTE4bmV4dFByb3ZpZGVyIiwidXNlU3RhdGUiLCJ1c2VFZmZlY3QiLCJpbml0STE4bmV4dCIsIlRyYW5zbGF0aW9uUHJvdmlkZXIiLCJjaGlsZHJlbiIsImxuZyIsIm5zIiwiaTE4bkluc3RhbmNlIiwic2V0STE4bkluc3RhbmNlIiwiaW5zdGFuY2UiLCJvZmYiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(app-pages-browser)/./app/components/TranslationsProvider.js\n"));

/***/ }),

/***/ "(app-pages-browser)/./app/i18n.js":
/*!*********************!*\
  !*** ./app/i18n.js ***!
  \*********************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {



;
    // Wrapped in an IIFE to avoid polluting the global scope
    ;
    (function () {
        var _a, _b;
        // Legacy CSS implementations will `eval` browser code in a Node.js context
        // to extract CSS. For backwards compatibility, we need to check we're in a
        // browser context before continuing.
        if (typeof self !== 'undefined' &&
            // AMP / No-JS mode does not inject these helpers:
            '$RefreshHelpers$' in self) {
            // @ts-ignore __webpack_module__ is global
            var currentExports = module.exports;
            // @ts-ignore __webpack_module__ is global
            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;
            // This cannot happen in MainTemplate because the exports mismatch between
            // templating and execution.
            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);
            // A module can be accepted automatically based on its exports, e.g. when
            // it is a Refresh Boundary.
            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {
                // Save the previous exports signature on update so we can compare the boundary
                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)
                module.hot.dispose(function (data) {
                    data.prevSignature =
                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);
                });
                // Unconditionally accept an update to this module, we'll check if it's
                // still a Refresh Boundary later.
                // @ts-ignore importMeta is replaced in the loader
                module.hot.accept();
                // This field is set when the previous version of this module was a
                // Refresh Boundary, letting us know we need to check for invalidation or
                // enqueue an update.
                if (prevSignature !== null) {
                    // A boundary can become ineligible if its exports are incompatible
                    // with the previous exports.
                    //
                    // For example, if you add/remove/change exports, we'll want to
                    // re-execute the importing modules, and force those components to
                    // re-render. Similarly, if you convert a class component to a
                    // function, we want to invalidate the boundary.
                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {
                        module.hot.invalidate();
                    }
                    else {
                        self.$RefreshHelpers$.scheduleUpdate();
                    }
                }
            }
            else {
                // Since we just executed the code for the module, it's possible that the
                // new exports made it ineligible for being a boundary.
                // We only care about the case when we were _previously_ a boundary,
                // because we already accepted this update (accidental side effect).
                var isNoLongerABoundary = prevSignature !== null;
                if (isNoLongerABoundary) {
                    module.hot.invalidate();
                }
            }
        }
    })();


/***/ })

});