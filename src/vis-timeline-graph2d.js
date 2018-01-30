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

exports.timeline.components.items.RangeItem.prototype.repositionX = function(limitSize) {
  var parentWidth = this.parent.width;
  var start = this.conversion.toScreen(this.data.start);
  var end = this.conversion.toScreen(this.data.end);
  var align = this.data.align === undefined ? this.options.align : this.data.align;
  var contentStartPosition;
  var contentWidth;

  // limit the width of the range, as browsers cannot draw very wide divs
  // unless limitSize: false is explicitly set in item data
  if (this.data.limitSize !== false && (limitSize === undefined || limitSize === true)) {
    if (start < -parentWidth) {
      start = -parentWidth;
    }
    if (end > 2 * parentWidth) {
      end = 2 * parentWidth;
    }
  }

  // add 0.5 to compensate floating-point values rounding
  var boxWidth = Math.max(end - start + 0.5, 1);

  if (this.overflow) {
    if (this.options.rtl) {
      this.right = start;
    } else {
      this.left = start;
    }
    this.width = boxWidth + this.props.content.width;
    contentWidth = this.props.content.width;

    // Note: The calculation of width is an optimistic calculation, giving
    //       a width which will not change when moving the Timeline
    //       So no re-stacking needed, which is nicer for the eye;
  }
  else {
    if (this.options.rtl) {
      this.right = start;
    } else {
      this.left = start;
    }
    this.width = boxWidth;
    contentWidth = Math.min(end - start, this.props.content.width);
  }

  if (this.options.rtl) {
    this.dom.box.style.right = this.right + 'px';
  } else {
    this.dom.box.style.left = this.left + 'px';
  }
  this.dom.box.style.width = boxWidth + 'px';

  switch (align) {
    case 'left':
      if (this.options.rtl) {
        this.dom.content.style.right = '0';
      } else {
        this.dom.content.style.left = '0';
      }
      break;

    case 'right':
      if (this.options.rtl) {
        this.dom.content.style.right = Math.max((boxWidth - contentWidth), 0) + 'px';
      } else {
        this.dom.content.style.left = Math.max((boxWidth - contentWidth), 0) + 'px';
      }
      break;

    case 'center':
      if (this.options.rtl) {
        this.dom.content.style.right = Math.max((boxWidth - contentWidth) / 2, 0) + 'px';
      } else {
        this.dom.content.style.left = Math.max((boxWidth - contentWidth) / 2, 0) + 'px';
      }

      break;

    default: // 'auto'
      // when range exceeds left of the window, position the contents at the left of the visible area
      if (this.overflow) {
        if (end > 0) {
          contentStartPosition = Math.max(-start, 0);
        }
        else {
          contentStartPosition = -contentWidth; // ensure it's not visible anymore
        }
      }
      else {
        if (start < 0) {
          contentStartPosition = -start;
        }
        else {
          contentStartPosition = 0;
        }
      }
      if (this.options.rtl) {
        this.dom.content.style.right = contentStartPosition + 'px';
      } else {
        this.dom.content.style.left = contentStartPosition + 'px';
        this.dom.content.style.width = 'calc(100% - ' + contentStartPosition + 'px)';
        this.dom.content.style.maxWidth = (parentWidth - Math.max(0, this.left)) + 'px';
      }
  }
};