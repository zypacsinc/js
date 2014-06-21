var dataset = { user_id: 1, company_id : 1, companyset: false,imported_files:{},service_mode:"excel"};
var services = {};
var company_map = {};
var webservices_map = {};
var companydata = [];
var i = 0;// for loop counter
var parser = new marknote.Parser();
/*
$( window ).resize(function() {
 var ht = $('#centerlayout').height();
	$('#centerdiv').css({height:ht} );
	$('#bptabs').css({height:ht} );
	console.log('resize ht :'+ht);
});
*/
function setDialogInit(){
	$("#createulinkdialog").dialog({
			autoOpen: false,
			height: 320,
			width: 500,
			modal: true			
		});		
	$("#dialog1").dialog({
			autoOpen: false,
			height: 500,
			width: 550,
			modal: true			
	});		
	$("#logindialog").dialog({
			autoOpen: false,
			height: 220,
			width: 300,
			modal: true			
	});		
}
function setButtonStatus(val){
 	document.getElementById('bplist').disabled = val;
	//document.getElementById('datadef').disabled= val;
	//document.getElementById('dataele').disabled= val;
	document.getElementById('all_web_methods').disabled = val;
	document.getElementById('all_web_methods').disabled = val;
	document.getElementById('projectlist').disabled = val;
	document.getElementById('savedlist').disabled = val;
	document.getElementById('uploadfilexml').disabled = val;
	
}

function logout() {
	setButtonStatus("disabled");
	$("#centerdiv").html("");
//	$("#login").html('<button class="btn_green_1"   type="button"  id="loginid"  onClick="javascript:showLogin();">&nbsp;&nbsp;&nbsp;login&nbsp;&nbsp;&nbsp;</button>');
	$("#login").html('<a class="topmenu" href="#"  id="loginid"  onClick="javascript:showLogin();">&nbsp;&nbsp;&nbsp;login&nbsp;&nbsp;&nbsp;</a>');
	//dataset = { user_id:-1,company_id :-1, companyset:false, projectset:false, bpset:false, projectnumber:''};
	// delete cookie 
	deleteCookie();
	window.location.reload();
}
function showLogin() {
	var str = '<table id="logintable" class="company"  >';
	str += '<tr style="height:35px;"><td colspan="2"><span id="loginerror" class="redfont_sm">&nbsp;<span></td></tr></thead>';
	str += '<tr style="height:20px;"><td>Username </td><td><input type="text" id="user_email"  value=""/></td></tr>';
	str += '<tr><td>Password </td><td><input type="password" id="user_password" value=""/></td></tr>';
	str += '<tr><td colspan="2">&nbsp;</td></tr><tr><td>&nbsp;</td><td><a href="#" class="buttonmenuL" id="userlogin"  onClick="javascript:checkUserLogin()">Login</a></td></tr>';
	str += '</table>'; 
	$("#logindialog").html(str);	
	$("#logindialog").dialog("open");
}
function init_org() {
	var cookieset = checkCookie();
	//alert(' Cookie result  '+cookieset);
	setDialogInit();
	document.getElementById('company').disabled = 'disabled';
	setButtonStatus("disabled");
	if(!cookieset)
		showLogin();
	else{
		setUserCompany(dataset.user_id);
	}
	// get webservices
	getData('get_services',setServices);
}
function setServices(data){
	
}

function checkUserLogin() {
	var user_email = $("#user_email").val();
	var user_password = $("#user_password").val();
	if(jQuery.trim(user_email) === '' && jQuery.trim(user_password) === '')
		return;
	if(jQuery.trim(user_email) === '' ){
		$('#loginerror').html('Username is empty');
		return;
	}	
	if(jQuery.trim(user_password) === '' ){
		$('#loginerror').html('Password is empty');
		return;
	}	
	$.ajax({
		type: 'GET',
		url: "connect",
		dataType: 'json',
		data: {actiontype : 'login',user_email:user_email,user_password:user_password},
		success: function(data){ 
			//alert('ret ' +data.user_id);
			if(data.user_id == '-1'){
				$('#loginerror').html('Username or Password is not correct');
			}else{
					setLoginDetails(data);
				}
		}
	});		
}
/*
function setLoginDetails(data){
	dataset.user_id = data.user_id;
	dataset.firstname = data.firstname;
	dataset.lastname = data.lastname;
	dataset.sessionid = data.session;
	setUserCompany(data.user_id);	
	$("#logindialog").dialog( "close" );
	setCookie(data);
}
*/

function connectInit(){
	dataset.user_id = 1;
	dataset.firstname = 'TK';
	dataset.lastname = 'Connect';
	dataset.sessionid = 'session';
	//buildGridDiv();
	console.log('init ---');
	setUserCompany(dataset.user_id);	
	
}
function setUserCompany(user_id) {
	
	//$('#userloginname').html(dataset.firstname+' '+dataset.lastname);
	//$('#userloginname').html(dataset.firstname+' '+dataset.lastname);
	setWebServicesMap();
	
	//document.getElementById('bpheader').style.visibility='visible';
	
	dataset.user_id = user_id;
	//alert('hello');
	//$("#login").html('<a class="topmenu"  id="logoutid" href="#" onClick="javascript:logout();">&nbsp;&nbsp;&nbsp;Logout&nbsp;&nbsp;&nbsp;</a>');
	getData('get_companies',setCompanyLog);
}

function setCompanyLog(data) {	
	dataset.companyset = true;	
	companydata = data;
	//alert('hello '+data);
	console.log('company logs  '+data);
	if(!data ) 
		return ;
	var i = 0;
	console.log('company logs  '+companydata.length);
	for( i=0;i<companydata.length;i++){
		var obj = companydata[i];
		setCompanyDataMap(obj);
	}	
//	displayCompanyLog();
	document.getElementById('companyinfo').innerHTML=company_map[dataset.company_id].company_name;
	document.getElementById('company').disabled= '';
	if(!company_map[dataset.company_id].ddset){
		getBPList();
		getData("dd_list",setDDListCallDE);
		getLatestServiceInfo();
	// get DD & DE silently & BP's
	}
}

function getLatestServiceInfo(){
	console.log('getLatestServiceInfo  --');
	var data_params = {request_type:"bp_list"};
	var promise = getPromise('service_info',data_params);
	promise.done( function(data){
		dataset.last_updated_bps=data.date;
	});
	data_params.request_type="project_list";
	var promise2 = getPromise('service_info',data_params);
	promise2.done( function(data){
		dataset.last_updated_projects=data.date;
	});
}

function setCompanyDataMap(obj) {
		obj['projectdata'] = null;	
		obj['bpdata'] = null;
		obj['bpset'] = false;	
		obj['ddset'] = false;
		obj['dddata'] = null;	
		obj['dddata_map'] = new Object();	
		obj['dedata'] = null;
		obj['deset'] = false;	
		obj['projectset'] = false;
		obj['selected_project'] = {};
		obj['selected_bp'] = {};
		obj['bp_info_map'] = {};
		obj['fav_methods'] = [];
		obj['fav_bps'] = [];
		obj['fav_projects'] = [];
		obj['saved_files'] = [];
		obj['services_log'] = [];
		company_map[obj.company_id] = obj;
		console.log('# --company id '+obj.company_id+' -- ::'+obj.dir_location);
}
function setDEListOnly(data) {
	//	alert("de "+data.length)
	
	company_map[dataset.company_id].deset = true;
	company_map[dataset.company_id].dedata = data;
}

function setDDListCallDE(data) {
	//	alert("dd "+data)
	dataset.xml_file_saved = false;
	if(data.length == 0)
		return;
	company_map[dataset.company_id].ddset = true;
	company_map[dataset.company_id].dddata = data;
	var k = 0;
	var dd_map = {};
	for(k = 0; k < data.length; k++)
		dd_map[data[k].data_name] = data[k]; 
	company_map[dataset.company_id].dddata_map = dd_map;
	
	if(!company_map[dataset.company_id].deset)
		getData("de_list",setDEListOnly);
}


function displayMenuCompany() {
	var str = '<div style="width:100%;">';
	dataset.xml_file_saved = false;
	
	str +='<div style="float:left;z-index:30;margin-left:10px;width:56px;"><a class="buttonmenu" title="Create a new Company" name="createco" id="createco"  onClick="javascript:showCoForm(\'Create Company\');" href="#">Create</a></div>';
	str +='<div style="float:left;z-index:30;margin-left:10px;width:56px;"><a title="Select a Company & Update a Company" class="buttonmenu" name="updateco" id="updateco" onClick="javascript:updateCoForm();" href="#">Update</a></div>';
	str +='</div>	';
	$("#rightbuttonid").html(str);
	str ='<div style="width:100%;height:10px"></div>	<div id="companydiv" style="visibility:visible;"></div>	</div>	';
	$("#centerdiv").html(str);
	
}

function setDatasetHeader() {
	var str = '<tr ><td style="width:4%;">&nbsp;</td><td  style="width:30%;">Company Name</td>';
	str += '<td  style="width:18%;">Registry Prefix</td>';
	str += '<td  style="width:15%;">Short Name</td>';
	str += '<td  style="width:33%;">URL</td></tr>';	
	return str;
}
function displayCompanyLog() {	
	displayMenuCompany();
	var str = '<table  class="table table-bordered table-striped font15" style="width:75%;">';
	str += setDatasetHeader();
	i = 0;	
	str += '<tbody>';
	var obj;
	for(i=0;i<companydata.length;i++){
		obj = companydata[i];	
		//alert(obj+"  **"+obj["company_id"]+" ::"+obj.company_id);
		if(obj ) {
			str += '<tr ><td style="text-laign:center;"><input type="radio" title="Select Company" name="companylistradio" value="'+obj.company_id+'"/></td>';
			str += '<td><a id="'+obj.company_id+'" href="#" style="text-decoration:none;" ';
			str += 'onClick="javascript:showCompanyDetails('+obj.company_id+')">'+obj.company_name+'</a></td>';
			str += '<td>&nbsp;'+obj.registry_prefix+'</td><td>'+obj.shortname+'</td><td>'+obj.company_url+'</td></tr>';
		}
	}
	str += '</tbody></table>';
	if(companydata.length === 0){
		str +='<div class="font15" style="margin:30px;color:blue;"> You need to Click on <b>Create</b> to Create a new Company, this company is the company which points to your local server or QA server or production server etc, you will need the server URL the Shortname & Authocde just like you did in Ulink.<br/>You can then setup <b>Favorite Methods</b>, Click on getting <b>Project/Shells</b> &amp; <b>BP Lists</b> data.</div>'; 
	}
	//alert(str);
	$("#companydiv").html(str);	
	$('#companydiv input:radio').change(function () {
		selectedCompany();
	});
}
function validateCompany() {
	var company_name = $("#company_name").val();
	var registry_prefix = $("#registry_prefix").val();
	var shortname = $("#shortname").val();
	var authcode = $("#authcode").val();
	var company_url = $("#company_url").val();
	var dir_location = $("#dir_location").val();
	//alert(company_name+" r: "+registry_prefix+"  s: "+shortname+"  c: "+authcode+"   u:  "+company_url);

	var error = '';
	$('#e_cn_n').html('');
	$('#e_sn_n').html('');
	$('#e_ac_n').html('');
	$('#e_cu_n').html('');
	if((jQuery.trim(company_name)).length == 0) {
		$('#e_cn_n').html('required');
		error +=' company error ';
	}if(jQuery.trim(shortname).length == 0){
		$('#e_sn_n').html('required');
		error +=' shotname error ';
	}if(jQuery.trim(authcode).length == 0){
		$('#e_ac_n').html('required');
		error +=' autcode error ';
	}if(jQuery.trim(company_url).length == 0){
		$('#e_cu_n').html('required');
		error +=' url error ';
	}if(error.length > 0){
		//alert(error);
		return false;
	}	
	return true;
}
function cancelUpdateCompany(type) {
	$("#createulinkdialog").dialog( "close" );
}
function createUpdateCompany(type) {
	if(!validateCompany())
		return;
	var company_name = $("#company_name").val();
	var registry_prefix = $("#registry_prefix").val();
	var shortname = $("#shortname").val();
	var authcode = $("#authcode").val();
	var company_url = $("#company_url").val();
	var dir_location = $("#dir_location").val();
	var file_location = $("#file_location").val();
	var action = 'create_company';
	var sessionid= dataset.sessionid;
	var service = $('#serviceradio:checked').val();
	var id = 0;
	if(type == 1){
		action = 'update_company';
		id = dataset.company_id ;
	}
	//alert(company_name+"  "+registry_prefix+"   "+shortname+"   "+authcode+"     "+company_url);
	$.ajax({
		type: 'POST',
		url: "connect",
		dataType: 'text',
		data: {actiontype : action, sessionid:sessionid,company_name:company_name, registry_prefix:registry_prefix, shortname:shortname,
				authcode:authcode, company_url:company_url, user_id:dataset.user_id,company_id:id,dir_location:dir_location,file_location:file_location,directory_service:service },
		success: function(data){ 				
				$("#createulinkdialog").dialog( "close" );
				// process this data
				var co = { company_name:company_name, registry_prefix:registry_prefix, shortname:shortname,	authcode:authcode, company_url:company_url, company_id:data.company_id,dir_location:dir_location,file_location:file_location,directory_service:service };
				if(type == 0)
					addCompany(co);
				else
					updateCompany(co, data);
		}
	});	
}

function updateCompany(data,pingdata) {
	company_map[dataset.company_id].company_name = data.company_name;
	company_map[dataset.company_id].registry_prefix = data.registry_prefix;
	company_map[dataset.company_id].shortname = data.shortname;
	company_map[dataset.company_id].authcode = data.authcode;
	company_map[dataset.company_id].company_url = data.company_url;
	company_map[dataset.company_id].file_location = data.file_location;
	company_map[dataset.company_id].dir_location = data.dir_location;
	company_map[dataset.company_id].directory_service = data.directory_service;
	document.getElementById('companyinfo').innerHTML=data.company_name;
	console.log(' company directory_service '+company_map[dataset.company_id].directory_service);
	/*if(pingdata){
		if(pingdata.statuscode == 200)
			$('#unifierconnect').html("Connected to Unifier");
		else
			$('#unifierconnect').html("Connection to Unifier Failed");		
	}*/
	$("#createulinkdialog").dialog( "close" );
}

function addCompany(data) {
	dataset.company_id 	= data.company_id;
	companydata[companydata.length] = data;
//	$("#centerdiv").html("");
	$("#selected_coname").html(data.company_name);
	$("#selected_targeturl").html(data.company_url);
	//getData("get_fav_methods",setFavMethods);
	setCompanyDataMap(data);
	displayCompanyLog();
	getData("dd_list",setDDListCallDE);
}

function getCompanyForm(type) {
	var str = '<div style="float:left;width:100%;height:38px;color:red;" class="font12" id="companylogtitle">&nbsp;</div>';
	 str += '<div style="float:left;width:100%;"><table id="companytable" class="table table-bordered table-striped" style="width:99%;font-size:12px;" >';
		str += '<tr><td style="width:31%;">Company Name</td><td  style="width:69%;"><input  style="width:90%;" type="text" id="company_name"  disabled="disabled" value=""/>&nbsp;<span id="e_cn_n" class="errordisp"></span></td></tr>';
		//str += '<tr><td>Registry Prefix</td><td><input  style="width:75%;" type="text" id="registry_prefix" name="registry_prefix" value=""/></td></tr>';
		str += '<tr><td>Short Name</td><td><input  style="width:90%;" type="text" id="shortname"  value=""/><span id="e_sn_n0" class="errordisp"></span></td></tr>';
		str += '<tr><td>Authentication Key</td><td><input  style="width:90%;" type="text" id="authcode"  value=""/><span id="e_ac_n1" class="errordisp"></span></td></tr>';
		str += '<tr><td>Company URL</td><td><input  style="width:90%;" type="text" id="company_url"  value=""/><span id="e_cu_n2" class="errordisp"></span></td></tr>';
		str += '<tr><td>Directory Location</td><td><input  style="width:90%;" type="text" id="dir_location" value=""/><span id="e_cu_n3" class="errordisp"></span></td></tr>';
		str += '<tr><td>Temp Location</td><td><input  style="width:90%;" type="text" id="file_location" value=""/><span id="e_cu_n4" class="errordisp"></span></td></tr>';
		var stopcheck='';
		var startcheck='';
		if(company_map[dataset.company_id].directory_service == 'stop')
			stopcheck=' checked="checked" ';
		else if(company_map[dataset.company_id].directory_service == 'stop')
			startcheck=' checked="checked" ';	
		//str += '<tr><td>Directory Service</td><td><input type="radio"  id="serviceradio"  name="serviceradio" value="stop" '+stopcheck+'/> Stop &nbsp;&nbsp;&nbsp;<input type="radio" '+startcheck+' id="serviceradio" name="serviceradio" value="start"  /> Start</td></tr>';
		str += '<tr><td>&nbsp;</td><td><a href="#" class="buttonmenu" id="createcompbtn"  onClick="javascript:createUpdateCompany('+type+')">OK</a>&nbsp;&nbsp;&nbsp;';
		str += '<a href="#" class="buttonmenu" id="testcompbtn"  onClick="javascript:testCompanyURL()">Test</a>&nbsp;&nbsp;&nbsp;';
		str += '<a href="#" class="buttonmenu" id="cancelcompbtn" onClick="javascript:cancelUpdateCompany('+type+')">Cancel</a>';
		str += '</td></tr>';
		str += '</table></div>'; 
	return str;	
}

function testCompanyURL(){	
	var data_params = {
		 shortname : $("#shortname").val(),
		 authcode : $("#authcode").val(),
		 company_url : $("#company_url").val()
	 }
	 $('#loading-indicator').show();
	var promise = getPromise('test_ping',data_params);
	promise.done( function(data){
		$('#loading-indicator').hide();
		if(data.statuscode == 200){
			$('#companylogtitle').html("Test Success");	
		}else if(data.statuscode == 601){
			$('#companylogtitle').html("Invalid Shortname/Authentication Key");	
		}else
			$('#companylogtitle').html(data.errors);
			
	});
}

function showCoForm(title) {
	//$("#createulinkdialog").html();
	var	type = 0;
	if(title === 'Update Company')
		type = 1;
	title = 'Settings';	
	$("#createulinkdialog").dialog( {height : 390, width:500,title:title} );
	$("#createulinkdialog").html(getCompanyForm(type));	
	$("#createulinkdialog").dialog( "open" );
}


function getCheckList() {
	var ds = [];
	var count = 0;
    $('#companydiv input:checked').each(function() {
            ds.push(this.id);
			count++;
    });
	if(count == 0){
		alert("Select a company ");
		return "";
	}
	if(count > 1){
		alert("Select only one company ");
		return "";
	}
	var ids = ds[0];	
	return ids;
}

function selectedCompany() {

	//setButtonStatus("");
	$("#selected_coname").html(companydata[i].company_name);
	$("#selected_targeturl").html(companydata[i].company_url);
	$("#selected_project").html('');
	$("#selected_bp").html('');
	$("#selected_bp_more").html('');
	getData("get_fav_methods",setFavMethods);
	getData("dd_list",setDDListCallDE);
	//alert(id + '  '+companydata[i].authcode+'   '+company_map[id].authcode);
}

function updateCoForm() {
	var id =  $('input[name=companylistradio]:checked').val();
	if(id === "" || !company_map[id])
		return;
	showCoForm('Update Company');
	setCompanyData(company_map[id]);
	$("#company_url").attr('disabled', true);
}
 
function setCompanyData(data) { 				
	$("#company_name").val(remove_al_gt2(data.company_name));
	$("#registry_prefix").val(data.registry_prefix);
	$("#shortname").val(data.shortname);
	$("#authcode").val(data.authcode);
	$("#company_url").val(data.company_url);
	$("#dir_location").val(data.dir_location);
	$("#file_location").val(data.file_location);
	
}

function showCompanyDetails() {
	showCoForm('Update Company');
	setCompanyData(company_map[dataset.company_id]);
}
function companyViewForm(data) {
	var str = '<table id="companytable" class="table table-bordered table-striped"  >';
		str += '<tr><td>Company Name:</td><td>'+data.company_name+'</td></tr>';
		str += '<tr><td>Registry Prefix:</td><td>'+data.registry_prefix+'</td></tr>';
		str += '<tr><td>Short Name:</td><td>'+data.shortname+'</td></tr>';
		str += '<tr><td>Authentication Key:</td><td>'+data.authcode+'</td></tr>';
		str += '<tr><td>Company URL:</td><td>'+data.company_url+'</td></tr>';
		str += '</table>';	
		$("#viewulinkdialog").html(str);				
		$("#viewulinkdialog").dialog( "open" );
}

function processSyncBP(data) {
	$('#loading-indicator').hide();
	var newbps = data.new_bp;
	if(newbps.length == 0){
		alert("No New BP's found");
		return;
	}	
	var len = company_map[dataset.company_id].bpdata.length;
	var dv = '<div class="font12" style="overflow-y:scroll;height:100%;">';
	for(var i = 0; i < newbps.length;i++){
		dv +='<div style="height:20px;width:300px;float:left;">'+newbps[i].bp_name+'</div>';
		company_map[dataset.company_id].bpdata[len] = newbps[i];
		len++;
	}	
	dv +='</div>';
	
	$("#dialog1").dialog( {height : 250, width:350,title:'New BP'} );
	$("#dialog1").html( dv );
	$("#dialog1").dialog( "open" );
}

function chnagesInBP() {
	$('#loading-indicator').show();
	getData("all_bp_sync",processSyncBP);
}

function setProjectList(data){
	//	alert("proj "+data)
	if(data.errors || data.length ===0){
		$('#loading-indicator').hide();
		return;
	}	
	company_map[dataset.company_id].projectset = true;
	company_map[dataset.company_id].projectdata = data;
	//projectdata = data;	
	displayProjects();
}
function getProjectList() {
	//alert('proj list '+company_map[dataset.company_id].projectset);
	if(dataset.company_id < 0)
		return;
	$('#loading-indicator').show();
	if(company_map[dataset.company_id].projectset){
		//setProjectList(company_map[dataset.company_id].projectdata);
		displayProjects();
		return;
	}
	getData("project_list",setProjectList);
}
function setSysProjectDataType(data){
	if(data.lastmodified){
		$('#projectslastupdated').html(data.lastmodified);
	}
}
function displayProjects() {

	$('#loading-indicator').hide();
	$("#rightbuttonid").html('');

	var str ='<div style="float:left;padding-left:10px;" ><a class="buttonmenu" href="#" id="autogen" title="Auto generate the XML data, will save time."  onClick="javascript:updateProjectShellList(0);">Update Project/Shell List</a> &nbsp;&nbsp;&nbsp;Last Updated &nbsp;&nbsp;&nbsp;: '+dataset.last_updated_projects+'</div>';
	str +='<div style="float:left;padding-left:10px;color:blue;font-size:12px;" >&nbsp;</div><div style="float:left;padding-left:10px;color:blue;font-size:12px;" id="projectslastupdated"></div>';
//	$('#rightbuttonid').html(str);
	//---
	
	str += '<div id="outerprojectlist" style="margin-left:2px;marigin-top:20px;height:100%;">';
	str +='<div id="projectlistheader" style="float:left;margin-left:2px;marigin-top:5px;width:99%;height:92%;overflow-y:auto;" ><table style="width:100%;margin-top:10px;border:1px solid #ECECEC;font-size:12px;font-family:Arial;" class="table table-bordered table-striped" >';
	str += '<tr style="height:22px;">';
//	str += '<td style="width:4%;text-align:center;" >&nbsp;#</td>';
//	str += '<td style="width:12%;text-align:center;" >';
//	str += '<a class="buttonmenu" name="projectsel" id="projectsel" href="#"  onClick="javascript:saveFavoriteProjects();" >Save&nbsp;<img src="images/fav_hover.png" style="height:20px;width:20px;"/></a>';
//	str += '</td>';
	str +='<td style="width:20%;" ><b>Type</b></td>';
	str +='<td style="width:25%;" ><b>Project/Shell Number</b></td>';
	str += '<td  style="width:55%;" ><b>Project/Shell Name</b></td></tr>';//</table></div>';
	//str +='<div id="bodyprojectlist" style="float:left;margin-left:2px;marigin-top:4px;width:99%;height:85%;overflow-y:auto;" >';
	//str +='<table style="width:99%;margin-top:5px;border:1px solid #ECECEC;font-size:12px;font-family:Arial;" class="table table-bordered table-striped" >';

	var pdata = company_map[dataset.company_id].projectdata;
	i = 0;
	//alert('**** '+pdata.length);
	for( i=0;i<pdata.length;i++){
		var obj = pdata[i];	
		var checked = '';
		var sel = '';
		if(!obj ) 
			continue;
		var type = 'Project';
		if(obj.projecttype == 98)
			type = 'WBS Shell';
		else 
		if(obj.projecttype == 99)
			type = 'Generic Shell';		
		if(company_map[dataset.company_id].selected_project.projectnumber == obj.projectnumber)
			sel ='checked';
		var fimg = 'images/fav_normal.png';	
		if(obj.uid != 999){
			checked ='checked="checked" ';
			fimg = 'images/fav_hover.png';	
		}	
		str += '<tr class="datacellone" id="1">';
/*		str += '<td style="width:4%;text-align:center;" ><input '+sel+' type="radio" name="projectlistradio" value="'+i+'"/></td><td style="width:12%;text-align:center;">';
		str += '<div style="visibility:hidden;width:20px;float:left;"><input  type="checkbox" '+checked+'  id="h_chk_'+obj.projectnumber+'" name="h_chk_'+obj.projectnumber+'"  value="'+obj.projectnumber+'"/></div><div style="width:50px;float:left;"><a style="margin:0px;" href="javascript:checkProjBPFavorite(\''+obj.projectnumber+'\')" id="a_'+obj.projectnumber+'"><img src="'+fimg+'"  title="Mark as Favorite" /></a></div></td>';
*/		
		str += '<td style="width:20%">'+type+'</td>';
		str += '<td style="width:25%"><a id="'+obj.projectnumber+'" href="javascript:selectedProject( '+i+',\''+obj.projectnumber+'\')" title="Click to select">'+obj.projectnumber+'</a></td><td style="width:55%;">'+obj.projectname+'</td></tr>';
	}
	str += '</table></div></div>';
	//alert(str);
	$("#dialog1").dialog( {height : 600, width:650,title:'Project/Shell list'} );
	$("#dialog1").html( str );
	$("#dialog1").dialog( "open" );
	/*
	$("#centerdiv").html(str);	
	$('#centerdiv input:radio').change(function () {
		selectedProject();
		//alert(' v '+$('#centerdiv input:radio').val());
	});
	*/
	getData("sys_data_type",setSysProjectDataType,'shell_info');
}
function updateProjectShellList(){
	getData("sync_project",setProjectList);
}

function checkProjBPFavorite(num){
	if($('#h_chk_'+num).is(':checked')){
		$('#h_chk_'+num).prop('checked',false);
		$('#a_'+num).html('<img src="images/fav_normal.png"  title="Mark as Favorite" />');
	}else{
		$('#h_chk_'+num).prop('checked',true);
		$('#a_'+num).html('<img src="images/fav_hover.png"  title="Marked as Favorite" />');
	}	
}	

function selectedProject(index,val) {
	//var val = $('input[name=projectlistradio]:checked').val();
	company_map[dataset.company_id].selected_project = company_map[dataset.company_id].projectdata[index];
	//alert(val+" :: "+company_map[dataset.company_id].projectdata[index]);
	//$("#subdetailheader").html(company_map[dataset.company_id].selected_project.projectnumber);
	var str = 'Project  &nbsp;&nbsp;:<span>&nbsp;'+val+'</span><span>&nbsp;';
	//WBS codes fix needs to be in 9.13.0.9
	//	str +='&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="javascript:getWBSCodes(\''+val+'\')">Check WBS Codes</a></span>';
	$("#subdetailheader").html(str);
	$("#dialog1").dialog( "close" );
	
}
function getWBSCodes(projnum){
	
	var data_params = {projectnumber:projnum};
	console.log('wbs codes --:'+data_params.projectnumber);
	var promise = getPromise('wbs_codes',data_params);
	promise.done( function(data){
	console.log('wbs codes  resp:'+data);
		displayWBSCodes(data);
	});	
}

function displayWBSCodes(data){
	var str = '<div class="font12" style="overflow-y:scroll;height:98%;width:99%;">';
	str +='<table style="width:100%;">';
	str +='<tr style="height:20px;background-color:#B3BDC7;width:100%;"><td style="width:50%">WBS Code</td><td style="width:50%;">WBS Item</td></tr>';
	for(var i = 0; i < data.length; i++){
		str +='<tr><td style="width:50%">'+data[i].wbscode+'</td><td style="width:50%;">'+data[i].wbsitem+'</td></tr>';
	}
	str+='</div>';
	$("#dialog1").dialog( {height : 500, width:450,title:'WBS Codes'} );
	$("#dialog1").html( str );
	$("#dialog1").dialog( "open" );
}

function setBPList(data, display) {
	//	alert("bp "+data)
	if(data.errors || data.length===0)
		return;
	company_map[dataset.company_id].bpset = true;
	company_map[dataset.company_id].bpdata = data;
	console.log('setBPList is set ******');
	//projectdata = data;	
	if(display === 'yes')
		displayBPs();
}
function getBPList(display) {
	//alert('bp list '+company_map[dataset.company_id].bpset);
	if(dataset.company_id < 0)
		return;
	if(display === 'yes')	
		$('#loading-indicator').show();
	dataset.xml_file_saved = false;
	if(company_map[dataset.company_id].bpset){
		//setBPList(company_map[dataset.company_id].bpdata);
		if(display === 'yes')
			displayBPs();
		return;
	}
	var data_params ={company_id:1};
	var promise = getPromise('bp_list',data_params);
	promise.done( function(data){
		setBPList(data,display);
			
	});
	//getData("bp_list",setBPList);
}

function selectedBP(val) {
	//$('#savedfileinfo').html('');
	console.log('selec bp data '+company_map[dataset.company_id].bpdata[val]);
	company_map[dataset.company_id].selected_bp = company_map[dataset.company_id].bpdata[val];
	var prefix = company_map[dataset.company_id].selected_bp.studio_prefix;
//	alert(val+"  ::  "+company_map[dataset.company_id].selected_bp.studio_name);
	var bpobj = company_map[dataset.company_id].selected_bp;
	var bpinfo = '<span id="selected_bp_name" class="font13b"><b>Name :</b>&nbsp;'+bpobj.studio_name + '</span> <span id="sel_bp_id" class="font11" >&nbsp;( Ver: '+bpobj.studio_version+', Pub.: '+bpobj.published_date.substring(0,10)+')</span> &nbsp;<span style="margin-top:2px;" onclick="getLatestBP(\''+prefix+'\')" title="You can check if there are changes to the BP" class="vnlabel_bl_14">Check Latest</span>';
	$("#selectedname").html(bpinfo);
	console.log('selected bp '+prefix);
//	$("#selected_bp_more").html('Last  Updated : '+bpobj.lastmodified.substring(0,10)+'&nbsp; <span onclick="getLatestBP(\''+prefix+'\')" title="You can check if there are changes to the BP" class="vnlabel_bl_14">Check for Latest</span>' );
	//alert(val+"  ::  "+company_map[dataset.company_id].selected_bp.studio_name+"  "+company_map[dataset.company_id].bp_info_map[prefix]+" ::"+prefix);
	if(!company_map[dataset.company_id].bp_info_map[prefix])// values are cached we can use
		getBPData("bp_info",prefix, setBPInfoData);
	else
		buildBPtemplate();
	//alert('******* '+company_map[dataset.company_id].selected_bp.company_bp+'    '+company_map[dataset.company_id].selected_project.projectnumber);	
/*	if(company_map[dataset.company_id].selected_bp.company_bp == 0){// project level BP
		if(!company_map[dataset.company_id].selected_project.projectnumber)
			alert('This BP requires a project number, select a Project/Shell by clicking on "Project/Shell List"');
	}
	*/
}
function getLatestBP(prefix) {
	// make a call to the 
	//console.log('ggggggggggg');
	$('#loading-indicator').show();
	getBPData("sync_bp",prefix, setBPInfoDataLatest);
}
function setBPInfoDataLatest(prefix,data){
console.log('setBPInfoDataLatest ---'+prefix+' data :'+data);
	$('#loading-indicator').hide();
	if(data.errors)
		return;
	console.log('setBPInfoData --aa- '+data.bp_info.studio_version+' dt :'+data.bp_info.published_date);	
	var bpobj = company_map[dataset.company_id].selected_bp;
	if(bpobj.studio_version == data.bp_info.studio_version){
		alert('No Changes in BP');
		return;
	}
	alert('New BP version found :'+data.bp_info.studio_version);
	var nstr = '&nbsp;( Ver: '+data.bp_info.studio_version+', Pub.: '+data.bp_info.published_date.substring(0,10)+')';
	$('#sel_bp_id').html(nstr);
	setBPInfoData(prefix,data);
}
function setBPInfoData(prefix,data) {
	console.log('setBPInfoData ---'+prefix+' data :'+data);
	if(data.error){
		alert("Cannot find BP desgin");
		return;
	}
	company_map[dataset.company_id].bp_info_map[prefix] = data;
	//setupthe tabs
	if(!company_map[dataset.company_id].bp_info_map[prefix].bp_info.demap  ){
		var delist = company_map[dataset.company_id].bp_info_map[prefix].bp_info.de;
		var demap ={};
		for(var i = 0; i < delist.length; i++)
			demap[delist[i].Name] = i;
		company_map[dataset.company_id].bp_info_map[prefix].bp_info.demap = demap;	
	}
	buildBPtemplate();
}
function buildBPtemplate(){
	$('#centerdiv').html(buildTabs(2));
	 $(function() {
		$( "#bptabs" ).tabs();
	  });
	 
	 
	buildMetatData();
	$('#unifierstatus').html('');
	// set up the grid data
}

function buildTabs(count){
 var str ='<div id="bptabs" style="height:98%;"><ul><li><a href="#tabs-1">Upper Form</a></li>';
	if(count > 1)
		str += '<li><a href="#tabs-2" >Line Item</a></li>';
	str +='</ul>';
	str +='<div id="tabs-1" style="height:90%;overflow:auto;">&nbsp; Upper</div>';
	if(count > 1)
		str +='<div id="tabs-2" style="height:90%;overflow:auto;"> &nbsp;No Line Items </div>';
	str +='</div>';
	return str;
}
function displayBPs() {
	$('#loading-indicator').hide();

	var str = '<div style="width:600px;margin-left:60px;height:30px;"><div style="float:left;z-index:30"><a class="buttonmenu" title="Check if there are any new BP\'s imported or existing BP\'s have been modified"   href="#" name="syncbp"  id="syncbp" onClick="javascript:chnagesInBP();">';
	str +='Check for New BP\'s</a> &nbsp;&nbsp;&nbsp;Last Updated &nbsp;&nbsp;&nbsp;: '+dataset.last_updated_bps+' </div></div>';
	
	str += '<div id="outerbplist" style="margin-left:20px;marigin-top:20px;height:96%;">'
	str +='<div id="mainbplist" style="float:left;margin-left:20px;marigin-top:20px;width:95%;height:98%;" >';
	str +='<div id="headerbplist" style="float:left;margin-left:20px;marigin-top:2px;width:100%;height:96%;overflow-y:scroll;"><table style="width:95%;margin-top:2px;border:1px solid #ECECEC;font-size:12px;font-family:Arial;" class="table table-bordered table-striped" >';
	str += '<tr style="height:30px;"><td style="width:4%" >&nbsp;#</td><td style="width:13%" >';
	str += '<a class="buttonmenu" href="#"  id="selectfavbpid"  onClick="javascript:saveFavoriteBPs();"  title="Select a set of BP\s by checking them & then click Favorites to mark & save them">Save&nbsp;<img src="images/fav_hover.png" style="height:20px;width:20px;"/></a>';
	str += '</td>';
	str += '<td  style="width:40%;" >BP Name</td><td  style="width:11%;" >Company BP</td><td style="width:9%;">Version</td>';
	str += '<td  style="width:24%;" >Published Date</td></tr>';
	//str +='</table></div><div id="bodybplist" style="float:left;margin-left:20px;marigin-top:2px;width:100%;height:88%;overflow-y:scroll;">';
	//str +='<table style="width:95%;margin-top:1px;border:1px solid #ECECEC;font-size:12px;font-family:Arial;" class="table table-bordered table-striped" >';
	var pdata = company_map[dataset.company_id].bpdata;
	i = 0;
	
	for( i=0;i<pdata.length;i++){
		var obj = pdata[i];	
		var sel ='';
		if(obj != null ) {
			var checked = '';
			var fimg = 'images/fav_normal.png';	
			if(obj.fav != 'zz'){
				checked ='checked="checked" ';
				fimg = 'images/fav_hover.png';	
			}	
			if(company_map[dataset.company_id].selected_bp.studio_prefix == obj.studio_prefix)
				sel = 'checked="checked"';
			str += '<tr class="datacellone" id="1"><td style="width:4%;" title="Select this BP" ><input name="bplistradio" style="padding-left:20px;text-align:center;" '+sel+' type="radio" value="'+i+'"/></td>';
			str += '<td title="Check this to mark this as a favorite BP" style="width:13%;text-align:center;" ><div style="visibility:hidden;width:20px;float:left;"><input  type="checkbox" '+checked+'  id="h_chk_'+obj.studio_prefix+'" name="h_chk_'+obj.studio_prefix+'"  value="'+obj.studio_prefix+'"/></div><div style="width:50px;float:left;"><a style="margin:0px;" href="javascript:checkProjBPFavorite(\''+obj.studio_prefix+'\')" id="a_'+obj.studio_prefix+'"><img src="'+fimg+'"  title="Mark as Favorite" /></a></div></td>';
			var cbp = (obj.company_bp == 0?'&nbsp;':'Yes');
			str += '<td style="width:40%;" >'+obj.studio_name+'</td><td style="width:11%;" >'+cbp+'</td>';
			str += '<td style="width:9%;" >'+obj.studio_version+'</td><td style="width:24%;" >'+obj.published_date+'</td></tr>';
		}
	}
	str += '</table></div></div></div>';
//	$("#rightbuttonid").html(topstr);
	$("#centerdiv").html(str);	
	$('#centerdiv input:radio').click(function () {
		var val = $('input[name=bplistradio]:checked').val();

		console.log('selected  clicked bp '+val);
		selectedBP(val);
	});
	/*
	$('#centerdiv input:radio').change(function () {
		var val = $('input[name=bplistradio]:checked').val();
		console.log('selected bp '+val);
		selectedBP(val);
		//alert(' v '+$('#centerdiv input:radio').val());
	});
	*/
	//$('input[name=radioName]:checked', '#myForm').val()
}

//-------------
function setDDList(data){
	//	alert("dd "+data)
	company_map[dataset.company_id].ddset = true;
	company_map[dataset.company_id].dddata = data;
	//projectdata = data;	
	displayDDs();
}

function getDDList(){
	//alert('dd list '+company_map[dataset.company_id].ddset);
	if(dataset.company_id <= 0)
		return;
	if(company_map[dataset.company_id].ddset){
		displayDDs();
		return;
	}
	getData("dd_list",setDDList);
}

function displayDDs(){
	$("#rightbuttonid").html('');
	var str = '<div id="outerddlist" style="margin-left:20px;marigin-top:20px;height:100%;">'
	str +='<div id="mainbplist" style="float:left;margin-left:20px;marigin-top:20px;width:90%;height:100%;overflow:auto;" ><table style="width:90%;margin-top:10px;border:1px solid #ECECEC;font-size:12px;font-family:Arial;"class="table table-bordered table-striped" >';
	str += '<tr style="height:30px;"><td style="width:20%" >Data Name</td><td style="width:20%;" >Data type</td>';
	str += '<td  style="width:20%;" >Input Type</td>';
	str += '<td  style="width:20%;" >Data Size</td></tr>';
	var pdata = company_map[dataset.company_id].dddata;
	i = 0;
	for(i=0;i<pdata.length;i++){
		var obj = pdata[i];	
		if(obj != null ) {
			str += '<tr class="datacellone" id="1"><td  >'+obj.data_name+'</td>';
			str += '<td >'+obj.data_type+'</td><td >'+obj.input_type+'</td>';
			str += '<td >'+obj.data_size+'</td></tr>';
		}
	}
	str += '</table></div></div>';
	$("#centerdiv").html(str);	
}

function setDEList(data){
	//	alert("de "+data.length)
	company_map[dataset.company_id].deset = true;
	company_map[dataset.company_id].dedata = data;
	displayDEs();
}
function getDEList(){
	//alert('d list '+company_map[dataset.company_id].deset);
	if(dataset.company_id <= 0)
		return;
	dataset.xml_file_saved = false;
	if(company_map[dataset.company_id].deset){
		displayDEs();
		return;
	}
	getData("de_list",setDEList);
}

function displayDEs(){
	$("#rightbuttonid").html('');
	var str = '<div id="outerdelist" style="margin-left:20px;marigin-top:20px;height:100%;">'
	str +='<div id="mainbplist" style="float:left;margin-left:20px;marigin-top:20px;width:90%;height:100%;overflow:auto;" ><table style="width:90%;margin-top:10px;border:1px solid #ECECEC;font-size:12px;font-family:Arial;" class="table table-bordered table-striped" >';
	str += '<tr style="height:30px;"><td style="width:20%"  >DE Name</td><td style="width:20%;">DE Label</td>';
	str += '<td  style="width:20%;" >DE Data Def</td>';
	str += '</tr>';
	var pdata = company_map[dataset.company_id].dedata;
	i = 0;
	for( i=0;i<pdata.length;i++){
		var obj = pdata[i];	
		if(obj != null ) {
			str += '<tr class="datacellone" id="1"><td  >'+obj.de_name+'</td>';
			str += '<td >'+obj.de_label+'</td>';
			str += '<td >'+obj.de_data_def+'</td></tr>';
		}
	}
	str += '</table></div></div>';
	$("#centerdiv").html(str);	
}

function syncRecdProjects(data){
// show a report of the new projects
	

}

function syncProjects(){
	//alert("syncproj");
	getData("sync_project",syncRecdProjects);
}



function getBPData(actiontype, bprefix, callback){
//	alert("getBPData");
	$.ajax({
		type: 'GET',
		url: "connect",
		dataType: 'json',
		data: {actiontype : actiontype,sessionid:dataset.sessionid,company_id:dataset.company_id,user_id:dataset.user_id,bp_prefix:bprefix},
		success: function(data){ 
//			alert('getBPData call '+data);
				callback(bprefix,data);
		}		
    });		
}

function validateXMLData(from){
	var method =	$('#methodid').val();
	var params = unifierwebservice.methods[webservices_map[method]].parameters;
	var xmlobj ;
	var xml;
	for(i= 0; i < params.length; i++){
		var par = params[i].param_name;
		var pn = par.toLowerCase();
		if(pn.indexOf("xml") >= 0 || pn.indexOf("options") >= 0){
				xml= $('textarea#p_'+par).val();
				break;
		}//check for bpname
		 
	}
	var xmlobj = parser.parse(xml);
	//alert(xmlobj)
	if(!xmlobj || xmlobj.getRootElement().getName() != 'List_Wrapper'){
		alert('Error found in parsing XML data');
		return false;
	}
	
	var bpelements = xmlobj.getRootElement().getChildElements();
	var elements = bpelements[0].getChildElements();
	var errors = '';
	for ( i=0; i<elements.length; i++) {
		var el = elements[i];
		//alert("Element name is '" + el.getName()+"  "+el.getText());
		
		errors += checkXMLDataValue(method, el.getName(), jQuery.trim(el.getText()))
	}
	if(errors.length > 0){
		var dv = '<div class="font12" style="overflow-y:scroll;height:150px;">'+errors+'</div>';
		$("#dialog1").dialog( {height : 200, width:250,title:'Errors'} );
		$("#dialog1").html( dv );
		$("#dialog1").dialog( "open" );
	}else{
		if(from === 0) 
			alert('No Errors found.');
		return true;
	}
	return false;
}
function checkXMLDataValue(method, de, devalue){
	var bpobj = company_map[dataset.company_id].selected_bp;
	var infodata = company_map[dataset.company_id].bp_info_map[bpobj.studio_prefix];
	var  bpdes = infodata.bp_info.bp_de.split(',');
	var destr = ','+infodata.bp_info.bp_de.toLowerCase()+','+infodata.bp_info.bp_li_de.toLowerCase()+',';
	var delist = infodata.bp_info.de;
	//alert(infodata.bp_info.de);
	var k = 0;
	var errorstr = '';
	for(k = 0; k < delist.length; k++){
		var dename = ','+delist[k].Name.toLowerCase()+',';
		if(destr.indexOf(dename) < 0  || delist[k].Name.toLowerCase() != de.toLowerCase())
			continue;// not found
		//	alert(de+'  '+delist[k].Mandatory+'  '+devalue.length +'  '+(delist[k].Mandatory != 'false'));
		if(delist[k].Mandatory != 'false' && devalue.length == 0)
			errorstr += '<b>'+de+'</b>  is required<br/>';
		var opt ='&nbsp;';
		var options = [];
		if(delist[k].options){
			options = delist[k].options;
			var j = 0;	
			var found = false;
			for(j = 0; j < options.length; j ++){
				if(options[j].Name == devalue){
					found = true;
					break;
				}	
			}
			if(!found)
				errorstr += '<b>'+de+'</b> value :'+devalue+' is not correct<br/>';
		}
		if(delist[k].InputType.toLowerCase() == 'text' && delist[k].DataDefinition ){
			var size = company_map[dataset.company_id].dddata_map[delist[k].DataDefinition].data_size;
			if(size > 0 && devalue.length > size)
				errorstr += '<b>'+de+'</b> value exceeds max length of :'+size+' <br/>';
			else{
				var data_type = delist[k].Type.toLowerCase();
				if(data_type == 'integer' &&  isNaN(devalue)  ){
					if(Math.floor(Number(devalue)) != Number(devalue))
						errorstr += '<b>'+de+'</b> value  is not an integer <br/>';
				}else if(data_type == 'float' && isNaN(devalue) )
					errorstr += '<b>'+de+'</b> value  is not numeric <br/>';
			}
		}
		
	}// for k
	return errorstr;
	//alert('displayBPInfo '+prefix);
}
function saveXMLData(){
	if(!company_map[dataset.company_id].selected_bp || !company_map[dataset.company_id].selected_bp.studio_prefix){
		alert('Business Process not selected');
		return;
	}	
	if(dataset.xml_file_saved){
		alert('Files have been saved');
		return;
	}	
	var dv = '<div class="font12" >';
	var name ='File ';
	if(company_map[dataset.company_id].servicetype && company_map[dataset.company_id].servicecount > 1){
		dv +='<div style="float:left;height:25px;"><span style="margin-left:20px;float:left;width:90%;color:blue">You have multiple Service requests ('+company_map[dataset.company_id].servicecount+')</span><div>';
		name = 'Group ';
	}		
	dv +='<div style="float:left;height:40px;"><span style="margin-left:20px;float:left;width:90%;margin-top:10px;">'+name+' Name <input type="text"  id="savenamespan" /></span>';
	dv +='<span style="margin-left:20px;float:left;width:90%;height:30px;">&nbsp;</span>';
	dv +='<span style="margin-left:20px;float:left;width:90%;text-align:center;"><a class="buttonmenu"  href="#" id="save_data_name" onClick="javascript:saveDataName();">Save</a>';
	dv +='</span></div></div>';
	$("#dialog1").dialog( {height : 160, width:275,title:'Enter Save Name'} );
	$("#dialog1").html( dv );
	$("#dialog1").dialog( "open" );
}
function saveDataName(){
	var save_name =jQuery.trim($('#savenamespan').val());
	if(save_name.length == 0){
		alert('Name is required');
		return;
	}
	if(!alphaNumericU(save_name)){
		alert('Save Name should have only alphanumeric or _');
		return;
	}
	dataset.xml_file_saved = true;
	$('#loading-indicator').show();
	//alert('dddd '+company_map[dataset.company_id].servicetype +' :: '+ company_map[dataset.company_id].servicecount);
	if(company_map[dataset.company_id].servicetype && company_map[dataset.company_id].servicecount > 1){
		var px = 0;
		var count = 1;
		for(px = 0; px < company_map[dataset.company_id].servicecount; px++){
			var input_data = generateServiceData("save_data", save_name+'_'+count);
			input_data.p_bpxml = company_map[dataset.company_id].bpxmlarry[px]	;
			input_data.group_name = save_name;
			if(px < 10)
				if(input_data.hasfile === 'yes')
					filePostService(input_data);
				else	
					postData(input_data, closeDialog);//for the first dont delay else send with delay
			else{
				setTimeout(function(){
				if(input_data.hasfile === 'yes')
					filePostService(input_data);
				else	
					postData(input_data, closeDialog);	},100);
				}
			count++;		
		}
	}else {
		var input_data = generateServiceData("save_data", save_name);
		input_data.group_name = "";
		input_data.p_bpxml = company_map[dataset.company_id].bpxmlarry[0]	;
		if(input_data.hasfile === 'yes')
			filePostService(input_data);
		else	
			postData(input_data, closeDialog);
	}
}
function postWithWait(input_data){
	postData(input_data, closeDialog);
}
function closeDialog(){
	$('#loading-indicator').hide();
	$("#dialog1").dialog( "close" );
}


function buildTopMethodHeader(method, auto, hasfile){
	var str ='<div id="rightmenudiv"  style="width:100%;height:24px;padding-top:0px;font-size:13px;font-family:Arial;"><div id="rightmenuinnerdiv" style="visibility:visible;" ><div style="float:left;padding-left:10px;" ><b>'+method+'</b></div>';
	str +='<div style="float:left;padding-left:10px;" >';
	str +='<a href="#"><img  id="runwebservice" title="Run the '+method+' Web Service Method" src="images/run.png" style="height:20px;width:20px;" onClick="javascript:runWebService('+hasfile+','+auto+');"/></a></div>';
	str +='<div style="float:left;padding-left:10px;" >';
	str +='<a href="#"> <img id="savexmldata"  onClick="javascript:saveXMLData();" src="images/save.png" style="height:20px;width:20px;" title="Save the current service and data"/> </a></div>';
	str +='<div style="float:left;padding-left:10px;" >';
	str +='<a href="#"> <img id="downloadxmldata"  onClick="javascript:downloadServiceData();" src="images/download.png" style="height:20px;width:20px;" title="Download the XML Data(connect format)"/> </a></div>';
	if(auto){
		str +='<div style="float:left;padding-left:10px;" >';
/*		str +='<a class="buttonmenu" href="#" id="autogen" title="Auto generate the XML data, will save time."  onClick="javascript:autoGenerateCount(0);">Generate XML</a></div>';
		str +='<div style="float:left;padding-left:10px;" >';
		str +='<a class="buttonmenu" href="#" id="generatecsv" title="Auto generate CSV format data to save or used in Unifier CSV Import"  onClick="javascript:autoGenerateCount(1);">Generate CSV</a></div>';
		str +='<div style="float:left;padding-left:10px;" >';
		str +='<a class="buttonmenu" href="#" id="checkdata" title="Validate the XML data in the XML box." onClick="javascript:validateXMLData(0);">Validate</a></div>';
		str +='<div style="float:left;padding-left:10px;" >';
		str +='<a class="buttonmenu" href="#" id="generatemultidata" title="Generate Multiple Service XML File data." onClick="javascript:autoGenerateCount(2);">Generate Multiple</a></div>';		
		str +='<a class="buttonmenu" href="#" id="checkdata" title="Validate the XML data in the XML box." onClick="javascript:validateXMLData(0);">Validate</a></div>';
		str +='<div style="float:left;padding-left:10px;" >';
		str +='</div>';
		*/
		str +='<div style="float:left;padding-left:10px;" id="divmenuholder1">';
		str +='<a class="buttonmenu" href="#" id="amenuholder1" onclick="threadPlatform(1)" >Thread Platform</a></div>';
		str +='<div style="float:left;padding-left:10px;" id="divmenuholder2">';
		str +='<a class="buttonmenu" href="#" id="amenuholder2"  ></a></div>';
	}
	
	str +='</div>';
	return str;
}

function uploadFileData(){
	//alert('*********');
	var uptype =	$('#fileactiontype').val();

	var filename = $('#f_fileclick').val();
	var ext = getFileExtension(filename);
	if(uptype === 'fileupload'){
		if(ext == '' || (ext.toLowerCase() !='xml' && ext.toLowerCase() !='xls' && ext.toLowerCase() !='csv' && ext.toLowerCase() != 'xlsx' ) ){
			alert(filename+' only files with  xml,csv,xls,xlsx are accepted')
			return false;
		}
	}
	var beginIndex = filename.indexOf("unifier_");
	var endIndex = filename.indexOf("_bp");
	var prefix = filename.substring(beginIndex+8, endIndex);
	if(!validBPPrefix(prefix)){
		alert('Entered Excel file is not a valid file name, please export template & try again');
		return;
	}
	if(company_map[dataset.company_id].selected_bp)
		$('#f_bp_prefix').val(company_map[dataset.company_id].selected_bp.studio_prefix);
	
	$('#f_filename').val(filename);
	document.uploadform.method = "post";
	document.uploadform.action ="/bpsync/filelink"
	document.uploadform.submit();
	return false;
}

function uploadZipFile(){
	// $("uploadform").attr("method","post");
	var filename = $('#z_f_fileclick').val();
	var ext = getFileExtension(filename);
	var  param = $('#f_filename').val();
	
	if( ext.toLowerCase() != 'zip'  ){
		alert(filename+' should be a zip file. ')
		$('#f_filename').val('-1');
		return false;
	}
	//alert('*********'+param);
	$('#p_'+param).val(filename);
	$('#f_user_id').val(dataset.user_id);
	$('#f_company_id').val(dataset.company_id);
	$('#f_filename').val(filename);
	$('#actiontype').val('zipfileupload');
	return true;

}
function uploadFile(){
	if(dataset.company_id < 0)
		return;
	$('#fileactiontype').val('fileupload');
	document.getElementById("f_fileclick").click();
}
function uploadZipFileClick(param){
	$('#f_filename').val(param);
	document.getElementById("z_f_fileclick").click();
}

function getUploadResponse(jsonstr){
	//alert(getUploadResponse +'**** '+jsonstr);
	$('#actiontype').val('dummy');
	 $("uploadform").attr("method","get");
	 $('#loading-indicator').hide();
	var obj = jQuery.parseJSON( jsonstr );
	document.uploadform.method = "get";
	document.uploadform.action = "/tkconnect/connect";
	if(obj.errors){
		alert("Found Errors :"+obj.errors);
	}
	document.uploadform.submit();
	// add this to saved files
	//alert('**** '+obj.error+' ^^^^ '+obj.service);
	if(obj.error || obj.statuscode)
		displayResult(obj);
	else if(obj.service)
		displayServiceResult(obj);
	else if(obj.saved)
		closeDialog();	
	else if(obj.prefix){
		// process result
		processExcelData(obj);
	}	
	
}
function validBPPrefix(prefix){
	var pdata = company_map[dataset.company_id].bpdata;
	for( var i=0;i<pdata.length;i++){
		if(pdata[i].studio_prefix == prefix){
			return true;
		}
	}
	return false;

}
function processExcelData(data){
	if(!validBPPrefix(data.prefix)){
		alert('Invalid file :'+data.filename);
		return;
	}
	console.log('processExcelData ---');
	var found = false;
	var pdata = company_map[dataset.company_id].bpdata;
	for(var i=0;i<pdata.length;i++){
		if(pdata[i].studio_prefix == data.prefix){
			company_map[dataset.company_id].selected_bp = pdata[i];
			console.log('processExcelData --- bp set');
			found = true;
			break;
		}	
	}
	if(!found){
		alert('There seems a problem connecting to Unifier or getting cached data, try again later');
		return;
	}
	//if(!company_map[dataset.company_id].selected_bp || company_map[dataset.company_id].selected_bp.studio_prefix != data.prefix)
	var bpobj = company_map[dataset.company_id].selected_bp;
	var bpinfo = '<span id="selected_bp_name" class="font13b">'+bpobj.studio_name + '</span> <span id="sel_bp_id" class="font11" >&nbsp;( Ver : '+bpobj.studio_version+',  Pub. date : '+bpobj.published_date.substring(0,10)+')</span>';
	$("#selectedname").html(bpinfo);
	setBPInfoData(data.prefix,data);
	// next check if selected bp
	/*
	for(var i = 0; i < data.upper_data.length; i++){
		var j = 0;
		for(var s in data.upper_data[i]){
			var gridobj = bpGridMetaData[grid.upper_cols[j]];
			if(gridobj.input_type == grid.INPUTTYPE_SELECT){
				console.log('select '+data.upper_data[i][s]+' '+gridobj.options );
				var xString = '<SELECT id="inp_1_'+i+'_'+j+'" CLASS="input" style="width:99%;">';
				if(gridobj.options){
					var options = gridobj.options;
					for(var pk = 0; pk < options.length; pk++){
						var sel = '';
						if(data.upper_data[i][s] == options[pk].name)
							sel = 'selected="selected"';
						xString +='<option  value="'+options[pk].value+'" '+sel+'>'+options[pk].name+'</option>';
					}	
				}
				xString += '</SELECT> ';//id="C_'+count+'_'+ii+'_'+j+'"
				$('#C_1_'+i+'_'+j).html(xString);
			}else
				$('#inp_1_'+i+'_'+j).val(data.upper_data[i][s]);
			j++;
		}
	}*/
	setGridColumn(1,data.upper_data);
	setGridColumn(2,data.lineitem_data);
	dataset.imported_files[data.prefix]=data;
}

function downloadServiceData(){
	var method =	$('#methodid').val();
	var params = unifierwebservice.methods[webservices_map[method]].parameters;
	
	var str = '<input type="hidden" id="user_id" name ="user_id"  value="'+dataset.user_id+'"/>';
	str += '<input type="hidden" id="company_id"  name ="company_id" value="'+dataset.company_id+'"/> ';
	str += '<input type="hidden" id="actiontype"  name ="actiontype" value="download_data"/> ';
	str += '<input type="hidden" id="method_name"  name ="method_name" value="'+method+'"/> ';
	str += '<input type="hidden" id="company_url"  name ="company_url" value="'+company_map[dataset.company_id].company_url+'"/> ';
	str += '<input type="hidden" id="service_name"  name ="service_name" value="'+$('#servicetype').val()+'"/> ';
	for(i= 0; i < params.length; i++){
		 var par = params[i].param_name;
		 var pn = par.toLowerCase();
		 var val = '';
		 if(pn == 'shortname')
		 	val= company_map[dataset.company_id].shortname;
		 else if(pn == 'authcode')
		 	val= company_map[dataset.company_id].authcode;
		 else{
			if(pn.indexOf("xml") >= 0 || pn.indexOf("options") >= 0)
				val= $('textarea#p_'+par).val();
			else
				val= $('#p_'+par).val();
			val = jsfilter3(val);	
			//	alert('bef  aa :'+val);
		 }
		  str += '<input type="hidden" id="'+par+'"  name="'+par+'" value="'+val+'"/> ';
	}
	document.getElementById("postid").innerHTML = str;
	//$('#postid').html(str);
	$("postform").attr("method","post");
	document.postform.submit();
	document.postform.method = "get";
	setTimeout(resetPostForm,5000);
}

function resetPostForm(){
	return;
	$('#postid').html('<input type="hidden" id="actiontype" name="actiontype" value="dummy" />');
	$("postform").attr("method","get");
	document.postform.method = "get";
	document.postform.action = "/tkconnect/connect";
	document.postform.submit();

}

function runWebService(hasfile,auto){
	//	alert('posting form data  '+hasfile+'    *** '+$('#f_filename').val()   );	
	if(auto){
		if(!validateXMLData(1)){
			return;
		}	
	}
	// you need to see if multiple
	if(company_map[dataset.company_id].servicetype && company_map[dataset.company_id].servicecount > 1){
		
	}
	$('#loading-indicator').show();
	var input_data = generateServiceData("run_single_service", "");
	if(hasfile === -1){
		//var input_data = generateServiceData("run_single_webservice", "");
		dataset.current_service = input_data;
		postData(input_data, displayResult);
	}else{// this is file processing)
		if($('#f_filename').val()=== '-1'){
			$('#loading-indicator').hide();
			return;
		}	
		//alert('posting form data '+hasfile+'  submitting  *** '+$('#f_filename').val()   );	
		dataset.current_service = input_data;
		generateFileServiceData('runwebservice',false);	
		document.uploadform.method = "post";
		document.uploadform.action ="/tkconnect/connect"
		document.uploadform.submit();
		return true;
	}
}
function filePostService(input_data){
		generateFileServiceData('savefileservice',true,input_data);	
		document.uploadform.method = "post";
		document.uploadform.action ="/tkconnect/connect"
		document.uploadform.submit();
}
function generateFileServiceData(action, fromdata, input_data){
		var method =	$('#methodid').val();
		var params = unifierwebservice.methods[webservices_map[method]].parameters;
	//	var str = '<input type="hidden" name="user_id" id="user_id" value="'+dataset.user_id+'" />';
	//	str += '<input type="hidden" name="company_id" id="company_id" value="'+dataset.company_id+'"/>';
		var str = '<input type="hidden" name="method_name" id="method_name"  value="'+method+'"/>';
		str += '<input type="hidden" name="save_name" id="save_name"  value="'+(fromdata?input_data.save_name:'')+'"/>';
		str += '<input type="hidden" name="group_name" id="group_name"  value="'+(fromdata?input_data.group_name:'')+'"/>';
		str += '<input type="hidden" name="company_url" id="company_url"  value="'+company_map[dataset.company_id].company_url+'"/>';
		str += '<input type="hidden" name="service_name" id="service_name" value="'+$('#servicetype').val()+'" />';
		str += '<input type="hidden" name="shortname" id="shortname" value="'+company_map[dataset.company_id].shortname+'"/>';
		str += '<input type="hidden" name="authcode" id="authcode" value="'+company_map[dataset.company_id].authcode+'"/>';
		for(i= 0; i < params.length; i++){
			var par = params[i].param_name;
			if(par == 'shortname' || par == 'authcode')
				continue;
			str += '<input type="hidden" name="z_'+par+'" id="z_'+par+'"  value="xxxx-'+i+'"/>';
		}	
		$('#f_company_id').val(dataset.company_id);
		$('#f_user_id').val(dataset.user_id);
		$('#fileactiontype').val(action);
		$('#morefiledata').html(str);
		//alert(' ::: ' + $('#morefiledata').html());
		for(i= 0; i < params.length; i++){
			 var par = params[i].param_name;
			 var pn = par.toLowerCase();
			 var val ='';
			 if(pn == 'shortname' || pn == 'authcode')
				continue;
			 else{
				if(pn.indexOf("xml") >= 0 || pn.indexOf("options") >= 0)
					val= $('textarea#p_'+par).val();
				else if (params[i].type ==='FileData')
						continue;				
				else
					val = $('#p_'+par).val();
				if(fromdata)
					val = input_data[pn];	
			 }
			 $('#z_'+par).val(val);
			 console.log(par+' ::::: '+$('#z_'+par).val());
		}
}

function generateServiceData(action, save_name){	
	var method =	$('#methodid').val();
	var params = unifierwebservice.methods[webservices_map[method]].parameters;
	var str = '{"user_id": "'+dataset.user_id+'",';
	str += '"company_id": "'+dataset.company_id+'",';
	str += '"sessionid": "'+dataset.sessionid+'",';
	str += '"actiontype": "'+action+'",';
	str += '"method_name": "'+method+'",';
	str += '"save_name": "'+save_name+'",';
	str += '"company_url":"'+company_map[dataset.company_id].company_url+'",';
	str += '"service_name": "'+$('#servicetype').val()+'"';
	for(i= 0; i < params.length; i++){
		 var pn = params[i].param_name.toLowerCase();
		 var par = params[i].param_name;
		 str +=',';
		 str += '"'+par+'":""';
	}	
	str +='}';
	//alert('bef  :: '+str);
	var input_data =  jQuery.parseJSON(str);
	//alert(str+'  '+input_data['method_name']);
	input_data.hasfile ='no';
	for(i= 0; i < params.length; i++){
		 var par = params[i].param_name;
		 var pn = par.toLowerCase();
		 if(pn == 'shortname')
		 	input_data[pn]= company_map[dataset.company_id].shortname;
		 else if(pn == 'authcode')
		 	input_data[pn]= company_map[dataset.company_id].authcode;
		 else{
			if(pn.indexOf("xml") >= 0 || pn.indexOf("options") >= 0)
				input_data[par]= $('textarea#p_'+par).val();
			else
				input_data[par]= $('#p_'+par).val();
				
			if (params[i].type ==='FileData' && $('#p_'+par).val().length > 0)	
				input_data.hasfile ='yes';
				
		 }
	}
	return input_data;
	
}

function postData(input_data, callback){	
//	alert('us '+company_map[dataset.company_id].authcode+' ::'+company_map[dataset.company_id].shortname);	
	$.ajax({
		type: 'POST',
		url: "connect",
		dataType: 'json',
		data:input_data ,
		success: function(data){ 
				$('#loading-indicator').hide();
				callback(data);
		}
	});		
	
}
function downloadServiceFile(service_audit_id){
	var str = '<input type="hidden" id="user_id" name="user_id" value="'+dataset.user_id+'" />';
	str += '<input type="hidden" id="company_id" name="company_id" value="'+dataset.company_id+'" />';
	str += '<input type="hidden" id="id" name="id" value="'+service_audit_id+'" />';
	str += '<input type="hidden" id="fileaction" name="fileaction" value="service_audit" />';
	str += '<input type="hidden" id="fileaction2" name="fileaction2" value="zipfile" />';
	str += '<input type="hidden" id="actiontype" name="actiontype" value="download_file" />';
	// do a download post with this id;
	$('#postid').html(str);
	$("postform").attr("method","post");
	//alert(' ddddddddddddd '+service_audit_id);
	document.postform.method = "post";
	document.postform.submit();
	//setTimeout(resetPostForm,5000);
}//li_csvdata , upper_csvdata

function displayResult(data){
	if(data.errors){
		alert('Found Errors :' +data.errors);
		dataset.current_service = {};
		return;
	}
	var method = $('#methodid').val();
	if(company_map[dataset.company_id].servicetype && company_map[dataset.company_id].servicecount > 1){
		if(!company_map[dataset.company_id].return_service)
			company_map[dataset.company_id].return_service = [];
		data.input_data = dataset.current_service;
		data.service_time = new Date();		
		company_map[dataset.company_id].return_service[company_map[dataset.company_id].return_service.length]= data;
	}
	var divstr = '<div id="responseid" class="font12" style="width:100%;height:100%;overflow-y:auto;"> ';
	divstr+='<table style="width:95%;height:"><tr><td style="width:30%;" class="font15b table table-bordered table-striped">Status Code</td><td style="65%;" >'+data.statuscode+'</td></tr>';
	var rowsNo =25;
	if(method.toLowerCase() ==='getcompletebprecord' && data.statuscode == 200){
		divstr+='<tr><td class="font15b">Recd FileName</td><td ><input disabled="disabled"  style="width:100%" value="'+data.filename+'">&nbsp;<a href="#" class="buttonmenu" onclick="downloadServiceFile('+data.service_audit_id+')">Download</a> </td></tr>';
	}
	if(data.statuscode != 200) {
		rowsNo =11;
		divstr+='<tr><td class="font15b">Error</td><td  ><textarea rows=4  disabled="disabled" style="width:100%">'+data.errorstatus+'</textarea></td></tr>';
	}
	else
		divstr+='<tr><td class="font15b">Contents</td><td ><textarea rows='+rowsNo+' disabled="disabled" style="width:100%">'+data.xmlcontents+'</textarea></td></tr>';
	divstr+='</table>';
	$("#dialog1").dialog( {height : 500, width:550,title:'Response'} );
	$("#dialog1").html( divstr );
	$("#dialog1").dialog( "open" );
}

function methodClick(method, data){
	var arglen = arguments.length;
	
	var index = webservices_map[method];
	console.log("u clicked "+method+"   "+index);
	var mnlow = method.toLowerCase();
	var setSideOptions = false;
	$('#methodid').val();
	if(dataset.company_id <= 0){
		alert('Select or Create a Company to work with by clicking "Company" button');
		return;
	}
	if(dataset.service_mode == 'excel'){
		
		setMethodHeader();
	}
	if(mnlow.indexOf("bp") >= 0 ){
		if(!company_map[dataset.company_id].selected_bp.studio_name){
			alert('Select a BP by clicking on "BP List"');
			//return;
		}
		if(mnlow.indexOf("get") < 0)
			setSideOptions = true;
		// check for project number
		/*
		if(company_map[dataset.company_id].selected_bp.company_bp == 0 && !company_map[dataset.company_id].selected_project.projectnumber){
			alert('This BP requires a project number, select a Project/Shell by clicking on "Project/Shell List"');
			return;
		}*/
		
	}	
	dataset.xml_file_saved = false;
	$('#methodid').val(method);
	var params = unifierwebservice.methods[index].parameters;
	var str = '';
	str += '<div id="outermethoddiv" style="width:100%;height:92%;overflow:auto;">';
	if(setSideOptions){
		str += '<div id="leftmethoddiv" style="float:left;width:58%;height:90%;">';
		str += '<div id="leftmethodmultidiv" style="float:left;width:100%;height:25px;margin-left:10px;background-color:#D6CEAA;"></div>';
	}else	
		str += '<div id="leftmethoddiv" style="float:left;width:80%;height:90%;">';
	str +='<table style="width:99%;padding-left:10px;padding-top:15px;">';
	var hasfile = -1;
	for(i= 0; i < params.length; i++){
		 var pn = params[i].param_name.toLowerCase();
		// alert('param :'+pn);
		if(pn == 'shortname' || pn == 'authcode')
			continue;
		var addzip ='';	
		if (params[i].type ==='FileData')	
			addzip = '&nbsp;&nbsp;<span style="font-size:12px;font-weight:none;">(only zip)</span>';
		str +='<tr><td style="width:18%;font-size:15px;font-family:Arial;"><b>'+pn+addzip+'</b></td><td style="width:78%;font-size:15px;font-family:Arial;">';
		var val = '';
		var disbaled='';
		if(pn == 'projectnumber'){
			/*if(!company_map[dataset.company_id].selected_project){
				alert('Select a Project by clicking on "Project/Shell List"');
				//return;
			}
			val = $('#selected_project').html();
			*/
		}else if(pn === 'bpname'){
			var obj = $('#selected_bp_name');
			if(obj )
				val = obj.html();
			//disbaled ='disabled="disabled"';
		}	
		if(arglen==2)
			val = data.parameters[i][pn];		
		if(pn.indexOf("xml") >= 0){
			if(setSideOptions && arglen == 1)
				val = getBPXML();
			str +='<textarea rows="22" cols="75" id="p_'+params[i].param_name+'" style="font-size:14px;font-family:Arial;">'+val+'</textarea>';
		}else if(pn.indexOf("options") >= 0)
			str +='<textarea rows="5" cols="75" id="p_'+params[i].param_name+'" style="font-size:14px;font-family:Arial;">'+val+'</textarea>';
		else if (params[i].type ==='FileData'){
			str +='<input type="text" style="width:210px;" disabled="disabled"  id="p_'+params[i].param_name+'" value="" />'; 
			str +='&nbsp;&nbsp;<input type="button" style="width:100px" id="p_file_'+params[i].param_name+'" onclick="uploadZipFileClick(\''+params[i].param_name+'\')" value="Upload" size="18"  />';
			hasfile = i;
		}else{
			var dis = '';
			if(pn === 'iszipfile'){
				dis = 'disabled="disabled"';
				val = 'yes';
			}
			str +='<input type="text" style="width:320px;" id="p_'+params[i].param_name+'" value="'+val+'" '+dis+' '+disbaled+' />';
		}	
		str +='</td></tr>';
	}
	str +='</table></div>';
	$("#bpsubheader").html(buildTopMethodHeader(method,setSideOptions,hasfile));
	//set excel menu
	$("#divmenuholder1").hide();
//	if(setSideOptions)
//		str += buildSideOptions(method);
	str +='</div>';
	$("#centerdiv").html(str);
	$("#leftmethodmultidiv").hide();
}

function getBPXML(){
		var bpobj = company_map[dataset.company_id].selected_bp;
		var infodata = company_map[dataset.company_id].bp_info_map[bpobj.studio_prefix];
		if(!infodata)
			return '';
		var  bpdes = infodata.bp_info.bp_de.split(',');
		var  bplide = jQuery.trim( infodata.bp_info.bp_li_de);
		var bplistr = '';
		var k = 0;
		if(bplide.length > 0 ){
			var bplides = bplide.split(',');
			bplistr +='<_bp_lineitems>\n';
			for(k =0; k < bplides.length; k++)
				bplistr +='     <'+bplides[k]+'> </'+bplides[k]+'>\n';
			bplistr +='</_bp_lineitems>\n';
		}
		var str ='<List_Wrapper>\n<_bp>\n';
		for(k =0; k < bpdes.length; k++)
			str +='<'+bpdes[k]+'> </'+bpdes[k]+'>\n';
		str += 	bplistr;
		str +='</_bp>\n</List_Wrapper>\n';
		return str;
	}

function buildSideOptions(method){
	var bpobj = company_map[dataset.company_id].selected_bp;
	var infodata = company_map[dataset.company_id].bp_info_map[bpobj.studio_prefix];
	if(!infodata)
		return 'BP Information could not be retreived.';
	var  bpdes = infodata.bp_info.bp_de.split(',');
	var str = '<div id="sideoptions" class="studiooptions b3">';
	str +='<table style="width:100%;padding-right:5px;" border="1" >';
	str +='<tr class="font15b"><td style="width:21%;" >DE Name</td><td style="width:11%;" >Label</td>';
	str +='<td style="width:17%;">Type</td><td style="width:50%;">More Details</td></tr>';
	var destr = ','+infodata.bp_info.bp_de.toLowerCase()+','+infodata.bp_info.bp_li_de.toLowerCase()+',';
	var delist = infodata.bp_info.de;
	var k = 0; 
	for(k = 0; k < delist.length; k++){
		var dename = ','+delist[k].Name.toLowerCase()+',';
		if(destr.indexOf(dename) < 0)
			continue;// not found
//		if( k < 5)
//			alert(dename +"      "+destr.indexOf(dename));
		var req = (delist[k].Mandatory == 'false'?'&nbsp;':'<b>Required</b>; &nbsp;');	
		var opt ='&nbsp; '+req;
		var inputtype = delist[k].InputType;
		var options = [];
		if(delist[k].options){
			options = delist[k].options;
			opt +='<table style="width:99%;" border="1" ><tr class="font15b"><td>Label</td><td>Value</td></tr>';
			var j = 0;	
			for(j = 0; j < options.length; j ++)
				opt +='<td>'+options[j].Name+'</td><td>'+options[j].Value+'</td></tr>';
			opt += '</table>';
		}
		if(delist[k].InputType && delist[k].InputType.toLowerCase() == 'text' && delist[k].DataDefinition ){
			var size = company_map[dataset.company_id].dddata_map[delist[k].DataDefinition].data_size;
			if(size == 0){
				opt += delist[k].DataDefinition;
				inputtype = delist[k].Type;
			}else
				opt +='Text Size : '+size;
		}else 	if(delist[k].InputType.toLowerCase() == 'picker' && delist[k].DataDefinition  && company_map[dataset.company_id].dddata_map[delist[k].DataDefinition]){
			//alert('picker '+delist[k].DataDefinition);
			var dtype = company_map[dataset.company_id].dddata_map[delist[k].DataDefinition].data_type;
			if(dtype.toLowerCase() === 'timestamp')
				opt += dtype;
		}

		str +='<tr  class="font12"><td >'+delist[k].Name+'</td><td >'+delist[k].Label+'</td>';
		str +='<td >'+inputtype+'</td><td >'+opt+'</td></tr>';
	}// for k
	str +='</table></div>';
	return str;
	//alert('displayBPInfo '+prefix);
}
function autoGenerateCount(from){
	// from == 2 is multiple services
	var divstr = '<div id="bprecordcount" style="height:90%;width:98%;">';
	divstr += '<table style="width:100%;" class="font12 table table-bordered table-striped">';//<tr><td colspan="2" ><b>Set the Number of Records</b></td></tr>';
	if(from === 2){
		divstr += '<tr><td style="width:85%">No. of Service Records<div style="color:blue;text-align:right;width:90px;float:right;">&nbsp;(Max 20)&nbsp;&nbsp;</div></td><td style="width:25%"><input type="text" size="2" maxlength="2"  id="servicecount" value="2"  onkeypress="return isNumberKey(event)" /></td></tr>';
	}
	divstr += '<tr><td style="width:85%">No. of Upper Form Record<div style="color:blue;text-align:right;width:90px;float:right;">(Max 15)&nbsp;&nbsp;</div></td><td style="width:25%"><input type="text" size="2" maxlength="2"  id="recordcount" value="1"  onkeypress="return isNumberKey(event)" /></td></tr>';
	divstr += '<tr><td >No. of Line Items<div style="color:blue;text-align:right;width:90px;float:right;">&nbsp;(Max 20)&nbsp;&nbsp;</div></td><td ><input type="text" size="2" maxlength="2" id="lirecordcount" value="1"  onkeypress="return isNumberKey(event)" /></td></tr>';
	divstr += '<tr style="height:35px;"><td colspan="2" style="height:35px;"><div style="height:17px;float:left;"><input name="charsetradio" style="padding-left:20px;text-align:center;"  type="radio" value="0"/>&nbsp;&nbsp;Use only Alpanumeric</div><div style="height:17px;float:left;"> <input name="charsetradio" style="padding-left:20px;text-align:center;"  type="radio" value="1"/>&nbsp;&nbsp;Use  Alpanumeric &amp; Special chars</div></td></tr>';
	
	divstr += '<tr><td colspan="2" style="margin-left:30px;"><div  style="text-align:center;" ><a  style="text-align:center;" class="buttonmenu" href="#"  id="recordcountbutton" onclick="setRecordCount('+from+')">Generate</a> </div></td></tr></table></div>';
	var title = 'Set Record Count';
	var ht = 230;
	if(from === 2){
		title = 'Multiple Service Records';
		ht = 260;
	}	
	$("#dialog1").dialog( {height : ht, width:350,title:title} );
	$("#dialog1").html( divstr );
	$("#dialog1").dialog( "open" );
	$('input:radio[name=charsetradio]:nth(1)').prop('checked',true);
}

function setRecordCount(from){
	var ser_count = 1;// no of services
	if(from === 2){// multiple services
		ser_count = parseInt($('#servicecount').val());
		if(ser_count > 20){
			alert("Max Services Records is 20");
			return;
		}
	}	
	var rec_count = parseInt($('#recordcount').val());
	if(rec_count > 15){
		alert("Max Upper Form Records is 15");
		return;
	}
	var li_count  = parseInt($('#lirecordcount').val());
	if(li_count > 20){
		alert("Max Lineitems per Form Record is 20");
		return;
	}
	
	var chartype = parseInt($('input[name=charsetradio]:checked').val());
//	alert('dddd '+chartype);
	$("#dialog1").dialog( "close" );
	if(from === 0){
		var s = autoGenerateBPXML(rec_count,li_count,true,chartype);
		var bpxmlarray = []; bpxmlarray[0] = s;
		company_map[dataset.company_id].bpxmlarry = bpxmlarray;
	}else if(from === 1)
		autoGenerateBPCSV(rec_count,li_count,chartype);
	else if(from === 2)
		autoGenerateBPXMLMulti(ser_count,rec_count,li_count,chartype);
	company_map[dataset.company_id].servicetype = from;	
	company_map[dataset.company_id].servicecount = ser_count;
	if(ser_count > 1){// multiple
		$("#divmenuholder1").show();
	 }
}
function autoGenerateBPXMLMulti(ser_count,rec_count,li_count,chartype){
	var px = 0;
	var bpxmlarray = [];
	var str = '<div style="float:left;width:60px;margin-top:4px;margin-bottom:4px;text-align:center;"><a href="#" onclick="javascript:setMultiRec(0,'+ser_count+')" class="font15b buttonmenu">Prev</a></div> ';
	str += '<div id="multirecdisplay"  class="font15b" style="float:left;width:30px;margin-top:4px;margin-bottom:4px;text-align:center;" >1</div> ';
	str += '<div class="font15b" style="float:left;width:40px;margin-top:4px;margin-bottom:4px;text-align:center;" >of&nbsp;&nbsp;&nbsp;'+ser_count+'</div> ';
	str += '<div style="float:left;width:60px;margin-top:4px;margin-bottom:4px;text-align:center;"><a href="#" onclick="javascript:setMultiRec(1,'+ser_count+')" class="font15b buttonmenu">&nbsp;&nbsp;&nbsp;&nbsp;Next</a></div> ';
	$("#leftmethodmultidiv").html(str);
	$("#leftmethodmultidiv").show();
	var display = true;
//	alert('autoGenerateBPXMLMulti :'+ser_count+' ::'+rec_count+' ::'+li_count);
	for(px = 0; px < ser_count; px++){
		bpxmlarray[px] = autoGenerateBPXML(rec_count,li_count,display,chartype);
		display = false;
	}	
	company_map[dataset.company_id].bpxmlarry = bpxmlarray;
	
}
function setMultiRec(from,ser_count){
	var cur = parseInt($("#multirecdisplay").html());
	//alert(cur+'*******'+ser_count);
	if((from === 0 && cur === 1) || (from === 1 && cur === ser_count))
		return;
	if(from === 0)
		cur--;
	else if(from === 1)
		cur++;
	$("textarea#p_bpxml").val( company_map[dataset.company_id].bpxmlarry[cur-1]	);
	$("#multirecdisplay").html(cur);
// now you need to chnage display	
}

function autoGenerateBPCSV(rec_count,li_count,chartype){
	// pass
		var bpobj = company_map[dataset.company_id].selected_bp;
		var infodata = company_map[dataset.company_id].bp_info_map[bpobj.studio_prefix];
		var delist = infodata.bp_info.de;
		var bpobj = company_map[dataset.company_id].selected_bp;
		var  bplide = jQuery.trim( infodata.bp_info.bp_li_de);
		var k = 0;
		var str ='';
		var n = 0;
		var destr = ','+infodata.bp_info.bp_de.toLowerCase()+',';
		var dliestr = ','+infodata.bp_info.bp_li_de.toLowerCase()+',';
		str +='"H"';
		//alert('hhh '+destr);
		//alert('ddd '+dliestr);
		
		var  bpdes = infodata.bp_info.bp_de.split(',');
		for(k =0; k < bpdes.length; k++)
			str +=',"'+bpdes[k]+'"';
		
		var bplistr = '';
		if(bplide.length > 0 ){
			var bplides = bplide.split(',');
			bplistr +='\r\n"D"';
			for(k =0; k < bplides.length; k++)
				bplistr +=',"'+bplides[k]+'"';
		}
		str += bplistr;
		for(k = 0; k < delist.length; k++){
			var dename = ','+delist[k].Name.toLowerCase()+',';
			if(destr.indexOf(dename) < 0)
				continue;// not found
			str+=',"'+delist[k].Name+'"';		// need label values
		}
		for(n = 0; n < rec_count; n++){
			str +='\r\n"H"';
			str +=getDEInfoValue(1,destr,delist,chartype);
			bplistr = '';
			if(bplide.length > 0 ){
				var p = 0;
				for(p = 0; p < li_count; p++){
					 bplistr+='\r\n"D"';
					bplistr +=''+getDEInfoValue(1,dliestr,delist,chartype);
					//bplistr +='';
				}//p  li count
			}//k
			str += bplistr;
			//str +='';
		}// n rec count	
		//str +='';
//	var divstr = '<div id="genxmldiv"  class="font12" ><textarea class="font12" id="textxml" rows="25" cols="68">'+str+'</textarea></div>';
	$("textarea#p_bpxml").val( str);
}


function autoGenerateBPXML(rec_count,li_count, display,chartype){
	// pass
		var bpobj = company_map[dataset.company_id].selected_bp;
		var infodata = company_map[dataset.company_id].bp_info_map[bpobj.studio_prefix];
		var delist = infodata.bp_info.de;
		var bpobj = company_map[dataset.company_id].selected_bp;
		var  bplide = jQuery.trim( infodata.bp_info.bp_li_de);
		var k = 0;
		var str ='<List_Wrapper>\n';
		var n = 0;
		var destr = ','+infodata.bp_info.bp_de.toLowerCase()+',';
		for(n = 0; n < rec_count; n++){
			str +='<_bp>\n';
			str +=getDEInfoValue(0,destr,delist,chartype);
			if(display)
				str +='\n';
			var bplistr = '';
			if(bplide.length > 0 ){
				var dliestr = ','+infodata.bp_info.bp_li_de.toLowerCase()+',';
				var p = 0;
				for(p = 0; p < li_count; p++){
					bplistr +='<_bp_lineitems>';
					if(display)
						bplistr +='\n       ';
				
					bplistr +=getDEInfoValue(0,dliestr,delist,chartype);
					bplistr +='</_bp_lineitems>';
					if(display)
						bplistr +='\n';
				}//p  li count
			}//k
			str += bplistr;
			str +='</_bp>\n';
		}// n rec count	
		str +='</List_Wrapper>\n';
//	var divstr = '<div id="genxmldiv"  class="font12" ><textarea class="font12" id="textxml" rows="25" cols="68">'+str+'</textarea></div>';
	if(display){
		$("textarea#p_bpxml").val( str);
		//alert(str);
	}
	return str;	
}

	function getDEInfoValue(from,destr, delist,chartype){
		// comma separated list of DE's
		var k = 0;
		var str ='';
		for(k = 0; k < delist.length; k++){
			var dename = ','+delist[k].Name.toLowerCase()+',';
			if(destr.indexOf(dename) < 0)
				continue;// not found
			var value = getDEValue(delist[k],chartype);
			if(from === 0)
				str +='<'+delist[k].Name+'>'+jsfilter2(value)+'</'+delist[k].Name+'>\n';	
			else{
				var t =  jsfilter3(value+'');
				//alert('**** '+t+' :::'+value);
				str +=',"'+t+'"';	
			}
		}// for k
		return str;
	}

	function getDEValue(deobj,chartype){
		if(deobj.Name === 'record_no'){
			return;
		}
		var req = (deobj.Mandatory == 'false'?false:true);	
		var value ='';
		var type = deobj.InputType.toLowerCase();
		var data_type = deobj.Type.toLowerCase();
		var data_size = 0;
		var ts = 1318781876406;// start of 1 January 1970 00:00:00 UTC
		if( type== 'select' ||  type== 'radio' || type== 'multiselect'){
			if(deobj.options && deobj.options.length  > 0){
				var r = Math.floor(Math.random()*1000) % deobj.options.length ;
				value = deobj.options[r].Name;
			}
		}else if(type == 'text' ){
			if( deobj.DataDefinition )
				data_size = company_map[dataset.company_id].dddata_map[deobj.DataDefinition].data_size;
			var size = Math.floor(data_size);
			if(size == 0){
				if( data_type == 'integer')
					value = Math.ceil(Math.random()*1000000) ;
				else if( data_type == 'float')
					value = Math.ceil(Math.random()*1000000) * Math.random(Math.random()*1000) ;
			}else{
				var len = (Math.floor(Math.random()*1000) % (size-5) ) + 5;
				//value = jsfilter2(randomString(len));
				if(chartype === 0)
					value =randomAlphaString(len );
				else
					value = randomString(len);
		//alert(deobj.Name +' :: '+deobj.DataDefinition+' ::'+size+'  :: '+data_type+'  ::'+value );
			}	
		}else if(deobj.InputType.toLowerCase() == 'picker' && deobj.DataDefinition && company_map[dataset.company_id].dddata_map[deobj.DataDefinition]){
			var dtype = company_map[dataset.company_id].dddata_map[deobj.DataDefinition].data_type;
			if(dtype.toLowerCase() === 'timestamp'){
				var ms = moment(ts+Math.ceil(Math.random()*10000000*((Math.random()*1234))));
				if(company_map[dataset.company_id].dddata_map[deobj.DataDefinition].data_name == 'Date Picker')
					value = ms.format("MM/DD/YYYY HH:mm:SS");
				else
					value = ms.format("MM/DD/YYYY");
				//alert(deobj.Name+' '+px +'  '+(new Date(px))+'  v: '+value );
			}
		}else if(type == 'currency'  ){
			value = Math.round(Math.random()*100000000)/100  ;
		}else if(type == 'textarea' ){
			var wcount = Math.ceil(Math.random()*1000) % 40;
			var pk = 0;
			var pstr = '';
			for(pk = 0; pk < wcount; pk++){
				var len = Math.ceil(Math.random()*1000) % 15;
				//pstr +=' '+ jsfilter2(randomString(len));
				if(chartype === 0)
					pstr +=' '+randomAlphaString(len );
				else
					pstr +=' '+ randomString(len);
			}
			value = pstr;
		}
		return value;
	}

function randomString(len ) {
    var charSet =  'ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789 -!@#$%^&* ()_+<>?';
    var randomStr = '';
    for ( i = 0; i < len; i++) {
    	var randomPoz = Math.floor(Math.random() * charSet.length);
    	randomStr += charSet.substring(randomPoz,randomPoz+1);
    }
    return randomStr;
}
function randomAlphaString(len ) {
    var charSet =  'abcdefghijk lmnopqrstuv wxyz 012345 6789';
    var randomStr = '';
    for ( i = 0; i < len; i++) {
    	var randomPoz = Math.floor(Math.random() * charSet.length);
    	randomStr += charSet.substring(randomPoz,randomPoz+1);
    }
    return randomStr;
}

function setWebServices(methods) {	
	var str = "";
	i = 0;
	for( i=0;i<methods.length;i++){
		var mn = methods[i];
		if(mn.indexOf("Object") >= 0 || mn.indexOf("Sap") >= 0 || mn.indexOf("Ping") >= 0 || mn.indexOf("User") >= 0)
			continue;
		str += '<div  class="methodclass" id="'+mn+'" onclick="methodClick(\''+mn+'\')" >'+mn+'</div>';
	}
	if(str.length == 0)
		str = '<span style="float:right;width:92%;padding-left:10px;" class="vnlabel_bl_14">Click on "Favorite Methods" to set the Web Services methods you want to use.</span>';
	$("#webservicesdiv").html(str);
}
function setWebServicesMap(){
	
	var methodsObj = unifierwebservice.methods;
		i = 0;
	for( i=0;i < methodsObj.length;i++){
		var mn = methodsObj[i].method_name;
		if(mn.indexOf("Object") >= 0 || mn.indexOf("Sap") >= 0 || mn.indexOf("Ping") >= 0 || mn.indexOf("User") >= 0)
			continue;
		webservices_map[mn]	= i;
	}
	//getData('get_user_webservices',userWebServices);
}
function userWebServices(data){
	//alert('userWebServices '+data);
	i = 0;
	for(i = 0; i < data.length; i++){
		var len = unifierwebservice.methods.length;
		webservices_map[data[i].method_name]= len;
		unifierwebservice.methods[len] = data[i];
	}
}
function allWebServices() {	
	var str = "";
	var methodsObj = unifierwebservice.methods;
	console.log('allWebServices  ::'+methodsObj.length);
	var ws = company_map[dataset.company_id].fav_methods;
	//alert(ws)
	for(var i=0;i<methodsObj.length;i++){
		var mn = methodsObj[i].method_name;
		if(mn.indexOf("Object") >= 0 || mn.indexOf("Sap") >= 0 || mn.indexOf("Ping") >= 0 || mn.indexOf("User") >= 0)
			continue;
		var chk = '';
		
		var fimg = 'images/fav_normal.png';	
		/*for(var k = 0; k < ws.length; k++){
			if(ws[k] == methodsObj[i].method_name){
				chk ='checked=""';
				fimg = 'images/fav_hover.png';	
				break;
			}
		}*/
		str += '<div  class="methodclass" id="'+methodsObj[i].method_name+'"  >';
//		str +='<div style="visibility:hidden;width:20px;float:left;">';
//		str +='<input type="checkbox" id="h_chk_'+methodsObj[i].method_name+'" name="h_chk_'+methodsObj[i].method_name+'"  value="'+methodsObj[i].method_name+'" '+chk+'/></div>';
		str +='<div style="width:200px;float:left;"><a style="margin:0px;" href="javascript:selectedMethodClick(\''+methodsObj[i].method_name+'\')" id="a_'+methodsObj[i].method_name;
		str +='">'+methodsObj[i].method_name+'</a></div></div>';
		//str +='<div style="width:210px;float:left;">&nbsp;&nbsp;&nbsp;&nbsp;'+methodsObj[i].method_name+'</div></div>';

	}
	return str;
}
function selectedMethodClick(methodname){
	$("#dialog1").dialog( "close" );
	methodClick(methodname);
}
function setFavMethods(data){
	var ds = [];
	i = 0;
	for(i = 0; i < data.length; i++)
		ds.push( data[i].name);
	company_map[dataset.company_id].fav_methods = ds;	
	setWebServices(ds);
	//alert(ds)
}

function setFavoriteMethods(){
	
	$("#dialog1").dialog( {height : 550, width:405,title:'Unifier Web Service Method'} );
	/*var str ='<div id="allmethodsid" style="height:100%;width:100%;"><div id="allmethodstop"  style="height:7%;width:100%;background-color:#d8e0e3;">';
	str +='<div class="topbutton " ><a class="buttonmenu" href="#" id="select_webservice_fav" onclick="saveFavoriteMethods()">Save&nbsp;<img src="images/fav_hover.png" style="width:18px;height:18px;" /></a></div>';
	str +='</div> ';
	*/
	var str ='<div id="allmethodsbody" style="float:left;height:99%;overflow-y:scroll;width:100%;">';
	str +=allWebServices() ;
	str +='</div>';
	$("#dialog1").html( str);
	$("#dialog1").dialog( "open" );
	
}

function saveFavoriteMethods(){
	var count = 0;
	var ds =[];
	$('#allmethodsid input:checked').each(function() {
            ds.push(this.value);
			count++;
    });
//	alert(' s '+count+' '+ds);
	if(count == 0)
		return "";
	company_map[dataset.company_id].fav_methods=ds;
	setWebServices(ds);
	var str =  ds.join(',');
	getData('fav_methods',favoriteMethods,str);
}

function favoriteMethods(data){
	$("#dialog1").dialog( "close" );
}
function saveFavoriteProjects(){
	var ds = [];	
	var count = 0;
	$("#bodyprojectlist input[type='checkbox']:checked").each(
		function() {
		    ds.push(this.value);
			count++;
		}
	);
	//alert(' s '+count+' '+ds);
	if(count == 0)
		return "";
	// get all the checked BP's
	company_map[dataset.company_id].fav_projects=ds;
	var str =  ','+ds.join(',')+',';
	getData('fav_projects',setFavoriteBPs,str);
	i = 0;
	for( i=0;i<company_map[dataset.company_id].projectdata.length;i++){
		var obj = company_map[dataset.company_id].projectdata[i];	
		obj.uid = 'zz';
		if(str.indexOf(','+obj.projectnumber+',') >=0)
			obj.uid = obj.projectnumber;
	}
}

function saveFavoriteBPs(){
	var ds = [];	
	var count = 0;
	$("#headerbplist input[type='checkbox']:checked").each(
		function() {
		    ds.push(this.value);
			count++;
		}
	);
	console.log('saveFavoriteBPs s '+count+' '+ds);
//	if(count == 0)
//		return ""; // we need to clear the saved BP's
	// get all the checked BP's
	company_map[dataset.company_id].fav_bps=ds;
		var pdata = company_map[dataset.company_id].bpdata;
	var str =  ','+ds.join(',')+',';
	getData('fav_bps',setFavoriteBPs,str);
	for( i=0;i<company_map[dataset.company_id].bpdata.length;i++){
		var obj = company_map[dataset.company_id].bpdata[i];	
		obj.fav = 'zz';
		if(str.indexOf(','+obj.studio_prefix+',') >=0)
			obj.fav = obj.studio_prefix;
	}
}

function setFavoriteBPs(data){
// does nothing dummy
}

function setSavedServiceListx(pdata){
 	company_map[dataset.company_id].saved_files=pdata;
	console.log('ssssss '+company_map[dataset.company_id].saved_files.length);
/*	if(dataset.threadplatform)
		displayThreadServiceList();
	else	
	*/
	displaySavedServiceList(pdata);
}	
function listSavedFiles(){
	var dataquery ='';
/*	if(company_map[dataset.company_id].saved_files && company_map[dataset.company_id].saved_files.length > 0)
		setSavedServiceList(company_map[dataset.company_id].saved_files);
	else	
*/
		getData("get_saved_list", setSavedServiceList,dataquery);
}
function setSavedServiceList(pdata){	
	company_map[dataset.company_id].saved_files=pdata;
	var str = '<div id="saveddatalistouter" style="margin-left:5px;marigin-top:5px;height:100%;z-index:100;">'
	str +='<div id="saveddatalist" style="float:left;marigin-top:2px;width:99%;height:90%;overflow:auto;" ><table style="width:100%;margin-top:1px;border:1px solid #ECECEC;font-size:12px;font-family:Arial;" class="table table-bordered table-striped" >';
	str += '<tr style="height33px;">';
	//<td style="width:6%;text-align:center;" ><b>Select</b></td>
	str +='<td style="width:23%;" ><b>Saved/Upload Name</b></td>';
	str += '<td  style="width:16%;" ><b>Date</b></td> </td><td style="width:33%;text-align:center;" ><b>BP Name</b></td><td style="width:11%;text-align:center;" ><b>Action</b></td></tr>';
	for(var i=0;i<pdata.length;i++){
		var obj = pdata[i];	
		var sel = '';
		if(obj != null ) {
			var type = 'Saved';
			if(type === 1)
				type = 'Run';
			else if(type == 2)
				type = 'Upload';
			var dt = moment(obj.lastmodified,'MM-DD-YYYY HH:mm:SS');
			var  upstr = (obj.isupload == "1"?"Excel":"Saved");
			var  bpname = getBPName(obj.prefix);
			str += '<tr class="datacellone" id="1">';
			//str +='<td style="text-align:center;" ><input type="radio" title="Select File" name="savedfilelistradio" value="'+obj.file_id+'"/></td>';
			str += '<td ><a href="#" onclick="javascript:selectedSavedFile('+i+');" title="This will download service file">'+obj.save_name+'</a></td><td >'+dt.format('MM-DD-YYYY HH:mm')+'</td><td>'+bpname+'</td><td>'+type+'</td></tr>';
		}
	}
	str += '</table></div>';
	str +='<div id="saveddatalistaction" style="float:left;padding-top:10px;width:99%;height:30px;z-index:100;border-top:1px solid;">';
//	str += '<a href="#" class="buttonmenu" id="selectfile"  style="margin-left:300px;" onClick="javascript:selectSavedFile()">OK</a>&nbsp;&nbsp;&nbsp;';
	str += '<a href="#" class="buttonmenu" id="cancelbtn" style="margin-left:300px;" onclick="javascript:cancelDialog1()">Close</a>';
	str +='</div></div>';
	//$("#rightbuttonid").html('');
//	$("#centerdiv").html(str);	
	$("#dialog1").dialog( {height : 480, width:800,title:'Saved Files '} );
	$("#dialog1").html( str );
	$("#dialog1").dialog( "open" );
	
}
function cancelDialog1(){
	$("#dialog1").dialog( "close" );
}

function selectSavedFile(){
	var id =  $('input[name=savedfilelistradio]:checked').val();
	console.log('selected id is '+id);
	$("#dialog1").dialog( "close" );
}
function getBPName(prefix){
	var pdata = company_map[dataset.company_id].bpdata;
	for(var j=0;j<pdata.length;j++){
		if(pdata[j].studio_prefix == prefix)
			return pdata[j].studio_name;
	}
	return "";
}

function filterRunList(actiontype){
	var dl = jQuery.trim($('#runlistdataquery').val());
//	if(dl.length === 0)
//		return;
	console.log('filterRunList ----'+dl);
	if(actiontype == 'run_service_list')
		runService(dl);	
	else 	if(from === 1)
		getServiceList(from,dl)
}
function buildFilterDiv(actiontype,exs){
	var lstr ='<div id="mainfilterdiv"  style="width:100%;height:48px;padding-top:0px;font-size:13px;font-family:Arial;">';
	lstr +='<div id="rightmenuinnerdiv" style="float:left;width:99%" >';
	lstr +='<div style="float:left;padding-left:5px;" >';
	lstr +='<b>Query:&nbsp;</b><input  type="text" id="runlistdataquery" title="Filter the query" value="" size="60"/></div>';
	//lstr +='</div>';
	lstr +='<div style="float:left;padding-left:10px;padding-top:5px;" >';
	lstr +='<a class="buttonmenu" href="#" id="autogen" title="Filter the query with fields method_name, service_name, time, response_code"  onClick="javascript:filterRunList(\''+actiontype+'\');">&nbsp;Run Filter</a></div></div>';
	lstr +='<div style="float:left;padding-left:25px;color:blue;width:90%;" class="font12" >'+exs+'</div>';

	lstr +='</div>';
	//console.log('ddddddd '+lstr);
	return lstr;
	//$("#rightbuttonid").html(lstr);
}

function savedServiceList_111(){
	//we can set the query in the fetch
	if(dataset.company_id < 0)
		return;
	dataset.threadplatform = false;
	buildFilterDiv(1,'','Ex. file_name like "%_up_%" or name="abc" or lastmodified <\'2013-12-19\' ');
	getServiceList('user','');
}
function getServiceList(from,dataquery){
	//we can set the query in the fetch
	//var dataquery = 'last 10 days';
	console.log('getServiceList ddd '+company_map[dataset.company_id].services_files);
/*	if(company_map[dataset.company_id].services_files && company_map[dataset.company_id].services_files.length > 0){
		displayRunServiceList(company_map[dataset.company_id].services_files);
		return;
	}	
	*/
	var str = '<div style="float:left;padding-left:2px;color:blue;width:99%;height:95%;" class="font12" >';
	str += buildFilterDiv('run_service_list',"Ex. file_name like '%_up_%' or bpname like '%abc' or time <'2013-12-19' ");
	
	str +='<div id="innerrunlist" style="float:left;padding-left:2px;color:blue;width:99%;height:70%;" class="font12" ></div></div>';
	$("#dialog1").dialog( {height : 480, width:950,title:'Services Files '} );
	$("#dialog1").html( str );
	$("#dialog1").dialog( "open" );
	//	getData("run_service_list", displayRunServiceList,dataquery);
	
	
}
function runService(dataquery){

console.log('runService ::' +dataquery);
	var promise = getPromise("run_service_list", {
				data_query : dataquery
			});
		promise.done(function (data) {
			console.log('runService saved :');
			//$('#loading-indicator').hide();
			if (data.erros){
				$('#unifierstatus').html(data.erros);
				return;
			}
			displayRunServiceList(data);

		});

}

function servicesRunList(dataquery, exs){
	if(dataset.company_id <= 0)
		return;

	var str = buildFilterDiv(0,dataquery,exs);
	getData("run_service_list", displayRunServiceList,dataquery);
	
}
function selectedRunFile(id, i){
	var dataquery = id;
	//alert('uuuuu '+id);
	getData("get_service_details", showRunService,dataquery);
}
function showRunService(data){
	//alert('ggghhhhh '+data);
	var divstr = '<div id="wsdlimportedid" class="font12" style="width:100%;height:100%;overflow-y:auto;"> ';
	divstr+='<table style="width:95%;" class="table table-bordered table-striped">';
		var ser_params = data.service_details.parameters;
		var params = unifierwebservice.methods[webservices_map[data.method_name]].parameters;
		var j = 0;
		var pstr = '';
		divstr+='<tr style="height:20px;width:100%;"><td style="width:35%;" class="font15b ">Response</td><td style="width:60%;" class="font15b ">'+data.response_code+' </td></tr>';
		for(j = 0; j < params.length; j++){
			if(params[j].param_name === 'shortname' || params[j].param_name === "authcode")
				continue;
			divstr+='<tr  style="height:20px;"><td class="font15b"  >'+params[j].param_name+' </td ><td class="font12"> '+ser_params[j][params[j].param_name.toLowerCase()]+'</td></tr>';
		}
		if( data.response_code == 200 && data.method_name.indexOf('get') === 0) {
			divstr+='<tr ><td class="font15b ">Recd. XML</td>';
			divstr+='<td  class="font12"><textarea cols="47" rows="14">'+data.output_details.xmlcontents+'</textarea></td></tr>';
		}else if( data.response_code != 200){
			divstr+='<tr ><td class="font15b "> Errors</td>';
			divstr+='<td  class="font12"><textarea cols="47" rows="6">'+data.errors+'</textarea></td></tr>';
		}
	divstr+='</table>';
	$("#dialog1").dialog( {height : 480, width:550,title:'Service Details: '+data.method_name} );
	$("#dialog1").html( divstr );
	$("#dialog1").dialog( "open" );
}
function displayRunServiceList(pdata){
	console.log('gggg '+pdata);
	var str = '<div id="servicesdatalistouter" style="margin-left:1px;height:100%;">'
	str +='<div id="servicesdatalist" style="float:left;marigin-top:5px;width:99%;height:100%;overflow:auto;" ><table style="width:100%;margin-top:5px;border:1px solid #ECECEC;font-size:12px;font-family:Arial;" class="table table-bordered table-striped" >';
	str += '<tr style="height:25px;"><td style="width:10%;" ><b>Time</b></td><td style="width:6%;text-align:center;" ><b>Status</b></td>';
	str += '<td  style="width:24%;text-align:center;" ><b>BP Name</b></td> <td  style="width:26%;text-align:center;" ><b>File Name</b></td><td style="width:34%;text-align:center;" ><b>Errors</b></td></tr>';
	i = 0;
	for( i=0;i<pdata.length;i++){
		var obj = pdata[i];	
		var sel = '';
		var  bpname = getBPName(obj.prefix);
		
		var dt = moment(obj.time,'MM-DD-YYYY HH:mm:SS');
	//	var  zipstr = (obj.method_name == "getCompleteBPRecord"?"yes":"no");
		str += '<tr class="datacellone" id="1">';
		str += '<td ><a href="#" onclick="javascript:selectedRunFile('+obj.id+','+i+');" title="This will show the run service record">'+dt.format('MM-DD-YYYY')+'</a></td>';
		str +='<td style="text-align:center;" >'+obj.response_code+'</td><td style="text-align:center;" >'+bpname+'</td><td style="text-align:center;" >'+obj.external_file_name+'</td><td style="text-align:center;" >'+obj.errors+'</td></tr>';
		
	}
	str += '</table></div>';
/*	str +='<div id="saveddatalistaction" style="float:left;padding-top:10px;width:99%;height:30px;z-index:100;border-top:1px solid;">';
	str += '<a href="#" class="buttonmenu" id="selectfile"  style="margin-left:300px;" onClick="javascript:selectSavedFile()">OK</a>&nbsp;&nbsp;&nbsp;';
	str += '<a href="#" class="buttonmenu" id="cancelbtn" onClick="javascript:f()">Cancel</a></div>';
*/
	str +='</div>';	
//	$("#dialog1").dialog( {height : 480, width:950,title:'Services Files '} );
	$("#innerrunlist").html( str );
//	$("#dialog1").dialog( "open" );
}

function selectedSavedFile(val){
	//alert('hello');
	// need to download the saved file
	//var val = parseInt($('input[name=savedlistradio]:checked', '#mainform').val());
	$('#loading-indicator').show();
	var data = company_map[dataset.company_id].saved_files;
	$('#savedfileinfo').html('<b>Saved File</b> : '+data[val].name+'&nbsp;&nbsp;<a href="#" onclick="clearSavedFile()">clear</a>');
	var filename = data[val].file_path+'/'+data[val].file_name;
	//alert('fff  '+filename);
	processDownload(data[val].file_id,'','saved_file',"download_file",'','');
	//getData('get_saved_file',displaySavedService, data[val].file_id);
	// we need to build all the servcies
	$('#loading-indicator').hide();
}
function clearSavedFile(){
	$('#savedfileinfo').html('');
}
function displaySavedService(data){
	// parsed the file 
	//alert(' displaySavedService '+data);
	$('#loading-indicator').hide();
	var method = data.method_name;
	if(data.servicename)
		method = data.servicename;
console.log('*** meth :'+data.method_name+'  ::'+data.servicename);
	var params = unifierwebservice.methods[webservices_map[data.method_name]].parameters;
	var file_params = data.parameters;
	//	alert('method '+method+' ::'+params.length);	
	var pi = 0;
	for(pi = 0; pi < params.length; pi++){
		
		if(params[pi].param_name.toLowerCase() === "projectnumber"){
		// find  the projectnumber
			var pdata = getProjectData(file_params[pi][params[pi].param_name.toLowerCase()]);
			company_map[dataset.company_id].selected_project = pdata;
			$("#selected_project").html(company_map[dataset.company_id].selected_project.projectnumber);
		}
		if(params[pi].param_name.toLowerCase() === "bpname"){
			var index = getBPPrefixData(file_params[pi][params[pi].param_name.toLowerCase()]);
			selectedBP(index);
		}	
		//alert('aaa '+pi);
	}
	//alert('done');
	methodClick(method,data);	
}

function displayThreadServiceList(){	
// thread 
	var str = '<div id="saveddatalistouter" style="margin-left:5px;marigin-top:10px;height:100%;">'
	str +='<div id="saveddatalist" style="float:left;width:99%;height:100%;overflow:auto;" ><table style="width:99%;margin-top:10px;border:1px solid #ECECEC;font-size:12px;font-family:Arial;" class="table table-bordered table-striped" class="font12">';
	str += '<tr style="height:25px;">';
	str +='<td style="width:6%;" ><b>#</b></td>';
	str +='<td style="width:25%;" ><b>Group</b></td>';
	str +='<td style="width:35%;" ><b>Name</b></td>';
	str +='<td style="width:20%;" ><b>Method</b></td>';
	str += '<td  style="width:14%;" ><b>Date</b></td> </tr>';
	var prev_group = '';
	var pdata = company_map[dataset.company_id].saved_files;
	for( i=0;i<pdata.length;i++){
		var obj = pdata[i];	
		var sel = '';
		if(obj != null ) {
			var gname = jQuery.trim(obj.group_name);
			if( gname === '#' || gname != prev_group){
				
				var dt = moment(obj.saved_date,'MM-DD-YYYY HH:mm:ss');
				str += '<tr class="datacellone" style="color:'+(gname=='#'?'gray':'blue')+'">';
				str += '<td style="text-align:center;"><input type="checkbox" value="'+i+'" id="servicecheckid" name="servicecheckid" /></td>';
				str += '<td style="text-align:center;">'+gname+'</td>';
				str += '<td style="text-align:center;">'+obj.name+'</td><td >'+obj.method_name+'</td><td  style="text-align:center;">'+dt.format('MM-DD-YYYY')+'</td></tr>';
			}
			prev_group = gname;
		}
	}
	str += '</table></div></div>';
	$("#rightthreadpanel").html(str);	
	
}

function getProjectData(pno){
	i = 0;
	if(company_map[dataset.company_id].projectset){
		for(i = 0; i < company_map[dataset.company_id].projectdata.length; i++){
			if(company_map[dataset.company_id].projectdata[i].projectnumber == pno)
				return company_map[dataset.company_id].projectdata[i];
		}
	}
	var pdata = {};
	pdata.projectnumber=pno;
	pdata.projectname='';
	return pdata;
}

function setBPOnDemand(data){
	company_map[dataset.company_id].bpset = true;
	company_map[dataset.company_id].bpdata = data;
}
function checkBPData(){
	if(!company_map[dataset.company_id].bpset)
		 getData("bp_list",setBPOnDemand);
}
function getBPPrefixData(bpname){
	i = 0;
	for(i = 0; i < company_map[dataset.company_id].bpdata.length; i++){
		if(company_map[dataset.company_id].bpdata[i].studio_name  == bpname)
			return i;
	}/*
	var obj = {};
	obj.studio_name = bpname;
	obj.studio_prefix='';
	obj.published_date ='No date    is available';
	*/
	return 0;
}



	
function createServiceForm(){
	var str = '<div style="width:100%;">';
	dataset.temp_service='';
	dataset.service_id= -1;
	/*
	str +='<div style="float:left;z-index:30;margin-left:10px;"><button class="btn_green_1" title="Click to create a new Service" type="button" name="createserviceid" id="createserviceid"  onClick="javascript:createService(1);">Create Client</button></div>';
	str +='<div style="float:left;z-index:30;margin-left:10px;"><button title="Save and Download WSDL" class="btn_green_1" type="button" name="downloadserwsdl" id="downloadserwsdl" onClick="javascript:downloadServiceWSDL();" disabled="disabled">Download WSDL</button></div>';
	*/
	str +='<div style="float:left;z-index:30;margin-left:10px;"><a class="buttonmenu" title=Create a new Service" href="#" name="createserviceid" id="createserviceid"  onClick="javascript:createService(1);">Create Client</a></div>';
	str +='<div style="float:left;z-index:30;margin-left:10px;"><a title="Save and Download WSDL" class="buttonmenu" href="#" name="downloadserwsdl" id="downloadserwsdl" onClick="javascript:downloadServiceWSDL();" disabled="disabled">Download WSDL</a></div>';

	str +='</div>	';
	$("#rightbuttonid").html(str);
	$("#downloadserwsdl").hide();
	str = '<div   style="width:100%;height:95%;background-color:#FAFAFA;">'
	str += '<div id="serviceform" class="font12" style="width:90%;height:100%;overflow-y:auto;"><div style="float:left;width:90%;margin-left:25px;" class="font12">';
	str +='<b>To create a Web Services Client connecting to Unifier you must have the following</b>';
	str +='<br/><b>1.</b> Name of the Implemented method &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>2.</b> Parameters for the method.  <br/>';
	//str +='<b>3.</b> Target End Point/namespace for the service  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>4.</b>Service Name ( Not mainservice or UnifierWebService) ';
	str +='</div>';
	str +='<div style="float:left;width:100%;height:70%;" class="font12">';
	
	str +='<div style="float:left;width:100%;height:8px;" >&nbsp;</div>';
	str +='<div style="color:red;" class="display2" ><div class="font12" style="padding-top:7px;width:90%;margin-left:35px;" id="serviceerror">&nbsp;</div></div>';
	str +='<div class="display2" >&nbsp;</div>';
	str +='<div class="font12 display2"><div class="font12 display1">';
	str +='<b>Service Name</b></div><div class="display3"><input type="text" size="53" id="servicenameid" name="servicenameid" value="UnifierWebServices" /><div style="color:red;width:30px;float:right;">*</div>';
	str +='</div></div>';
	str +='<div class="font12 display2"><div  class="font12  display1">';
	str +='<b>End Point</b></div><div class="display3"><input type="text" size="53" id="endpointid"  value=""/>';
	str +='</div></div>';
	str +='<div class="font12 display2"><div class="font12 display1">';
	str +='<b>Target Namespace</b></div><div class="display3"><input type="text" size="53" id="targetnameid"  value=""/>';
	str +='</div></div>';
	str +='<div class="font12 display2"><hr style="width:90%;text-align:center;color:gray;margin-left:30px;" /></div>';
	str +='<div class="font12 display2"><div  class="font12  display1">';
	str +='<b>Method Name</b></div><div class="display3"><input type="text" size="53" id="methodnameid"  value=""/>';
	str +='<div style="color:red;width:30px;float:right;">*</div></div></div>';
	str +='<div class="font12 display2"><div class="font12  " style="float:left;width:70%;text-align:center;">';
	str +='<b>Method Parameters</b></div><div style="width:10%;">&nbsp;';
	str +='</div></div>';
	str +='<div class="font12 display2"><div  class="font12  display4">';
	str +='<b>Short Name</b></div><div class="display1">String';
	str +='</div></div>';
	str +='<div class="font12 display2"><div  class="font12  display4">';
	str +='<b>Auth Code</b></div><div class="display1">String';
	str +='</div></div>';
	str +='<div class="font12 display2"><div  class="font12  display4">';
	str +='<input type="text" size="45" id="methodparam1"  value=""/></div><div class="display1">'+paramTypeString(1)+'';
	str +='</div></div>';
	str +='<div class="font12 display2"><div  class="font12  display4">';
	str +='<input type="text" size="45" id="methodparam2"  value=""/></div><div class="display1">'+paramTypeString(2)+'';
	str +='</div></div>';
	str +='<div class="font12 display2"><div  class="font12  display4">';
	str +='<input type="text" size="45" id="methodparam3"  value=""/></div><div class="display1">'+paramTypeString(3)+'';
	str +='</div></div>';
	str +='<div class="font12 display2"><div  class="font12  display4">';
	str +='<input type="text" size="45" id="methodparam4"  value=""/></div><div class="display1">'+paramTypeString(4)+'';
	str +='</div></div>';
	str +='<div class="font12 display2"><div  class="font12  display4">';
	str +='<input type="text" size="45" id="methodparam5"  value=""/></div><div class="display1">'+paramTypeString(5)+'';
	str +='</div></div>';

	str +='<div class="font12 display2"><div  class="font12  display4">&nbsp</div>';
	
	str +='</div></div>';
	$('#centerdiv').html(str);
	$('#targetnameid').val('http://general.service.webservices.skire.com');
}
function paramTypeString(id){
	var str='<select id="paramtypeid_'+id+'"> <option value="String">String</option> <option value="String[]">String Array</option>';
	str +=' <option value="FileData">File</option> <option value="FileData[]">File Array</option></select>';
	return str;
}
function importWSDL(num){
	$('#fileactiontype').val('importwsdlfile');
	document.getElementById("f_fileclick").click();
}

function displayServiceResult(data){
	var divstr = '<div id="wsdlimportedid" class="font12" style="width:100%;height:100%;overflow-y:auto;"> ';
	divstr+='<table style="width:95%;" class="table table-bordered table-striped">';//<tr><td style="width:95%;" class="font15b ">Method </td></tr>';
	//<td style="65%;" >'+data.methods+'</td></tr>';
	i = 0;
	for(i = 0; i < data.methods.length; i++){
		var m = data.methods[i];
		divstr+='<tr><td  style="width:100%;"><table class="table table-bordered table-striped"><tr><td class="font15b" style="width:30%;">Method</td>';
		divstr+='<td style="width:70%;" class="font15"> '+m.method_name+'</td></tr>';
		var params = m.parameters;
		var j = 0;
		var pstr = '';
		for(j = 0; j < params.length; j++)
			pstr +=params[j].param_name+', ';
		divstr+='<tr><td class="font15b" >Parameters </td ><td class="font12"> '+pstr+'</td></tr>';
		divstr+='<tr><td class="font15b" >Response </td ><td class="font12"> '+m.response.type+'</td></tr>';
		divstr+='</table></td></tr>';
	}
	divstr+='</table>';
	$("#dialog1").dialog( {height : 450, width:500,title:'Service : '+data.service} );
	$("#dialog1").html( divstr );
	$("#dialog1").dialog( "open" );
}
function getData(actiontype, callback,data_inp){
	// alert("getData "+actiontype+'  :'+dataset.company_id);
	var data_param ='';
	if(data_inp)
		data_param = data_inp;
	var sessionid = dataset.sessionid;	
	
	$.ajax({
		type: 'GET',
		url: "connect",
		dataType: 'json',
		data: {actiontype : actiontype,sessionid:sessionid,company_id:dataset.company_id,user_id:dataset.user_id,data_param:data_param},
		success: function(data){ 
			
			//	alert("getData "+actiontype+'  :'+data);
			callback(data);
		}		
    });		
}
function getPromise(actiontype, data_params){
	// alert("getData "+actiontype+'  :'+dataset.company_id);
	
	data_params['actiontype']= actiontype;
	
	return $.ajax({
		type: 'GET',
		url: "connect",
		dataType: 'json',
		data:data_params
    });		
}
function getPostPromise(actiontype, data_params){
	// alert("getData "+actiontype+'  :'+dataset.company_id);
	
	data_params['actiontype']= actiontype;
	
	return $.ajax({
		type: 'Post',
		url: "connect",
		dataType: 'json',
		data:data_params
    });		
}
function downloadExcel(){
	//alert('downloadServiceWSDL '+dataset.service_id);
	
	if(!company_map[dataset.company_id].selected_bp || !company_map[dataset.company_id].selected_bp.studio_prefix){
		alert('Business Process not selected');
		return;
	}	
	var prefix = company_map[dataset.company_id].selected_bp.studio_prefix;
	processDownload(0,prefix,'excel_template',"download_file",'','');
}
function processDownload(id,prefix,fileaction,actiontype,upper_csvdata,li_csvdata){	
	var str = '<input type="hidden" id="id" name="id" value="'+id+'" />';
	str += '<input type="hidden" id="prefix" name="prefix" value="'+prefix+'" />';
	str += '<input type="hidden" id="upper_csvdata" name="upper_csvdata" value="'+upper_csvdata+'" />';
	str += '<input type="hidden" id="li_csvdata" name="li_csvdata" value="'+li_csvdata+'" />';
	str += '<input type="hidden" id="filetype" name="filetype" value="bp" />';
	str += '<input type="hidden" id="fileaction" name="fileaction" value="'+fileaction+'" />';
	str += '<input type="hidden" id="actiontype" name="actiontype" value="'+actiontype+'" />';
	// do a download post with this id;
	$('#postid').html(str);
	$("postform").attr("method","post");
	document.postform.submit();
	document.postform.method = "get";
	setTimeout(resetPostForm,5000);
}
function importExcel(){
	$('#fileactiontype').val('excel_data');
	document.getElementById("f_fileclick").click();
}

//----------------------------------------------- batch processing

function batchServiceResponse(data){
	alert('*&*&*& '+data);
}
function runThreadWebService(){
	var id =  $('input[name=batchlistradio]:checked').val();
	if(id === "")
		return;
	alert('^^^ '+id);	
	getData("run_batch_services",getBatchResult,id);
}
function saveBatchThreads(){
	if(!alphaNumericU($('#threadservicebatchname').val()) || $('#threadservicebatchname').val().length > 30){
		alert('Batch name should only contain alphanumeric or _ & not exceed 30 chars');
		return;
	}
	var input_data ={};
	input_data.actiontype ='save_batch_services';
	input_data.batch_name = $('#threadservicebatchname').val();
	input_data.user_id=dataset.user_id;
	input_data.company_id= dataset.company_id
	input_data.schedule_status = $('#schedulestatus').val();;
	var threadval = $('input[name=threadserviceradio]:checked').val();
	input_data.thread_count = 1;
	if(threadval == '1'){// multithread
		input_data.thread_count = parseInt($('#threadcount').val());
		if( input_data.thread_count > 15){
			alert('Max Thread Count should be 15');
			input_data.thread_count = 15;
		}else if(input_data.thread_count <= 0)
			input_data.thread_count = 5;
		$('#threadcount').val(input_data.thread_count);
	}
	// now check for the selected checkboxes 
	var sids = 	getBatchServiceIds();
	input_data.service_ids =sids.join(','); ;
	input_data.service_id_count = sids.length;
	postData(input_data, batchServiceResponse);	
}

function getBatchServiceIds(){
	var serviceids = [];
	$(':checkbox:checked').each(function(i){
		var ptr = $(this).val();
		//alert('####  :'+ptr +' ;;;'+company_map[dataset.company_id].saved_files.length);
        var obj = company_map[dataset.company_id].saved_files[ptr];
		var gname = jQuery.trim(obj.group_name);
		if( gname != '#' ){
			// collect all service ids
			var new_gname = gname;
			while(gname == new_gname ){
				serviceids.push(obj.service_id);
				ptr++;
				if( ptr >= company_map[dataset.company_id].saved_files.length)
					break;
				obj = company_map[dataset.company_id].saved_files[ptr];
				new_gname = jQuery.trim(obj.group_name);
			}
		}else
			serviceids.push(obj.service_id);
    });
	alert('**** '+serviceids.join(','));
	return serviceids;
}

function getBatchResultList(){
	var id =  $('input[name=batchlistradio]:checked').val();
	if(id === "")
		return;
	alert('^^^result '+id);	
	getData('get_batch_results',displayBatchServices,id);

}

function displayBatchServices(pdata){
	var str = '<div id="saveddatalistouter" style="margin-left:5px;marigin-top:10px;height:100%;">'
	str +='<div id="saveddatalist" style="float:left;width:99%;height:100%;overflow:auto;" ><table style="width:99%;margin-top:10px;border:1px solid #ECECEC;font-size:12px;font-family:Arial;" class="table table-bordered table-striped" class="font12">';
	str += '<tr style="height:25px;">';
	str +='<td style="width:3%;" ><b>#</b></td>';
	str +='<td style="width:28%;" ><b>Batch Name</b></td>';
	str +='<td style="width:20%;" ><b>Start Time</b></td>';
	str +='<td style="width:20%;" ><b>End Time</b></td>';
	str += '<td  style="width:13%;" ><b>Services</b></td> ';
	str += '<td  style="width:13%;" ><b>Threads</b></td> </tr>';
	for( i=0;i<pdata.length;i++){
		var obj = pdata[i];	
		var sel = '';
		if(pdata[i] != null ) {
				var dt = moment(obj.start_time,'MM-DD-YYYY HH:mm:ss');
				str += '<tr class="datacellone" >';
				str += '<td style="text-align:center;"><input type="checkbox" value="'+i+'" id="servicecheckid" name="servicecheckid" /></td>';
				str += '<td style="text-align:center;">'+pdata[i].batch_name+'</td>';
				str += '<td style="text-align:center;">'+pdata[i].start_time+'</td><td >'+pdata[i].end_time+'</td><td  style="text-align:center;">'+pdata[i].service_count+'</td><td  style="text-align:center;">'+pdata[i].thread_count+'</td></tr>';
		}
	}
	str += '</table></div></div>';
	$("#rightthreadpanel").html(str);	
}

function threadPlatform(from){
//when in the reset the gui
	dataset.threadplatform = true;
	if(from === 1 && !dataset.xml_file_saved){
		var conf = confirm('Files are not saved, continue ?');
		if(conf == false)
			return;
	}
	var str ='<div id="rightmenudiv"  style="width:100%;height:24px;padding-top:0px;font-size:13px;font-family:Arial;"><div id="rightmenuinnerdiv" style="visibility:visible;" >';
	str +='<div style="float:left;padding-left:30px;" >';
	str +='<a href="#"><img  id="runwebservice" title="Run the Multi Web Service Methods" src="images/run.png" style="height:20px;width:20px;" onClick="javascript:runThreadWebService(0,2);"/></a></div>';

	str +='<div style="float:left;padding-left:30px;" >';
	str +='<a href="#" id="getthreadservices" title="Get the results of the batch Web Service Job"  class="buttonmenu"  onclick="javascript:getBatchResultList();" >Batch Run Results</a></div>';
	str +='<div style="float:left;padding-left:30px;" >';
	str +='<a href="#" id="getsavedservices" title="List all Saved Web Service Methods" class="buttonmenu"  onclick="javascript:createThreadBatch('+from+');" >Create Batch</a></div>';
	if(from === 3){
		str +='<div style="float:left;padding-left:10px;" >';
		str +='<a href="#"> <img id="savexmldata"  onClick="javascript:saveXMLData();" src="images/save.png" style="height:20px;width:20px;" title="Save the current service and data"/> </a></div>';
		str +='<div style="float:left;padding-left:10px;" >';
		str +='<a href="#"> <img id="downloadxmldata"  onClick="javascript:downloadServiceData();" src="images/download.png" style="height:20px;width:20px;" title="Download the CSV/XML Data(connect format)"/> </a></div>';
	}
	str +='</div></div>';
	$("#rightbuttonid").html(str);
	// main body get batch list
   getData("get_batch_list",displayThreadBatchList);
}
function displayThreadBatchList(data){
	//alert('kkkkk '+data.length);
	var str = '<div id="headerbplist" style="float:left;margin-left:20px;marigin-top:2px;width:100%;height:95%;overflow-y:scroll;"><table style="width:80%;margin-top:2px;border:1px solid #ECECEC;font-size:12px;font-family:Arial;" class="table table-bordered table-striped" >';
	str += '<tr ><td style="width:4%;">&nbsp;#</td><td  style="width:30%;">Batch Name</td>';
	str += '<td  style="width:13%;">Thread Count</td>';
	str += '<td  style="width:13%;">Service Count</td>';
	str += '<td  style="width:19%;">Created date</td>';	
	str += '<td  style="width:19%;">last Run</td></tr>';	
	i = 0;	
	str += '<tbody>';
	for(i=0;i<data.length;i++){
		//alert(data[i]+"  **"+data[i]["batch_id"]+" ::"+data[i].batch_id);
		str += '<tr ><td style="text-laign:center;"><input type="radio" title="Select Batch" name="batchlistradio" value="'+data[i].batch_id+'"/></td>';
		str += '<td><a id="'+data[i].batch_id+'" href="#" style="text-decoration:none;" ';
		str += '>'+data[i].batch_name+'</a></td>';
		str += '<td>&nbsp;'+data[i].thread_count+'</td><td>'+data[i].service_count+'</td><td>'+data[i].created_date+'</td>';
		str += '<td>'+(data[i].last_run_time===''?'&nbsp;':data[i].last_run_time )+'</td></tr>';
	}
	str += '</tbody></table></div>';
	$('#centerdiv').html(str);
}
function createThreadBatch(from){
	var str = '<div   style="width:100%;height:95%;" >'
	str += '<div id="threadform" class="font12 " style="height:100%;overflow-y:auto;background-color:#f1f1f1;">';
	str +='<div style="float:left;width:35%;margin-left:15px;" class="font12" id="leftthreadpanel">';
	str +='<div style="padding-left:10px;color:blue;width:90%;text-align:center;height:40px;margin-top:5px;" class="font15b">Running multiple services</div>';
	str +='<div style="padding-left:10px;color:black;width:90%;text-align:left;height:120px;margin-top:25px;" class="font12" id="detailsthread">';
	str +='<span style="margin-left:30px;">Pool of services is created for every non group service & a selected group will be expanded into individual members, each of this member will be added to the service thread pool. Execution of these services will depending on the thread settings. <br/>Results will displayed only after all the services have been run.</span></div>';
	str +='<div style="padding-left:10px;color:blue;width:90%;text-align:left;height:20px;" class="font12">&nbsp;</div>';
	
	str +='<div style="padding-left:10px;color:blue;width:90%;text-align:left;height:20px;" class="font12">';
	str +='<input type="radio" title="Single Thread" name="threadserviceradio" value="0"/>&nbsp;&nbsp;Single Thread (running the process sequentially)</div>';
	str +='<div style="padding-left:10px;color:blue;width:90%;text-align:left;height:20px;" class="font12">';
	str +='<input type="radio" title="Multi Thread (running the processes concurently)" name="threadserviceradio"  value="1"/>&nbsp;&nbsp;Multi Thread (running the processes concurently)</div>';
	str +='<div style="padding-left:10px;color:blue;width:90%;text-align:left;height:20px;" class="font12" id="threadcountdiv">';
	str +='<span style="margin-left:30px;">Number of threads : </span><input type="text"  title="Multi Thread (running the processes concurently)" name="threadcount" size="2" value="5"/></div>';
	str +='<div style="padding-left:10px;color:blue;width:90%;text-align:left;height:20px;" class="font12">';
	str +='Batch Name&nbsp;&nbsp;<input type="text" title="Give the name of the batch" id="threadservicebatchname" name="threadservicebatchname" value="" class="font12" size="30"/></div>';
	str +='<div style="padding-left:10px;color:blue;width:90%;text-align:left;height:20px;" class="font12">';
	str +='Schedule Batch Job&nbsp;&nbsp;<select id="schedulestatus"> <option value="0">No</option><option value="1">Weekly on Sat</option>';
	str +='<option value="2">Monthly 1st</option></select></div>';
	str +='<div style="padding-left:10px;color:blue;width:90%;text-align:left;height:20px;" class="font12">&nbsp;</div>';
	str +='<div style="padding-left:10px;color:blue;width:90%;text-align:center;height:20px;" class="font12">';
	str +='<a href="#" title="Save Batch" name="batchsave" onclick="saveBatchThreads()" class="buttonmenu">&nbsp;&nbsp;Save Batch</a></div>';
	
	str +='</div>';
	str +='<div style="float:left;width:60%;height:100%;margin-left:15px;border-left: 1px gray solid;;" class="font12" id="rightthreadpanel">&nbsp;';
	// show process list
	str +='</div></div>';
	$("#dialog1").dialog( {height : 550, width:1100,title:'Create Batch Service '} );
	$("#dialog1").html( str );
	$("#dialog1").dialog( "open" );

	getServiceList('thread','');
	$('input:radio[name=threadserviceradio]:nth(0)').prop('checked',true);
	$('#threadcountdiv').hide();
	$('input:radio[name=threadserviceradio]').click(function(){
		if(this.value == 1)
			$('#threadcountdiv').show();
		else
			$('#threadcountdiv').hide();
	});

}
//-------------------- service details
function createServiceDone(data){
	//alert('ggggggg '+data.found)
		$('#loading-indicator').hide();
		if(data.found == 'true'){
			$('#serviceerror').html('"Service creation in progress .....Done. Service not created already exiists' );
			dataset.temp_service='';
			return;
		}else{
			$("#downloadserwsdl").show();
			$('#serviceerror').html('"Service creation in progress .....Done. Service is ready for use. and you can download WSDL,' );
			if(data.service_id){
				dataset.service_id = data.service_id;
				var ser = jQuery.parseJSON(dataset.temp_service);
				userWebServices(ser)
			}
		}	
	}
	function createClientService(){
		createServiceForm();
	}
	function createService(num){
		if(! validateService())
			return;
		var input_data ={};
		input_data.user_id = dataset.user_id;
		input_data.sessionid = dataset.sessionid;
		input_data.actiontype="new_service";
		input_data.servicename = $('#servicenameid').val();
		input_data.targetnamespace = $('#targetnameid').val();
		input_data.methodname = $('#methodnameid').val();
		if(webservices_map[input_data.methodname]){
			// found
			alert('Service Method :'+input_data.methodname+' already exists.')
			return;
		}
		input_data.endpoint = $('#endpointid').val();
		var count = 0;
		var str = '[{ "method_name": "'+$('#methodnameid').val()+'", "parameters":[ ';
		for(i = 1; i < 6; i++){
			val = jQuery.trim($('#methodparam'+i).val());	
			if(val.length > 0){
				input_data['methodparam'+i]=val;
				input_data['paramtypeid'+i] = $('#paramtypeid_'+i).val();
				var t = $('#paramtypeid_'+i).val();
				var type = 'String';
				var ct = '1';
				if(t === 'String[]')
					ct = 'unbounded';
				else if(t === 'FileData')
					type = 'FileData';
				else if(t === 'FileData[]'){
					type = 'FileData';
					ct ='unbounded';
				}
				if(count > 0)
					str +=',';
				str +='{"param_name": "'+val+'","type": "'+type+'","count": "'+ct+'"}';
				count++;
			}		
		}
		str +=']}]';	
		dataset.temp_service = str;
		$('#loading-indicator').show();
		postData(input_data, createServiceDone);	
		$('#serviceerror').html('"Service creation in progress .....');
	}
	function validateService(){
		$('#serviceerror').html('');
		var val = jQuery.trim($('#servicenameid').val());
		//alert(val+' ggggg '+val.match(/^[0-9a-z]+$/) );
		if(!alphaNumeric(val)){
			$('#serviceerror').html('"Service Name" is required & should have only alphanumeric values');
			return false;
		}
		val = jQuery.trim($('#methodnameid').val());
		if(!alphaNumeric(val)){
			$('#serviceerror').html('"Method Name" is required & should have only alphanumeric values');
			return false;
		}
		val = jQuery.trim($('#targetnameid').val());	
		if(val.length == 0)
			$('#targetnameid').val('http://general.service.webservices.skire.com');
		else{
			if(!isValidURL($('#targetnameid').val())){
				alert($('#targetnameid').val()+' is not a valid URL namespace');
				return false;
			}
		}
		for(i = 1; i < 6; i++){
			val = jQuery.trim($('#methodparam'+i).val());	
			if(val.length > 0){
				if(!alphaNumericU(val)){
					$('#serviceerror').html('Parameter '+val+' should have only alphanumeric or Underscrore values');
					return false;
				}
			}
		}	
		return true;
	}
	function downloadServiceWSDL(){
		//alert('downloadServiceWSDL '+dataset.service_id);
		if(dataset.service_id <= 0){
			alert('WSDL not available');
			return;
		}	
		var str = '<input type="hidden" id="user_id" name="user_id" value="'+dataset.user_id+'" />';
		str += '<input type="hidden" id="company_id" name="company_id" value="'+dataset.company_id+'" />';
		str += '<input type="hidden" id="id" name="id" value="'+dataset.service_id+'" />';
		str += '<input type="hidden" id="fileaction" name="fileaction" value="service" />';
		str += '<input type="hidden" id="actiontype" name="actiontype" value="download_file" />';
		// do a download post with this id;
		$('#postid').html(str);
		$("postform").attr("method","post");
		document.postform.submit();
		document.postform.method = "get";
		setTimeout(resetPostForm,5000);
	}

	function importWSDL(num){
		$('#fileactiontype').val('importwsdlfile');
		document.getElementById("f_fileclick").click();
	}
	
	function getDE(delist,prefix,dename){  
	//	if(company_map[dataset.company_id].bp_info_map[prefix].bp_info.demap[dename] && typeof(company_map[dataset.company_id].bp_info_map[prefix].bp_info.demap[dename]) != 'undefined')
	//		return company_map[dataset.company_id].bp_info_map[prefix].bp_info.demap[dename];
		for(var k = 0; k < delist.length; k++){
			if( dename.toLowerCase() == delist[k].Name.toLowerCase())
				return k;
		}
		
		return -1;	
	}
