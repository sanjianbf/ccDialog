// JavaScript Document
;(function($, win, undef){
		   
	var ccDialog=function(id, settings){
		//处理设定信息
		this.settings = $.extend({}, ccDialog.defaults, settings||{});
		//生成遮罩层
		var _mask = ccDialog.util.createMask(this.settings);
		//生成对话框
		var _dialog = ccDialog.util.createDialog(id, this.settings);
		this.hash = {
			"mask":	_mask,
			"dialog":_dialog,
			"index":index++
		};
		this.events = $.extend({}, ccDialog.events);
	};
	
	//默认设置
	ccDialog.defaults={
		"msg":"111",
		"skin":"ccdefault",
		"maskid":"ccDialogMask",
		"method":"iframe",
		"cctitle":"对话框",
		"w":400,
		"h":300,
		"closeTrigger":".ccbar a.ccclose"
	};
	
	//默认事件
	ccDialog.events={
		"onhide":null
	};
	
	//全局变量
	var hasMask = false;		//是否生成遮罩层
	var index = 1;				//对象序号计数
	var regTag = /{(\w*?)}/ig;	//标签替换正则表达式
	
	//栈操作
	//定义栈
	mystack=[];
	win.ccDialogStack={
		//进栈操作
		"push":function(_obj){
			mystack.push(_obj);
		},
		//出栈操作，返回第一个元素
		"pop":function(){
			return mystack.pop();
		},
		//取栈的第一个元素，但是不出栈
		"top":function(){
			var len = mystack.length;
			if(len>0){
				return mystack[len-1];
			}else{
				return undef;
			}
		}
	};
	
	//ccDialog方法
	ccDialog.util={
		//生成遮罩层
		"createMask":function(settings){
			if(!hasMask){
				var _temp = "<div id=\"{maskid}\" class=\"ccmask {skin}\"><iframe src=\"about:blank\" frameborder=\"0\" style=\"width:100%; height:100%; display:none; _display:block;\"></iframe></div>";
				//替换模板标签
				var _maskHTML = _temp.replace(regTag, function(r, r1){
					return settings[r1];
				});
				//设标志变量
				hasMask = true;
				//将遮罩层附加到body并返回该对象
				return $(_maskHTML).appendTo("body");
			}else{
				return this.getObj(ccDialog.defaults.maskid);
			}
		},
		
		//显示遮罩层
		"showMask":function(_ccdialog){
			var 
				_hash = _ccdialog.hash,
				_mask = _hash.mask,
				_index = _hash.index;
			_mask.css({"z-index":10 * _index}).show();
		},
		
		//隐藏遮罩层
		"hideMask":function(_ccdialog){
			var
				_hash = _ccdialog.hash,
				_mask = _hash.mask;
			_mask.hide();
		},
		
		//生成对话框html代码
		"generateDialog":function(){
			var 
				_arr=[];
			_arr.push("<div class=\"{skin}\">");
			_arr.push("<div id=\"{id}\" class=\"ccdialog\">");
			_arr.push("<div class=\"ccbar\"><span class='cctitle' title=\"{cctitle}\">{cctitle}</span><a href=\"javascript:void(0);\" class=\"ccclose\" title=\"关闭\"></a></div>");
			_arr.push("<div class=\"cccontent\">{content}</div>  </div>  </div>");
			return _arr.join("");
		},
		
		//生成对话框
		"createDialog":function(_id, _settings){
			var _dialog;
			switch(_settings.method){
				case "iframe":
					_dialog = this.createIframeDialog(_id, _settings);
					break;
				case "wrap":
					_dialog = this.createWrapDialog(_id, _settings);
					break;
				default:
					this.error("createDialog Error:Method " +  _settings.method + " does not exist on jQuery.ccDialog!");
					return;
					break;
			}
			return _dialog;
		},
		
		//生成iframe dialog
		"createIframeDialog":function(_id, _settings){
			var
				_dialogHTML,
				_ifrHTML = "<div><iframe id=\"{id}_ifrDialog\" name=\"{id}_ifrDialog\" src=\"about:blank\" frameborder=\"0\" scrolling=\"auto\" style=\"width:100%; height:100%;\"></iframe></div>;";
			_dialogHTML = this.generateDialog();
			_dialogHTML = _dialogHTML.replace(regTag, function(r, r1){
				switch(r1){
					case "id":
						return _id;
						break;
					case "content":
						return _ifrHTML;
						break;
					default:
						return _settings[r1] ? _settings[r1] : "";
						break;
				}
			});
			_dialog = $(_dialogHTML).appendTo("body").find("#"+_id);
			return _dialog;
		},
		
		//包裹已存在对象
		//_id为需要包裹对象的id
		"createWrapDialog":function(_id, _settings){
			//生成dialog的id
			var 
				_dlgid = this.generateID(_id)
				_dialogHTML = this.generateDialog();
			_dialogHTML = _dialogHTML.replace(regTag, function(r, r1){
				switch(r1){
					case "id":
						return _dlgid;
						break;
					case "content":
						return "";
						break;
					default:
						return _settings[r1] ? _settings[r1] : "";
						break;
				}
			});
			_dialog = $(_dialogHTML).appendTo("body").find("#" + _dlgid);
			_dialog.find("div.cccontent").append(this.getObj(_id).show());
			return _dialog;
		},
		
		//显示对话框
		"showDialog":function(_url, _title, _w, _h, _ccdialog){
			var
				_hash = _ccdialog.hash,
				_dialog = _hash.dialog,
				_index = _hash.index,
				_this = this;
			this.resizeDialog(_w, _h, _dialog);
			_dialog.find("iframe").attr("src", _url).on("load", function(){})//未完成
				.end().find("a.ccclose").off("click").on("click", function(e){
					_this.hide(_ccdialog);
					return false;
				})
				.end().css({"index":10*_index + 1}).show();
		},
		
		//隐藏对话框
		"hideDialog":function(_ccdialog, ret){
			var
				_hash = _ccdialog.hash;
			_hash.dialog.hide();
		},
		
		//改变对话框大小
		"resizeDialog":function(_w, _h, _dialog){
			var
				_h2, _mgt, _mgl;
			_h2 = _h + 26;
			_mgt = 0 - Math.floor(_h2/2);
			_mgl = 0 - Math.floor(_w/2);
			_dialog.width(_w).height(_h2).css({"margin-top":_mgt, "margin-left":_mgl})
				.find("iframe").width(_w).height(_h2);
		},
		
		//显示遮罩层与窗体
		"show":function(_url, _title, _w, _h, _ccdialog){
			//显示遮罩层
			this.showMask(_ccdialog);
			//显示窗体
			this.showDialog(_url, _title, _w, _h, _ccdialog);
			//对象进栈
			ccDialogStack.push(_ccdialog);
		},
		
		//隐藏遮罩层与窗体
		"hide":function(_ccdialog, _ret){
			var _events = _ccdialog.events;
			//隐藏遮罩层
			this.hideMask(_ccdialog);
			//隐藏窗口
			this.hideDialog(_ccdialog);
			//对象出栈
			ccDialogStack.pop();
			//隐藏事件处理
			if(_events && typeof(_events.onhide)==="function"){
				_events.onhide.apply(_ccdialog, [_ret]);
			}
		},
		
		//获得对象
		"getObj":function(_id){
			var _jid = ["#", _id].join("");
			return $(_jid);
		},
		
		//生成随机id
		"generateID":function(_id){
			return [_id, "_wrapper"].join("");
		},
		
		//错误处理
		"error":function(_msg){
			alert(_msg);
			return false;
		}
	};
	
	//**** 公开方法代码 ****
	//显示模态窗口
	ccDialog.prototype.show=function(_url, _title, _w, _h, _callback){
		//参数处理
		switch(this.settings.method){
			case "iframe":
				if(typeof(_url)!=="string"){
					_url = "about:blank";	
				}
				if(typeof(_title)!=="string"){
					if(typeof(_title)==="function"){
						_callback=_title;
						_w = ccDialog.defaults.w;
						_h = ccDialog.defaults.h;
					}else if(typeof(_title)==="number"){
						_callback = typeof(_h)==="function" ? _h : undef;
						_h = _w;
						_w = _title;
					}else{
						_w = ccDialog.defaults.w;
						_h = ccDialog.defaults.h;
					}
					_title = ccDialog.defaults.cctitle;
				}
				break;
			case "wrap":
				if(arguments.length>4){
					//参数个数超过4个
					ccDialog.util.error("show Error:Parameter number error!");
					return;
				}
				var _arg = Array.prototype.slice.call(arguments); 
				
				if(typeof(arguments[0])==="function"){
					//第一个参数为function，则只有一个参数
					_callback = arguments[0];
					_url = undef;
					_title = ccDialog.defaults.cctitle;
					_w = ccDialog.defaults.w;
					_h = ccDialog.defaults.h;
				}else if(typeof(arguments[0])==="number"){
					//第一个参数为number，则有2或3个参数
					_callback = typeof(_arg[2])==="function" ? _arg[2] : undef;
					_h = typeof(_arg[1])==="number" ? _arg[1] : ccDialog.defaults.h;
					_w = ccDialog.defaults.w;
					_title = ccDialog.defaults.cctitle;
					_url = undef;
				}else if(typeof(arguments[0])==="string"){
					//第一个参数为string，则有1-4个参数
					_title = _arg[0];
					if(typeof(_arg[1])==="function"){
						_callback = _arg[1];
						_url = undef;
						_w = ccDialog.defaults.w;
						_h = ccDialog.defaults.h;
					}else if(typeof(_arg[1])==="number"){
						_w = _arg[1];
						_h = typeof(_arg[2])==="number" ? _arg[2] : ccDialog.defaults.h;
						_callback = typeof(_arg[3])==="function" ? _arg[3] : undef;
					}else{
						ccDialog.util.error("1show Error:Parameter type error!");
					}
				}else{
					ccDialog.util.error("2show Error:Parameter type error!");
				}
				break;
			default:
				ccDialog.util.error("show Error:Method " +  _settings.method + " does not exist on jQuery.ccDialog!");
				break;
		}
		//显示
		ccDialog.util.show(_url, _title, _w, _h, this);
		//绑定关闭事件
		$.extend(this.events, {"onhide":_callback});
	};
	
	//隐藏模态窗口
	ccDialog.prototype.hide=function(_ret){
		ccDialog.util.hide(this, _ret);
	};
	
	//**** 插件部分代码 ****
	$.fn.ccDialog={
		//初始化对象
		"init":function(id, settings){
			return new ccDialog(id, $.extend(settings, {"method":"iframe"}));
		},
		
		//包裹对象
		"wrap":function(id, settings){
			return new ccDialog(id, $.extend(settings, {"method":"wrap"}));
		},
		
		//iframe页面关闭窗口的方法（仅供iframe弹出页面调用）
		"close":function(ret){
			var dialog = win.parent.ccDialogStack.top();
			if(dialog){
				dialog.hide.apply(dialog, [ret]);
			}
		}
	}
})(jQuery, window);