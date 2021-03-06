/**
 * @module ol/layer/VectorRenderType
 */

/**
 * @enum {string}
 * Render mode for vector layers:
 *  * `'image'`: Vector layers are rendered as images. Great performance, but
 *    point symbols and texts are always rotated with the view and pixels are
 *    scaled during zoom animations.
 *  * `'vector'`: Vector layers are rendered as vectors. Most accurate rendering
 *    even during animations, but slower performance.
 * @api
 */
export default {
  IMAGE: 'image',
  VECTOR: 'vector'
};

//# sourceMappingURL=VectorRenderType.js.map