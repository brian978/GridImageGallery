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
             * {image: Image, imgDom: HTMLImageElement, container: HTMLSpanElement, loadingDom: jQuery, specs: {width: number, height: number, src: string}}
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

            /**
             *
             * @type {Object}
             * @protected
             */
            this.callbacks = {
                beforeAppend: null
            };
        }

        GridGallery.prototype = {
            /**
             *
             * @param {Function=null} afterLoad
             * @returns {GridGallery}
             */
            initialize: function (afterLoad) {
                this.attachListeners();

                this.calculateTargetAspectRatio();
                this.loadOptions();
                this.loadImageSpecs();
                this.getMaxWidth();
                this.resizeBoxes();
                this.displayLoading();

                this.loadImages((function () {
                    // Since now all is loaded we need to make sure we don't
                    // have a scroll bar that would affect the layout
                    if (document.body.scrollHeight > document.body.clientHeight) {
                        this.getMaxWidth();
                        this.resizeToFit();
                    }

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
                    this.getMaxWidth();
                    this.resizeToFit();
                }).bind(this));
            },

            /**
             * Used to collect the specifications of the images (like the image source)
             *
             * @returns {GridGallery}
             */
            loadImageSpecs: function () {
                var _this = this;

                this.target.find(".image").each(function () {
                    _this.images.push({
                        imgDom: null,
                        loadingDom: null,
                        container: $(this),
                        specs: {
                            src: $(this).data("src")
                        }
                    });
                });

                return this;
            },

            /**
             *
             * @param {string} src
             * @returns {jQuery}
             * @protected
             */
            createImageObject: function (src) {
                var object = $("<img/>");
                object.attr("src", src);

                return object;
            },

            /**
             *
             * @param {Function} afterLoad
             * @returns {GridGallery}
             * @protected
             */
            loadImages: function (afterLoad) {
                var image, imgDom, imagesCount = this.images.length, imagesLoaded = 0, _this = this;

                for (var idx in this.images) {
                    if (this.images.hasOwnProperty(idx)) {
                        image = new Image();
                        image.onload = (function (imageData) {
                            imagesLoaded++;

                            // We might need to change the container we append to
                            var appendContainer = imageData.container;

                            // Adding what we have to to the container
                            var href = imageData.container.data("href");
                            if (typeof href == "string" && href.length > 0) {
                                appendContainer = imageData.container.find("a");
                                if (appendContainer.length <= 0) {
                                    appendContainer = $("<a></a>");
                                }

                                appendContainer.attr("href", href);
                                imageData.container.append(appendContainer);
                            }

                            // Creating the image element
                            imgDom = _this.createImageObject(imageData.specs.src);

                            // Calling the callback before we append in order to allow for better customization
                            if (_this.callbacks.beforeAppend !== null) {
                                _this.callbacks.beforeAppend.call(null, imageData.container, imgDom, this);
                            }

                            // Updating the image data
                            imageData.imgDom = imgDom;
                            imageData.image = this;

                            // Setting the dimensions of the image using the data from the container
                            imgDom.width(imageData.specs.width);
                            imgDom.height(imageData.specs.height);

                            // Removing the loading image and replacing it with the image
                            imageData.loadingDom.remove();
                            appendContainer.append(imgDom);

                            // Showing the image in a nice way
                            imgDom.css("display", "inline-block");

                            // Our callback must be called only after all the images have loaded
                            if (imagesLoaded == imagesCount) {
                                afterLoad.call(null);
                            }
                        }).bind(image, this.images[idx]);

                        // Triggering the image loading
                        image.src = this.images[idx].specs.src;
                    }
                }

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
             * Needs to be called either at initialization or when the user resizes the window
             *
             * @returns {GridGallery}
             * @protected
             */
            getMaxWidth: function () {
                this.maxWidth = parseInt(window.getComputedStyle(this.target[0], null).width);

                return this;
            },

            /**
             * Returns the maximum width that a box from the grid will have
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
                } while (width < 0);

                return width;
            },

            /**
             * Resizes the containers of the images (call only at initialization)
             *
             * @returns {GridGallery}
             * @protected
             */
            resizeBoxes: function () {
                var width = this._getMaxBoxWidth();

                if (width > 0) {
                    var container, height = width / this.aspectRatio;
                    for (var idx in this.images) {
                        if (this.images.hasOwnProperty(idx)) {
                            container = this.images[idx].container;
                            container.width(width);
                            container.height(height);
                            container.css("margin", this.spacing);

                            // Updating the specs
                            this.images[idx].specs.width = width;
                            this.images[idx].specs.height = height;
                        }
                    }
                }

                return this;
            },

            /**
             * Resizes both the containers and the images (call only when the images are already loaded)
             *
             * @returns {GridGallery}
             * @protected
             */
            resizeToFit: function () {
                var width = this._getMaxBoxWidth();

                if (width > 0) {
                    var imgDom, container, height = width / this.aspectRatio;
                    for (var idx in this.images) {
                        if (this.images.hasOwnProperty(idx)) {
                            // The method might get called before the image is loaded so we must make sure
                            // we have the image first
                            imgDom = this.images[idx].imgDom;
                            if (imgDom !== null) {
                                imgDom.width(width);
                                imgDom.height(height);
                            }

                            container = this.images[idx].container;
                            container.width(width);
                            container.height(height);

                            // Updating the specs
                            this.images[idx].specs.width = width;
                            this.images[idx].specs.height = height;
                        }
                    }
                }

                return this;
            },

            /**
             *
             * @returns {jQuery}
             * @private
             */
            _createLoading: function () {
                var object = $("<span class=\"loading-box\"></span>");
                object.append($("<span class=\"loading\"></span>"));

                return object;
            },

            /**
             *
             * @returns {GridGallery}
             * @protected
             */
            displayLoading: function () {
                var data;

                for (var idx in this.images) {
                    if (this.images.hasOwnProperty(idx)) {
                        data = this.images[idx];

                        // Updating the image data
                        data.loadingDom = this._createLoading();

                        // Appending the loading image to the container
                        data.container.append(data.loadingDom);
                    }
                }

                return this;
            }
        };

        return new GridGallery($(this), options);
    };
}(jQuery));
