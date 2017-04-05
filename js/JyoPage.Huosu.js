/*
 * 前端开发库 - 火速插件
 * nivk - v1.0.1 (2016-06-20T02:55:00+0800)
 */
; void function (win, doc, undefined) {

    var openid = JyoPage.queryString["openid"];
    var nickname = JyoPage.queryString["nickname"];
    var headimgurl = JyoPage.queryString["headimgurl"];

    if (!!JyoPage.debug) {
        var testId = localStorage["testWxOpenId"] || Math.floor(Math.random() * 100000000);
        localStorage["testWxOpenId"] = testId;
        openid = "test" + testId;
        nickname = "测试用户" + testId;
        headimgurl = "http://abc.yunfan.huosu.com/testRes/face.jpg";
    }

    // 是否已经设置过微信配置
    var isSetWxConfig = false;

    // 分享所使用的设置对象
    var setShareObj = null;

    function Huosu() {
        /// <summary>
        /// 火速开发相关类
        /// </summary>
        /// <field name="userinfo" type="Object">用户信息</field> 
        /// <field name="officialServer" type="Object">正式服务器配置</field> 
        /// <field name="testServer" type="Object">测试服务器配置</field> 

        var self = this;

        this.userinfo = {
            get openid() {
                if (openid == undefined) self.authorize();
                return openid;
            },
            get nickname() {
                if (nickname == undefined) self.authorize(true);
                return nickname;
            },
            get headimgurl() {
                if (headimgurl == undefined) self.authorize(true);
                return headimgurl;
            }
        };

        this.officialServer = {
            authorize: "http://weixin.huosu.com/api/index.php",
            sign: "http://weixin.huosu.com/api/index.php"
        };

        this.testServer = {
            authorize: "http://weixin.huosu.com/api/index.php",
            sign: "http://weixin.huosu.com/api/index.php"
        };

        this._useServer = JyoPage.debug ? this.testServer : this.officialServer;
    }

    function jsonp(url, callback) {
        /// <summary>
        /// 发送JSONP请求
        /// </summary>
        /// <param name="url" type="String">地址</param>
        /// <param name="callback" type="Function">回调函数</param>

        var callbackName = "JyoPageHuosuCallback" + Math.floor(Math.random() * 100000000);
        window[callbackName] = function () {
            callback && callback.apply(JyoPage.huosu, arguments);
            delete window[callbackName];
        };

        url += (url.indexOf("?") >= 0 ? "&" : "?") + "callback=" + callbackName;

        var script = document.createElement("script");
        script.onreadystatechange = script.onload = function () {
            if (!this.readyState || 'loaded' === this.readyState || 'complete' === this.readyState) {
                this.onreadystatechange = null;
                this.parentNode.removeChild(this);
            }
        };
        script.src = url;
        var head = document.getElementsByTagName('head')[0];
        !!head ? head.appendChild(script) : document.appendChild(scrip);
    }

    Huosu.prototype = {
        authorize: function (hasUserinfo) {
            /// <summary>
            /// 授权
            /// </summary>
            /// <param name="hasUserinfo" type="Boolean">是否需要用户信息</param>

            // 存在增强信息
            if (nickname != undefined && headimgurl != undefined) return;
            // 存在基本信息
            if (openid != undefined && !hasUserinfo) return;
            // 存在问题
            if (JyoPage.queryString["JyoPageA"] == "true") {
                console.warn("请求了增强授权,但接口没有返回增强信息。");
            }
            location.replace(this._useServer.authorize + "?act=authorize&is_userinfo=" + (!!hasUserinfo ? 1 : 0) + "&url=" + encodeURIComponent(location.href + (location.href.indexOf("?") >= 0 ? "&" : "?") + "JyoPageA=true"));
        },
        setShare: function (obj) {
            /// <summary>
            /// 设置分享
            /// </summary>
            /// <param name="obj" type="Object">分享设置对象</param>

            setShareObj = obj;
            if (isSetWxConfig) {
                JyoPage.setShare(obj);
                return;
            }
            jsonp(this._useServer.sign + "?act=sign", function (obj) {
                isSetWxConfig = true;
                JyoPage.wxConfig = obj.data;
                JyoPage.setShare(setShareObj);
            });
        }
    };

    JyoPage.huosu = new Huosu();

}(window, document);