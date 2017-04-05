/*
 * 前端移动端开发库
 * nivk - v1.1.4 (2016-06-20T04:02:00+0800)
 */


// 主体，必须
; void function (win, doc, undefined) {

    // [内部]微信配置对象
    var _wxConfig = null;

    function JyoPage() {
        /// <summary>
        /// Api类
        /// </summary>
        /// <field name="queryString" type="Object">URL查询字符串对象</field> 
        /// <field name="metaString" type="Object">Meta字符串对象</field> 
        /// <field name="JyoPageSourceSize" type="Object">设计尺寸</field> 
        /// <field name="prefix" type="Object">浏览器前缀</field> 
        /// <field name="wxConfig" type="Object">[只写]微信配置参数对象</field> 
        /// <field name="debug" type="boolean">是否在调试状态下</field> 

        var self = this;
        this.queryString = getQueryString();
        this.metaString = getMetaString();

        this.debug = self.metaString["JyoPageDebug"];
        this.debug = typeof this.debug == "string" ? this.debug.toString().toLowerCase() : false;
        switch (this.debug) {
            case "": case "0": case "no": case "false":
                this.debug = false;
                break;
            default:
                this.debug = true;
                console.info("调试状态已开启（请务必在上线前关闭）");
                break;
        }

        Object.defineProperty(this, "wxConfig", {
            set: function (value) {
                _wxConfig = value;
            }
        });

        this.JyoPageSourceSize = function () {
            /// <summary>
            /// 获取源尺寸
            /// </summary>
            /// <returns type="Object"></returns>

            var meta = self.metaString["JyoPageSourceSize"];
            if (meta == undefined) return null;
            var result = meta.trim().match(/\[(\d+),(\d+)\]/);
            if (result == undefined) {
                self.debug && console.error("JyoPageSourceSize: 无效的Meta设置。" +
                                                            "\r\n正确示例：<meta name=\"JyoPageSourceSize\" content=\"[640,1008]\" />");
            }
            return { width: Number(result[1]), height: Number(result[2]) };
        }();

        this.prefix = (function () {
            /// <summary>获取浏览器前缀</summary>
            /// <field name="dom" type="String">浏览器Dom元素前缀</field>
            /// <field name="css" type="String">浏览器Css属性前缀</field>
            /// <field name="js" type="String">浏览器js对象前缀</field>
            /// <field name="lowercase" type="String">浏览器前缀小写</field>

            if (!("getComputedStyle" in window)) {
                return { dom: "", css: "", js: "", lowercase: "" };
            }

            var styles = window.getComputedStyle(document.documentElement, ''),
                pre = (Array.prototype.slice.call(styles).join('').match(/-(moz|webkit|ms|o)-/))[1],
                dom = ('WebKit|Moz|MS|O').match(new RegExp('(' + pre + ')', 'i'))[1];
            return { dom: dom, lowercase: pre, css: "-" + pre + "-", js: pre[0].toUpperCase() + pre.substr(1) };
        })();
    }

    JyoPage.prototype = {
        setShare: function (obj) {
            /// <summary>
            /// 设置分享
            /// </summary>
            /// <param name="obj" type="Object">分享设置对象</param>

            obj = obj || this._shareObj || {};
            obj.title = obj.title || document.title;
            obj.desc = obj.desc || document.title;
            obj.icon = obj.icon || location.href.split("?")[0].substr(0, location.href.lastIndexOf("/") + 1) + "icon.jpg";
            obj.link = obj.link || location.href.split("?")[0];

            this._shareObj = obj;

            if (this.debug) {
                console.info("设置了新的分享内容：" +
                                  "\r\n分享标题：" + obj.title +
                                  "\r\n分享简介：" + obj.desc +
                                  "\r\n分享图标：" + obj.icon +
                                  "\r\n分享链接：" + obj.link);
            }

            setShareWx.call(this, obj);

            setShareAlipay.call(this, obj);
        }
    };

    win.JyoPage = new JyoPage();

    function setShareWx(obj) {
        /// <summary>
        /// 设置分享到微信
        /// </summary>
        /// <param name="obj" type="Object">分享参数</param>

        if (typeof wx == "undefined") {
            this.debug && console.info("没有引入微信JS Api文件，无法在微信内分享" +
                                "\r\n详情请看：http://mp.weixin.qq.com/wiki/11/74ad127cc054f6b80759c40f77ec03db.html");
            return;
        }
        if (!_wxConfig) {
            this.debug && console.error("没有设置wxConfig");
            return;
        }
        wx.config(_wxConfig);
        wx.ready(function () {
            var list = [
                {
                    api: "onMenuShareAppMessage",
                    channelName: "Friend"
                },
                {
                    api: "onMenuShareTimeline",
                    channelName: "Timeline"
                },
                {
                    api: "onMenuShareWeibo",
                    channelName: "Tencent Weibo"
                },
                {
                    api: "onMenuShareQQ",
                    channelName: "QQ"
                },
                {
                    api: "onMenuShareQZone",
                    channelName: "QZone"
                }
            ];
            for (var i = list.length; i--;) {
                (function (config) {
                    wx[config.api]({
                        title: obj.title,
                        desc: obj.desc,
                        link: obj.link,
                        imgUrl: obj.icon,
                        trigger: function (res) {
                            obj.ontrigger && obj.ontrigger("Send to " + config.channelName, res);
                        },
                        complete: function (res) {
                            obj.oncomplete && obj.oncomplete("Send to " + config.channelName, res);
                        },
                        success: function (res) {
                            obj.onshare && obj.onshare("Send to " + config.channelName, res);
                        },
                        cancel: function (res) {
                            obj.oncancel && obj.oncancel("Send to " + config.channelName, res);
                        },
                        fail: function (res) {
                            obj.onfail && obj.onfail("Send to " + config.channelName, res);
                        }
                    });
                })(list[i]);
            }
        });
    }

    function setShareAlipay(obj) {
        /// <summary>
        /// 设置分享到支付宝
        /// </summary>
        /// <param name="obj" type="Object">分享参数</param>

        var self = this;

        if (navigator.userAgent.indexOf("AlipayClient") === -1) {
            this.debug && console.info("不在支付宝环境下，无法使用支付宝钱包分享功能" +
                                "\r\n详情请看：https://am-team.github.io/h5container/jsapi-doc.html");
            return;
        }

        if (typeof AlipayJSBridge == "undefined") {
            document.addEventListener('AlipayJSBridgeReady', function () {
                setShareAlipay.call(self, obj);
            }, false);
            return;
        }

        createMeta("Alipay:title", obj.title);
        createMeta("Alipay:imgUrl", obj.icon);
        createMeta("Alipay:desc", obj.desc);
    }

    function createMeta(name, content) {
        /// <summary>
        /// 创建Meta标签
        /// </summary>
        /// <param name="name" type="String">名称</param>
        /// <param name="content" type="String">内容</param>

        document.head.appendChild(function () {
            var meta = document.getElementsByName(name)[0] || document.createElement("meta");
            meta.name = name;
            meta.content = content;
            return meta;
        }());
    }

    function getQueryString() {
        /// <summary>
        /// 获取QueryString的数组 
        /// </summary>
        /// <returns type="Array"></returns>

        var obj = {};
        var result = location.search.match(new RegExp("[\?\&][^\?\&]+=[^\?\&]+", "g"));
        if (!result) return obj;
        for (var i = 0; i < result.length; i++) {
            result[i] = result[i].substring(1).split("=");
            var key = decodeURIComponent(result[i][0]),
                 value = decodeURIComponent(result[i][1]);
            var num = Number(value);
            obj[key] = isNaN(num) ? value : num;
        }
        return Object.freeze(obj);
    }

    function getMetaString() {
        /// <summary>
        /// 获取Meta的数组 
        /// </summary>
        /// <returns type="Array"></returns>

        var obj = {};
        var els = document.getElementsByTagName("meta");
        for (var i = 0; i < els.length; i++) {
            if (els[i].name == "") continue;
            obj[els[i].name] = els[i].content;
        }
        return Object.freeze(obj);
    }

}(window, document);

// 适配方案，可选
; void function (win, doc, undefined) {

    var fullscreenStr = "{" + [
                 "position: fixed",
                 "left: 0px",
                 "top: 0px",
                 "bottom: 0px",
                 "right: 0px",
                 "width: 100%",
                 "height: 100%",
                 "margin: 0px",
                 "padding: 0px",
                 "background-color: black;"
    ].join(" !important;") + "}";

    var cssText = [
                   "html,body {",
                   "    margin: 0px;",
                   "    padding: 0px;",
                   "    width: 100%;",
                   "    height: 100%;",
                   "}",

                   "@viewport {",
                   "    width: device-width;",
                   "    height:device-height;",
                   "    user-zoom: fixed;",
                   "    user-scalable: fixed;",
                   "}",

                   ":" + JyoPage.prefix.css + "full-screen " + fullscreenStr,
                   ":full-screen " + fullscreenStr,
                   ":fullscreen " + fullscreenStr
    ].join("");

    if (JyoPage.JyoPageSourceSize != null) {
        cssText += [".JyoPage{",
                            "position: absolute;",
                            "display: none;",
                            "left: 0px;",
                            "top:0px;",
                            "width: " + JyoPage.JyoPageSourceSize.width + "px;",
                            "height: " + JyoPage.JyoPageSourceSize.height + "px;",
                          "}"].join("");
    }

    var style = document.getElementById("__HTMLStyle__") || document.createElement("style");
    style.id = "__HTMLStyle__";
    style.innerHTML = cssText;
    document.head.appendChild(style);

    var div = {
        // 默认缩放
        JyoPageScale: [1, 1],
        adaptation: function (mode, settings) {
            /// <summary>
            /// 适配
            /// </summary>
            /// <param name="mode" type="String">适配模式</param>
            /// <param name="settings" type="Object">覆盖配置</param>

            if (!JyoPage.JyoPageSourceSize) {
                JyoPage.debug && console.error("您没有设置名称为JyoPageSourceSize的Meta标签。");
                return;
            }

            if (!mode) return;
            var self = this;
            settings = settings || {};
            var cWidth = document.body.clientWidth,
                 cHeight = document.body.clientHeight;
            var sWidth = JyoPage.JyoPageSourceSize.width,
                 sHeight = JyoPage.JyoPageSourceSize.height;
            var marginLeft = typeof settings.marginLeft != "undefined" ? settings.marginLeft : (cWidth - sWidth) / 2,
                  marginTop = typeof settings.marginTop != "undefined" ? settings.marginTop : (cHeight - sHeight) / 2;
            var dockLeft = settings.dockLeft || "center",
                  dockTop = settings.dockTop || "center";

            var scale = this.JyoPageScale;
            switch (mode) {
                case "fill":
                    scale[0] = cWidth / sWidth;
                    scale[1] = cHeight / sHeight;
                    break;
                case "cover":
                    scale[0] = scale[1] = Math.max(cWidth / sWidth, cHeight / sHeight);
                    if (JyoPage.debug && document.defaultView.getComputedStyle(document.body).overflow != "hidden") {
                        console.warn("在cover适配模式下，body的overflow样式如果不为hidden则会出现滚动条。\r\n如已设置，请忽略此建议。");
                    }
                    break;
                case "contain":
                    scale[0] = scale[1] = Math.min(cWidth / sWidth, cHeight / sHeight);
                    break;
                case "none":
                    scale = [1, 1];
                    marginLeft = marginTop = 0;
                    dockLeft = "left";
                    dockTop = "top";
                    break;
                default:
                    JyoPage.debug && console.error("无法识别的适配模式。" +
                                                                       "\r\n目前仅支持：cover、contain、fill、none");
                    break;
            }

            var css = "";

            scale = "scale(" + scale[0] + "," + scale[1] + ")";

            css += [JyoPage.prefix.css + "transform:" + scale + ";",
                        "transform: " + scale + ";",
                        JyoPage.prefix.css + "transform-origin: " + dockLeft + " " + dockTop + ";",
                        "transform-origin: " + dockLeft + " " + dockTop + ";",
                        "left: " + marginLeft + "px;",
                        "top: " + marginTop + "px;",
                        "display: block;"].join("");

            this.style.cssText += css;
            this._resizeMode = mode;
            this._resizeSettings = settings;

            if (mode != "none") {
                var timer;
                this._resizeFn = function resize() {
                    if (timer) {
                        clearTimeout(timer);
                        timer = null;
                    }
                    timer = setTimeout(function () {
                        if (self._resizeMode !== undefined) {
                            self.adaptation(self._resizeMode, self._resizeSettings);
                        }
                    }, 200);

                    window.removeEventListener("load", self._resizeFn, false);
                    return resize;
                }
                window.addEventListener("resize", self._resizeFn, false);
                window.addEventListener("load", self._resizeFn, false);
            } else {
                delete self._resizeMode;
                delete self._resizeSettings;
                window.removeEventListener("resize", self._resizeFn, false);
            }

            processPages.call(this, mode != "none");
        }
    };

    function processPages(isScale) {
        /// <summary>
        /// 处理页面
        /// </summary>

        var pages = this.children;
        var len = pages.length;
        pages[len] = this;
        for (var i = len + 1; i--;) {
            if (isScale) {
                pages[i].classList.add("JyoPage");
            } else {
                pages[i].classList.remove("JyoPage");
            }
        }
    }

    for (var i in div) {
        HTMLDivElement.prototype[i] = div[i];
    }

}(window, document);

// 加载方案，可选
; void function (win, doc, undefined) {

    // 自增ID
    var incrementId = 0;

    // 保存每秒大小体积
    var saveSize = 0;

    // 计算速度所用的计时器
    var speedTimer;

    function loadFile(url, fn, progressFn) {
        /// <summary>
        /// 加载文件
        /// </summary>
        /// <param name="url" type="String">文件地址</param>
        /// <param name="fn" type="Function">加载完成回调</param>
        /// <param name="progressFn" type="Function">过程回调</param>

        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onerror = function (e) {
            if (JyoPage.debug) {
                if (this.status == 0) {
                    return console.error("无法读取跨域或本地文件");
                }
                console.error("文件 " + url + " 未找到");
            }
        };
        xmlHttp.onprogress = progressFn;
        xmlHttp.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status == 404) { return this.onerror(); }
                if (!this.response) { return; }
                fn(this.response);
            }
        };
        xmlHttp.open('GET', url);
        xmlHttp.responseType = "blob";
        xmlHttp.send(null);
    }

    function Loader() {
        /// <summary>
        /// 资源加载器
        /// </summary>
        /// <field name="loadingSize" type="Number">正在加载剩余的文件大小</field> 
        /// <field name="loadedSize" type="Number">已加载的文件大小</field> 
        /// <field name="loadedFiles" type="Array">已加载的文件列表</field> 
        /// <field name="loadingFiles" type="Object">正在加载的文件查找表</field> 
        /// <field name="loadCount" type="Number">加载文件的总数量(包括正在加载和已加载的文件)</field> 
        /// <field name="loadSize" type="Number">加载文件的总大小(包括正在加载和已加载的文件)</field> 
        /// <field name="loadedCountPercentage" type="Number">已加载文件数量的百分比</field> 
        /// <field name="loadedSizePercentage" type="Number">已加载文件大小的百分比</field> 
        /// <field name="estimatedTime" type="Number">预计剩余下载时间(单位：秒)</field> 
        /// <field name="realtimeSpeed" type="Number">实时下载速度(单位：KB)</field> 

        var self = this;
        this.struct = null;
        this.loadingSize = 0;
        this.loadedSize = 0;
        this.loadedFiles = [];
        this.loadingFiles = { length: 0 };
        this.estimatedTime = 0;
        this.realtimeSpeed = 0;
        Object.defineProperty(this, "loadCount", {
            get: function () {
                return self.loadedFiles.length + self.loadingFiles.length;
            }
        });
        Object.defineProperty(this, "loadSize", {
            get: function () {
                return self.loadingSize + self.loadedSize;
            }
        });
        Object.defineProperty(this, "loadedCountPercentage", {
            get: function () {
                return Math.floor(self.loadedFiles.length / self.loadCount * 100);
            }
        });
        Object.defineProperty(this, "loadedSizePercentage", {
            get: function () {
                return Math.floor(self.loadedSize / self.loadSize * 100);
            }
        });
        this.loadedFolders = [];
    }

    Loader.prototype = {
        loadStruct: function (value, fn) {
            /// <summary>
            /// 加载结构
            /// </summary>
            /// <param name="value" type="String or Object">结构文件地址或对象</param>
            /// <param name="fn" type="Function" optional="true">加载完成后的回调函数</param>

            var self = this;
            if (!!this.struct) {
                if (JyoPage.debug) {
                    console.warn("无法重复加载结构，该请求将被忽略");
                }
                return;
            }
            if (typeof value == "string") {
                loadFile(value, function (blob) {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        self.struct = JSON.parse(e.target.result);
                        if (JyoPage.debug) {
                            console.info("结构数据加载完成：");
                            console.dir(self.struct);
                        }
                        fn && fn(self.struct);
                    };
                    reader.readAsText(blob);
                });
            } else if (typeof value == "object") {
                self.struct = value;
                if (JyoPage.debug) {
                    console.info("结构数据设置完成：");
                    console.dir(self.struct);
                }
                fn && fn(self.struct);
            } else {
                throw new TypeError("无效的加载器结构");
            }
        },
        loadAll: function (fn, progressFn) {
            /// <summary>
            /// 加载全部文件
            /// 此方法一般不推荐使用
            /// </summary>
            /// <param name="fn" type="Function">加载完成后的回调函数</param>
            /// <param name="progressFn" type="Function">加载进度回调函数</param>

            loadFolder.call(this, ".", fn, progressFn, true);
        },
        loadFolder: function (path, fn, progressFn) {
            /// <summary>
            /// 加载文件夹下的所有文件(不包含子文件夹)
            /// </summary>
            /// <param name="path" type="String">相对html的路径</param>
            /// <param name="fn" type="Function">加载完成后的回调函数</param>
            /// <param name="progressFn" type="Function">加载进度回调函数</param>

            if (path instanceof Array) {
                for (var i = path.length; i--;) {
                    loadFolder.call(this, path[i], fn, progressFn, false);
                }
                return;
            }
            loadFolder.call(this, path, fn, progressFn, false);
        },
        loadFolderWithSubFolders: function (path, fn, progressFn) {
            /// <summary>
            /// 加载文件夹下的所有文件(包含子文件夹)
            /// </summary>
            /// <param name="path" type="String">相对html的路径</param>
            /// <param name="fn" type="Function">加载完成后的回调函数</param>
            /// <param name="progressFn" type="Function">加载进度回调函数</param>

            if (path instanceof Array) {
                for (var i = path.length; i--;) {
                    loadFolder.call(this, path[i], fn, progressFn, false);
                }
                return;
            }
            loadFolder.call(this, path, fn, progressFn, true);
        }
    };

    function getPathFolder(path) {
        /// <summary>
        /// 获取路径所指的文件夹对象
        /// </summary>
        /// <param name="path" type="String">路径</param>
        /// <returns type="Object">文件夹对象</returns>

        if (path == ".") return this.struct;
        path = path.split("/");

        if (path[0] == ".") path.shift();

        var z = 0;
        var serachObj = this.struct;
        var serachFn = function () {
            if (path.length == z) return serachObj;
            var folders = serachObj.folders;
            for (var i = 0; i < folders.length; i++) {
                if (folders[i].name == path[z]) {
                    serachObj = folders[i];
                    z++;
                    return serachFn();
                }
            }
            console.error("在 " + path.join("/") + " 中找不到层级 " + path[z]);
        };
        return serachFn();
    }

    function getFilesByFolder(path) {
        /// <summary>
        /// 获取文件夹下已加载的文件列表
        /// </summary>
        /// <param name="path" type="String">路径</param>
        /// <returns type="Array">已加载文件列表</returns>

        path += "/";
        var list = [];
        for (var i = this.loadedFiles.length; i--;) {
            if (this.loadedFiles[i].fullName.indexOf(path) == 0) {
                list.push(this.loadedFiles[i]);
            }
        }
        return list;
    }

    function loadFolder(path, fn, progressFn, hasSub, _info, _n) {
        /// <summary>
        /// 加载文件夹
        /// </summary>
        /// <param name="path" type="String">文件夹路径</param>
        /// <param name="fn" type="Function">加载完成后的回调函数</param>
        /// <param name="progressFn" type="Function">加载进度回调函数</param>
        /// <param name="hasSub" type="Boolean">是否加载子文件夹下的内容</param>

        var self = this;

        if (!this.struct) throw new ReferenceError("还未加载结构");

        _n = _n || 0;

        var canLoad = false;

        var folder = getPathFolder.call(this, path);

        var tryFiles = getFilesByFolder.call(this, path);
        loadFiles: {
            if (tryFiles.length > 0) {
                break loadFiles;
            }

            canLoad = true;

            self.loadedFolders.push(path);

            _info = _info || {
                beginTime: Date.now(),
                files: [],
                size: hasSub ? folder.size : folder.fileSize
            };

            self.loadingSize += folder.fileSize;

            var file;
            for (var i = folder.files.length; i--;) {
                file = folder.files[i];
                incrementId++;
                this.loadingFiles["file" + incrementId] = file;
                file.fullName = path + "/" + file.name;
                self.loadingFiles.length++;
                (function (id, file) {
                    _info.files.push(file);
                    file.beginTime = Date.now();
                    file.loadedSize = 0;
                    loadFile(path + "/" + file.name, function (blob) {
                        file.blob = blob;
                        self.loadedFiles.push(file);
                        delete self.loadingFiles["file" + id];
                        self.loadingFiles.length--;
                        if (self.loadedFiles.length == self.loadCount) {
                            saveSize = 0;
                            self.realtimeSpeed = 0;
                            self.estimatedTime = 0;
                            clearInterval(speedTimer);
                            speedTimer = null;
                            fn && fn({
                                totalLoadTime: Date.now() - _info.beginTime,
                                files: _info.files,
                                size: _info.size
                            });
                        }
                    }, function (e) {
                        if (file.isComplate) return;

                        var loadedSize = (e.loaded - file.loadedSize);
                        self.loadedSize += loadedSize;
                        file.loadedSize += loadedSize;
                        self.loadingSize -= loadedSize;

                        if (file.loadedSize >= file.size) {
                            file.isComplate = true;
                            file.loadedSize = file.size;
                            file.endTime = Date.now();
                        }

                        file.loadTime = Date.now() - file.beginTime;

                        progressFn && progressFn(file);
                    });
                })(incrementId, file);
            }

        }

        if (hasSub) {
            var subFolder;
            for (var i = folder.folders.length; i--;) {
                subFolder = folder.folders[i];
                canLoad = loadFolder.call(this, path + "/" + subFolder.name, fn, progressFn, hasSub, _info, _n + 1);
            }
        }

        if (!canLoad && _n == 0) {
            fn && fn({
                totalLoadTime: 0,
                files: tryFiles,
                size: folder.size
            });
        }

        if (_n == 0 && !speedTimer) {
            var timerNum = 0;
            self.realtimeSpeed = 0;
            self.estimatedTime = self.loadSize;
            speedTimer = setInterval(function timerFn() {
                var realtimeSpeed = ((self.loadedSize - saveSize) * 4 / 1024).toFixed(2);
                if (realtimeSpeed == 0) {
                    self.realtimeSpeed = (self.realtimeSpeed * 0.05).toFixed(2);
                    self.estimatedTime = (self.estimatedTime * 1.05).toFixed(2);
                } else {
                    self.realtimeSpeed = realtimeSpeed;
                    self.estimatedTime = (self.loadingSize / self.realtimeSpeed / 1000).toFixed(2);
                }
                if (!saveSize || ++timerNum == 4) {
                    timerNum = 0;
                    saveSize = self.loadedSize;
                }
                return timerFn;
            }(), 250);
        }

        return canLoad;
    }

    JyoPage.loader = new Loader();

}(window, document);

// 微信、支付宝音频Hack方案，可选
; void function (win, doc, undefined) {
    // 原理：调用链中的某个事件被标识为用户事件而非系统事件
    // 进而导致浏览器以为是用户触发播放而允许播放
    Audio.prototype._play = Audio.prototype.play;
    HTMLAudioElement.prototype._play = HTMLAudioElement.prototype.play;

    function wxPlay(audio) {
        /// <summary>
        /// 微信播放Hack
        /// </summary>
        /// <param name="audio" type="Audio">音频对象</param>

        WeixinJSBridge.invoke('getNetworkType', {}, function (e) {
            audio._play();
        });
    }

    function alipayPlay(audio) {
        /// <summary>
        /// 支付宝播放Hack
        /// </summary>
        /// <param name="audio" type="Audio">音频对象</param>

        AlipayJSBridge.call('getNetworkType', function (result) {
            audio._play();
        });
    }

    function play() {
        var self = this;

        self._play();

        try {
            wxPlay(self);
        } catch (ex) {
            document.addEventListener("WeixinJSBridgeReady", function evt() {
                wxPlay(self);
                document.removeEventListener("WeixinJSBridgeReady", evt, false);
            }, false);
        }

        try {
            alipayPlay(self);
        } catch (ex) {
            document.addEventListener('AlipayJSBridgeReady', function evt() {
                alipayPlay(self);
                document.removeEventListener("AlipayJSBridgeReady", evt, false);
            }, false);
        }
    }

    Audio.prototype.play = play;
    HTMLAudioElement.prototype.play = play;
}(window, document);

// FastClick，可选
!function () { "use strict"; function a(b, d) { function f(a, b) { return function () { return a.apply(b, arguments) } } var e, g, h, i, j; if (d = d || {}, this.trackingClick = !1, this.trackingClickStart = 0, this.targetElement = null, this.touchStartX = 0, this.touchStartY = 0, this.lastTouchIdentifier = 0, this.touchBoundary = d.touchBoundary || 10, this.layer = b, this.tapDelay = d.tapDelay || 200, this.tapTimeout = d.tapTimeout || 700, !a.notNeeded(b)) { for (g = ["onMouse", "onClick", "onTouchStart", "onTouchMove", "onTouchEnd", "onTouchCancel"], h = this, i = 0, j = g.length; j > i; i++) h[g[i]] = f(h[g[i]], h); c && (b.addEventListener("mouseover", this.onMouse, !0), b.addEventListener("mousedown", this.onMouse, !0), b.addEventListener("mouseup", this.onMouse, !0)), b.addEventListener("click", this.onClick, !0), b.addEventListener("touchstart", this.onTouchStart, !1), b.addEventListener("touchmove", this.onTouchMove, !1), b.addEventListener("touchend", this.onTouchEnd, !1), b.addEventListener("touchcancel", this.onTouchCancel, !1), Event.prototype.stopImmediatePropagation || (b.removeEventListener = function (a, c, d) { var e = Node.prototype.removeEventListener; "click" === a ? e.call(b, a, c.hijacked || c, d) : e.call(b, a, c, d) }, b.addEventListener = function (a, c, d) { var e = Node.prototype.addEventListener; "click" === a ? e.call(b, a, c.hijacked || (c.hijacked = function (a) { a.propagationStopped || c(a) }), d) : e.call(b, a, c, d) }), "function" == typeof b.onclick && (e = b.onclick, b.addEventListener("click", function (a) { e(a) }, !1), b.onclick = null) } } var b = navigator.userAgent.indexOf("Windows Phone") >= 0, c = navigator.userAgent.indexOf("Android") > 0 && !b, d = /iP(ad|hone|od)/.test(navigator.userAgent) && !b, e = d && /OS 4_\d(_\d)?/.test(navigator.userAgent), f = d && /OS [6-7]_\d/.test(navigator.userAgent), g = navigator.userAgent.indexOf("BB10") > 0; a.prototype.needsClick = function (a) { switch (a.nodeName.toLowerCase()) { case "button": case "select": case "textarea": if (a.disabled) return !0; break; case "input": if (d && "file" === a.type || a.disabled) return !0; break; case "label": case "iframe": case "video": return !0 } return /\bneedsclick\b/.test(a.className) }, a.prototype.needsFocus = function (a) { switch (a.nodeName.toLowerCase()) { case "textarea": return !0; case "select": return !c; case "input": switch (a.type) { case "button": case "checkbox": case "file": case "image": case "radio": case "submit": return !1 } return !a.disabled && !a.readOnly; default: return /\bneedsfocus\b/.test(a.className) } }, a.prototype.sendClick = function (a, b) { var c, d; document.activeElement && document.activeElement !== a && document.activeElement.blur(), d = b.changedTouches[0], c = document.createEvent("MouseEvents"), c.initMouseEvent(this.determineEventType(a), !0, !0, window, 1, d.screenX, d.screenY, d.clientX, d.clientY, !1, !1, !1, !1, 0, null), c.forwardedTouchEvent = !0, a.dispatchEvent(c) }, a.prototype.determineEventType = function (a) { return c && "select" === a.tagName.toLowerCase() ? "mousedown" : "click" }, a.prototype.focus = function (a) { var b; d && a.setSelectionRange && 0 !== a.type.indexOf("date") && "time" !== a.type && "month" !== a.type ? (b = a.value.length, a.setSelectionRange(b, b)) : a.focus() }, a.prototype.updateScrollParent = function (a) { var b, c; if (b = a.fastClickScrollParent, !b || !b.contains(a)) { c = a; do { if (c.scrollHeight > c.offsetHeight) { b = c, a.fastClickScrollParent = c; break } c = c.parentElement } while (c) } b && (b.fastClickLastScrollTop = b.scrollTop) }, a.prototype.getTargetElementFromEventTarget = function (a) { return a.nodeType === Node.TEXT_NODE ? a.parentNode : a }, a.prototype.onTouchStart = function (a) { var b, c, f; if (a.targetTouches.length > 1) return !0; if (b = this.getTargetElementFromEventTarget(a.target), c = a.targetTouches[0], d) { if (f = window.getSelection(), f.rangeCount && !f.isCollapsed) return !0; if (!e) { if (c.identifier && c.identifier === this.lastTouchIdentifier) return a.preventDefault(), !1; this.lastTouchIdentifier = c.identifier, this.updateScrollParent(b) } } return this.trackingClick = !0, this.trackingClickStart = a.timeStamp, this.targetElement = b, this.touchStartX = c.pageX, this.touchStartY = c.pageY, a.timeStamp - this.lastClickTime < this.tapDelay && a.preventDefault(), !0 }, a.prototype.touchHasMoved = function (a) { var b = a.changedTouches[0], c = this.touchBoundary; return Math.abs(b.pageX - this.touchStartX) > c || Math.abs(b.pageY - this.touchStartY) > c ? !0 : !1 }, a.prototype.onTouchMove = function (a) { return this.trackingClick ? ((this.targetElement !== this.getTargetElementFromEventTarget(a.target) || this.touchHasMoved(a)) && (this.trackingClick = !1, this.targetElement = null), !0) : !0 }, a.prototype.findControl = function (a) { return void 0 !== a.control ? a.control : a.htmlFor ? document.getElementById(a.htmlFor) : a.querySelector("button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea") }, a.prototype.onTouchEnd = function (a) { var b, g, h, i, j, k = this.targetElement; if (!this.trackingClick) return !0; if (a.timeStamp - this.lastClickTime < this.tapDelay) return this.cancelNextClick = !0, !0; if (a.timeStamp - this.trackingClickStart > this.tapTimeout) return !0; if (this.cancelNextClick = !1, this.lastClickTime = a.timeStamp, g = this.trackingClickStart, this.trackingClick = !1, this.trackingClickStart = 0, f && (j = a.changedTouches[0], k = document.elementFromPoint(j.pageX - window.pageXOffset, j.pageY - window.pageYOffset) || k, k.fastClickScrollParent = this.targetElement.fastClickScrollParent), h = k.tagName.toLowerCase(), "label" === h) { if (b = this.findControl(k)) { if (this.focus(k), c) return !1; k = b } } else if (this.needsFocus(k)) return a.timeStamp - g > 100 || d && window.top !== window && "input" === h ? (this.targetElement = null, !1) : (this.focus(k), this.sendClick(k, a), d && "select" === h || (this.targetElement = null, a.preventDefault()), !1); return d && !e && (i = k.fastClickScrollParent, i && i.fastClickLastScrollTop !== i.scrollTop) ? !0 : (this.needsClick(k) || (a.preventDefault(), this.sendClick(k, a)), !1) }, a.prototype.onTouchCancel = function () { this.trackingClick = !1, this.targetElement = null }, a.prototype.onMouse = function (a) { return this.targetElement ? a.forwardedTouchEvent ? !0 : a.cancelable ? !this.needsClick(this.targetElement) || this.cancelNextClick ? (a.stopImmediatePropagation ? a.stopImmediatePropagation() : a.propagationStopped = !0, a.stopPropagation(), a.preventDefault(), !1) : !0 : !0 : !0 }, a.prototype.onClick = function (a) { var b; return this.trackingClick ? (this.targetElement = null, this.trackingClick = !1, !0) : "submit" === a.target.type && 0 === a.detail ? !0 : (b = this.onMouse(a), b || (this.targetElement = null), b) }, a.prototype.destroy = function () { var a = this.layer; c && (a.removeEventListener("mouseover", this.onMouse, !0), a.removeEventListener("mousedown", this.onMouse, !0), a.removeEventListener("mouseup", this.onMouse, !0)), a.removeEventListener("click", this.onClick, !0), a.removeEventListener("touchstart", this.onTouchStart, !1), a.removeEventListener("touchmove", this.onTouchMove, !1), a.removeEventListener("touchend", this.onTouchEnd, !1), a.removeEventListener("touchcancel", this.onTouchCancel, !1) }, a.notNeeded = function (a) { var b, d, e, f; if ("undefined" == typeof window.ontouchstart) return !0; if (d = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [, 0])[1]) { if (!c) return !0; if (b = document.querySelector("meta[name=viewport]")) { if (-1 !== b.content.indexOf("user-scalable=no")) return !0; if (d > 31 && document.documentElement.scrollWidth <= window.outerWidth) return !0 } } if (g && (e = navigator.userAgent.match(/Version\/([0-9]*)\.([0-9]*)/), e[1] >= 10 && e[2] >= 3 && (b = document.querySelector("meta[name=viewport]")))) { if (-1 !== b.content.indexOf("user-scalable=no")) return !0; if (document.documentElement.scrollWidth <= window.outerWidth) return !0 } return "none" === a.style.msTouchAction || "manipulation" === a.style.touchAction ? !0 : (f = +(/Firefox\/([0-9]+)/.exec(navigator.userAgent) || [, 0])[1], f >= 27 && (b = document.querySelector("meta[name=viewport]"), b && (-1 !== b.content.indexOf("user-scalable=no") || document.documentElement.scrollWidth <= window.outerWidth)) ? !0 : "none" === a.style.touchAction || "manipulation" === a.style.touchAction ? !0 : !1) }, a.attach = function (b, c) { return new a(b, c) }, "function" == typeof define && "object" == typeof define.amd && define.amd ? define(function () { return a }) : "undefined" != typeof module && module.exports ? (module.exports = a.attach, module.exports.FastClick = a) : document.addEventListener('DOMContentLoaded', function () { a.attach(document.body); }, false); }();