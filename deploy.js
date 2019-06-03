const FtpDeploy = require('ftp-deploy');
const path = require('path');
var ftpDeploy_main = new FtpDeploy();
var ftpDeploy_cdn = new FtpDeploy();
var errcode = 1;

const config_main = {
	username: process.env.FTP_MAIN_USER,
	password: process.env.FTP_MAIN_PASS,
	host: "ftp.seethediff.cn",
	port: 21,
	localRoot: path.resolve(__dirname, "dist"),
	remoteRoot: "/home/bitvacation/public_html",
	exclude: ['cdn']
};
const config_cdn = {
	username: process.env.FTP_CDN_USER,
	password: process.env.FTP_CDN_PASS,
	host: "v0.ftp.upyun.com",
	port: 21,
	localRoot: path.resolve(__dirname, "dist", "cdn"),
	remoteRoot: "/projects/bitvacation"
};

try{
	ftpDeploy_main.deploy(config_main, function(err) {
		if (err){
			console.error(err);
			errcode = 10;
			process.exit(errcode);
		}
		else{
			console.log('finished deployment on main');
			ftpDeploy_cdn.deploy(config_cdn, function(err) {
				if (err){
					console.error(err);
					errcode = 11;
				}
				else{
					errcode = 0;
					console.log('finished deployment on cdn');
				}
				process.exit(errcode);
			});
		}
	});
}catch(e){
	console.error(e);
	process.exit(errcode);
}