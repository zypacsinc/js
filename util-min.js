function onlyDigits(e,decReq,winObj)
{if(!winObj)
winObj=self;var isIE=winObj.document.all?true:false;var isNS=winObj.document.layers?true:false;var key=(isIE)?winObj.event.keyCode:e.which;var obj=(isIE)?winObj.event.srcElement:e.target;var isNum=(key>47&&key<58)?true:false;var dotOK=(key==46&&decReq=='decOK'&&(obj.value.indexOf(".")<0||obj.value.length==0))?true:false;winObj.event.keyCode=(!isNum&&!dotOK&&isIE)?0:key;e.which=(!isNum&&!dotOK&&isNS)?0:key;return(isNum||dotOK);}
function positiveAndNegativeDigits(e,decReq,winObj)
{if(!winObj)
winObj=self;var isIE=winObj.document.all?true:false;var isNS=winObj.document.layers?true:false;var key=(isIE)?winObj.event.keyCode:e.which;var obj=(isIE)?winObj.event.srcElement:e.target;var isNum=(key>47&&key<58)?true:false;var dotOK=(key==46&&decReq=='decOK'&&(obj.value.indexOf(".")<0||obj.value.length==0))?true:false;var negativeOK=(key==45&&(obj.value.indexOf("-")<0||obj.value.length==0))?true:false;winObj.event.keyCode=(!isNum&&!dotOK&&isIE&&!negativeOK)?0:key;e.which=(!isNum&&!dotOK&&isNS&&!negativeOK)?0:key;return(isNum||dotOK||negativeOK);}
function receiveNumber(e,decReq,winObj)
{positiveAndNegativeDigits(e,decReq,winObj);}
function removeIncorrectNegative(e,winObj)
{if(!winObj)
winObj=self;var isIE=winObj.document.all?true:false;var isNS=winObj.document.layers?true:false;var key=(isIE)?winObj.event.keyCode:e.which;var obj=(isIE)?winObj.event.srcElement:e.target;if(obj.value.indexOf("-")>0)
{var arrSplit=obj.value.split("-");obj.value=arrSplit.join("");}}
function SetPointer(winObj)
{if(!winObj)
winObj=self;if(winObj.document.all)
{var documentObjectNum=winObj.document.all.length;winObj.document.body.style.cursor='wait';if(winObj.documentObjectNum<100)
{for(var i=0;i<documentObjectNum;i++)
winObj.document.all(i).style.cursor='wait';}}}
function ResetPointer(winObj)
{if(!winObj)
winObj=self;if(winObj.document.all)
{var documentObjectNum=winObj.document.all.length;winObj.document.body.style.cursor='default';if(documentObjectNum<100)
{for(var i=0;i<documentObjectNum;i++)
winObj.document.all(i).style.cursor='default';}}}
function formatCurrency(num)
{if(num==Infinity||num==-Infinity)
return"Invalid";num=num.toString().replace(/\$|\,/g,'');if(isNaN(num))
num="0";sign=(num==(num=Math.abs(num)));num=Math.floor(num*100+0.50000000001);cents=num%100;num=Math.floor(num/100).toString();if(cents<10)
cents="0"+cents;for(var i=0;i<Math.floor((num.length-(1+i))/3);i++)
num=num.substring(0,num.length-(4*i+3))+','+
num.substring(num.length-(4*i+3));if(num==0&&cents==0)
sign=true;return(((sign)?'':'-')+num+'.'+cents);}
function formatPercentage(num)
{if(num==Infinity||num==-Infinity)
return"Invalid";num=num.toString().replace(/\$|\,/g,'');if(isNaN(num))
num="0";num=num*100;sign=(num==(num=Math.abs(num)));num=Math.floor(num*100+0.50000000001);cents=num%100;num=Math.floor(num/100).toString();if(cents<10)
cents="0"+cents;for(var i=0;i<Math.floor((num.length-(1+i))/3);i++)
num=num.substring(0,num.length-(4*i+3))+','+
num.substring(num.length-(4*i+3));if(num==0&&cents==0)
sign=true;return(((sign)?'':'-')+num+'.'+cents+'%');}
function getNumber(num)
{num=num.toString().replace(/\$|\,/g,'');if(isNaN(num))
num="0";return num;}
function getCurrencyNumber(num)
{num=num.toString().replace(/\$|\,/g,'');if(isNaN(num))
num="0";sign=(num==(num=Math.abs(num)));num=Math.floor(num*100+0.50000000001);cents=num%100;num=Math.floor(num/100).toString();if(cents<10)
cents="0"+cents;for(var i=0;i<Math.floor((num.length-(1+i))/3);i++)
num=num.substring(0,num.length-(4*i+3))+
num.substring(num.length-(4*i+3));if(num==0&&cents==0)
sign=true;return(((sign)?'':'-')+num+'.'+cents);}
function mathRound(num)
{var result=Math.round(num*100)/100
return result;}
String.prototype.trim=function()
{var x=this;x=x.replace(/^\s*(.*)/,"$1");x=x.replace(/(.*?)\s*$/,"$1");return x;}
function jsfilter(str)
{if(str==null)
return("");var result="";for(var i=0;i<str.length;i++)
{switch(str.substring(i,i+1))
{case'"':result+='&quot;';break;case"'":result+="\'";break;case'<':result+='&lt;';break;case'>':result+='&gt;';break;default:result+=str.substring(i,i+1);break;}}
return(result);}
function jsSqlFilter(str)
{if(str==null)
return("");var result="";for(var i=0;i<str.length;i++)
{switch(str.substring(i,i+1))
{case"'":result+="''";break;default:result+=str.substring(i,i+1);break;}}
return(result);}
function showLoading(winObj)
{if(!winObj)
winObj=self;message="Processing &nbsp;.&nbsp;.&nbsp;.";var loadingHTML="<table width=100% height=50%><tr><td align=center><table width=40% height=40 border=0 class=wait><tr><td width=10></td><TD valign=top width=100><img align=center src='/webant/images/unifier_processing.gif'></TD><td valign=middle class=fonttopbarblue>"+message+"</td></tr><tr><td height=2></td></tr></table></td></tr></table>"
winObj.ListViewData.innerHTML=loadingHTML;}
function remove_al_gt(str)
{if(str==null||str.length==0)
return"";var arrStr=str.split("&lt;")
if(arrStr.length>0)
str=arrStr.join("<");var arrStr=str.split("&gt;")
if(arrStr.length>0)
str=arrStr.join(">");return str;}
function remove_al_gt2(str)
{if(str==null||str.length==0)
return"";var arrStr=str.split("&lt;")
if(arrStr.length>0)
str=arrStr.join("<");var arrStr=str.split("&gt;")
if(arrStr.length>0)
str=arrStr.join(">");var arrStr=str.split("&quot;")
if(arrStr.length>0)
str=arrStr.join('"');var arrStr=str.split("\'")
if(arrStr.length>0)
str=arrStr.join("'");var arrStr=str.split("&amp;")
if(arrStr.length>0)
str=arrStr.join("&");return str;}
function copyArray(what)
{var newObj=new Array();for(i in what){newObj[i]=what[i];}
return newObj;}
function EnableSelect()
{E=event.srcElement.type
if(E=="text"||E=="textarea")
return true;else
return false;}
function jsfilter3(str)
{if(str==null)
return("");var result="";for(var i=0;i<str.length;i++){var c=str.charAt(i);switch(c){case'"':result+='&quot;';break;case"'":result+="\'";break;case'<':result+='&lt;';break;case'>':result+='&gt;';break;case'\\':result+='\\\\';break;case'\r':result+='\\r';break;case'\t':result+='\\t';break;case'\n':result+='\\n';break;default:result+=c;break;}}
return(result);}
function jsfilter2(str)
{if(str==null)
return("");var result="";for(var i=0;i<str.length;i++){var c=str.charAt(i);switch(c){case'"':result+='&quot;';break;case'<':result+='&lt;';break;case'>':result+='&gt;';break;case'\\':result+='\\\\';break;case'\r':result+='\\r';break;case'\t':result+='\\t';break;case'\n':result+='\\n';break;default:result+=c;break;}}
return(result);}
function checkValues(command,objValue){switch(command.toLowerCase())
{case"integer":{if(objValue.charAt(0)=='-')
objValue=objValue.substring(1);var charpos=objValue.search("[^0-9]");if(objValue.length>0&&charpos>=0)
{if(!strError||strError.length==0)
{strError="Not an integer.";}
errors[errors.length]=[objLabel,strError];return false;}
var objInt=parseInt(objValue);if(objInt>2147483647){errors[errors.length]=[objLabel,"Value must be between -2147483647 and 2147483647."];return false;}
break;}
case"float_no_comma":{if(objValue.charAt(0)=='-')
objValue=objValue.substring(1);objValue=objValue.replace(/\./,"")
var charpos=objValue.search("[^0-9]");if(objValue.length>0&&charpos>=0)
{if(!strError||strError.length==0)
{strError="Not a float.";}
errors[errors.length]=[objLabel,strError];return false;}
break;}}}
function randomString(len){var charSet='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+<>?';var randomString='';for(var i=0;i<len;i++){var randomPoz=Math.floor(Math.random()*charSet.length);randomString+=charSet.substring(randomPoz,randomPoz+1);}
return randomString;}
function alphaNumeric(val){if(val.match(/^[0-9a-z]+$/i)){return true;}
return false;}
function alphaNumericU(val){if(val.match(/^[0-9a-z_]+$/i)){return true;}
return false;}
function jsfilter3(str){if(!str)
return("");if(str.indexOf('"')<0)
return str;var result="";for(var i=0;i<str.length;i++){var c=str.charAt(i);if(c=='"'){result+='\\"';continue;}
result+=c;}
return(result);}
function checkboxInit(){$('#checkall').toggle(function(){$('input:checkbox').attr('checked','checked');},function(){$('input:checkbox').removeAttr('checked');})}
function isNumberKey(evt)
{var charCode=(evt.which)?evt.which:evt.keyCode;if(charCode!=46&&charCode>31&&(charCode<48||charCode>57))
return false;return true;}
function isValidURL(url){var RegExp=/(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;if(RegExp.test(url)){return true;}else{return false;}}
function getFileExtension(fn){var index=fn.lastIndexOf('.');if(index<=0||index===fn.length-1)
return'';return fn.substr(index+1);}
function getCookie(c_name){var i,x,y,ARRcookies=document.cookie.split(";");for(i=0;i<ARRcookies.length;i++){x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);x=x.replace(/^\s+|\s+$/g,"");if(x===c_name){return unescape(y);}}}
function setCookie(data){var c_name="connectuser";var value=data.user_id+"*"+data.firstname+"*"+data.lastname+"*"+data.session+value;var exmins=2*24*60;var exdate=new Date();exdate.setTime(exdate.getTime()+exmins*60*1000);var c_value=escape(value)+"; expires="+exdate.toUTCString();document.cookie=c_name+"="+c_value;}
function deleteCookie()
{var cookie_date=new Date();cookie_date.setTime(cookie_date.getTime()-1);document.cookie='connectuser=; expires='+cookie_date.toGMTString();}
function checkCookie(){var username=getCookie("connectuser");if(username&&username!=null&&username!=""){var sdata=username.split("*");if(sdata.length<3){alert('Error is setting values');return;}
dataset.user_id=sdata[0];dataset.firstname=sdata[1];dataset.lastname=sdata[2];dataset.sessionid=sdata[3];return true;}
return false;}
function isInt(value){return!isNaN(parseInt(value,10))&&(parseFloat(value,10)==parseInt(value,10));}
function isFloat(value){var regex=/^[0-9]\d*(((,\d{3}){1})?(\.\d{0,2})?)$/;return regex.test(value);}