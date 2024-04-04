
const path = require('path');
const Image = require("@11ty/eleventy-img");
const htmlmin = require("html-minifier-terser");

const stringifyAttributes = (attributeMap) => {
  return Object.entries(attributeMap)
    .map(([attribute, value]) => {
      if (typeof value === "undefined") return "";
      return `${attribute}="${value}"`;
    })
    .join(" ");
};

module.exports = async function imageShortcode(src, alt, className, formats, widths, sizes = '90vw',) {

  const absSrc = `src/${src}`;
  const urlPath = path.dirname(src);
  const outputDir = `./dist/${urlPath}`;

  const metadata = await Image(absSrc, {
    widths: widths || [800],
    formats: formats || ["avif", "webp", "jpeg"],
    urlPath,
    outputDir,
    filenameFormat: function (id, src, width, format, options) {
      return `${path.parse(src).name}-${id}-${width}.${format}`;
    },
  });

  const lowsrc = metadata.jpeg[metadata.jpeg.length - 1];
  const imageSources = Object.values(metadata)
    .map((imageFormat) => {
      return `  <source type="${
        imageFormat[0].sourceType
      }" srcset="${imageFormat
        .map((entry) => entry.srcset)
        .join(", ")}" sizes="${sizes}">`;
    })
    .join("\n");

  const imageAttributes = stringifyAttributes({
    alt,
    sizes,
    src: lowsrc.url,
    width: lowsrc.width,
    height: lowsrc.height,
    class: className,
    loading: "lazy",
    decoding: "async",
  });

  const imageElement = `<picture>${imageSources}<img ${imageAttributes} /></picture>`;

  return htmlmin.minify(imageElement, { collapseWhitespace: true });
};
