const basePath = './lib/';
const context = require.context('../node_modules/vis', true, /lib\/.*\.js$/);

// utils
exports.util = context(basePath + 'util.js');
exports.DOMutil = context(basePath + 'DOMutil.js');

// data
exports.DataSet = context(basePath + 'DataSet.js');
exports.DataView = context(basePath + 'DataView.js');
exports.Queue = context(basePath + 'Queue.js');

// Timeline
exports.Timeline = context(basePath + 'timeline/Timeline.js');
exports.Graph2d = context(basePath + 'timeline/Graph2d.js');
exports.timeline = {
  Core: context(basePath + 'timeline/Core.js'),
  DateUtil: context(basePath + 'timeline/DateUtil.js'),
  Range: context(basePath + 'timeline/Range.js'),
  stack: context(basePath + 'timeline/Stack.js'),
  TimeStep: context(basePath + 'timeline/TimeStep.js'),

  components: {
    items: {
      Item: context(basePath + 'timeline/component/item/Item.js'),
      BackgroundItem: context(basePath + 'timeline/component/item/BackgroundItem.js'),
      BoxItem: context(basePath + 'timeline/component/item/BoxItem.js'),
      PointItem: context(basePath + 'timeline/component/item/PointItem.js'),
      RangeItem: context(basePath + 'timeline/component/item/RangeItem.js')
    },

    BackgroundGroup: context(basePath + 'timeline/component/BackgroundGroup.js'),
    Component: context(basePath + 'timeline/component/Component.js'),
    CurrentTime: context(basePath + 'timeline/component/CurrentTime.js'),
    CustomTime: context(basePath + 'timeline/component/CustomTime.js'),
    DataAxis: context(basePath + 'timeline/component/DataAxis.js'),
    DataScale: context(basePath + 'timeline/component/DataScale.js'),
    GraphGroup: context(basePath + 'timeline/component/GraphGroup.js'),
    Group: context(basePath + 'timeline/component/Group.js'),
    ItemSet: context(basePath + 'timeline/component/ItemSet.js'),
    Legend: context(basePath + 'timeline/component/Legend.js'),
    LineGraph: context(basePath + 'timeline/component/LineGraph.js'),
    TimeAxis: context(basePath + 'timeline/component/TimeAxis.js')
  }
};

// bundled external libraries
exports.moment = context(basePath + 'module/moment.js');
exports.Hammer = context(basePath + 'module/hammer.js');
exports.keycharm = require('keycharm');

// Hacked by Phy
/**
 * Start of a touch gesture
 * @param {Event} event
 * @private
 */
exports.timeline.Range.prototype._onTouch = function (event) {  // eslint-disable-line no-unused-vars
  this.props.touch.start = this.start;
  this.props.touch.end = this.end;
  this.props.touch.allowDragging = true;
  this.props.touch.center = null;
  this.scaleOffset = 0;
  this.deltaDifference = 0;
  // Disable the browser default handling of this event.
  // Comment out this one to let WeChat use it
  // util.preventDefault(event);
};