// CSS
import 'vis/dist/vis-timeline-graph2d.min.css';
import './app.css';

import { DataSet, Timeline } from './vis-timeline-graph2d.js';
import Moment from 'moment';
Moment.locale('zh-CN');
var $id = (id) => document.getElementById(id) || {};

import {end as trim_newlines} from 'trim-newlines';

import * as OfflinePluginRuntime from 'offline-plugin/runtime';
OfflinePluginRuntime.install({
  onUpdateReady: () => {
    var swu = $id('sw-update');
    swu.className = '';
    // Tells to new SW to take control immediately
    swu.addEventListener('click', function(){
      OfflinePluginRuntime.applyUpdate();
      this.innerHTML = '请等待...';
    });
  },
  onUpdated: () => {
    // Reload the webpage to load into the new version
    window.location.reload();
  },
});

function alertSnackbox(content){
  if(content) $id('snackbox-content').innerHTML = trim_newlines(content || '').replace(/\n/g, '<br>');
  $id('snackbox').className = '';
  $id('snackbox-close').focus();
}

$id('snackbox-close').addEventListener('click', function(){
  $id('snackbox').className = 'hide';
});
$id('snackbox').addEventListener('keydown', function(event){
  if(event.keyCode == 27){
    $id('snackbox-close').click();
  }
});

if('BITvacationDATA' in window){
  window.charts = [];
  const timeline_width_days = window.innerWidth>576 ? 7: 3;
  const data = window.BITvacationDATA;
  $id('page-name').innerHTML = (data.name || '未知');
  $id('header').innerHTML = (data.header_html || '').replace('[today]', Moment().format('LL dddd'));
  $id('header').className = '';
  $id('footer').innerHTML += (data.footer_html || '');
  var start_moment = Moment().startOf('day'), end_moment = start_moment.clone().add(timeline_width_days, 'days');
  var navJumpHTML = '';

  // Welcome
  if(localStorage){
    var v = localStorage['BITvacation_welcomeVersion'];
    if(!v || v < 1){
      alertSnackbox();
      localStorage['BITvacation_welcomeVersion'] = 1;
    }
  }

  data.charts.forEach(function(c){
    var container = document.createElement('div');
    container.id = 'chart-'+c.id;
    container.className = 'vis';
    navJumpHTML += ' <a href="#chart-'+c.id+'">'+c.name+'</a>';
    var containerHTML = '<h2>'+c.name+'</h2><p>'+(c.description || '')+'</p>';
    if(c.type == 'timeline') containerHTML += '<div class="chart-control"><button class="chart-btn-before">以前</button><div><button class="chart-btn-thisweek">本周</button> <button class="chart-btn-overview">本月</button></div><button class="chart-btn-after">以后</button></div>';
    container.innerHTML = containerHTML;
    $id('content').appendChild(container);

    if(c.type != 'timeline') return;

    var groups = new DataSet(c.groups);
    var items_submit = c.items.filter(function(item){return !item.startends;});
    c.items.filter(function(item){return !!item.startends;}).forEach(function(item){
      item.startends.forEach(function(startend){
        var cloned = JSON.parse(JSON.stringify(item));
        cloned.startends = undefined;
        cloned.start = startend[0];
        cloned.end = startend[1];
        items_submit.push(cloned);
      });
    });
    var items = new DataSet(items_submit.map(function(item){item.type = 'range';return item;}));

    var timeline = new Timeline(container, items, groups, {
      groupOrder: 'order', horizontalScroll: true, verticalScroll: true, stack: false, zoomMin: 24*3600*1000, zoomMax: 60*24*3600*1000,
      min: c.min, max: c.max, start: start_moment, end: end_moment,
      locale: 'zh-CN', showTooltips: false,
      locales: {
        // create a new locale (text strings should be replaced with localized strings)
        'zh-CN': {
          current: '当前',
          time: '时间',
        }
      },
      format: {
        minorLabels: {
          millisecond:'SSS',
          second:     's',
          minute:     'HH:mm',
          hour:       'HH:mm',
          weekday:    'ddd D',
          day:        'ddd D',
          week:       'w',
          month:      'MMM',
          year:       'YYYY'
        },
        majorLabels: {
          millisecond:'HH:mm:ss',
          second:     'D MMMM HH:mm',
          minute:     'ddd D MMMM',
          hour:       'ddd D MMMM',
          weekday:    'MMMM',
          day:        'MMMM',
          week:       'MMMM',
          month:      'YYYY',
          year:       ''
        }
      },
      orientation:{'item':'top', 'axis':'top'},
      template: function (item, element, data) {
        return '<strong>'+item.title+'</strong><br>'+item.content;
      },
    });
    /*
    container.addEventListener('click', function (event) {
      var props = timeline.getEventProperties(event);
      if(props.what == 'item'){
        var item = timeline.itemsData.get(props.item);
        var group = timeline.groupsData.get(props.group);
        alert(Moment(props.time).format('LL')+' '+group.content+'：'+item.title+"\n\n"+item.content);
      }
    });
    */
    var mouseMoving = 0;
    timeline.on('mouseDown', function(){
        mouseMoving = 1;
    });
    timeline.on('mouseMove', function(){
        if(mouseMoving == 1) mouseMoving = 2;
    });
    timeline.on('mouseUp', function(e){
        if(mouseMoving != 2){
            var props = e;
            if(props.item){
              var item = timeline.itemsData.get(props.item);
              var group = timeline.groupsData.get(item.group);
              alertSnackbox(Moment(props.time).format('LL')+' '+group.content.replace(/\<br\>/g, ' ')+'：'+item.title+"\n\n"+item.content);
            }
        }
        mouseMoving = 0;
    });
    timeline.on('changed', function(){
      var panels = timeline.dom.container.querySelectorAll('.vis-panel');
      [].forEach.call(panels, function (item) {
        item.style['touch-action'] = 'auto';
        // item.style['user-select'] = 'auto';
        //item.style['-webkit-user-drag'] = 'auto';
      });
    });
    container.querySelector('.chart-btn-before').addEventListener('click', function(){
      timeline.range.setRange(timeline.range.start-timeline_width_days*24*3600*1000, timeline.range.end-timeline_width_days*24*3600*1000, { animation: true });
    });
    container.querySelector('.chart-btn-after').addEventListener('click', function(){
      timeline.range.setRange(timeline.range.start+timeline_width_days*24*3600*1000, timeline.range.end+timeline_width_days*24*3600*1000, { animation: true });
    });
    container.querySelector('.chart-btn-thisweek').addEventListener('click', function(){
      timeline.range.setRange(start_moment, end_moment, { animation: true });
    });
    container.querySelector('.chart-btn-overview').addEventListener('click', function(){
      var thisMonthStart = Moment.max(Moment(timeline.range.start).startOf('month'), Moment(timeline.range.options.min));
      var thisMonthEnd = Moment.min(thisMonthStart.clone().endOf('month'), Moment(timeline.range.options.max));
      timeline.range.setRange(thisMonthStart, thisMonthEnd, { animation: true });
    });
    window.charts.push(timeline);
  });
  $id('nav-jump').innerHTML += navJumpHTML;
  $id('nav').className = '';
}else{
  $id('page-name').innerHTML = '加载失败';
}

if('onfinished' in window){
  window.onfinished();
}