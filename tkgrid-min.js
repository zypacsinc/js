var grid={USER_DATE_FORMAT:'yyyy-mm-dd',COLUMN_DISABLED:0,COLUMN_ENABLED:1,HIDDEN_COLUMN:2,HEADER_HEIGHT:50,COLUMN_HEIGHT:20,NONE:"",TEXT:"VARCHAR",INTEGER:"INTEGER",FLOAT:"FLOAT",DOUBLE:"DOUBLE",DATE:"TIMESTAMP",INPUTTYPE_CURRENCY:"currency",INPUTTYPE_SELECT:"select",INPUTTYPE_CHECKBOX:"checkbox",INPUTTYPE_TEXTAREA:"textarea",INPUTTYPE_RADIO:"radio",INPUTTYPE_FILE:"file",INPUTTYPE_MULTISELECT:"multiselect",INPUTTYPE_PICKER:"picker",INPUTTYPE_DATAPICKER:"datapicker",isResized:false,dragStartPoint:0,upper_cols:[],li_cols:[]}
var bpGridMetaData=[{datasource:'srno',displaymode:1,width:60,name:'Sr No',data_type:grid.INTEGER,input_type:''},{datasource:'id',displaymode:1,width:200,name:'col1',data_type:grid.INTEGER,input_type:''},{datasource:'projectnumber',displaymode:1,width:200,name:'project',data_type:grid.TEXT,input_type:grid.INPUTTYPE_CHECKBOX},{datasource:'record_no',displaymode:1,width:200,name:'record',data_type:grid.TEXT,input_type:''},{datasource:'description',displaymode:1,width:200,name:'discription',data_type:grid.TEXT,input_type:''},{datasource:'finishdate',displaymode:1,width:250,name:'Finish date',data_type:grid.TEXT,input_type:''},{datasource:'inv_num',displaymode:1,width:250,name:'invoice num',data_type:grid.TEXT,input_type:''},{datasource:'finishdate2',displaymode:1,width:250,name:'Late date',data_type:grid.TEXT,input_type:''}];var recorddata=[];function buildMetatData(){var str='[{"datasource":"srno", "data_size": 6 ,"displaymode":1,"width":60,"name":"Sr No","data_type":"'+grid.INTEGER+'","input_type":"text","display_type":"both"},';str+='{"datasource":"method","displaymode":1,"width":200,"name":"Web Service Method","data_type":"'+grid.TEXT+'","input_type":"text", "data_size": 40,"display_type":"upper"},';str+='{"datasource":"project_no","displaymode":1,"width":200,"name":"Project Number","data_type":"'+grid.TEXT+'","input_type":"text", "data_size": 40,"display_type":"upper"}';var prefix=company_map[dataset.company_id].selected_bp.studio_prefix;var infodata=company_map[dataset.company_id].bp_info_map[prefix];console.log('buildMetatData  %%%%% :'+infodata+'  '+prefix);if(!infodata)
return'';var delist=infodata.bp_info.de;console.log('buildMetatData ***---***li :'+infodata.bp_info.bp_li_de+'  '+prefix);console.log('buildMetatData ***---***upper :'+infodata.bp_info.bp_de+'  '+prefix);var bpdes=infodata.bp_info.bp_de.split(',');var bplide=jQuery.trim(infodata.bp_info.bp_li_de);var errorstr='';for(var i=0;i<bpdes.length;i++){var dename=bpdes[i];var p=checkDE(infodata,prefix,dename);if(p<0){var obj={Name:dename,Label:dename,InputType:"text",Type:"VARCHAR"};if(dename=='srno')
obj['Type']='Integer';p=delist.length;delist[p]=obj;infodata.bp_info.demap[dename]=p;}
str+=buildJsonData(delist,p,dename,'upper');}
if(bplide.length>0){var bplides=bplide.split(',');for(var i=0;i<bplides.length;i++){var dename=bplides[i];var p=checkDE(infodata,prefix,dename);str+=buildJsonData(delist,p,dename,'line');}}
str+=']';bpGridMetaData=JSON.parse(str);buildGridDiv(1);buildGridDiv(2);$('#webservicesdiv').html(buildSideOptions());}
function setGridColumn(count,items){for(var i=0;i<items.length;i++){var j=0;for(var s in items[i]){var colindex=(count===1?grid.upper_cols[j]:grid.li_cols[j]);var gridobj=bpGridMetaData[colindex];if(i==0)
console.log(j+' :'+colindex+' ::'+gridobj.input_type);if(gridobj.input_type==grid.INPUTTYPE_SELECT){console.log('select '+items[i][s]+' '+gridobj.options);var xString='<SELECT id="inp_'+count+'_'+i+'_'+j+'" CLASS="input" style="width:99%;">';if(gridobj.options){var options=gridobj.options;for(var pk=0;pk<options.length;pk++){var sel='';if(items[i][s]==options[pk].name)
sel='selected="selected"';xString+='<option  value="'+options[pk].value+'" '+sel+'>'+options[pk].name+'</option>';}}
xString+='</SELECT> ';$('#C_'+count+'_'+i+'_'+j).html(xString);}else{if(gridobj.data_type==grid.INTEGER)
$('#inp_'+count+'_'+i+'_'+j).val(parseInt(items[i][s]));else{$('#inp_'+count+'_'+i+'_'+j).val(items[i][s]);}}
j++;}}}
function checkDE(infodata,prefix,dename){var delist=infodata.bp_info.de;var p=getDE(delist,prefix,dename);if(p<0){var obj={Name:dename,Label:dename,InputType:"text",Type:"VARCHAR"};p=delist.length
delist[p]=obj;infodata.bp_info.demap[dename]=p;}
return p;}
function buildJsonData(delist,k,dename,displaytype){var str='';var opt='[]';if(delist[k].InputType==grid.INPUTTYPE_SELECT&&delist[k].options){var options=delist[k].options;opt='[';for(var j=0;j<options.length;j++){if(j>0)
opt+=',';opt+='{"name": "'+jsfilter2(options[j].Name)+'", "value":"'+jsfilter2(options[j].Value)+'"}';}
opt+=']';}
var datasize=0;if(delist[k].DataDefinition&&company_map[dataset.company_id].dddata_map[delist[k].DataDefinition])
datasize=company_map[dataset.company_id].dddata_map[delist[k].DataDefinition].data_size;var width=125;if(delist[k].Type=='VARCHAR')
width=200;if(delist[k].InputType==grid.INPUTTYPE_SELECT)
width=135;str+=',{"datasource":"'+delist[k].Name+'","displaymode":1, "data_size": '+datasize+', "width":'+width+',"name":"'+delist[k].Label+'","data_type":"'+delist[k].Type.toLowerCase()+'","input_type":"'+delist[k].InputType+'","options":'+opt+',"display_type":"'+displaytype+'" }';return str;}
function buildGridDiv(count){var str='';str+='<div id="griddatadiv_'+count+'" style="height:99%;float:left;">&nbsp;</div> ';$('#tabs-'+count).html(str);displayData(count);}
function paintHeadingCols(count){var leftHeaderArr=new Array();leftHeaderArr.push('<tr class="gridheadtop1" style="height:'+grid.HEADER_HEIGHT+'px;">');var colcount=0;for(var j=0;j<bpGridMetaData.length;j++){if(bpGridMetaData[j].displaymode===grid.HIDDEN_COLUMN)
continue;if(count===1&&bpGridMetaData[j].display_type==='line')
continue;if(count===2&&bpGridMetaData[j].display_type==='upper')
continue;var colDiaplayName=jsfilter(bpGridMetaData[j].name)+'<br/>('+jsfilter(bpGridMetaData[j].datasource)+')';if(bpGridMetaData[j].datasource==='uuu_tab_id')
colDiaplayName='Tab Id<br/>('+jsfilter(bpGridMetaData[j].datasource)+')';var colWidth=Number(bpGridMetaData[j].width);var str='<td id="tdHead_'+colcount+'_'+count+'" class="gridhead1" style="width:'+(colWidth+1)+'px;height:'+grid.HEADER_HEIGHT+'px;">';str+='<div id="tableHead_'+colcount+'_'+count+'" class="gridhead1" style="width:'+(colWidth+1)+'px;" >';str+=' <div id="divtdhead_'+colcount+'_'+count+'" class="gridheadfont1"  style="float:left;width:'+(colWidth-1)+'px;height:100%;text-align:center;" title=\"'+colDiaplayName+'">';str+=colDiaplayName+'</div>';str+='<div id="divth_'+colcount+'_'+count+'" style="float:right;" class="cellcss2" onmouseover = "this.style.cursor = \'E-resize\';" onmousedown = setDrag(this,'+colcount+',event) >&nbsp;</div>';str+="</div></td>";leftHeaderArr.push(str);if(count===1)
grid.upper_cols.push(j);else
grid.li_cols.push(j);colcount++;}
leftHeaderArr.push("</tr>");return leftHeaderArr.join("");}
function getRows(count){var rows=recorddata.length;if(rows>100)
rows+=20;else if(rows<=10)
rows+=100;else
rows+=70;if(count==2)
rows+=50;return rows;}
function displayData(count){var leftDataArr=new Array();leftDataArr.push('<table id="headerdiv_'+count+'" class="leftdata1">');leftDataArr.push(paintHeadingCols(count));var rows=getRows(count);if(count===1)
dataset.upper_rows=rows;else if(count===2)
dataset.lineitems_rows=rows;var ii=0;for(var i=0;i<rows;i++){var rowClass=((i%2)?'gridr1':'gridr2');var inpclass=((i%2)?'input_alt':'input');leftDataArr.push('<tr id="trRow_'+i+'_'+count+'" schID="0" style="height:'+grid.COLUMN_HEIGHT+'px"  onMouseOver=\"changeRowColor('+i+','+count+',0)\" onMouseOut=\"changeRowColor('+i+','+count+',1)\" class="'+rowClass+'">');var colcount=0;for(var j=0;j<bpGridMetaData.length;j++){var row_col=i+"_"+j;var datasource=bpGridMetaData[j].datasource;var cval="&nbsp;";if(bpGridMetaData[j].displaymode===grid.HIDDEN_COLUMN)
continue;if(count===1&&bpGridMetaData[j].display_type==='line')
continue;if(count===2&&bpGridMetaData[j].display_type==='upper')
continue;var colWidth=Number(bpGridMetaData[j].width);var xString='<td id="cell_'+row_col+'_'+count+'" style="width:'+(colWidth+1)+'px;" class="'+(colcount===0?'gridcol11':'gridcol1')+'" onKeyDown=\"if(event.keyCode ==9) return false;\" id="CCC_'+i+'_'+j+'" ';xString+=' ><div class=" gridfont1" style="height:'+grid.COLUMN_HEIGHT;xString+='px;width:100%;white-space:nowrap;text-overflow:ellipsis;overflow:hidden;" id="cell_'+count+'_'+ii+'_'+colcount+'" >';if(bpGridMetaData[j].input_type==grid.INPUTTYPE_SELECT){xString+='<SELECT id="inp_'+count+'_'+ii+'_'+colcount+'" CLASS="input" style="width:99%;">';if(bpGridMetaData[j].options){var options=bpGridMetaData[j].options;for(var pk=0;pk<options.length;pk++)
xString+='<option  value="'+options[pk].value+'" >'+options[pk].name+'</option>';}
xString+='</SELECT> ';}else{var value='';if(bpGridMetaData[j].datasource=='project_no'&&company_map[dataset.company_id].selected_project.projectnumber)
value=company_map[dataset.company_id].selected_project.projectnumber;xString+='<INPUT  ONCLICK="event.cancelBubble = true;" TYPE="text" style="width:100%;';xString+='height:20px" class="'+inpclass+'"  id="inp_'+count+'_'+ii+'_'+colcount+'" style="text-align:right" onKeyPress="javascript:return keyCheck(event, this)" value="'+value+'" />';}
xString+=' </div></td>';leftDataArr.push(xString);colcount++;}
leftDataArr.push('</tr>');ii++;}
leftDataArr.push('</table>');$('#griddatadiv_'+count).html(leftDataArr.join(""));}
function keyCheck(event,obj){}
changeCursor=function(obj){obj.style.cursor='url(/webant/images/skireArrow.cur),arrow'}
changeRowColor=function(i,type){var inpcolor=((i%2)?'#F2F9FA':'#ffffff');if(type===0)
inpcolor="#EFEAE3";for(var j=0;j<bpGridMetaData.length;j++)
$('#inp_'+i+'_'+j).css({"backgroundColor":inpcolor});}
function saveGridData(action,batch){var save_name=jQuery.trim($('#savenamespan').val());if(save_name.length==0){alert('Name is required');$("#dialog1").dialog("close");return;}
if(!alphaNumericU(save_name)){alert('Save Name should have only alphanumeric or _');$("#dialog1").dialog("close");return;}
var batchsize=0;if(batch==='yes'){batchsize=$('#batchsize').val()}
$("#dialog1").dialog("close");$('#loading-indicator').show();if(!dataset.upper_rows)
return;var upperstr=getGridData(1,dataset.upper_rows);var lowerstr='';if(dataset.lineitems_rows)
lowerstr=getGridData(2,dataset.lineitems_rows);var prefix=company_map[dataset.company_id].selected_bp.studio_prefix;var fileid=0;if(dataset.imported_files[prefix])
fileid=dataset.imported_files[prefix].fileid;var promise=getPostPromise(action,{upper_csvdata:upperstr,li_csvdata:lowerstr,prefix:prefix,save_name:save_name,batch:batch,batchsize:batchsize,fileid:fileid});return promise;}
function proceesResponse(data,action){if(action=='run_webservice')
$('#unifierstatus').html('<a href="#" class="buttonmenuR" onclick="javascript:downloadResponseFile('+data.service_id+');">Download Response</a>');else
$('#unifierstatus').html('<a href="#" class="buttonmenuR" onclick="javascript:downloadSavedFile('+data.fileid+');">Download File</a>');}
function getGridData(formcount,rows){var str='';for(var i=0;i<rows;i++){var colcount=0;for(var j=0;j<bpGridMetaData.length;j++){if(bpGridMetaData[j].displaymode===grid.HIDDEN_COLUMN)
continue;if(formcount===1&&bpGridMetaData[j].display_type==='line')
continue;if(formcount===2&&bpGridMetaData[j].display_type==='upper')
continue;var text=$('#inp_'+formcount+'_'+i+'_'+colcount).val();if(colcount===0){if(!text||typeof(text)==='undefined'||text.trim().length==0)
break;}
text=text.replace('"','""');if(colcount>0)
str+=',';str+=text;colcount++;}
str+='\r\n';}
return str;}
function showSaveDialog(action){var dv='<div class="font12" >';dv+='<div style="float:left;height:40px;"><span style="margin-left:20px;float:left;width:90%;margin-top:10px;">'+name+' Name <input type="text"  id="savenamespan" /></span>';dv+='<span style="margin-left:20px;float:left;width:90%;height:30px;">&nbsp;</span>';dv+='<span style="margin-left:20px;float:left;width:90%;text-align:center;"><a class="buttonmenu"  href="#"  id="save_data_name" >Save</a>';dv+='</span></div></div>';$("#dialog1").dialog({height:160,width:275,title:'Enter Save Name'});$("#dialog1").html(dv);$('#save_data_name').click(function(){saveResponse(action);});$("#dialog1").dialog("open");}
function saveResponse(action){var promise=saveGridData(action,'no');if(!promise||typeof(promise)=='undefined')
return;promise.done(function(data){console.log('data saved :'+action+' id:'+data.service_id+'  ;;'+data.saved_file_id);$('#loading-indicator').hide();if(data.erros){$('#unifierstatus').html(data.erros);return;}
proceesResponse(data,action);});}
function showRunDialog(){var dv='<div class="font12" >';dv+='<div style="float:left;height:80px;"><span style="margin-left:2px;float:left;width:95%;margin-top:10px;"> To run as batch service all method names & project number (if required) should be the same.<br/> Optimum record size should be around 10.</span></div>';dv+='<div style="float:left;height:25px;margin-top:1px;width:90%;"><span style="width:100px;margin-left:2px;float:left;">Batch    :</span><span style="width:140px;"><input type="radio"  id="runradio"  name="runradio" value="yes"/> Yes &nbsp;&nbsp;&nbsp;<input type="radio" checked="checked" id="runradio" name="runradio" value="no"  /> No</span></div>';dv+='<div style="float:left;height:25px;witdh:90%;"><span style="margin-left:2px;float:left;width:100px;margin-top:2px;">Batch Size  :</span><span style="width:140px;"><input type="number"  min="2" max="25"  value="10" id="batchsize" style="width:100px;"/></span></div>';dv+='<div style="float:left;height:40px;width:90%;"><span style="margin-left:2px;float:left;width:100px;margin-top:10px;">'+name+' Name :</span><span style="width:220px;"><input type="text"  id="savenamespan" style="width:200px;margin-top:10px;"/></span>';dv+='<span style="margin-left:20px;float:left;width:90%;height:30px;">&nbsp;</span>';dv+='<span style="margin-left:20px;float:left;width:90%;text-align:center;"><a class="buttonmenu"  href="#"  id="save_data_name" >Run</a>';dv+='</span></div></div>';$("#dialog1").dialog({height:260,width:375,title:'Run Web Services'});$("#dialog1").html(dv);$('#save_data_name').click(function(){saveRunServiceResponse('run_webservice',$('#runradio:checked').val());});$("#dialog1").dialog("open");}
function saveRunServiceResponse(action,batch){var promise=saveGridData(action,batch);;if(!promise||typeof(promise)=='undefined')
return;promise.done(function(data){console.log('data saved :'+action+' id:'+data.service_id+'  ;;'+data.saved_file_id);$('#loading-indicator').hide();if(data.erros){$('#unifierstatus').html(data.erros);return;}
proceesResponse(data,action);alert('Web Services has finished, check "Download Response" link');});}
function validateData(){if(!dataset.upper_rows)
return;var str=checkGridData(1,dataset.upper_rows);if(dataset.lineitems_rows)
str+=checkGridData(2,dataset.lineitems_rows);alert("Errors :"+str);}
function checkGridData(formcount,rows){var str='';for(var i=0;i<rows;i++){var colcount=0;for(var j=0;j<bpGridMetaData.length;j++){if(bpGridMetaData[j].displaymode===grid.HIDDEN_COLUMN)
continue;if(formcount===1&&bpGridMetaData[j].display_type==='line')
continue;if(formcount===2&&bpGridMetaData[j].display_type==='upper')
continue;var text=$('#inp_'+formcount+'_'+i+'_'+colcount).val();if(colcount===0){if(!text||typeof(text)=='undefined'||text.trim().length==0)
break;}
var estr=checkDataValue(bpGridMetaData[j].datasource,text);if(estr.length>0){$('#inp_'+formcount+'_'+i+'_'+colcount).addClass('cell_error');$('#inp_'+formcount+'_'+i+'_'+colcount).attr('title',estr);}else{$('#inp_'+formcount+'_'+i+'_'+colcount).removeClass('cell_error');$('#inp_'+formcount+'_'+i+'_'+colcount).attr('title','');}
str+=estr;colcount++;}}
return str;}
function checkDataValue(de,devalue){var bpobj=company_map[dataset.company_id].selected_bp;var infodata=company_map[dataset.company_id].bp_info_map[bpobj.studio_prefix];var bpdes=infodata.bp_info.bp_de.split(',');var destr=','+infodata.bp_info.bp_de.toLowerCase()+','+infodata.bp_info.bp_li_de.toLowerCase()+',';var delist=infodata.bp_info.de;var errorstr='';var k=getDE(delist,bpobj.studio_prefix,de);if(k<0){if(de=='srno'||de=='project_no'||de=='method'){var type=(de=='srno'?'Integer':'VARCHAR');var obj={Name:de,Label:de,InputType:"text",Type:type};k=delist.length
delist[k]=obj;}else
return errorstr+='<b>'+de+'</b> value :'+devalue+' is not found<br/>';}
if(de=='project_no')
return errorstr+=checkProjectNumber(devalue);if(delist[k].Mandatory!='false'&&devalue.length==0&&de!='_delete_bp_lineitems')
errorstr+='<b>'+de+'</b>  is required<br/>';var options=[];if(delist[k].InputType.toLowerCase()=='text'){if(delist[k].DataDefinition){var size=company_map[dataset.company_id].dddata_map[delist[k].DataDefinition].data_size;if(size>0&&devalue.length>size)
errorstr+='<b>'+de+'</b> value exceeds max length of :'+size+' <br/>';}else{var data_type=delist[k].Type.toLowerCase();if(data_type=='integer'){if(!isInt(devalue))
errorstr+='<b>'+de+'</b> value  is not an integer <br/>';}else if(data_type=='float'&&isNaN(devalue))
errorstr+='<b>'+de+'</b> value  is not numeric <br/>';}}else if(delist[k].InputType==grid.INPUTTYPE_SELECT&&delist[k].options){options=delist[k].options;var j=0;var found=false;for(j=0;j<options.length;j++){if(options[j].Name==devalue){found=true;break;}}
if(!found)
errorstr+='<b>'+de+'</b> value :'+devalue+' is not correct<br/>';}else if(delist[k].InputType.toLowerCase()==='currency'){if(!isFloat(devalue))
errorstr+='<b>'+de+'</b> value  is not currency <br/>';}
return errorstr;}
function checkProjectNumber(devalue){if(company_map[dataset.company_id].selected_bp.company_bp==0&&devalue=='')
return'project/shell number is empty';var pdata=company_map[dataset.company_id].projectdata;if(!pdata){alert('Please set project data by clicking on "Project/Shell List" link');return;}
for(var i=0;i<pdata.length;i++){var obj=pdata[i];if(!obj)
continue;if(obj.projectnumber==devalue){console.log('proj ---found -- '+devalue);return'';}}
console.log('proj ---error '+devalue);return'invalid project/shell number '+devalue;}
function downloadSavedFile(fileid){var prefix=company_map[dataset.company_id].selected_bp.studio_prefix;processDownload(fileid,prefix,'saved_file',"download_file",'','');}
function downloadResponseFile(service_id){console.log('downloadResponseFile id:'+service_id);var prefix=company_map[dataset.company_id].selected_bp.studio_prefix;processDownload(service_id,prefix,'service_audit',"download_file",'','');}
function buildExcelMenu(){var str='';str+='<div id="importexcel" style="float:left;width:110px;height:20px;"><a href="#" class="buttonmenu" title="Imports Excel Data" onclick="javascript:importExcel();">Import Excel</a></div>';str+='<div id="exportexcel" style="float:left;width:110px;height:20px;"><a href="#" class="buttonmenu" title="Export BP template" onclick="javascript:downloadExcel();">Export Excel</a></div>';str+='<div id="validatedata" style="float:left;width:95x;height:20px;"><a href="#" class="buttonmenu" title="Validate Grid Data" onclick="javascript:validateData();">Validate</a></div>';str+='<div id="savedata" style="float:left;width:105px;height:20px;"><a href="#" class="buttonmenu" title="Save the grid data to file" onclick="javascript:showSaveDialog(\'save_data\');">Save Data</a></div>';str+='<div id="exportdata" style="float:left;width:110px;height:20px;"><a href="#" class="buttonmenu" title="Exports data from the grid" onclick="javascript:exportFormData();">Export Data</a></div>';str+='<div id="runservice" style="float:left;width:140px;height:20px;"><a href="#" class="buttonmenu" onclick="javascript:showRunDialog();">Run Web Service</a></div>';str+='<div id="unifierstatus"  style="float:right;width:220px;height:20px;color:#F2D933;margin-right:6px;" class="font13">&nbsp; </div>';$('#excelsubheader').html(str);dataset.service_mode='excel';$("#bpsubheader").html('');$("#centerdiv").html('');if(company_map[dataset.company_id].selected_bp){var prefix=company_map[dataset.company_id].selected_bp.studio_prefix;var data=company_map[dataset.company_id].bp_info_map[prefix];setBPInfoData(prefix,data);}}
function setMethodHeader(){var str='<div id="resetexcelmenu" style="float:left;width:140px;height:20px;"><a href="#" class="buttonmenu" title="Reset Excel Menu" onclick="javascript:buildExcelMenu();">Reset Excel Menu</a></div>';$('#excelsubheader').html(str);dataset.service_mode='methods';}
function downloadExcelData(){var upperstr=getGridData(1,dataset.upper_rows);var lowerstr='';if(dataset.lineitems_rows)
lowerstr=getGridData(2,dataset.lineitems_rows);var prefix=company_map[dataset.company_id].selected_bp.studio_prefix;var fileid=0;console.log('downloadExcelData '+prefix);if(dataset.imported_files[prefix])
fileid=dataset.imported_files[prefix].fileid;processDownload(fileid,prefix,'excel_data',"download_file",upperstr,lowerstr);}