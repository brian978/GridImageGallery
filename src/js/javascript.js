/**
 * GridImageGallery
 *
 * @link https://github.com/brian978/GridImageGallery
 * @copyright Copyright (c) 2014
 * @license Creative Commons Attribution-ShareAlike 3.0
 */
$(document).ready(function () {
    var gallery = $("#grid-gallery").gridgallery({
        columns: 4,
        spacing: 3,
        defaultDimension: {
            width: 384,
            height: 216
        },
        minWidth: 256
    });

    gallery.initialize();
});
