var commander = require('commander');
var spawn = require('cross-spawn');
var blessed = require('blessed');

var program = new commander.Command('foreman-dashboard');
program.parse(process.argv);

var command = program.args[0];
var args = program.args.slice(1);
var env = process.env;

var webLog = '';
var workerLog = '';
var webpackLog = '';

env.FORCE_COLOR = true;

var screen = blessed.screen({
  smartCSR: true,
  title: 'foreman-dashboard',
});

var web = blessed.box({
  top: 0,
  left: 0,
  width: '50%',
  height: '50%',
  tags: true,
  content: 'Loading Puma...',
  border: {
    type: 'line'
  },
  style: {
    fg: '#51C2FD',
    border: {
      fg: '#f0f0f0'
    }
  }
});

var worker = blessed.box({
  top: 0,
  right: 0,
  width: '50%',
  height: '50%',
  tags: true,
  content: 'Loading Sidekiq...',
  border: {
    type: 'line'
  },
  style: {
    fg: '#4AC49F',
    border: {
      fg: '#f0f0f0'
    }
  }
});

var webpack = blessed.box({
  bottom: 0,
  left: 0,
  width: '50%',
  height: '50%',
  tags: true,
  content: 'Loading Webpack...',
  border: {
    type: 'line'
  },
  style: {
    fg: '#E52770',
    border: {
      fg: '#f0f0f0'
    }
  }
});

screen.append(web);
screen.append(worker);
screen.append(webpack);

screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

var child = spawn(command, args, {
  env: env,
  stdio: [null, null, null, 'ipc'],
  detached: true
});

child.stdout.on('data', function (data) {
  var data = data.toString('utf8')

  if(data.match(/web.1/)) {
    webLog += data;
    web.setContent(webLog);
  }

  if(data.match(/worker.1/)) {
    workerLog += data;
    worker.setContent(workerLog);
  }

  if(data.match(/js.1/)) {
    webpackLog += data;
    webpack.setContent(webpackLog);
  }

  screen.render();
});

child.stderr.on('data', function (data) {
  var data = data.toString('utf8')
  box.setContent(data);
});

process.on('exit', function () {
  var childPid = process.platform === 'win32' ? child.pid : -child.pid;
  process.kill(childPid);
});
