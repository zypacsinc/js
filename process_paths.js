//web worker
/*
self.addEventListener('message', function(e) {
  var data = e.data;
  switch (data.cmd) {
    case 'start':
      self.postMessage('WORKER STARTED: ' + data.msg);
      break;
    case 'stop':
      self.postMessage('WORKER STOPPED: ' + data.msg +
                       '. (buttons will no longer work)');
      self.close(); // Terminates the worker.
      break;
    default:
      self.postMessage('Unknown command: ' + data.msg);
  };
}, false);
*/
//------------------------------------------------------
// tansferrable.js

importScripts('shared.js');

var ready = false;
var visitednodesids = [];
var cnodes = {};
var to = 0;
var count = 0;

function createNode(id){
	var nodeobj = { id :id, value : 0 , done : false, fromid:0};
	return nodeobj;
}	

self.onmessage = function(e) {
	  if (!ready) {
	    initComplete();
	    return;
	  }
	
	  // Presumably, this worker would create its own Uint8Array or alter the
	  // ArrayBuffer (e.data) in some way. For this example, just send back the data
	  // we were sent.
	  log('thread worker data ***** '+e.data);
	 // log('thread worker data ***str  '+ab2str(e.data));
	  visitednodesids = [];
	  cnodes = {};
	  to = 0;
	  count = 0;
//	  var str = ab2str(e.data);
	  log('worker after convert ---::  '+e.data);
	  flow = e.data;
	
	  processNodes();
	  var result = JSON.stringify(cnodes);
	  var uInt8View = str2ab(result);
	
	  if (USE_TRANSFERRABLE) {
	    	//self.postMessage(uInt8View.buffer, [uInt8View.buffer]);
	    	self.postMessage(cnodes);
	  } else {
	    	self.postMessage(e.data);
	  }
	};
	
	self.onerror = function(message) {
		log('worker error');
	};
	
	
     
	function log(msg) {
	  var object = {
		  type: 'debug',
		  msg: source() + msg + ' [' + time() + ']'
	  };
	  self.postMessage(object);
	}
	
	function initComplete() {
	  ready = true;
	  log('READY!');
	}

//------------- actual processing work

	var visitednodesids = [];
var cnodes = {};
var to = 0;
var count = 0;

function createNode(id){
	var nodeobj = { id :id, value : 0 , done : false, fromid:0,linkid:0};
	return nodeobj;
}	

	function processNodes(){
		// flow = JSON.parse(str);
		
		var blink = flow.links[flow.connectLinkObj.id];
		var to = blink.to;
		cnodes[blink.from] = createNode(blink.from);
		visitednodesids.push(blink.from);
		checkVisitedNodes();
		// after this display all the node names backtrack
		var str = 'SP from '+flow.nodes[blink.from].props.NodeName+ ' ';
		var destid = to;
		var cp = 0;
		//console.log(' dest id '+destid+' fr id '+cnodes[destid].fromid);
		var sparr = []
		sparr.push(to)
		while(destid !== 0 && cp < 10){
				if(!cnodes[destid]){
					str +=' smething wrong dest id not set  visited ids ';
					for(var i = 0; i < visitednodesids.length; i++)	{
							str +=' , '+visitednodesids[i];
					}
					break; // this is wrong
				}
					
		//console.log(' dest id  ***** '+destid+' fr id '+cnodes[destid].fromid+' chk '+(cnodes[destid].fromid == 0)+' linkid  '+cnodes[destid].linkid);
				if(cnodes[destid].fromid == 0)
					destid = 0; // end has reached
				else{
					//str += ' next '+flow.nodes[cnodes[destid].fromid].props.NodeName+ ' ';	
					sparr.push(cnodes[destid].fromid);
					if(cnodes[destid].linkid !== 0){
		//console.log(' dest id  $$$$$$$  '+destid+' fr id '+cnodes[destid].fromid+' linkid  '+cnodes[destid].linkid);
					//	var linkobj = document.getElementById('link-'+cnodes[destid].linkid);
					//	linkobj.setAttributeNS(null, "class", 'yline'); 
					}
					destid = cnodes[destid].fromid;
				}
				cp++;
		}
		str = 'Shortest from ';
		for(var i = sparr.length-1; i >= 0; i--){
			str +=' -> '+flow.nodes[sparr[i]].props.NodeName
		}
		//console.log (str);
	}
	
	function checkVisitedNodes(){
		
		var min ={id:0,value:MAX_INT, fromid:0, linkid:0};
		for(var i = 0; i < visitednodesids.length; i++)	{
			var cnode = cnodes[visitednodesids[i]];
			if(cnode.done)
				continue;
			log(' visitednodesids --- '+visitednodesids[i]);
			var ret = nodePaths(visitednodesids[i]);
			if(!ret){
				//console.log(' visitednodesids --- *****  continue **** '+visitednodesids[i]+ '  ret --- '+ret);
				continue;// null recd next
			}
			//console.log(' visitednodesids --- *****   **** '+visitednodesids[i]+ '  ret --- '+ret.id+' mi: '+min.id+' v '+ret.value+' mv: '+min.value);	
			if(ret.value <= min.value ){
				min.id = ret.id;//to id
				min.value = ret.value;
				min.linkid = ret.linkid;
				min.fromid = visitednodesids[i];
			}
		}// end for
		// now we have the node 
		visitednodesids.push(min.id);
		var cnode = createNode(min.id);
		cnode.value = min.value;
		cnode.fromid = min.fromid;
		cnode.linkid = min.linkid;
		cnodes[min.id] = cnode;
		//console.log(' visitednodesids ---from id '+min.fromid+ '  to id --- '+min.id+'  val: '+min.value+' link id '+min.linkid);
		count++;
		if(min.id !== to && count < 10000000)
			checkVisitedNodes()
			
	}	

	function nodePaths(fromid){
		//  get all links from node
		log('node path --------:'+fromid+' :'+flow.nodes[fromid]);
		var flinks = flow.nodes[fromid].links;
		var cnode = cnodes[fromid];
		//if(cnode.done)
		//	return;
		var minvalue = 	MAX_INT;
		var minid = 0;
		var linkid = 0;
		for(var i = 0; i < flinks.length; i++){
			// find the other point
			var link = flow.links[flinks[i]];
			if(link.type === flow.BAND_LINK)
				continue;// 
			var otherid = 0;
		//	console.log(' nodepath ****** from id '+fromid+' lf '+link.from+' lt '+link.to+'  fchk: '+(link.from == fromid)+' cnf '+cnodes[link.to]+' linkid '+flinks[i]+' tchk: '+(link.to == fromid )+' cnt : '+cnodes[link.from]);
			if(link.from == fromid)
			 	if( cnodes[link.to])
					continue; // the destination is already present skip it
				else
					otherid = 	link.to;
			if(link.to == fromid )
				if(cnodes[link.from])
					continue; // the destination is already present skip it	
				else
					otherid = 	link.from;	
			// get the link value
			var value =  parseInt(link.props.MaxBandwidth)	;
			if(value < 0){
					//console.log(value+' ---- neg-- '+flow.links[flinks[i]].props.MaxBandwidth +'  id :'+flow.links[flinks[i]].id+' value :'+value);
					value = 1000;
			}
			value += cnode.value;
			//cnode.value = value;
		//	console.log(' nodepath --- from id '+fromid+' lf '+flow.links[flinks[i]].from+' lt '+flow.links[flinks[i]].to+'  o: '+otherid+' linkid '+flinks[i]+' v: '+value+' : '+minvalue+' ty '+link.type);
		//	console.log(' nodepath ---end  '+fromid+' minid '+minid+' v: '+value+' : '+minvalue +' o: '+otherid+' lf: '+link.from+' lt: '+link.to+' vchk '+(value < minvalue)+' l id '+link.id);
			if(value < minvalue){
				minvalue = value;
				minid = otherid;
				linkid = link.id;
			}
		}// end for
		if(minid ===0){
			// no more links
			cnodes[fromid].done = true;
			return ;
		}	
		return {id :minid,value:value,linkid:linkid};
		
	}
	
// we will use djikstra's alg assume we are having + values