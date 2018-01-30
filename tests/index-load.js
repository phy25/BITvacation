casper.test.begin('Index loads without error', function testLoad(test) {
	var error = false;
	casper.options.onError = function(c, m, b){
		error = m;
	};
	/*
	casper.on('error', function(msg, backtrace) {
	    error = msg;
	});
	*/
	casper.start('./dist/index.html');
	casper.waitFor(function check() {
	    return this.evaluate(function() {
	    	var n = document.getElementById('page-name');
	    	var l = document.querySelector('#nav-jump a');
	        return l || (n && n.innerHTML.indexOf('失败') >= 0);
	    });
	}, function then(){
		var pageName = this.fetchText('#page-name');
		test.assertNot(pageName.indexOf('失败') >= 0, '#page-name says load is not failed; if this fails please check manually');
		test.pass("If not failed previously, it has loaded now");
	}, function timeout(){
		test.fail("#nav-jump is not populated (timeout)");
		// this.echo(this.getHTML());
	}, 5000);

	casper.run(function(){
		var pageTitle = this.getTitle();
		test.assertMatch(pageTitle, /假/, 'title contains related symbol');
		test.assertNot(error, 'Page load has no error');
		test.done();
	});
});