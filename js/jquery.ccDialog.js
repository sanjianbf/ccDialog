// JavaScript Document
;(function($, win, undef){
		   
	var ccDialog=function(id, settings){
		//处理设定信息
		this.settings = $.extend({}, ccDialog.defaults, settings||{});
		this.hash = {
			"mask":	ccDialog.util.createMask(this.settings),
			"dialog":ccDialog.util.createDialog(id, this.settings),
			"index":index++
		};
		this.events = $.extend({}, ccDialog.events);
	};
	
	//默认设置
	ccDialog.defaults={
		"msg":"111",
		"skin":"ccdefault",
		"maskid":"ccDialogMask",
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
	
	//ccDialog方法
	ccDialog.util={
		//生成遮罩层
		createMask:function(settings){
			if(!hasMask){
				var temp = "<div id=\"{maskid}\" class=\"ccmask {skin}\"><iframe src=\"about:blank\" frameborder=\"0\" style=\"width:100%; height:100%; display:none; _display:block;\"></iframe></div>";
				//替换模板标签
				var maskHTML = temp.replace(regTag, function(r, r1){
					return settings[r1];
				});
				//设标志变量
				hasMask = true;
				//将遮罩层附加到body并返回该对象
				return $(maskHTML).appendTo("body");
			}else{
				return this.getObj(ccDialog.defaults.maskid);
			}
		},
		
		//显示遮罩层
		showMask:function(_ccdialog){
			var 
				_hash = _ccdialog.hash,
				_mask = _hash.mask,
				_index = _hash.index;
			_mask.css({"z-index":10 * _index}).show();
		},
		
		//隐藏遮罩层
		hideMask:function(_ccdialog){
			var
				_hash = _ccdialog.hash,
				_mask = _hash.mask;
			_mask.hide();
		},
		
		//生成对话框
		createDialog:function(_id, _settings){
			var arr=[], dialogHTML, _dialog;
			//皮肤div
			var skinHTML = ["<div class=\"", _settings.skin ,"\"></div>"].join("");
			//对话框html代码
			arr.push("<div id=\"{id}\" class=\"ccdialog\">");
			arr.push("<div class=\"ccbar\"><span class='cctitle' title=\"{cctitle}\">{cctitle}</span><a href=\"javascript:void(0);\" class=\"ccclose\" title=\"关闭\"></a></div>");	
			arr.push("<div><iframe id=\"{id}_ifrDialog\" name=\"{id}_ifrDialog\" src=\"about:blank\" frameborder=\"0\" scrolling=\"auto\" style=\"width:100%; height:100%;\"></iframe></div>");
			arr.push("</div>");
			dialogHTML = arr.join("").replace(regTag, function(r, r1){
				if(r1=="id"){
					return _id;
				}else{
					return _settings[r1];
				}
			});
			_dialog = $(dialogHTML).appendTo("body").wrap(skinHTML);
			
			return _dialog;
		},
		
		//显示对话框
		showDialog:function(_url, _title, _w, _h, _ccdialog){
			var
				_hash = _ccdialog.hash,
				_dialog = _hash.dialog,
				_index = _hash.index,
				_this = this;
			this.resizeDialog(_w, _h, _dialog);
			_dialog.find("iframe").attr("src", _url).on("load", function(){})//未完成
				.end().find("a.ccclose").off("click").on("click", function(e){
					_this.hideMask(_ccdialog);
					_this.hideDialog(_ccdialog);
					return false;
				})
				.end().css({"index":10*_index + 1}).show();
		},
		
		//隐藏对话框
		hideDialog:function(_ccdialog, ret){
			var
				_hash = _ccdialog.hash;
			_hash.dialog.hide();
		},
		
		//改变对话框大小
		resizeDialog:function(_w, _h, _dialog){
			var
				_h2, _mgt, _mgl;
			_h2 = _h + 26;
			_mgt = 0 - Math.floor(_h2/2);
			_mgl = 0 - Math.floor(_w/2);
			_dialog.width(_w).height(_h2).css({"margin-top":_mgt, "margin-left":_mgl})
				.find("iframe").width(_w).height(_h2);
		},
		
		getObj:function(id){
			var _id = ["#", id].join("");
			return $(_id);
		}
	};
	
	//显示模态窗口
	ccDialog.prototype.show=function(_url, _title, _w, _h, _callback){
		//参数处理
		if(typeof(_url)!=="string"){
			_url = "about:blank";	
		}
		if(typeof(_title)!=="string"){
			if(typeof(_title)==="function"){
				_callback=_title;
				_w = ccDialog.defaults.w;
				_h = ccDialog.defaults.h;
			}else if(typeof(_h)==="function"){
				_callback=_h;
				_h=_w;
				_w=_title;
			}else{
				_w = ccDialog.defaults.w;
				_h = ccDialog.defaults.h;
			}
			_title = ccDialog.defaults.cctitle;
		}
		//显示遮罩层
		ccDialog.util.showMask(this);
		//显示对话框
		ccDialog.util.showDialog(_url, _title, _w, _h, this);
		//绑定关闭事件
		$.extend(this.events, {"onhide":_callback});
	};
	
	//隐藏模态窗口
	ccDialog.prototype.hide=function(){
		var 
			_events = this.events;
		//隐藏遮罩层
		ccDialog.util.hideMask(this);
		//触发关闭事件
		if(typeof(_events.onhide)==="function"){
			_events.onhide();
		}
	};
	
	$.fn.ccDialog={
		"init":function(id, settings){
			return new ccDialog(id, settings);
		},
		"close":function(){
			alert("asdfgh");
		}
	}
})(jQuery, window);