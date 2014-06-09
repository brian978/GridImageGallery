/**
 * GridImageGallery
 *
 * @link https://github.com/brian978/GridImageGallery
 * @copyright Copyright (c) 2014
 * @license Creative Commons Attribution-ShareAlike 3.0
 */

(function ($) {
    /**
     *
     * @param options
     * @returns {$.fn.GridGallery}
     */
    $.fn.gridgallery = function (options) {
        /**
         *
         * @param {jQuery} target
         * @param {Object} options
         * @constructor
         */
        function GridGallery(target, options) {
            /**
             *
             * @type {jQuery}
             * @protected
             */
            this.target = target;

            /**
             *
             * @type {Object}
             * @protected
             */
            this.options = options;

            /**
             * Each element will have the following format:
             * {image: Image, img: HTMLImageElement, container: HTMLSpanElement}
             *
             * @type {Array}
             */
            this.images = [];

            /**
             * We need the aspect ratio to determine the height of a box
             *
             * @type {number}
             * @protected
             */
            this.aspectRatio = 1;

            /**
             *
             * @type {{min: {width: number, height: number}, default: {width: number, height: number}}}
             */
            this.dimensions = {
                min: {
                    width: 0,
                    height: 0
                },
                default: {
                    width: 0,
                    height: 0
                }
            };

            /**
             *
             * @type {number}
             * @protected
             */
            this.columns = 1;

            /**
             *
             * @type {number}
             * @protected
             */
            this.maxWidth = 0;

            /**
             *
             * @type {number}
             * @protected
             */
            this.spacing = 5;
        }

        GridGallery.prototype = {
            /**
             *
             * @param {Function=null} afterLoad
             * @returns {GridGallery}
             */
            initialize: function (afterLoad) {
                this.attachListeners();
                this.loadImages((function () {
                    this.calculateTargetAspectRatio()
                        .getMaxWidth()
                        .loadOptions()
                        .resizeToFit()
                        .displayImages();

                    // Calling the callback provided by the user (if any)
                    if (typeof afterLoad == "function") {
                        afterLoad.call(null);
                    }
                }).bind(this));

                return this;
            },

            /**
             *
             * @protected
             */
            attachListeners: function () {
                $(window).on("resize", (function () {
                    this.getMaxWidth()
                        .resizeToFit();
                }).bind(this));
            },

            /**
             *
             * @param {Function} afterLoad
             * @returns {GridGallery}
             * @protected
             */
            loadImages: function (afterLoad) {
                var image, dom, imagesCount = 0, imagesLoaded = 0, _this = this;

                this.target.find("span.image").each(function () {
                    imagesCount++;
                    image = new Image();
                    image.onload = (function (span) {
                        imagesLoaded++;

                        // Creating the image element
                        dom = $("<img/>");
                        dom.attr("src", this.src);

                        // Modifying the span container
                        span.append(dom);

                        // Storing some info about the image
                        _this.images.push({
                            image: this,
                            dom: dom,
                            container: span
                        });

                        // Our callback must be called only after all the images have loaded
                        if (imagesLoaded == imagesCount) {
                            afterLoad.call(null);
                        }
                    }).bind(image, $(this));

                    // Triggering the image loading
                    image.src = $(this).data("src");
                });

                return this;
            },

            /**
             *
             * @returns {GridGallery}
             * @protected
             */
            calculateTargetAspectRatio: function () {
                if (this.options.hasOwnProperty("defaultDimension")) {
                    this.aspectRatio = this.options.defaultDimension.width / this.options.defaultDimension.height;
                }

                return this;
            },

            /**
             * Loads different options in the object's properties
             *
             * @returns {GridGallery}
             * @protected
             */
            loadOptions: function () {
                if (this.options.hasOwnProperty("columns")) {
                    this.columns = this.options.columns;
                }

                if (this.options.hasOwnProperty("spacing")) {
                    this.spacing = this.options.spacing;
                }

                if (this.options.hasOwnProperty("defaultDimension")) {
                    this.dimensions.default.width = this.options.defaultDimension.width;
                    this.dimensions.default.height = this.options.defaultDimension.height;
                }

                if (this.options.hasOwnProperty("minWidth")) {
                    var minHeight = this.options.minWidth / this.aspectRatio;

                    this.dimensions.min.width = this.options.minWidth;
                    this.dimensions.min.height = minHeight;
                }

                return this;
            },

            /**
             * We need to figure out what is the maximum with that we have available to add images
             *
             * @returns {GridGallery}
             * @protected
             */
            getMaxWidth: function () {
                this.maxWidth = parseInt(window.getComputedStyle(this.target[0], null).width);

                return this;
            },

            /**
             *
             * @returns {number}
             * @private
             */
            _getMaxBoxWidth: function () {
                var width = -1, tmpWidth, columns = this.columns;

                do {
                    tmpWidth = this.maxWidth / (columns--) - this.spacing * 2;
                    if (tmpWidth > this.dimensions.min.width) {
                        width = tmpWidth;
                    }
                } while(width < 0);

                return width;
            },

            /**
             *
             * @returns {GridGallery}
             * @protected
             */
            resizeToFit: function () {
                // We need to determine the max with of the box in the grid
                var width = this._getMaxBoxWidth();
                if (width > 0) {
                    var dom, container, height = width / this.aspectRatio;
                    for (var idx in this.images) {
                        if (this.images.hasOwnProperty(idx)) {
                            dom = this.images[idx].dom;
                            container = this.images[idx].container;

                            dom.width(width);
                            dom.height(height);

                            container.width(width);
                            container.height(height);
                        }
                    }
                }

                return this;
            },

            /**
             *
             * @returns {GridGallery}
             * @protected
             */
            displayImages: function () {
                for (var idx in this.images) {
                    if (this.images.hasOwnProperty(idx)) {
                        this.images[idx].dom.css("display", "block");
                        this.images[idx].container.css("margin", this.spacing);
                    }
                }

                return this;
            }
        };

        return new GridGallery($(this), options);
    };
}(jQuery));
