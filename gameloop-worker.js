function worker_function() {
    addEventListener('message', function(e) {
    	setInterval(function(){
    		postMessage(null);
    	}, 1000 / 60);
		// postMessage(e.data);
	}, false);
}
// This is in case of normal worker start
if(window != self)
  worker_function();