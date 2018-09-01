/**
 * @module ol/geom/flat/orient
 */
import {coordinates as reverseCoordinates} from '../flat/reverse.js';


/**
 * @param {Array.<number>} flatCoordinates Flat coordinates.
 * @param {number} offset Offset.
 * @param {number} end End.
 * @param {number} stride Stride.
 * @return {boolean} Is clockwise.
 */
export function linearRingIsClockwise(flatCoordinates, offset, end, stride) {
  // http://tinyurl.com/clockwise-method
  // https://github.com/OSGeo/gdal/blob/trunk/gdal/ogr/ogrlinearring.cpp
  var edge = 0;
  var x1 = flatCoordinates[end - stride];
  var y1 = flatCoordinates[end - stride + 1];
  for (; offset < end; offset += stride) {
    var x2 = flatCoordinates[offset];
    var y2 = flatCoordinates[offset + 1];
    edge += (x2 - x1) * (y2 + y1);
    x1 = x2;
    y1 = y2;
  }
  return edge > 0;
}


/**
 * Determines if linear rings are oriented.  By default, left-hand orientation
 * is tested (first ring must be clockwise, remaining rings counter-clockwise).
 * To test for right-hand orientation, use the `opt_right` argument.
 *
 * @param {Array.<number>} flatCoordinates Flat coordinates.
 * @param {number} offset Offset.
 * @param {Array.<number>} ends Array of end indexes.
 * @param {number} stride Stride.
 * @param {boolean=} opt_right Test for right-hand orientation
 *     (counter-clockwise exterior ring and clockwise interior rings).
 * @return {boolean} Rings are correctly oriented.
 */
export function linearRingIsOriented(flatCoordinates, offset, ends, stride, opt_right) {
  var right = opt_right !== undefined ? opt_right : false;
  for (var i = 0, ii = ends.length; i < ii; ++i) {
    var end = ends[i];
    var isClockwise = linearRingIsClockwise(
      flatCoordinates, offset, end, stride);
    if (i === 0) {
      if ((right && isClockwise) || (!right && !isClockwise)) {
        return false;
      }
    } else {
      if ((right && !isClockwise) || (!right && isClockwise)) {
        return false;
      }
    }
    offset = end;
  }
  return true;
}


/**
 * Determines if linear rings are oriented.  By default, left-hand orientation
 * is tested (first ring must be clockwise, remaining rings counter-clockwise).
 * To test for right-hand orientation, use the `opt_right` argument.
 *
 * @param {Array.<number>} flatCoordinates Flat coordinates.
 * @param {number} offset Offset.
 * @param {Array.<Array.<number>>} endss Array of array of end indexes.
 * @param {number} stride Stride.
 * @param {boolean=} opt_right Test for right-hand orientation
 *     (counter-clockwise exterior ring and clockwise interior rings).
 * @return {boolean} Rings are correctly oriented.
 */
export function linearRingsAreOriented(flatCoordinates, offset, endss, stride, opt_right) {
  for (var i = 0, ii = endss.length; i < ii; ++i) {
    if (!linearRingIsOriented(
      flatCoordinates, offset, endss[i], stride, opt_right)) {
      return false;
    }
  }
  return true;
}


/**
 * Orient coordinates in a flat array of linear rings.  By default, rings
 * are oriented following the left-hand rule (clockwise for exterior and
 * counter-clockwise for interior rings).  To orient according to the
 * right-hand rule, use the `opt_right` argument.
 *
 * @param {Array.<number>} flatCoordinates Flat coordinates.
 * @param {number} offset Offset.
 * @param {Array.<number>} ends Ends.
 * @param {number} stride Stride.
 * @param {boolean=} opt_right Follow the right-hand rule for orientation.
 * @return {number} End.
 */
export function orientLinearRings(flatCoordinates, offset, ends, stride, opt_right) {
  var right = opt_right !== undefined ? opt_right : false;
  for (var i = 0, ii = ends.length; i < ii; ++i) {
    var end = ends[i];
    var isClockwise = linearRingIsClockwise(
      flatCoordinates, offset, end, stride);
    var reverse = i === 0 ?
      (right && isClockwise) || (!right && !isClockwise) :
      (right && !isClockwise) || (!right && isClockwise);
    if (reverse) {
      reverseCoordinates(flatCoordinates, offset, end, stride);
    }
    offset = end;
  }
  return offset;
}


/**
 * Orient coordinates in a flat array of linear rings.  By default, rings
 * are oriented following the left-hand rule (clockwise for exterior and
 * counter-clockwise for interior rings).  To orient according to the
 * right-hand rule, use the `opt_right` argument.
 *
 * @param {Array.<number>} flatCoordinates Flat coordinates.
 * @param {number} offset Offset.
 * @param {Array.<Array.<number>>} endss Array of array of end indexes.
 * @param {number} stride Stride.
 * @param {boolean=} opt_right Follow the right-hand rule for orientation.
 * @return {number} End.
 */
export function orientLinearRingsArray(flatCoordinates, offset, endss, stride, opt_right) {
  for (var i = 0, ii = endss.length; i < ii; ++i) {
    offset = orientLinearRings(
      flatCoordinates, offset, endss[i], stride, opt_right);
  }
  return offset;
}

//# sourceMappingURL=orient.js.map