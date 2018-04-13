/**
 * html2Json 改造来自: https://github.com/Jxck/html2json
 *
 *
 * author: Di (微信小程序开发工程师)
 * organization: WeAppDev(微信小程序开发论坛)(http://weappdev.com)
 *               垂直微信小程序开发交流社区
 *
 * github地址: https://github.com/icindy/wxParse
 *
 * for: 微信小程序富文本解析
 * detail : http://weappdev.com/t/wxparse-alpha0-1-html-markdown/184
 */

var __placeImgeUrlHttps = "https";
var __emojisReg = '';
var __emojisBaseSrc = '';
var __emojis = {};
var wxDiscode = require('./wxDiscode.js');
var HTMLParser = require('./htmlparser.js');
// Empty Elements - HTML 5
var empty = makeMap("area,base,basefont,br,col,frame,hr,img,input,link,meta,param,embed,command,keygen,source,track,wbr");
// Block Elements - HTML 5
var block = makeMap("br,a,code,address,article,applet,aside,audio,blockquote,button,canvas,center,dd,del,dir,div,dl,dt,fieldset,figcaption,figure,footer,form,frameset,h1,h2,h3,h4,h5,h6,header,hgroup,hr,iframe,ins,isindex,li,map,menu,noframes,noscript,object,ol,output,p,pre,section,script,table,tbody,td,tfoot,th,thead,tr,ul,video");

// Inline Elements - HTML 5
var inline = makeMap("abbr,acronym,applet,b,basefont,bdo,big,button,cite,del,dfn,em,font,i,iframe,img,input,ins,kbd,label,map,object,q,s,samp,script,select,small,span,strike,strong,sub,sup,textarea,tt,u,var");

// Elements that you can, intentionally, leave open
// (and which close themselves)
var closeSelf = makeMap("colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr");

// Attributes that have their values filled in disabled="disabled"
var fillAttrs = makeMap("checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected");

// Special Elements (can contain anything)
var special = makeMap("wxxxcode-style,script,style,view,scroll-view,block");

function makeMap(str) {
  var obj = {}, items = str.split(",");
  for (var i = 0; i < items.length; i++)
    obj[items[i]] = true;
  return obj;
}

function q(v) {
  return '"' + v + '"';
}

function removeDOCTYPE(html) {
  return html
    .replace(/<\?xml.*\?>\n/, '')
    .replace(/<.*!doctype.*\>\n/, '')
    .replace(/<.*!DOCTYPE.*\>\n/, '');
}

function trimHtml(html) {
  return html
    .replace(/\r?\n+/g, '')
    .replace(/<!--.*?-->/ig, '')
    .replace(/\/\*.*?\*\//ig, '')
    .replace(/[ ]+</ig, '<')
}


function html2json(html, bindName) {
  //处理字符串
  html = removeDOCTYPE(html);
  html = trimHtml(html);
  html = wxDiscode.strDiscode(html);
  //生成node节点
  var bufArray = [];
  var results = {
    name: bindName,
    images: [],
    imageUrls: [],
    children: []
  };
  var index = 0;
  HTMLParser(html, {
    start: function (tag, attrs, unary) {
      //debug(tag, attrs, unary);
      // node for this element
      var node = {
        type: 'node',
        name: tag,
        attrs: {},
        children: []
      };

      if (bufArray.length === 0) {
        node.index = index.toString()
        index += 1
      } else {
        var parent = bufArray[0];
        if (parent.children === undefined) {
          parent.children = [];
        }
        node.index = parent.index + '.' + parent.children.length
      }

      if (block[tag]) {
        node.tagType = "block";
      } else if (inline[tag]) {
        node.tagType = "inline";
      } else if (closeSelf[tag]) {
        node.tagType = "closeSelf";
      }

      if (attrs.length !== 0) {
        node.attrs = attrs.reduce(function (pre, attr) {
          var name = attr.name;
          var value = attr.value;
          pre[name] = value;
          return pre;
        }, {});
      }

      if (!node.attrs.style) {
        node.attrs.style = '';
      }
      if (!node.attrs.class) {
        node.attrs.class = '';
      }
      //对img添加额外数据
      if (node.name === 'img') {
        node.imgIndex = results.images.length;
        var imgUrl = node.attr.src;
        if (imgUrl[0] == '') {
          imgUrl.splice(0, 1);
        }
        imgUrl = wxDiscode.urlToHttpUrl(imgUrl, __placeImgeUrlHttps);
        node.attrs.src = imgUrl;
        node.from = bindName;
        results.images.push(node);
        results.imageUrls.push(imgUrl);
      }

      // 处理font标签样式属性
      if (node.name === 'font') {
        var fontSize = ['x-small', 'small', 'medium', 'large', 'x-large', 'xx-large', '-webkit-xxx-large'];
        var styleAttrs = {
          'color': 'color',
          'face': 'font-family',
          'size': 'font-size'
        };
        if (!node.attrs.style) node.attrs.style = '';
        for (var key in styleAttrs) {
          if (node.attrs[key]) {
            var value = key === 'size' ? fontSize[parseInt(node.attrs[key]) - 1] : node.attrs[key];
            node.attrs.style += styleAttrs[key] + ': ' + value + ';';
          }
        }
      }

      //临时记录source资源
      if (node.name === 'source') {
        results.source = node.attrs.src;
      }

      if (unary) {
        // if this tag doesn't have end tag
        // like <img src="hoge.png"/>
        // add to parents
        var parent = bufArray[0] || results;
        if (parent.children === undefined) {
          parent.children = [];
        }
        parent.children.push(node);
      } else {
        bufArray.unshift(node);
      }
    },
    end: function (tag) {
      //debug(tag);
      // merge into parent tag
      var node = bufArray.shift();
      if (node.name !== tag) console.error('invalid state: mismatch end tag');

      //当有缓存source资源时于于video补上src资源
      if (node.name === 'video' && results.source) {
        node.attrs.src = results.source;
        delete results.source;
      }

      if (bufArray.length === 0) {
        results.children.push(node);
      } else {
        var parent = bufArray[0];
        if (parent.children === undefined) {
          parent.children = [];
        }
        parent.children.push(node);
      }
    },
    chars: function (text) {
      //debug(text);
      var node = {
        type: 'text',
        text: text
      };

      if (bufArray.length === 0) {
        node.index = index.toString()
        index += 1
        results.children.push(node);
      } else {
        var parent = bufArray[0];
        if (parent.children === undefined) {
          parent.children = [];
        }
        node.index = parent.index + '.' + parent.children.length
        parent.children.push(node);
      }
    },
    comment: function (text) {
      //debug(text);
      // var node = {
      //     node: 'comment',
      //     text: text,
      // };
      // var parent = bufArray[0];
      // if (parent.nodes === undefined) {
      //     parent.nodes = [];
      // }
      // parent.nodes.push(node);
    },
  });
  return results;
};
module.exports = {
  html2json: html2json,
};

